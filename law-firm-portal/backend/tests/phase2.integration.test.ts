import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { getEnv } from "../src/config/env.js";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

const app = createApp(getEnv());

describe("Phase 2 — cases & RBAC", () => {
  let adminToken: string;
  let clientToken: string;
  let clientId: string;
  let testCaseId: string;

  beforeAll(async () => {
    await prisma.$connect();
    const admin = await request(app).post("/auth/login").send({
      email: "admin@najurists.local",
      password: "Admin123!",
    });
    adminToken = admin.body.accessToken as string;
    const client = await request(app).post("/auth/login").send({
      email: "client@najurists.local",
      password: "Client123!",
    });
    clientToken = client.body.accessToken as string;
    const me = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${clientToken}`);
    clientId = me.body.user.id as string;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("admin creates a case", async () => {
    const r = await request(app)
      .post("/api/v1/admin/cases")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Vitest matter", reference: "VT-P2" });
    expect(r.status).toBe(201);
    testCaseId = r.body.case.id as string;
  });

  it("client cannot access admin cases list", async () => {
    const r = await request(app)
      .get("/api/v1/admin/cases")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(r.status).toBe(403);
  });

  it("admin assigns client to case", async () => {
    const r = await request(app)
      .post(`/api/v1/admin/cases/${testCaseId}/assign`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ userId: clientId });
    expect(r.status).toBe(201);
  });

  it("client lists assigned case", async () => {
    const r = await request(app)
      .get("/api/v1/me/cases")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(r.status).toBe(200);
    const ids = (r.body.cases as { id: string }[]).map((c) => c.id);
    expect(ids).toContain(testCaseId);
  });

  it("client can post message on case", async () => {
    const r = await request(app)
      .post(`/api/v1/cases/${testCaseId}/messages`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ body: "Hello from client test" });
    expect(r.status).toBe(201);
  });

  it("admin updates status and creates notification for client", async () => {
    const r = await request(app)
      .post(`/api/v1/admin/cases/${testCaseId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "review", note: "Under review" });
    expect(r.status).toBe(200);
    const n = await request(app)
      .get("/api/v1/me/notifications")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(n.status).toBe(200);
    expect((n.body.notifications as unknown[]).length).toBeGreaterThan(0);
  });
});
