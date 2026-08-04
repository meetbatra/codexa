import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const judge0Client = axios.create({
  baseURL: "https://judge0-ce.p.rapidapi.com",
  headers: {
    "x-rapidapi-key": process.env.JUDGE0_API_KEY ?? "",
    "x-rapidapi-host": process.env.JUDGE0_API_HOST ?? "judge0-ce.p.rapidapi.com",
    "Content-Type": "application/json",
  },
});

export const languageMap = {
  python: 71,
  javascript: 63,
  cpp: 54,
  java: 62,
} as const;

type TestCase = {
  input: string;
  expectedOutput: string;
};

type TestCaseResult = {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
};

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

function decode(value: string | null | undefined) {
  return value ? Buffer.from(value, "base64").toString("utf8") : "";
}

export async function createSubmission(
  code: string,
  languageId: number,
  stdin: string
): Promise<string> {
  const response = await judge0Client.post(
    "/submissions",
    {
      source_code: encode(code),
      language_id: languageId,
      stdin: encode(stdin),
    },
    { params: { base64_encoded: "true" } }
  );

  if (!response.data?.token) {
    throw new Error("Judge0 did not return a submission token");
  }

  return response.data.token;
}

export async function getSubmissionResult(token: string): Promise<any> {
  const response = await judge0Client.get(`/submissions/${token}`, {
    params: { base64_encoded: "true" },
  });

  return response.data;
}

export async function waitForResult(token: string): Promise<any> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 15_000) {
    const result = await getSubmissionResult(token);
    const statusId = result?.status?.id;

    if (statusId !== 1 && statusId !== 2) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error("Judge0 submission timed out after 15 seconds");
}

function resultError(result: any) {
  const statusDescription = result?.status?.description;
  const stderr = decode(result?.stderr).trim();
  const compileOutput = decode(result?.compile_output).trim();
  const message = decode(result?.message).trim();

  if (statusDescription === "Wrong Answer") return "Wrong Answer";
  if (statusDescription === "Time Limit Exceeded") return "Time Limit Exceeded";
  const compilerDiagnostic =
    statusDescription === "Compilation Error" ||
    /SyntaxError|(?:^|\n).*error:|';' expected/.test(stderr);
  if (compilerDiagnostic) {
    return `Compilation Error: ${compileOutput || stderr || "Compilation failed"}`;
  }
  if (stderr) return stderr;
  if (compileOutput) return compileOutput;
  if (message) return message;
  return statusDescription || "Execution failed";
}

export async function runTestCases(
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<TestCaseResult[]> {
  const languageId = languageMap[language as keyof typeof languageMap];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  return Promise.all(
    testCases.map(async (testCase) => {
      try {
        const token = await createSubmission(code, languageId, testCase.input);
        const result = await waitForResult(token);
        const actualOutput = decode(result?.stdout);
        const statusDescription = result?.status?.description;
        const passed =
          statusDescription === "Accepted" &&
          actualOutput.trim() === testCase.expectedOutput.trim();
        const error =
          !passed && statusDescription === "Accepted"
            ? "Wrong Answer"
            : resultError(result);

        return {
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput,
          ...(passed ? {} : { error }),
        };
      } catch (error) {
        return {
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "",
          error: error instanceof Error ? error.message : "Execution failed",
        };
      }
    })
  );
}
