import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { getEnv } from "../config/env.js";
import { paramStr } from "../lib/httpParams.js";
import { prisma } from "../lib/prisma.js";
import { emailField } from "../lib/userEmail.js";
import { hashPassword } from "../lib/password.js";
import {
  emailAssignedClientsForNewHearing,
  notifyAssignedClients,
} from "../lib/notifyStatus.js";
import { createCaseUpload } from "../lib/uploadMulter.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const upload = createCaseUpload();

router.use(requireAuth, requireRole(Role.ADMIN));

router.get("/dashboard", async (_req, res) => {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const openCases = await prisma.case.count({ where: { archived: false } });
  const upcomingHearings30d = await prisma.hearing.count({
    where: {
      scheduledAt: { gte: now, lte: in30 },
      case: { archived: false },
    },
  });

  const casesWithHearings = await prisma.case.findMany({
    where: { archived: false },
    include: {
      hearings: { where: { scheduledAt: { gte: now } } },
    },
  });
  const casesMissingUpcomingHearing = casesWithHearings.filter(
    (c) => c.hearings.length === 0,
  ).length;

  const recentClientMessages = await prisma.message.count({
    where: {
      sender: { role: Role.CLIENT },
      createdAt: { gte: sevenDaysAgo },
    },
  });

  res.json({
    openCases,
    upcomingHearings30d,
    casesMissingUpcomingHearing,
    recentClientMessages,
  });
});

router.get("/clients", async (_req, res) => {
  const clients = await prisma.user.findMany({
    where: { role: Role.CLIENT, disabled: false },
    select: { id: true, email: true, createdAt: true },
    orderBy: { email: "asc" },
  });
  res.json({ clients });
});

const createUserBody = z.object({
  email: emailField,
  password: z.string().min(8),
  role: z.nativeEnum(Role),
});

router.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { email: "asc" },
    select: {
      id: true,
      email: true,
      role: true,
      disabled: true,
      createdAt: true,
    },
  });
  res.json({ users });
});

router.post("/users", async (req, res) => {
  const parsed = createUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password, role } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, role },
    select: {
      id: true,
      email: true,
      role: true,
      disabled: true,
      createdAt: true,
    },
  });
  res.status(201).json({ user });
});

const patchUserBody = z.object({
  email: emailField.optional(),
  role: z.nativeEnum(Role).optional(),
  disabled: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

router.patch("/users/:userId", async (req, res) => {
  const userId = paramStr(req.params.userId);
  if (!userId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = patchUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const data: {
    email?: string;
    role?: Role;
    disabled?: boolean;
    passwordHash?: string;
  } = {};
  if (parsed.data.email !== undefined) data.email = parsed.data.email;
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.disabled !== undefined) data.disabled = parsed.data.disabled;
  if (parsed.data.password !== undefined) {
    data.passwordHash = await hashPassword(parsed.data.password);
  }
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        disabled: true,
        createdAt: true,
      },
    });
    res.json({ user });
  } catch {
    res.status(404).json({ error: "User not found" });
  }
});

router.delete("/users/:userId", async (req, res) => {
  const userId = paramStr(req.params.userId);
  if (!userId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  if (userId === req.user!.id) {
    res.status(400).json({ error: "Cannot delete your own account" });
    return;
  }
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (target.role === Role.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
    if (adminCount <= 1) {
      res.status(400).json({ error: "Cannot delete the last admin" });
      return;
    }
  }
  await prisma.user.delete({ where: { id: userId } });
  res.json({ ok: true });
});

const listQuery = z.object({
  archived: z.enum(["true", "false"]).optional(),
  q: z.string().optional(),
});

router.get("/cases", async (req, res) => {
  const parsed = listQuery.safeParse(req.query);
  const archived =
    parsed.data?.archived === "true"
      ? true
      : parsed.data?.archived === "false"
        ? false
        : undefined;
  const search = parsed.data?.q?.trim();
  const cases = await prisma.case.findMany({
    where: {
      ...(archived !== undefined ? { archived } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { reference: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      assignments: {
        include: { user: { select: { id: true, email: true } } },
      },
      _count: {
        select: { documents: true, messages: true, hearings: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  res.json({ cases });
});

const createCaseBody = z.object({
  title: z.string().min(1),
  reference: z.string().optional(),
  status: z.string().optional(),
  displayOnWebsite: z.boolean().optional(),
});

router.post("/cases", async (req, res) => {
  const parsed = createCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const c = await prisma.case.create({
    data: {
      title: parsed.data.title,
      reference: parsed.data.reference,
      status: parsed.data.status ?? "open",
      displayOnWebsite: parsed.data.displayOnWebsite ?? false,
    },
  });
  res.status(201).json({ case: c });
});

router.get("/cases/:caseId", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  if (!caseId) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }
  const c = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      assignments: {
        include: { user: { select: { id: true, email: true } } },
      },
      statusHistory: {
        include: { author: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
      },
      documents: {
        include: { uploadedBy: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
      },
      hearings: { orderBy: { scheduledAt: "asc" } },
      _count: { select: { messages: true } },
    },
  });
  if (!c) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  res.json({ case: c });
});

const patchCaseBody = z.object({
  title: z.string().min(1).optional(),
  reference: z.string().nullable().optional(),
  archived: z.boolean().optional(),
  displayOnWebsite: z.boolean().optional(),
});

router.patch("/cases/:caseId", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  if (!caseId) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }
  const parsed = patchCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const data: {
    title?: string;
    reference?: string | null;
    archived?: boolean;
    displayOnWebsite?: boolean;
  } = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.reference !== undefined) data.reference = parsed.data.reference;
  if (parsed.data.archived !== undefined) data.archived = parsed.data.archived;
  if (parsed.data.displayOnWebsite !== undefined)
    data.displayOnWebsite = parsed.data.displayOnWebsite;
  try {
    const c = await prisma.case.update({
      where: { id: caseId },
      data,
    });
    res.json({ case: c });
  } catch {
    res.status(404).json({ error: "Case not found" });
  }
});

const assignBody = z.object({ userId: z.string().min(1) });

router.post("/cases/:caseId/assign", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  if (!caseId) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }
  const parsed = assignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const client = await prisma.user.findFirst({
    where: { id: parsed.data.userId, role: Role.CLIENT, disabled: false },
  });
  if (!client) {
    res.status(400).json({ error: "User is not a client" });
    return;
  }
  try {
    const row = await prisma.caseAssignment.create({
      data: { caseId, userId: parsed.data.userId },
      include: { user: { select: { id: true, email: true } } },
    });
    res.status(201).json({ assignment: row });
  } catch {
    res.status(409).json({ error: "Already assigned or invalid case" });
  }
});

router.delete("/cases/:caseId/assign/:userId", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  const userId = paramStr(req.params.userId);
  if (!caseId || !userId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await prisma.caseAssignment.delete({
      where: {
        caseId_userId: {
          caseId,
          userId,
        },
      },
    });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Assignment not found" });
  }
});

const statusBody = z.object({
  status: z.string().min(1),
  note: z.string().optional(),
});

router.post("/cases/:caseId/status", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  if (!caseId) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }
  const parsed = statusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const userId = req.user!.id;
  const existing = await prisma.case.findUnique({ where: { id: caseId } });
  if (!existing) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  const fromStatus = existing.status;
  const toStatus = parsed.data.status;

  const txResult = await prisma.$transaction([
    prisma.case.update({
      where: { id: caseId },
      data: { status: toStatus },
    }),
    prisma.caseStatusHistory.create({
      data: {
        caseId,
        authorId: userId,
        fromStatus,
        toStatus,
        note: parsed.data.note,
      },
    }),
  ]);
  const updated = txResult[0];

  await notifyAssignedClients(
    caseId,
    "Case status updated",
    `Status changed from "${fromStatus}" to "${toStatus}".${parsed.data.note ? ` Note: ${parsed.data.note}` : ""}`,
  );

  res.json({ case: updated });
});

router.post(
  "/cases/:caseId/documents",
  upload.single("file"),
  async (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "Missing file field (multipart 'file')" });
      return;
    }
    const caseId = paramStr(req.params.caseId);
    if (!caseId) {
      res.status(400).json({ error: "Invalid case id" });
      return;
    }
    const exists = await prisma.case.findUnique({ where: { id: caseId } });
    if (!exists) {
      fs.unlink(path.join(path.resolve(getEnv().UPLOAD_DIR), file.filename), () => {});
      res.status(404).json({ error: "Case not found" });
      return;
    }
    const doc = await prisma.document.create({
      data: {
        caseId,
        uploadedById: req.user!.id,
        originalName: String(file.originalname),
        storedName: String(file.filename),
        mimeType: file.mimetype || "application/octet-stream",
        size: file.size,
      },
    });
    res.status(201).json({ document: doc });
  },
);

const hearingBody = z.object({
  scheduledAt: z.string().min(1),
  venue: z.string().optional(),
  notes: z.string().optional(),
});

router.get("/cases/:caseId/hearings", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  if (!caseId) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }
  const list = await prisma.hearing.findMany({
    where: { caseId },
    orderBy: { scheduledAt: "asc" },
  });
  res.json({ hearings: list });
});

router.post("/cases/:caseId/hearings", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  if (!caseId) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }
  const parsed = hearingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const exists = await prisma.case.findUnique({ where: { id: caseId } });
  if (!exists) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  const when = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(when.getTime())) {
    res.status(400).json({ error: "Invalid scheduledAt" });
    return;
  }
  const h = await prisma.hearing.create({
    data: {
      caseId,
      scheduledAt: when,
      venue: parsed.data.venue,
      notes: parsed.data.notes,
    },
  });
  void emailAssignedClientsForNewHearing(
    caseId,
    exists.title,
    when,
    parsed.data.venue ?? null,
  ).catch((e) => console.error("[emailAssignedClientsForNewHearing]", e));
  res.status(201).json({ hearing: h });
});

const patchHearingBody = z.object({
  scheduledAt: z.string().min(1).optional(),
  venue: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

router.patch("/hearings/:hearingId", async (req, res) => {
  const hearingId = paramStr(req.params.hearingId);
  if (!hearingId) {
    res.status(400).json({ error: "Invalid hearing id" });
    return;
  }
  const parsed = patchHearingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const data: {
    scheduledAt?: Date;
    venue?: string | null;
    notes?: string | null;
  } = {};
  if (parsed.data.scheduledAt !== undefined) {
    const when = new Date(parsed.data.scheduledAt);
    if (Number.isNaN(when.getTime())) {
      res.status(400).json({ error: "Invalid scheduledAt" });
      return;
    }
    data.scheduledAt = when;
  }
  if (parsed.data.venue !== undefined) data.venue = parsed.data.venue;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;
  try {
    const h = await prisma.hearing.update({
      where: { id: hearingId },
      data,
    });
    res.json({ hearing: h });
  } catch {
    res.status(404).json({ error: "Hearing not found" });
  }
});

router.delete("/hearings/:hearingId", async (req, res) => {
  const hearingId = paramStr(req.params.hearingId);
  if (!hearingId) {
    res.status(400).json({ error: "Invalid hearing id" });
    return;
  }
  try {
    await prisma.hearing.delete({ where: { id: hearingId } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Hearing not found" });
  }
});

router.delete("/cases/:caseId/documents/:docId", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  const docId = paramStr(req.params.docId);
  if (!caseId || !docId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const doc = await prisma.document.findFirst({
    where: { id: docId, caseId },
  });
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  await prisma.document.delete({ where: { id: doc.id } });
  fs.unlink(path.join(path.resolve(getEnv().UPLOAD_DIR), doc.storedName), () => {});
  res.json({ ok: true });
});

/** Cases with no hearing scheduled in the future (alert stub for admins). */
router.get("/alerts/missing-upcoming-hearings", async (_req, res) => {
  const now = new Date();
  const cases = await prisma.case.findMany({
    where: { archived: false },
    include: {
      hearings: { where: { scheduledAt: { gte: now } } },
      assignments: { include: { user: { select: { email: true } } } },
    },
  });
  const flagged = cases.filter((c) => c.hearings.length === 0);
  res.json({
    count: flagged.length,
    cases: flagged.map((c) => ({
      id: c.id,
      title: c.title,
      reference: c.reference,
      status: c.status,
      clients: c.assignments.map((a) => a.user.email),
    })),
  });
});

export { router as adminPortalRouter };
