import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { getEnv } from "../src/config/env.js";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

const adminEmail = "admin@najurists.local";
const clientEmail = "client@najurists.local";

describe("Phase 1 auth & RBAC", () => {
  const app = createApp(getEnv());

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("admin login can access /api/v1/admin/ping", async () => {
    const login = await request(app)
      .post("/auth/login")
      .send({ email: adminEmail, password: "Admin123!" });
    expect(login.status).toBe(200);
    const token = login.body.accessToken as string;
    expect(token).toBeTruthy();

    const res = await request(app)
      .get("/api/v1/admin/ping")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.scope).toBe("admin");
  });

  it("admin cannot access /api/v1/client/ping", async () => {
    const login = await request(app)
      .post("/auth/login")
      .send({ email: adminEmail, password: "Admin123!" });
    const token = login.body.accessToken as string;

    const res = await request(app)
      .get("/api/v1/client/ping")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("client login can access /api/v1/client/ping", async () => {
    const login = await request(app)
      .post("/auth/login")
      .send({ email: clientEmail, password: "Client123!" });
    expect(login.status).toBe(200);
    const token = login.body.accessToken as string;

    const res = await request(app)
      .get("/api/v1/client/ping")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.scope).toBe("client");
  });

  it("client cannot access /api/v1/admin/ping", async () => {
    const login = await request(app)
      .post("/auth/login")
      .send({ email: clientEmail, password: "Client123!" });
    const token = login.body.accessToken as string;

    const res = await request(app)
      .get("/api/v1/admin/ping")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("GET /auth/me returns user with valid token", async () => {
    const login = await request(app)
      .post("/auth/login")
      .send({ email: clientEmail, password: "Client123!" });
    const token = login.body.accessToken as string;

    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(clientEmail);
    expect(res.body.user.role).toBe("CLIENT");
  });
});
