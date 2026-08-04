"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CodeEditor from "../../../components/CodeEditor";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { NativeSelect, NativeSelectOption } from "../../../components/ui/native-select";
import { Skeleton } from "../../../components/ui/skeleton";
import { apiFetch } from "../../../lib/api";

const languages = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

const defaultCode: Record<string, string> = {
  python: "# Write your solution here\n",
  javascript: "// Write your solution here\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // Write your solution here\n    return 0;\n}\n",
  java: "import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n",
};

type TestCase = { input: string; expectedOutput: string };

type Problem = {
  id: string;
  title: string;
  description: string;
  testCases: TestCase[];
};

type TestResult = {
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
};

type Submission = {
  id: string;
  problemId: string;
  language: string;
  code?: string;
  status: string;
  aiFeedback?: string | null;
  testResults?: TestResult[] | null;
  createdAt: string;
  problem?: { id?: string; title?: string };
};

type DetailResponse = { data: Problem };
type SubmissionsResponse = { data: Submission[] };

type Tab = "tests" | "results" | "feedback";

export default function ProblemDetailPage() {
  return (
    <ProtectedRoute>
      <ProblemDetailContent />
    </ProtectedRoute>
  );
}

function ProblemDetailContent() {
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(defaultCode.python);
  const [activeTab, setActiveTab] = useState<Tab>("tests");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPage() {
      try {
        const [problemResponse, submissionsResponse] = await Promise.all([
          apiFetch(`/api/problems/${problemId}`) as Promise<DetailResponse>,
          apiFetch("/api/submissions") as Promise<SubmissionsResponse>,
        ]);
        if (active) {
          setProblem(problemResponse.data);
          setSubmissions(submissionsResponse.data ?? []);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load problem");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPage();
    return () => {
      active = false;
    };
  }, [problemId]);

  useEffect(() => {
    if (!currentSubmission?.id) return;
    if (currentSubmission.aiFeedback) return;

    const submissionId = currentSubmission.id;
    let active = true;
    async function pollFeedback() {
      try {
        const response = (await apiFetch(`/api/submissions/${submissionId}`)) as {
          data: Submission;
        };
        if (active) {
          setCurrentSubmission(response.data);
          setSubmissions((items) =>
            items.map((item) => (item.id === response.data.id ? response.data : item))
          );
        }
      } catch {
        // Feedback polling is best-effort and should not interrupt the results view.
      }
    }

    void pollFeedback();
    const interval = window.setInterval(pollFeedback, 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [currentSubmission?.id, currentSubmission?.aiFeedback]);

  const recentSubmissions = useMemo(
    () =>
      submissions
        .filter((submission) => submission.problemId === problemId)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 5),
    [problemId, submissions]
  );

  function handleLanguageChange(nextLanguage: string) {
    setLanguage(nextLanguage);
    setCode(defaultCode[nextLanguage] ?? "");
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    try {
      const response = (await apiFetch("/api/submissions", {
        method: "POST",
        body: JSON.stringify({ problemId, language, code }),
      })) as { data: Submission };
      setCurrentSubmission(response.data);
      setSubmissions((items) => [response.data, ...items.filter((item) => item.id !== response.data.id)]);
      setActiveTab("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit code");
    } finally {
      setSubmitting(false);
    }
  }

  async function openSubmission(submissionId: string) {
    try {
      const response = (await apiFetch(`/api/submissions/${submissionId}`)) as {
        data: Submission;
      };
      setCurrentSubmission(response.data);
      setActiveTab("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load submission");
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] gap-6 p-6">
        <Skeleton className="w-2/5 bg-surface" />
        <Skeleton className="flex-1 bg-surface" />
      </div>
    );
  }

  if (!problem) {
    return <p className="p-8 text-error">{error || "Problem not found."}</p>;
  }

  return (
    <main className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col lg:flex-row">
      <section className="w-full overflow-y-auto border-b border-border p-6 lg:w-2/5 lg:border-r lg:border-b-0">
        <h1 className="text-xl font-bold text-foreground">{problem.title}</h1>
        <p className="mt-4 whitespace-pre-wrap leading-7 text-muted-foreground">{problem.description}</p>

        <div className="my-6 border-t border-border" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Examples</h2>
        <div className="mt-3 space-y-3">
          {problem.testCases.slice(0, 2).map((testCase, index) => (
            <div key={`${testCase.input}-${index}`} className="rounded-lg border border-border bg-background p-3">
              <p className="mb-1 text-xs text-muted-foreground">Example {index + 1}</p>
              <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                Input: {testCase.input}{"\n"}Output: {testCase.expectedOutput}
              </pre>
            </div>
          ))}
        </div>

        <div className="my-6 border-t border-border" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Recent Submissions</h2>
        <div className="mt-3 space-y-1">
          {recentSubmissions.length ? (
            recentSubmissions.map((submission) => (
              <button
                key={submission.id}
                type="button"
                onClick={() => void openSubmission(submission.id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition hover:bg-[#222]"
              >
                <StatusBadge status={submission.status} />
                <span className="text-xs text-muted-foreground">{relativeTime(submission.createdAt)}</span>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          )}
        </div>
      </section>

      <section className="flex min-h-0 w-full flex-1 flex-col lg:w-3/5">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <NativeSelect
            value={language}
            onChange={(event) => handleLanguageChange(event.target.value)}
            className="w-40"
          >
            {languages.map((item) => (
              <NativeSelectOption key={item.value} value={item.value}>
                {item.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button onClick={() => void handleSubmit()} disabled={submitting} size="sm">
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden p-3">
          <CodeEditor key={language} value={code} onChange={setCode} language={language} />
        </div>

        <div className="h-[220px] shrink-0 border-t border-border">
          <div className="flex border-b border-border">
            <TabButton active={activeTab === "tests"} onClick={() => setActiveTab("tests")}>
              Test Cases
            </TabButton>
            <TabButton active={activeTab === "results"} onClick={() => setActiveTab("results")}>
              Results
            </TabButton>
            <TabButton active={activeTab === "feedback"} onClick={() => setActiveTab("feedback")}>
              AI Feedback
            </TabButton>
          </div>
          <div className="h-[178px] overflow-y-auto p-4">
            {activeTab === "tests" && <TestCasesPanel testCase={problem.testCases[0]} />}
            {activeTab === "results" && <ResultsPanel submission={currentSubmission} />}
            {activeTab === "feedback" && <FeedbackPanel submission={currentSubmission} />}
          </div>
        </div>
      </section>
    </main>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-2 text-sm transition-colors ${
        active ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function TestCasesPanel({ testCase }: { testCase?: TestCase }) {
  if (!testCase) return <p className="text-sm text-muted-foreground">No test cases available.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <CodeBlock label="Input" value={testCase.input} />
      <CodeBlock label="Expected Output" value={testCase.expectedOutput} />
    </div>
  );
}

function ResultsPanel({ submission }: { submission: Submission | null }) {
  if (!submission) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Submit your code to see results.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <StatusBadge status={submission.status} large />
      </div>
      {submission.testResults?.length ? (
        <div className="space-y-1">
          {submission.testResults.map((result, index) => (
            <div key={`${result.input}-${index}`} className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-xs">
              <span className={result.passed ? "text-success" : "text-error"}>
                Test case {index + 1}: {result.passed ? "Passed" : "Failed"}
              </span>
              {result.error && <span className="max-w-[55%] truncate text-muted-foreground">{result.error}</span>}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FeedbackPanel({ submission }: { submission: Submission | null }) {
  if (!submission) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Submit your code to see AI feedback.</div>;
  }

  return (
    <div className="space-y-2">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">AI Feedback</p>
      {submission.aiFeedback ? (
        <div className="border-l-4 border-accent bg-surface p-4 text-sm leading-6 text-foreground">
          {submission.aiFeedback}
        </div>
      ) : (
        <p className="animate-pulse text-sm text-muted-foreground">Generating AI feedback...</p>
      )}
    </div>
  );
}

function CodeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <pre className="min-h-12 whitespace-pre-wrap rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground">{value}</pre>
    </div>
  );
}

function StatusBadge({ status, large = false }: { status: string; large?: boolean }) {
  const statusClass =
    status === "ACCEPTED"
      ? "bg-success/20 text-success"
      : status === "WRONG_ANSWER" || status === "RUNTIME_ERROR"
        ? "bg-error/20 text-red-300"
        : status === "COMPILATION_ERROR"
          ? "bg-orange-500/20 text-orange-300"
          : "bg-warning/20 text-yellow-300";

  return <Badge className={`${statusClass} ${large ? "px-4 py-1 text-sm" : ""}`}>{status}</Badge>;
}

function relativeTime(date: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
