import cors from "cors";
import express from "express";
import type { Env } from "./config/env.js";
import { apiRouter } from "./routes/api.routes.js";
import { authRouter } from "./routes/auth.routes.js";

export function createApp(env: Env) {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "law-firm-portal-api",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/auth", authRouter);
  app.use("/api/v1", apiRouter);

  return app;
}
