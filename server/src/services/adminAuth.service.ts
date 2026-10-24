import jwt from "jsonwebtoken";

// Deliberately does NOT import signJwt/verifyJwt/getJwtSecret from
// auth.service.ts - the two JWT systems must never be able to verify each
// other's tokens, so they use a distinct secret and a distinct payload
// shape ({ adminId }, not { userId }). hashPassword/verifyPassword ARE
// reused below since those are pure bcrypt wrappers with no User-specific
// logic - the separation that matters here is the signing/verification,
// not the password hashing.
export { hashPassword, verifyPassword } from "./auth.service";

// Shorter than the regular user token's 30d: an admin session grants
// destructive content-management power and is expected to be a short,
// deliberate work session, not a "stay logged in for a month" consumer
// login.
const ADMIN_JWT_EXPIRY = "12h";

function getAdminJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET is not set in the environment");
  }
  return secret;
}

export interface AdminJwtPayload {
  adminId: string;
}

export function signAdminJwt(adminId: string): string {
  return jwt.sign({ adminId }, getAdminJwtSecret(), { expiresIn: ADMIN_JWT_EXPIRY });
}

export function verifyAdminJwt(token: string): AdminJwtPayload | null {
  try {
    const decoded = jwt.verify(token, getAdminJwtSecret());
    if (typeof decoded === "object" && decoded !== null && "adminId" in decoded) {
      return { adminId: String((decoded as Record<string, unknown>).adminId) };
    }
    return null;
  } catch {
    return null;
  }
}
