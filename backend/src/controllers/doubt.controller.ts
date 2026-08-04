import type { Request, Response } from "express";
import { AnswerState } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { generateDoubtAnswer } from "../services/doubt.ai.service";
import type { ApiResponse } from "../types";

function validateDoubtBody(body: unknown) {
  if (!body || typeof body !== "object") return "Request body is required";

  const input = body as { title?: unknown; content?: unknown };
  if (typeof input.title !== "string" || input.title.trim().length === 0) {
    return "Title is required";
  }
  if (input.title.length > 200) return "Title must be 200 characters or fewer";
  if (typeof input.content !== "string" || input.content.trim().length === 0) {
    return "Content is required";
  }
  if (input.content.length > 2000) return "Content must be 2000 characters or fewer";

  return null;
}

function serializeDoubt(doubt: {
  id: string;
  title: string;
  body: string;
  userId: string;
  createdAt: Date;
  answers?: Array<{
    id: string;
    aiFeedbackDraft: string;
    state?: AnswerState;
    teacherEdit?: string | null;
    createdAt: Date;
  }>;
}) {
  return {
    id: doubt.id,
    title: doubt.title,
    content: doubt.body,
    studentId: doubt.userId,
    createdAt: doubt.createdAt,
    ...(doubt.answers
      ? {
          answers: doubt.answers.map((answer) => ({
            id: answer.id,
            content: answer.teacherEdit ?? answer.aiFeedbackDraft,
            ...(answer.state ? { state: answer.state } : {}),
            createdAt: answer.createdAt,
          })),
        }
      : {}),
  };
}

export async function postDoubt(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
    }

    const validationError = validateDoubtBody(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError } satisfies ApiResponse);
    }

    const { title, content } = req.body as { title: string; content: string };
    const doubt = await prisma.doubt.create({
      data: {
        title,
        body: content,
        userId: req.user.id,
      },
    });

    setImmediate(() => {
      void generateDoubtAnswer(title, content)
        .then((answer) =>
          prisma.doubtAnswer.create({
            data: {
              doubtId: doubt.id,
              aiFeedbackDraft: answer,
              state: AnswerState.DRAFT,
            },
          })
        )
        .catch((error) => {
          console.error("Failed to generate doubt answer:", error);
        });
    });

    return res.status(201).json({
      success: true,
      data: serializeDoubt(doubt),
    } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to post doubt",
    } satisfies ApiResponse);
  }
}

export async function getDoubts(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
    }

    const doubts = await prisma.doubt.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        body: true,
        userId: true,
        createdAt: true,
        answers: {
          where: { state: AnswerState.APPROVED },
          select: { id: true, aiFeedbackDraft: true, teacherEdit: true, createdAt: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: doubts.map(serializeDoubt),
    } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load doubts",
    } satisfies ApiResponse);
  }
}

export async function getMyDoubts(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
    }

    const doubts = await prisma.doubt.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        body: true,
        userId: true,
        createdAt: true,
        answers: {
          select: {
            id: true,
            aiFeedbackDraft: true,
            teacherEdit: true,
            state: true,
            createdAt: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: doubts.map(serializeDoubt),
    } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load your doubts",
    } satisfies ApiResponse);
  }
}
