import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error("[Unhandled error]", err);
  sendError(res, 500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred");
}
