import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { assertCaseAccess } from "../lib/caseAccess.js";
import { paramStr } from "../lib/httpParams.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole(Role.CLIENT));

router.get("/dashboard", async (req, res) => {
  const userId = req.user!.id;
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const assignments = await prisma.caseAssignment.findMany({
    where: { userId },
    select: { caseId: true },
  });
  const caseIds = [...new Set(assignments.map((a) => a.caseId))];
  if (caseIds.length === 0) {
    res.json({
      activeMatters: 0,
      openMatters: 0,
      upcomingHearings30d: 0,
      unreadNotifications: 0,
      messagesFromFirm: 0,
      nextHearings: [],
      recentFirmMessages: [],
    });
    return;
  }

  const assignedMatters = await prisma.case.count({
    where: { id: { in: caseIds } },
  });
  const openMatters = await prisma.case.count({
    where: { id: { in: caseIds }, archived: false },
  });
  const upcomingHearings30d = await prisma.hearing.count({
    where: {
      caseId: { in: caseIds },
      scheduledAt: { gte: now, lte: in30 },
    },
  });
  const unreadNotifications = await prisma.notification.count({
    where: { userId, read: false },
  });
  const messagesFromFirm = await prisma.message.count({
    where: {
      caseId: { in: caseIds },
      senderId: { not: userId },
    },
  });

  const hearRows = await prisma.hearing.findMany({
    where: {
      caseId: { in: caseIds },
      scheduledAt: { gte: now },
    },
    orderBy: { scheduledAt: "asc" },
    take: 12,
    include: {
      case: { select: { id: true, title: true, archived: true } },
    },
  });
  const nextHearings = hearRows
    .filter((h) => !h.case.archived)
    .map((h) => ({
      id: h.id,
      caseId: h.caseId,
      caseTitle: h.case.title,
      scheduledAt: h.scheduledAt.toISOString(),
      venue: h.venue,
    }));

  const msgRows = await prisma.message.findMany({
    where: {
      caseId: { in: caseIds },
      senderId: { not: userId },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      case: { select: { id: true, title: true } },
    },
  });
  const recentFirmMessages = msgRows.map((m) => ({
    id: m.id,
    caseId: m.caseId,
    caseTitle: m.case.title,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));

  res.json({
    activeMatters: assignedMatters,
    openMatters,
    upcomingHearings30d,
    unreadNotifications,
    messagesFromFirm,
    nextHearings,
    recentFirmMessages,
  });
});

router.get("/notifications", async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ notifications });
});

/** Mark all notifications read for this client (e.g. when opening the bell menu). */
router.post("/notifications/read-all", async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { userId: req.user!.id, read: false },
    data: { read: true },
  });
  res.json({ ok: true, count: result.count });
});

router.patch("/notifications/:notificationId/read", async (req, res) => {
  const nid = paramStr(req.params.notificationId);
  if (!nid) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const n = await prisma.notification.findFirst({
    where: { id: nid, userId: req.user!.id },
  });
  if (!n) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await prisma.notification.update({
    where: { id: n.id },
    data: { read: true },
  });
  res.json({ ok: true });
});

router.get("/cases", async (req, res) => {
  const userId = req.user!.id;
  const rows = await prisma.caseAssignment.findMany({
    where: { userId },
    include: { case: true },
    orderBy: { case: { updatedAt: "desc" } },
  });
  res.json({ cases: rows.map((r) => r.case) });
});

router.get("/cases/:caseId", async (req, res) => {
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
    },
  });
  if (!c) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  res.json({ case: c });
});

export { router as mePortalRouter };
