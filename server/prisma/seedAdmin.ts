import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/services/auth.service";

// Standalone from seed.ts on purpose: provisioning/resetting an admin
// account should never force a full content reseed, and vice versa. Run
// via `npm run seed:admin` with ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD set
// in the environment - idempotent (upsert by email), so re-running this
// with a new ADMIN_SEED_PASSWORD against an existing email doubles as a
// password-reset tool for that admin.

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must both be set in the environment.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_SEED_PASSWORD must be at least 8 characters long.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  const admin = await prisma.adminUser.upsert({
    where: { email: normalizedEmail },
    update: { passwordHash },
    create: { email: normalizedEmail, passwordHash },
  });

  console.log(`Admin account ready: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error("Admin seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
