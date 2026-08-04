import { Role } from "@prisma/client";
import jwt, { type JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import type { JwtPayload } from "../types";

type AuthenticatedUser = {
  id: string;
  email: string;
  role: Role;
  name: string;
};

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authorization token missing",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: "JWT secret is not configured",
      });
    }

    const decoded = jwt.verify(token, secret) as JsonWebTokenPayload | string;
    if (typeof decoded === "string") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    const payload = decoded as JwtPayload;
    const user = (await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    })) as AuthenticatedUser | null;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
}

export function requireTeacher(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

    if (req.user.role !== Role.TEACHER) {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
    });
  }

  return next();
}
