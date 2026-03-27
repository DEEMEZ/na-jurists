import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().default(4000),
  /** Portal SPA origin (CORS). */
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
  /** Public URL for links in emails (password reset). Defaults to FRONTEND_ORIGIN. */
  APP_PUBLIC_URL: z.string().optional(),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string().min(16),
  /** Access JWT lifetime in seconds (default 15 minutes). */
  ACCESS_TOKEN_EXPIRES_SEC: z.coerce.number().default(900),
  REFRESH_TOKEN_DAYS: z.coerce.number().default(7),
  /** Local directory for case document uploads (dev: ./uploads). */
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_UPLOAD_MB: z.coerce.number().default(15),
  /** Set true and configure SMTP to send real email (otherwise logged to console). */
  EMAIL_ENABLED: z.coerce.boolean().default(false),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  /** From address, e.g. "N&A Jurists <portal@example.com>". */
  SMTP_FROM: z.string().optional(),
  PASSWORD_RESET_EXPIRES_MIN: z.coerce.number().default(60),
  /** Daily jobs: missing-hearing digest + upcoming reminders (node-cron syntax). */
  CRON_ENABLED: z.coerce.boolean().default(true),
  CRON_SCHEDULE: z.string().default("0 8 * * *"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error("[env] validation failed:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables (check .env against .env.example)");
  }
  cached = parsed.data;
  return cached;
}
