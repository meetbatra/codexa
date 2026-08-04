import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { ApiResponse } from "../types";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  role: z.nativeEnum(Role).optional().default(Role.STUDENT),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

function signToken(payload: {
  userId: string;
  email: string;
  role: Role;
}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const response: ApiResponse = {
        success: false,
        error: parsed.error.issues.map((issue) => issue.message).join(", "),
      };
      return res.status(400).json(response);
    }

    const { name, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: "Email already exists",
      };
      return res.status(409).json(response);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: userSelect,
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        token,
        user,
      },
    };
    return res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
    return res.status(500).json(response);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const response: ApiResponse = {
        success: false,
        error: parsed.error.issues.map((issue) => issue.message).join(", "),
      };
      return res.status(400).json(response);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid email or password",
      };
      return res.status(401).json(response);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid email or password",
      };
      return res.status(401).json(response);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };
    return res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
    return res.status(500).json(response);
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Unauthorized",
      };
      return res.status(401).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: req.user,
    };
    return res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load profile",
    };
    return res.status(500).json(response);
  }
}
