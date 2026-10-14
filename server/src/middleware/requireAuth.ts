import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../services/auth.service";

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token: unknown = req.cookies?.token;
  if (!token || typeof token !== "string") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const payload = verifyJwt(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.userId = payload.userId;
  next();
}

export default requireAuth;
