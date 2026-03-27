import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { getEnv } from "../config/env.js";

export type AccessPayload = {
  sub: string;
  email: string;
  role: Role;
};

export function signAccessToken(payload: AccessPayload): string {
  const env = getEnv();
  const signOptions: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_SEC,
  };
  return jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role },
    env.JWT_ACCESS_SECRET,
    signOptions,
  );
}

export function verifyAccessToken(token: string): AccessPayload {
  const env = getEnv();
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload & {
    sub: string;
    email: string;
    role: Role;
  };
  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  };
}

export function createRefreshTokenValue(): string {
  return crypto.randomBytes(48).toString("base64url");
}

export function refreshTokenExpiresAt(): Date {
  const env = getEnv();
  const d = new Date();
  d.setDate(d.getDate() + env.REFRESH_TOKEN_DAYS);
  return d;
}
