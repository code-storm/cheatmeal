import type { Request, Response, NextFunction } from "express";
import { verifyAdminJwt } from "../services/adminAuth.service";

export interface AdminAuthedRequest extends Request {
  adminId?: string;
}

export function requireAdminAuth(req: AdminAuthedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const payload = verifyAdminJwt(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.adminId = payload.adminId;
  next();
}

export default requireAdminAuth;
