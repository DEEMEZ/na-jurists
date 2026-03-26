import cron from "node-cron";
import { Role } from "@prisma/client";
import type { Env } from "../config/env.js";
import { sendMail } from "./email.js";
import { prisma } from "./prisma.js";

const KIND_UPCOMING_7D = "UPCOMING_7D";
const KIND_UPCOMING_1D = "UPCOMING_1D";

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Cases with no future hearing (same logic as admin alerts API). */
async function casesMissingUpcomingHearing() {
  const now = new Date();
  const cases = await prisma.case.findMany({
    where: { archived: false },
    include: {
      hearings: { where: { scheduledAt: { gte: now } } },
      assignments: { include: { user: { select: { email: true } } } },
    },
  });
  return cases.filter((c) => c.hearings.length === 0);
}

export async function runDailyHearingJobs(env: Env): Promise<void> {
  const label = "[cron] daily hearing jobs";
  try {
    await runMissingHearingDigestEmail(env);
    await runUpcomingHearingReminders(env);
    console.log(`${label} completed ${new Date().toISOString()}`);
  } catch (e) {
    console.error(`${label} error:`, e);
  }
}

async function runMissingHearingDigestEmail(env: Env): Promise<void> {
  const flagged = await casesMissingUpcomingHearing();
  if (flagged.length === 0) return;

  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN, disabled: false },
    select: { email: true },
  });
  if (admins.length === 0) return;

  const lines = flagged.map(
    (c) =>
      `- ${c.title}${c.reference ? ` (${c.reference})` : ""} — id ${c.id}`,
  );
  const text = [
    "The following open matters have no upcoming hearing scheduled (from today onward):",
    "",
    ...lines,
    "",
    `Digest generated at ${new Date().toISOString()}`,
  ].join("\n");

  for (const a of admins) {
    await sendMail(env, {
      to: a.email,
      subject: `[N&A Jurists] Daily hearing alert — ${flagged.length} matter(s) need scheduling`,
      text,
    });
  }
}

async function runUpcomingHearingReminders(env: Env): Promise<void> {
  const now = new Date();
  const in7d = addDays(now, 7);
  const in1d = addDays(now, 1);

  const upcoming = await prisma.hearing.findMany({
    where: {
      scheduledAt: { gt: now },
      case: { archived: false },
    },
    include: {
      case: {
        include: {
          assignments: { include: { user: { select: { id: true, email: true, role: true } } } },
        },
      },
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN, disabled: false },
    select: { email: true },
  });

  for (const h of upcoming) {
    const at = h.scheduledAt;
    if (at <= now) continue;

    if (at <= in1d) {
      const exists = await prisma.hearingReminder.findUnique({
        where: {
          hearingId_kind: { hearingId: h.id, kind: KIND_UPCOMING_1D },
        },
      });
      if (!exists) {
        await sendHearingReminderEmails(env, h, "within 24 hours", admins);
        await prisma.hearingReminder.create({
          data: { hearingId: h.id, kind: KIND_UPCOMING_1D },
        });
      }
      continue;
    }

    if (at <= in7d) {
      const exists = await prisma.hearingReminder.findUnique({
        where: {
          hearingId_kind: { hearingId: h.id, kind: KIND_UPCOMING_7D },
        },
      });
      if (!exists) {
        await sendHearingReminderEmails(env, h, "within 7 days", admins);
        await prisma.hearingReminder.create({
          data: { hearingId: h.id, kind: KIND_UPCOMING_7D },
        });
      }
    }
  }
}

async function sendHearingReminderEmails(
  env: Env,
  h: {
    id: string;
    scheduledAt: Date;
    venue: string | null;
    case: {
      title: string;
      reference: string | null;
      assignments: { user: { email: string; role: Role } }[];
    };
  },
  windowLabel: string,
  admins: { email: string }[],
): Promise<void> {
  const when = h.scheduledAt.toISOString();
  const ref = h.case.reference ? ` · Ref: ${h.case.reference}` : "";
  const base = [
    `Matter: ${h.case.title}${ref}`,
    `Hearing: ${when}${h.venue ? ` · ${h.venue}` : ""}`,
    `This hearing is ${windowLabel}.`,
  ].join("\n");

  const clientEmails = new Set<string>();
  for (const a of h.case.assignments) {
    if (a.user.role === Role.CLIENT) clientEmails.add(a.user.email);
  }
  for (const email of clientEmails) {
    await sendMail(env, {
      to: email,
      subject: `[N&A Jurists] Upcoming hearing reminder — ${h.case.title}`,
      text: `Dear client,\n\n${base}\n\n— N&A Jurists`,
    });
  }
  for (const a of admins) {
    await sendMail(env, {
      to: a.email,
      subject: `[N&A Jurists] Upcoming hearing (${windowLabel}) — ${h.case.title}`,
      text: `Admin reminder:\n\n${base}`,
    });
  }
}

export function startScheduler(env: Env): void {
  if (!env.CRON_ENABLED) {
    console.log("[cron] disabled (CRON_ENABLED=false)");
    return;
  }
  const schedule = env.CRON_SCHEDULE || "0 8 * * *";
  cron.schedule(schedule, () => {
    void runDailyHearingJobs(env);
  });
  console.log(`[cron] scheduled: "${schedule}"`);
}
