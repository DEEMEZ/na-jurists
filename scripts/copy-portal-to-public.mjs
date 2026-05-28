/**
 * After `vite build --base /portal/`, copies law-firm-portal/frontend/dist → public/portal
 * so Next.js serves the SPA at /portal on the same domain.
 */
import { cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dist = path.join(root, "law-firm-portal", "frontend", "dist");
const dest = path.join(root, "public", "portal");

await rm(dest, { recursive: true, force: true });
await cp(dist, dest, { recursive: true });
console.log("[copy-portal]", dist, "->", dest);
