import { describe, expect, it } from "vitest";
import { z } from "zod";
import { emailField } from "./userEmail.js";

const schema = z.object({ email: emailField });

describe("emailField", () => {
  it("trims and lowercases valid emails", () => {
    const r = schema.safeParse({ email: "  Client@Example.COM  " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("client@example.com");
  });

  it("rejects invalid strings", () => {
    expect(schema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(schema.safeParse({ email: "" }).success).toBe(false);
  });
});
