import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const rounds = 10;
  const adminEmail = "admin@najurists.local";
  const clientEmail = "client@najurists.local";

  const adminHash = await bcrypt.hash("Admin123!", rounds);
  const clientHash = await bcrypt.hash("Client123!", rounds);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminHash, role: Role.ADMIN },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  const client = await prisma.user.upsert({
    where: { email: clientEmail },
    update: { passwordHash: clientHash, role: Role.CLIENT },
    create: {
      email: clientEmail,
      passwordHash: clientHash,
      role: Role.CLIENT,
    },
  });

  let demoCase = await prisma.case.findFirst({
    where: { reference: "DM-001" },
  });
  if (!demoCase) {
    demoCase = await prisma.case.create({
      data: {
        title: "Demo matter (seed)",
        reference: "DM-001",
        status: "open",
      },
    });
  }

  await prisma.caseAssignment.upsert({
    where: {
      caseId_userId: { caseId: demoCase.id, userId: client.id },
    },
    update: {},
    create: {
      caseId: demoCase.id,
      userId: client.id,
    },
  });

  console.log("[seed] Admin:", adminEmail, "| Client:", clientEmail);
  console.log("[seed] Demo case linked to client.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
