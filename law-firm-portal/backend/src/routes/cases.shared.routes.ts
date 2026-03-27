import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { z } from "zod";
import { getEnv } from "../config/env.js";
import { assertCaseAccess } from "../lib/caseAccess.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { paramStr } from "../lib/httpParams.js";

const router = Router();
router.use(requireAuth);

router.get("/:caseId/messages", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  if (!caseId) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }
  const gate = await assertCaseAccess(
    req.user!.id,
    req.user!.role,
    caseId,
  );
  if (!gate.ok) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const messages = await prisma.message.findMany({
    where: { caseId },
    include: {
      sender: { select: { id: true, email: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 300,
  });
  res.json({ messages });
});

const messageBody = z.object({
  body: z.string().min(1).max(8000),
});

router.post("/:caseId/messages", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  if (!caseId) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }
  const parsed = messageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const gate = await assertCaseAccess(
    req.user!.id,
    req.user!.role,
    caseId,
  );
  if (!gate.ok) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const msg = await prisma.message.create({
    data: {
      caseId,
      senderId: req.user!.id,
      body: parsed.data.body,
    },
    include: {
      sender: { select: { id: true, email: true, role: true } },
    },
  });
  res.status(201).json({ message: msg });
});

router.get("/:caseId/documents", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  if (!caseId) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }
  const gate = await assertCaseAccess(
    req.user!.id,
    req.user!.role,
    caseId,
  );
  if (!gate.ok) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const documents = await prisma.document.findMany({
    where: { caseId },
    include: { uploadedBy: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ documents });
});

router.get("/:caseId/documents/:docId/file", async (req, res) => {
  const caseId = paramStr(req.params.caseId);
  const docId = paramStr(req.params.docId);
  if (!caseId || !docId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const gate = await assertCaseAccess(
    req.user!.id,
    req.user!.role,
    caseId,
  );
  if (!gate.ok) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const doc = await prisma.document.findFirst({
    where: { id: docId, caseId },
  });
  if (!doc) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const fullPath = path.join(path.resolve(getEnv().UPLOAD_DIR), doc.storedName);
  if (!fs.existsSync(fullPath)) {
    res.status(404).json({ error: "File missing on server" });
    return;
  }
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
  );
  res.setHeader("Content-Type", doc.mimeType);
  res.sendFile(fullPath);
});

export { router as casesSharedRouter };
