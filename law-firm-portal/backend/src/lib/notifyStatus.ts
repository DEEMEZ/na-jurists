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
