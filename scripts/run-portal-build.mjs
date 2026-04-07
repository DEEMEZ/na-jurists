/**
 * Loads root `.env.production` (+ optional `.env.production.local`) so `VITE_*`
 * lives next to Next.js env, then builds the portal and copies to `public/portal`.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

config({ path: resolve(root, ".env.production") });
const local = resolve(root, ".env.production.local");
if (existsSync(local)) {
  config({ path: local, override: true });
}

const frontend = resolve(root, "law-firm-portal", "frontend");

const build = spawnSync("npm", ["run", "build:mono"], {
  cwd: frontend,
  env: process.env,
  stdio: "inherit",
  shell: true,
});
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const copy = spawnSync(process.execPath, [resolve(root, "scripts", "copy-portal-to-public.mjs")], {
  cwd: root,
  stdio: "inherit",
});
process.exit(copy.status ?? 0);
