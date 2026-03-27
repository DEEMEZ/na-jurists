import { createHash, randomBytes } from "node:crypto";
import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { getEnv } from "../config/env.js";
import { publicPortalUrl, sendMail } from "../lib/email.js";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  createRefreshTokenValue,
  refreshTokenExpiresAt,
  signAccessToken,
} from "../lib/tokens.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginBody = registerBody;

const refreshBody = z.object({
  refreshToken: z.string().min(10),
});

const forgotBody = z.object({
  email: z.string().email(),
});

const resetPasswordBody = z.object({
  token: z.string().min(32),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function userPublic(u: { id: string; email: string; role: Role }) {
  return { id: u.id, email: u.email, role: u.role };
}

/** Public registration — creates CLIENT only (admins are seeded). */
router.post("/register", async (req, res) => {
  const parsed = registerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, role: Role.CLIENT },
  });
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshValue = createRefreshTokenValue();
  await prisma.refreshToken.create({
    data: {
      token: refreshValue,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt(),
    },
  });
  res.status(201).json({
    user: userPublic(user),
    accessToken,
    refreshToken: refreshValue,
  });
});

router.post("/login", async (req, res) => {
  const parsed = loginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (
    !user ||
    user.disabled ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshValue = createRefreshTokenValue();
  await prisma.refreshToken.create({
    data: {
      token: refreshValue,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt(),
    },
  });
  res.json({
    user: userPublic(user),
    accessToken,
    refreshToken: refreshValue,
  });
});

router.post("/refresh", async (req, res) => {
  const parsed = refreshBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { refreshToken: raw } = parsed.data;
  const record = await prisma.refreshToken.findUnique({
    where: { token: raw },
    include: { user: true },
  });
  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.refreshToken.delete({ where: { id: record.id } });
    }
    res.status(401).json({ error: "Invalid or expired refresh token" });
    return;
  }
  await prisma.refreshToken.delete({ where: { id: record.id } });
  const user = record.user;
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const newRefresh = createRefreshTokenValue();
  await prisma.refreshToken.create({
    data: {
      token: newRefresh,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt(),
    },
  });
  res.json({
    user: userPublic(user),
    accessToken,
    refreshToken: newRefresh,
  });
});

router.post("/logout", async (req, res) => {
  const parsed = refreshBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  await prisma.refreshToken.deleteMany({
    where: { token: parsed.data.refreshToken },
  });
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ user: req.user });
});

/** Request password reset email (always responds ok to avoid email enumeration). */
router.post("/forgot-password", async (req, res) => {
  const parsed = forgotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (user && !user.disabled) {
      const env = getEnv();
      const raw = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(raw).digest("hex");
      const expiresAt = new Date(
        Date.now() + env.PASSWORD_RESET_EXPIRES_MIN * 60 * 1000,
      );
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });
      const url = `${publicPortalUrl(env)}/reset-password?token=${encodeURIComponent(raw)}`;
      await sendMail(env, {
        to: user.email,
        subject: "Reset your N&A Jurists portal password",
        text: `We received a request to reset your password.\n\nOpen this link (valid ${String(env.PASSWORD_RESET_EXPIRES_MIN)} minutes):\n${url}\n\nIf you did not request this, ignore this email.`,
      });
    }
  } catch (e) {
    console.error("[auth] forgot-password:", e);
  }
  res.json({ ok: true });
});

router.post("/reset-password", async (req, res) => {
  const parsed = resetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const tokenHash = createHash("sha256")
    .update(parsed.data.token)
    .digest("hex");
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });
  if (!row || row.expiresAt < new Date()) {
    res.status(400).json({ error: "Invalid or expired token" });
    return;
  }
  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: row.userId } }),
    prisma.refreshToken.deleteMany({ where: { userId: row.userId } }),
  ]);
  res.json({ ok: true });
});

export { router as authRouter };
