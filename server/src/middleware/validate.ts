import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendError } from "../utils/response";

type Target = "body" | "query" | "params";

/**
 * Zod validation middleware factory.
 * validate(schema)        → validates req.body (default)
 * validate(schema, "query") → validates req.query
 */
export function validate(schema: ZodSchema, target: Target = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const fields: Record<string, string> = {};
      (result.error as ZodError).errors.forEach((e) => {
        const key = e.path.join(".");
        fields[key] = e.message;
      });
      sendError(res, 400, "VALIDATION_ERROR", "Validation failed", fields);
      return;
    }
    // Replace with parsed+coerced values (important for query params)
    (req as Record<string, unknown>)[target] = result.data;
    next();
  };
}
