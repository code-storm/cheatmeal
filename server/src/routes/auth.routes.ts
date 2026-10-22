import { Router } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword, signJwt } from "../services/auth.service";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOKIE_NAME = "token";
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// In production, the frontend (Vercel) and backend (Render) are on
// different origins, so this is a cross-site cookie - sameSite: "none"
// is required for the browser to send it at all, which in turn requires
// secure: true (browsers reject sameSite: "none" without secure).
// Locally both run on localhost over http, where "lax"/non-secure is both
// sufficient and necessary (secure cookies aren't sent over plain http).
const isProd = process.env.NODE_ENV === "production";

function setAuthCookie(res: import("express").Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

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
    setAuthCookie(res, token);

    res.status(201).json({ user: { id: user.id, email: user.email } });
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
    setAuthCookie(res, token);

    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/logout", (_req, res) => {
  // clearCookie must be called with the same sameSite/secure attributes
  // the cookie was originally set with, or some browsers won't match it.
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
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
