import { z } from "zod";

/** Trim, validate RFC-style email, store as lowercase. */
export const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .transform((s) => s.toLowerCase());
