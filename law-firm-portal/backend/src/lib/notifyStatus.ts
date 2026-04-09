import { Role } from "@prisma/client";
import { getEnv } from "../config/env.js";
import { sendMail } from "./email.js";
import { prisma } from "./prisma.js";

export async function notifyAssignedClients(
  caseId: string,
  title: string,
  body: string,
): Promise<void> {
  const assignments = await prisma.caseAssignment.findMany({
    where: { caseId },
    select: { userId: true },
  });
  if (assignments.length === 0) return;
  await prisma.notification.createMany({
    data: assignments.map((a) => ({
      userId: a.userId,
      caseId,
      title,
      body,
    })),
  });

  const env = getEnv();
  const userIds = assignments.map((a) => a.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, disabled: false },
    select: { email: true },
  });
  const text = `${body}\n\n— N&A Jurists Portal`;
  for (const u of users) {
    await sendMail(env, {
      to: u.email,
      subject: title,
      text,
    });
  }
}

/** Email assigned clients when the firm posts a message on a matter (Prisma API only). */
export async function emailAssignedClientsForNewMessage(
  caseId: string,
  caseTitle: string,
  senderRole: Role,
  body: string,
): Promise<void> {
  if (senderRole !== Role.ADMIN) return;
  const env = getEnv();
  const assignments = await prisma.caseAssignment.findMany({
    where: { caseId },
    include: { user: { select: { email: true, disabled: true } } },
  });
  const preview = body.trim().slice(0, 600);
  for (const a of assignments) {
    if (a.user.disabled) continue;
    await sendMail(env, {
      to: a.user.email,
      subject: `New message — ${caseTitle}`,
      text: `${preview}${body.length > 600 ? "…" : ""}\n\nSign in to the client portal to reply.\n— N&A Jurists`,
    });
  }
}

/** Email assigned clients when a hearing is scheduled (Prisma API only). */
export async function emailAssignedClientsForNewHearing(
  caseId: string,
  caseTitle: string,
  scheduledAt: Date,
  venue: string | null,
): Promise<void> {
  const env = getEnv();
  const assignments = await prisma.caseAssignment.findMany({
    where: { caseId },
    include: { user: { select: { email: true, disabled: true } } },
  });
  const whenStr = scheduledAt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const loc = venue ? `\nVenue: ${venue}` : "";
  for (const a of assignments) {
    if (a.user.disabled) continue;
    await sendMail(env, {
      to: a.user.email,
      subject: `Hearing scheduled — ${caseTitle}`,
      text: `A hearing has been scheduled for your matter.\n\nWhen: ${whenStr}${loc}\n\n— N&A Jurists Portal`,
    });
  }
}
