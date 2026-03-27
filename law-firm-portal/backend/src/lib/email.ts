import nodemailer from "nodemailer";
import type { Env } from "../config/env.js";

function logFallback(subject: string, text: string): void {
  console.log("[email] (not sent — configure SMTP or set EMAIL_ENABLED=true)");
  console.log(`[email] Subject: ${subject}\n${text}`);
}

function createTransport(env: Env) {
  if (!env.SMTP_HOST || !env.SMTP_PORT) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });
}

export function isEmailSendingConfigured(env: Env): boolean {
  return Boolean(env.EMAIL_ENABLED && env.SMTP_HOST && env.SMTP_PORT && env.SMTP_FROM);
}

export async function sendMail(
  env: Env,
  options: { to: string; subject: string; text: string; html?: string },
): Promise<void> {
  const from = env.SMTP_FROM || "noreply@localhost";
  if (!isEmailSendingConfigured(env)) {
    logFallback(options.subject, options.text);
    return;
  }
  const transport = createTransport(env);
  if (!transport) {
    logFallback(options.subject, options.text);
    return;
  }
  await transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html ?? options.text.replace(/\n/g, "<br/>"),
  });
}

export function publicPortalUrl(env: Env): string {
  const raw = env.APP_PUBLIC_URL || env.FRONTEND_ORIGIN;
  return raw.replace(/\/$/, "");
}
