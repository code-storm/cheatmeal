import { Router } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword, signJwt } from "../services/auth.service";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/auth/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: "A valid email address is required." });
      return;
    }
    if (typeof password !== "string" || password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters long." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash },
    });

    const token = signJwt(user.id);

    res.status(201).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = signJwt(user.id);

    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    next(err);
  }
});

// Stateless JWT - there's no server-side session to invalidate. The real
// "log out" action is the client deleting its stored token; this route
// stays only so the client has a stable endpoint to call for symmetry.
router.post("/auth/logout", (_req, res) => {
  res.json({ ok: true });
});

router.get("/auth/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const profile = await prisma.pregnancyProfile.findUnique({ where: { userId } });

    res.json({ user: { id: user.id, email: user.email }, hasProfile: Boolean(profile) });
  } catch (err) {
    next(err);
  }
});

export default router;
