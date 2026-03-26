import { Role } from "@prisma/client";
import { prisma } from "./prisma.js";

export async function userCanAccessCase(
  userId: string,
  role: Role,
  caseId: string,
): Promise<boolean> {
  if (role === Role.ADMIN) return true;
  const row = await prisma.caseAssignment.findUnique({
    where: { caseId_userId: { caseId, userId } },
  });
  return !!row;
}

export async function assertCaseAccess(
  userId: string,
  role: Role,
  caseId: string,
): Promise<{ ok: true } | { ok: false; status: 403 }> {
  const ok = await userCanAccessCase(userId, role, caseId);
  return ok ? { ok: true } : { ok: false, status: 403 };
}
