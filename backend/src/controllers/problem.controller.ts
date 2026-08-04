import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { ApiResponse } from "../types";

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
});

const createProblemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  testCases: z.array(testCaseSchema).min(1, "At least one test case is required"),
});

export async function createProblem(req: Request, res: Response) {
  try {
    const parsed = createProblemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map((issue) => issue.message).join(", "),
      } satisfies ApiResponse);
    }

    const problem = await prisma.problem.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        testCases: parsed.data.testCases,
      },
    });

    return res.status(201).json({ success: true, data: problem } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create problem",
    } satisfies ApiResponse);
  }
}

export async function getProblems(_req: Request, res: Response) {
  try {
    const problems = await prisma.problem.findMany({
      select: { id: true, title: true, description: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: problems } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load problems",
    } satisfies ApiResponse);
  }
}

export async function getProblemById(req: Request, res: Response) {
  try {
    const problemId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: { id: true, title: true, description: true, createdAt: true, testCases: true },
    });

    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found" } satisfies ApiResponse);
    }

    const testCaseCount = Array.isArray(problem.testCases) ? problem.testCases.length : 0;
    return res.status(200).json({
      success: true,
      data: {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        createdAt: problem.createdAt,
        testCaseCount,
      },
    } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load problem",
    } satisfies ApiResponse);
  }
}
