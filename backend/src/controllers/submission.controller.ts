import type { Request, Response } from "express";
import { Role, SubmissionStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { runTestCases } from "../lib/judge0";
import { generateCodeFeedback } from "../services/ai.service";
import type { ApiResponse } from "../types";

const submitSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required"),
  code: z.string().min(1, "Code is required"),
  language: z.enum(["python", "javascript", "cpp", "java"]),
});

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
});

function getSubmissionStatus(results: Array<{ passed: boolean; error?: string }>) {
  if (results.every((result) => result.passed)) return SubmissionStatus.ACCEPTED;

  const errors = results
    .filter((result) => !result.passed)
    .map((result) => result.error?.toLowerCase() ?? "");

  if (errors.some((error) => error.includes("compilation"))) {
    return SubmissionStatus.COMPILATION_ERROR;
  }
  if (errors.some((error) => error.includes("time limit") || error.includes("timed out"))) {
    return SubmissionStatus.TIME_LIMIT_EXCEEDED;
  }
  if (errors.some((error) => error.includes("wrong answer"))) {
    return SubmissionStatus.WRONG_ANSWER;
  }
  return SubmissionStatus.RUNTIME_ERROR;
}

export async function submit(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== Role.STUDENT) {
      return res.status(403).json({ success: false, error: "Only students can submit code" } satisfies ApiResponse);
    }

    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map((issue) => issue.message).join(", "),
      } satisfies ApiResponse);
    }

    const problem = await prisma.problem.findUnique({ where: { id: parsed.data.problemId } });
    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found" } satisfies ApiResponse);
    }

    const testCases = z.array(testCaseSchema).safeParse(problem.testCases);
    if (!testCases.success) {
      return res.status(500).json({ success: false, error: "Problem test cases are invalid" } satisfies ApiResponse);
    }

    const langConfig = await prisma.problemLanguageConfig.findUnique({
      where: { problemId_language: { problemId: problem.id, language: parsed.data.language } },
      select: { wrapperCode: true },
    });
    if (!langConfig) {
      return res.status(400).json({ success: false, error: `No execution config for language: ${parsed.data.language}` } satisfies ApiResponse);
    }

    const submission = await prisma.submission.create({
      data: {
        userId: req.user.id,
        problemId: problem.id,
        code: parsed.data.code,
        language: parsed.data.language,
        status: SubmissionStatus.PENDING,
      },
    });

    const testResults = await runTestCases(parsed.data.code, parsed.data.language, testCases.data, langConfig.wrapperCode);
    const status = getSubmissionStatus(testResults);
    const updatedSubmission = await prisma.submission.update({
      where: { id: submission.id },
      data: { status, testResults },
      include: { problem: { select: { title: true } } },
    });

    const { aiFeedback: _aiFeedback, ...submissionResponse } = updatedSubmission;
    const response = res.status(200).json({
      success: true,
      data: submissionResponse,
    } satisfies ApiResponse);
    setImmediate(() => {
      void generateCodeFeedback(
        submission.code,
        submission.language,
        updatedSubmission.status
      )
        .then((feedback) =>
          prisma.submission.update({
            where: { id: submission.id },
            data: { aiFeedback: feedback },
          })
        )
        .catch((error) => {
          console.error("Failed to generate AI feedback:", error);
        });
    });
    return response;
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to execute submission",
    } satisfies ApiResponse);
  }
}

export async function runCode(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== Role.STUDENT) {
      return res.status(403).json({ success: false, error: "Only students can run code" } satisfies ApiResponse);
    }

    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map((issue) => issue.message).join(", "),
      } satisfies ApiResponse);
    }

    const problem = await prisma.problem.findUnique({ where: { id: parsed.data.problemId } });
    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found" } satisfies ApiResponse);
    }

    const testCases = z.array(testCaseSchema).safeParse(problem.testCases);
    if (!testCases.success) {
      return res.status(500).json({ success: false, error: "Problem test cases are invalid" } satisfies ApiResponse);
    }

    const langConfig = await prisma.problemLanguageConfig.findUnique({
      where: { problemId_language: { problemId: problem.id, language: parsed.data.language } },
      select: { wrapperCode: true },
    });
    if (!langConfig) {
      return res.status(400).json({ success: false, error: `No execution config for language: ${parsed.data.language}` } satisfies ApiResponse);
    }

    const testResults = await runTestCases(parsed.data.code, parsed.data.language, testCases.data, langConfig.wrapperCode);
    const status = getSubmissionStatus(testResults);

    return res.status(200).json({
      success: true,
      data: {
        status,
        testResults,
      },
    } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to run code",
    } satisfies ApiResponse);
  }
}

export async function getSubmissions(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);

    const submissions = await prisma.submission.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { problem: { select: { title: true } } },
    });

    return res.status(200).json({ success: true, data: submissions } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load submissions",
    } satisfies ApiResponse);
  }
}

export async function getSubmissionById(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
    const submissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, userId: req.user.id },
      include: { problem: { select: { title: true } } },
    });

    if (!submission) {
      return res.status(404).json({ success: false, error: "Submission not found" } satisfies ApiResponse);
    }

    return res.status(200).json({ success: true, data: submission } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load submission",
    } satisfies ApiResponse);
  }
}
