import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { getEnv } from "../config/env.js";

function uploadDir(): string {
  return path.resolve(getEnv().UPLOAD_DIR);
}

export function ensureUploadDir(): void {
  fs.mkdirSync(uploadDir(), { recursive: true });
}

export function createCaseUpload(): multer.Multer {
  ensureUploadDir();
  const env = getEnv();
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, uploadDir());
      },
      filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        cb(null, `${randomUUID()}-${safe}`);
      },
    }),
    limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  });
}
