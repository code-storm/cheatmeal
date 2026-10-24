import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { verifyPassword, signAdminJwt } from "../../services/adminAuth.service";
import { requireAdminAuth, type AdminAuthedRequest } from "../../middleware/requireAdminAuth";

const router = Router();

// No /auth/signup route here, deliberately - admin accounts are
// provisioned only via `npm run seed:admin` (prisma/seedAdmin.ts), never
// through a public HTTP endpoint.

router.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
    if (!admin) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = signAdminJwt(admin.id);

    res.json({ admin: { id: admin.id, email: admin.email }, token });
  } catch (err) {
    next(err);
  }
});

// Stateless JWT, same rationale as the regular /auth/logout - no
// server-side session to invalidate; kept for a stable client endpoint.
router.post("/auth/logout", (_req, res) => {
  res.json({ ok: true });
});

router.get("/auth/me", requireAdminAuth, async (req: AdminAuthedRequest, res, next) => {
  try {
    const adminId = req.adminId as string;
    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json({ admin: { id: admin.id, email: admin.email } });
  } catch (err) {
    next(err);
  }
});

export default router;
