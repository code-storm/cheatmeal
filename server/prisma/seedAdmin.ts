import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/services/auth.service";

// Standalone from seed.ts on purpose: provisioning/resetting an admin
// account should never force a full content reseed, and vice versa. Run
// via `npm run seed:admin` with ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD set
// in the environment - idempotent (upsert by email), so re-running this
// with a new ADMIN_SEED_PASSWORD against an existing email doubles as a
// password-reset tool for that admin.
//
// Uses the app's own libSQL-adapter-aware `prisma` export (not a bare
// `new PrismaClient()`) so this script actually honors
// TURSO_DATABASE_URL/TURSO_AUTH_TOKEN when set - a bare client only ever
// reads schema.prisma's plain `DATABASE_URL` datasource and would
// silently write to the local dev.db file even with Turso env vars set.

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
