import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const JWT_EXPIRY = "30d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in the environment");
  }
  return secret;
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export interface JwtPayload {
  userId: string;
}

export function signJwt(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: JWT_EXPIRY });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "object" && decoded !== null && "userId" in decoded) {
      return { userId: String((decoded as Record<string, unknown>).userId) };
    }
    return null;
  } catch {
    return null;
  }
}
