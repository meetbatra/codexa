import type { Request, Response } from "express";
import { AnswerState } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { ApiResponse } from "../types";

function doubtIdFromRequest(req: Request) {
  return Array.isArray(req.params.doubtId)
    ? req.params.doubtId[0]
    : req.params.doubtId;
}

function serializeAnswer(answer: {
  id: string;
  doubtId: string;
  aiFeedbackDraft: string;
  teacherEdit: string | null;
  state: AnswerState;
  createdAt: Date;
}) {
  return {
    id: answer.id,
    doubtId: answer.doubtId,
    content: answer.teacherEdit ?? answer.aiFeedbackDraft,
    state: answer.state,
    createdAt: answer.createdAt,
  };
}

export async function submitForReview(req: Request, res: Response) {
  try {
    const answer = await prisma.doubtAnswer.findFirst({
      where: {
        doubtId: doubtIdFromRequest(req),
        doubt: { userId: req.user?.id },
      },
    });

    if (!answer) {
      return res.status(404).json({ success: false, error: "Answer not found" } satisfies ApiResponse);
    }

    if (answer.state !== AnswerState.DRAFT) {
      return res.status(400).json({
        success: false,
        error: "Answer must be in DRAFT state to submit for review",
      } satisfies ApiResponse);
    }

    const updatedAnswer = await prisma.doubtAnswer.update({
      where: { id: answer.id },
      data: { state: AnswerState.PENDING },
    });

    return res.status(200).json({
      success: true,
      data: serializeAnswer(updatedAnswer),
    } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit answer for review",
    } satisfies ApiResponse);
  }
}

export async function reviewAnswer(req: Request, res: Response) {
  try {
    const body = req.body as {
      action?: unknown;
      editedContent?: unknown;
    };

    if (body?.action !== "approve" && body?.action !== "reject") {
      return res.status(400).json({
        success: false,
        error: "Action must be approve or reject",
      } satisfies ApiResponse);
    }

    if (body.editedContent !== undefined && typeof body.editedContent !== "string") {
      return res.status(400).json({
        success: false,
        error: "editedContent must be a string",
      } satisfies ApiResponse);
    }

    const answer = await prisma.doubtAnswer.findFirst({
      where: { doubtId: doubtIdFromRequest(req) },
    });

    if (!answer) {
      return res.status(404).json({ success: false, error: "Answer not found" } satisfies ApiResponse);
    }

    if (answer.state !== AnswerState.PENDING) {
      return res.status(400).json({
        success: false,
        error: "Answer must be in PENDING state to review",
      } satisfies ApiResponse);
    }

    const updatedAnswer = await prisma.doubtAnswer.update({
      where: { id: answer.id },
      data: {
        state:
          body.action === "approve"
            ? AnswerState.APPROVED
            : AnswerState.REJECTED,
        ...(body.action === "approve" && body.editedContent !== undefined
          ? { teacherEdit: body.editedContent }
          : {}),
      },
    });

    return res.status(200).json({
      success: true,
      data: serializeAnswer(updatedAnswer),
    } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to review answer",
    } satisfies ApiResponse);
  }
}

export async function getPendingAnswers(req: Request, res: Response) {
  try {
    // Older AI answers were stored as DRAFT before the automatic review flow.
    // Promote them so they are not stranded outside the teacher queue.
    await prisma.doubtAnswer.updateMany({
      where: { state: AnswerState.DRAFT },
      data: { state: AnswerState.PENDING },
    });

    const answers = await prisma.doubtAnswer.findMany({
      where: { state: AnswerState.PENDING },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        doubtId: true,
        aiFeedbackDraft: true,
        teacherEdit: true,
        state: true,
        createdAt: true,
        doubt: {
          select: {
            id: true,
            title: true,
            body: true,
            createdAt: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: answers.map((answer) => ({
        ...serializeAnswer(answer),
        doubt: {
          id: answer.doubt.id,
          title: answer.doubt.title,
          body: answer.doubt.body,
          createdAt: answer.doubt.createdAt,
        },
      })),
    } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load pending answers",
    } satisfies ApiResponse);
  }
}
