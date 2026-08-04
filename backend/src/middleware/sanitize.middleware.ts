import type { NextFunction, Request, Response } from "express";
import { sanitizeObject } from "../utils/sanitize";

export function sanitizeBody(limits: Record<string, number>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
      req.body = sanitizeObject(req.body as Record<string, string>, limits);
    }

    next();
  };
}
