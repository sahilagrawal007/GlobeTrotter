import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

/**
 * Must run AFTER requireAuth. Checks that the authenticated user has role "admin".
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "admin") {
    sendError(res, 403, "FORBIDDEN", "Admin access required");
    return;
  }
  next();
}
