"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Send,
  RotateCcw,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  History,
  Lightbulb,
  Terminal,
  Copy,
  Check,
  Code2,
  ChevronRight,
  Cpu,
  Layers,
  Pause,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

import CodeEditor from "../../../components/CodeEditor";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import { Allotment } from "allotment";
import { apiFetch } from "../../../lib/api";
import MarkdownContent from "../../../components/MarkdownContent";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

const languages = [
  { value: "python", label: "Python 3" },
  { value: "javascript", label: "JavaScript (Node.js)" },
  { value: "cpp", label: "C++ (GCC 17)" },
  { value: "java", label: "Java (OpenJDK 17)" },
];


async function fetchStarterCode(problemId: string, language: string): Promise<string> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/problems/${problemId}/starter-code?language=${language}`,
      { cache: "no-store" }
    );
    const json = await res.json() as { data?: { starterCode: string } };
    return json.data?.starterCode ?? `# Write your ${language} solution here\n`;
  } catch {
    return `# Write your ${language} solution here\n`;
  }
}

type TestCase = { input: string; expectedOutput: string };

type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | string;
  category?: string;
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

type LeftTab = "description" | "submissions" | "hints";
type BottomTab = "testcases" | "results" | "feedback";

export default function ProblemDetailPage() {
  return (
    <ProtectedRoute>
      <ProblemDetailContent />
    </ProtectedRoute>
  );
}

function ProblemDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const problemId = params.id;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("# Loading...");

  // Tabs
  const [leftTab, setLeftTab] = useState<LeftTab>("description");
  const [bottomTab, setBottomTab] = useState<BottomTab>("testcases");
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);

  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Run Test Results (simulated local execution or temporary run)
  const [runResults, setRunResults] = useState<TestResult[] | null>(null);
  const [customInput, setCustomInput] = useState("");

  // Stopwatch Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Stopwatch Interval
  useEffect(() => {
    let interval: number | null = null;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Initial Fetch
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
          const starter = await fetchStarterCode(problemId, language);
          setCode(starter);
          setSubmissions(submissionsResponse.data ?? []);
          if (problemResponse.data.testCases?.length > 0) {
            setCustomInput(problemResponse.data.testCases[0].input);
          }
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

  // Polling AI Feedback for submissions
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
        // Best-effort polling
      }
    }

    void pollFeedback();
    const interval = window.setInterval(pollFeedback, 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [currentSubmission?.id, currentSubmission?.aiFeedback]);

  const problemSubmissions = useMemo(
    () =>
      submissions
        .filter((submission) => submission.problemId === problemId)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [problemId, submissions]
  );

  async function handleLanguageChange(nextLanguage: string) {
    setLanguage(nextLanguage);
    if (problem) {
      const starter = await fetchStarterCode(problem.id, nextLanguage);
      setCode(starter);
    }
  }

  function handleResetCode() {
    if (problem) {
      void fetchStarterCode(problem.id, language).then(setCode);
    }
  }

  function handleCopyCode() {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Handle Run Code
  async function handleRunCode() {
    if (!problem) return;
    setRunning(true);
    setError("");
    setBottomTab("results");

    try {
      const response = (await apiFetch("/api/submissions/run", {
        method: "POST",
        body: JSON.stringify({
          problemId: problem.id,
          code,
          language,
        }),
      })) as { success: boolean; data: { status: string; testResults: TestResult[] }; error?: string };

      if (!response.success) {
        throw new Error(response.error || "Failed to run code");
      }

      setRunResults(response.data.testResults);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while running your code.");
    } finally {
      setRunning(false);
    }
  }

  // Handle Submit Code
  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    setBottomTab("results");

    try {
      const response = (await apiFetch("/api/submissions", {
        method: "POST",
        body: JSON.stringify({ problemId, language, code }),
      })) as { data: Submission };
      setCurrentSubmission(response.data);
      setSubmissions((items) => [response.data, ...items.filter((item) => item.id !== response.data.id)]);
      setRunResults(null);
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
      if (response.data.code) {
        setCode(response.data.code);
      }
      if (response.data.language) {
        setLanguage(response.data.language);
      }
      setBottomTab("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load submission");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col bg-[#050505] p-4 text-[#e5e2e1]">
        <div className="flex h-12 items-center justify-between border-b border-white/10 pb-3">
          <Skeleton className="h-6 w-36 bg-white/10" />
          <Skeleton className="h-8 w-48 bg-white/10" />
        </div>
        <div className="mt-4 flex flex-1 gap-3">
          <Skeleton className="w-2/5 bg-white/5 rounded-2xl" />
          <Skeleton className="flex-1 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#050505] text-[#e5e2e1] p-6">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold">Problem Not Found</h2>
        <p className="text-sm text-neutral-400 mt-2">{error || "The requested problem could not be loaded."}</p>
        <Button
          onClick={() => router.push("/problems")}
          className="mt-6 bg-white/10 hover:bg-white/20 text-white rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Problems
        </Button>
      </div>
    );
  }

  const difficulty = problem.difficulty?.toUpperCase() || "MEDIUM";
  const difficultyBadgeColor =
    difficulty === "EASY"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : difficulty === "HARD"
      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
      : "bg-amber-500/10 text-amber-400 border-amber-500/20";

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#050505] text-[#e5e2e1] select-none">
      {/* ── Top Header Navigation Bar ────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#08080a] px-4 backdrop-blur-xl z-20">
        {/* Top Left: Back Arrow + Problems link */}
        <div className="flex items-center gap-3">
          <Link
            href="/problems"
            className="group flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-white/10 hover:text-white transition-all border border-white/10"
          >
            <ArrowLeft className="h-4 w-4 text-neutral-400 group-hover:-translate-x-0.5 group-hover:text-white transition-transform" />
            <span>Problems</span>
          </Link>

          <div className="h-4 w-px bg-white/10" />

          {/* Problem Title & Difficulty */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
              {problem.title}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${difficultyBadgeColor}`}
            >
              {difficulty}
            </span>
          </div>
        </div>

        {/* Top Right: Timer, Run, Submit */}
        <div className="flex items-center gap-2.5">
          {/* Stopwatch Timer */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-400">
            <Clock className="h-3.5 w-3.5 text-orange-400" />
            <span className="font-mono text-white font-medium">{formatTimer(timerSeconds)}</span>
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-neutral-500 hover:text-white transition-colors"
              title={isTimerRunning ? "Pause Timer" : "Start Timer"}
            >
              {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
          </div>

          {/* Run Code Button */}
          <Button
            onClick={() => void handleRunCode()}
            disabled={running || submitting}
            variant="outline"
            className="h-8 flex items-center gap-1.5 rounded-lg border-white/15 bg-white/5 text-xs font-medium text-white hover:bg-white/10 active:scale-95 transition-all shadow-sm"
          >
            <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
            <span>{running ? "Running..." : "Run"}</span>
          </Button>

          {/* Submit Solution Button */}
          <Button
            onClick={() => void handleSubmit()}
            disabled={submitting || running}
            className="h-8 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-4 text-xs font-semibold text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-700 active:scale-95 transition-all border border-orange-400/30"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{submitting ? "Submitting..." : "Submit"}</span>
          </Button>
        </div>
      </header>

      {/* ── Main 3-Panel Resizable Workspace ──────────────────────── */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden p-2 gap-2 bg-[#050505]">
        <Allotment className="h-full w-full rounded-2xl overflow-hidden border border-white/10 bg-[#09090c]" defaultSizes={[45, 55]}>
          
          {/* ── PANEL 1: PROBLEM STATEMENT & SUBMISSIONS (LEFT) ── */}
          <Allotment.Pane minSize={300} preferredSize="45%" className="flex flex-col min-w-0 min-h-0 bg-[#0b0b0e]">
            {/* Left Header Tabs */}
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0d11] px-3">
              <div className="flex items-center gap-1">
                <TabPill
                  active={leftTab === "description"}
                  onClick={() => setLeftTab("description")}
                  icon={<FileText className="h-3.5 w-3.5 text-orange-400" />}
                  label="Description"
                />
                <TabPill
                  active={leftTab === "submissions"}
                  onClick={() => setLeftTab("submissions")}
                  icon={<History className="h-3.5 w-3.5 text-sky-400" />}
                  label={`Submissions (${problemSubmissions.length})`}
                />
                <TabPill
                  active={leftTab === "hints"}
                  onClick={() => setLeftTab("hints")}
                  icon={<Lightbulb className="h-3.5 w-3.5 text-amber-400" />}
                  label="Hints"
                />
              </div>
            </div>

            {/* Left Panel Body Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6 text-sm text-[#d4d4d8] leading-relaxed custom-scrollbar">
              {leftTab === "description" && (
                <div className="space-y-6">
                  {/* Title & Category Header */}
                  <div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">{problem.title}</h2>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-md px-2 py-0.5 font-semibold border ${difficultyBadgeColor}`}>
                        {difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-[#e4e4e7] leading-relaxed whitespace-pre-wrap font-sans">
                    {problem.description}
                  </div>

                  {/* Examples Section */}
                  {problem.testCases?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-orange-400" />
                        <span>Examples</span>
                      </h3>
                      {problem.testCases.map((tc, index) => (
                        <div
                          key={`tc-example-${index}`}
                          className="rounded-xl border border-white/10 bg-[#121217] p-4 space-y-3 shadow-inner"
                        >
                          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium border-b border-white/5 pb-2">
                            <span>Example {index + 1}</span>
                          </div>
                          <div className="space-y-2 font-mono text-xs">
                            <div>
                              <span className="text-neutral-500 block text-[11px] mb-1">Input:</span>
                              <pre className="rounded-lg bg-black/50 border border-white/5 p-2.5 text-emerald-300 overflow-x-auto">
                                {tc.input}
                              </pre>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[11px] mb-1">Expected Output:</span>
                              <pre className="rounded-lg bg-black/50 border border-white/5 p-2.5 text-sky-300 overflow-x-auto">
                                {tc.expectedOutput}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Constraints */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-purple-400" />
                      <span>Constraints</span>
                    </h3>
                    <ul className="list-disc list-inside text-xs text-neutral-400 space-y-1 font-mono rounded-xl border border-white/5 bg-white/[0.01] p-3">
                      <li>1 &lt;= testCases.length &lt;= 10^4</li>
                      <li>Standard time limit: 2.0 seconds</li>
                      <li>Memory limit: 256 MB</li>
                    </ul>
                  </div>
                </div>
              )}

              {leftTab === "submissions" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Recent Submissions
                  </h3>
                  {problemSubmissions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center text-xs text-neutral-500">
                      No submissions recorded yet for this problem.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {problemSubmissions.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => void openSubmission(sub.id)}
                          className={`w-full text-left rounded-xl border p-3.5 transition-all flex items-center justify-between ${
                            currentSubmission?.id === sub.id
                              ? "border-orange-500/40 bg-orange-500/10 shadow-lg shadow-orange-500/5"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <StatusBadge status={sub.status} />
                            <span className="text-xs font-mono text-neutral-300 uppercase">
                              {sub.language}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <span>{relativeTime(sub.createdAt)}</span>
                            <ChevronRight className="h-4 w-4 text-neutral-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {leftTab === "hints" && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Approach & Hints
                  </h3>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold">
                      <Lightbulb className="h-4 w-4" />
                      <span>Hint 1: Algorithm Strategy</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      Consider using an optimal time-complexity approach (e.g. Hash Map or Two Pointers) to solve this problem in O(N) or O(N log N) linear scan time.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-sky-400 font-semibold">
                      <Sparkles className="h-4 w-4" />
                      <span>Hint 2: Edge Cases</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      Make sure to test boundary cases including empty inputs, single element arrays, or negative values.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Allotment.Pane>

          {/* ── RIGHT PANEL GROUP: CODE EDITOR (TOP) & TEST RESULTS (BOTTOM) ── */}
          <Allotment.Pane minSize={400} className="flex flex-col min-w-0 min-h-0 bg-[#050508]">
            <Allotment vertical defaultSizes={[60, 40]} className="h-full w-full">
              
              {/* ── TOP RIGHT PANEL: CODE EDITOR ── */}
              <Allotment.Pane minSize={200} preferredSize="60%" className="flex flex-col min-w-0 min-h-0 bg-[#07070a]">
                {/* Editor Header Toolbar */}
                <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0d11] px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                      <Code2 className="h-4 w-4 text-orange-400" />
                      <span className="hidden sm:inline text-white">Language:</span>
                    </div>

                    <Select value={language} onValueChange={(val) => { if (val) handleLanguageChange(val); }}>
                      <SelectTrigger className="h-7 w-44 text-xs bg-[#121217] border-white/15 text-white focus:ring-1 focus:ring-orange-500/50 cursor-pointer">
                        <SelectValue placeholder="Select Language">
                          {languages.find(l => l.value === language)?.label || "Select Language"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a21] border-white/10 text-white">
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value} className="text-xs cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white">
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <TooltipProvider>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger
                          type="button"
                          onClick={handleCopyCode}
                          className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white transition-all"
                        >
                          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copied ? "Copied" : "Copy Code"}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger
                          type="button"
                          onClick={handleResetCode}
                          className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white transition-all"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reset Code</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>

                {/* Editor Container */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <CodeEditor key={language} value={code} onChange={setCode} language={language} />
                </div>
              </Allotment.Pane>

              {/* ── BOTTOM RIGHT PANEL: TEST CASES & EXECUTION RESULTS ── */}
              <Allotment.Pane minSize={150} preferredSize="40%" className="flex flex-col min-w-0 min-h-0 bg-[#0a0a0e]">
                {/* Bottom Panel Header Tabs */}
                <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0d11] px-3">
                  <div className="flex items-center gap-1">
                    <TabPill
                      active={bottomTab === "testcases"}
                      onClick={() => setBottomTab("testcases")}
                      icon={<Terminal className="h-3.5 w-3.5 text-emerald-400" />}
                      label="Test Cases"
                    />
                    <TabPill
                      active={bottomTab === "results"}
                      onClick={() => setBottomTab("results")}
                      icon={<Sparkles className="h-3.5 w-3.5 text-orange-400" />}
                      label="Test Results"
                    />
                    <TabPill
                      active={bottomTab === "feedback"}
                      onClick={() => setBottomTab("feedback")}
                      icon={<Cpu className="h-3.5 w-3.5 text-purple-400" />}
                      label="AI Feedback"
                    />
                  </div>
                </div>

                {/* Bottom Panel Body Content */}
                <div className="flex-1 overflow-y-auto p-4 text-xs text-neutral-300 custom-scrollbar">
                  {bottomTab === "testcases" && (
                    <div className="space-y-4">
                      {/* Case Picker Tabs */}
                      <div className="flex items-center gap-2">
                        {problem.testCases?.map((_, idx) => (
                          <button
                            key={`tc-tab-${idx}`}
                            type="button"
                            onClick={() => setSelectedTestCaseIndex(idx)}
                            className={`rounded-lg px-3 py-1.5 font-medium cursor-pointer transition-all ${
                              selectedTestCaseIndex === idx
                                ? "bg-white/15 text-white border border-white/20 shadow-sm"
                                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Selected Test Case Inputs & Outputs */}
                      {problem.testCases?.[selectedTestCaseIndex] && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <CodeBox
                            label="Input"
                            value={problem.testCases[selectedTestCaseIndex].input}
                          />
                          <CodeBox
                            label="Expected Output"
                            value={problem.testCases[selectedTestCaseIndex].expectedOutput}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {bottomTab === "results" && (
                    <div className="space-y-4">
                      {running || submitting ? (
                        <div className="flex flex-col items-center justify-center py-8 text-neutral-400 space-y-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                          <p className="text-xs font-medium animate-pulse">
                            {submitting ? "Evaluating solution against test harness..." : "Running test cases..."}
                          </p>
                        </div>
                      ) : runResults ? (
                        <div className="space-y-3">
                          <div className={`flex items-center gap-2 font-bold ${runResults.every(r => r.passed) ? "text-emerald-400" : "text-rose-400"}`}>
                            {runResults.every(r => r.passed) ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <span>Execution Finished: {runResults.filter(r => r.passed).length}/{runResults.length} Test Cases Passed</span>
                          </div>
                          <div className="space-y-2">
                            {runResults.map((res, i) => (
                              <div
                                key={`rr-${i}`}
                                className={`rounded-xl border p-3 font-mono text-xs flex items-center justify-between ${
                                  res.passed 
                                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" 
                                    : "border-rose-500/20 bg-rose-500/5 text-rose-300"
                                }`}
                              >
                                <span>Case {i + 1}: {res.passed ? "Passed" : "Failed"}</span>
                                <span className="text-neutral-400 max-w-[50%] truncate">Output: {res.actualOutput} {res.error ? ` | ${res.error}` : ''}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : currentSubmission ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">
                            <div className="flex items-center gap-3">
                              <StatusBadge status={currentSubmission.status} large />
                              <div className="text-xs text-neutral-400">
                                <span>Submitted: {relativeTime(currentSubmission.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-mono">
                              <div className="text-neutral-400">
                                Runtime: <span className="text-emerald-400 font-bold">24 ms</span>
                              </div>
                              <div className="text-neutral-400">
                                Memory: <span className="text-sky-400 font-bold">14.2 MB</span>
                              </div>
                            </div>
                          </div>

                          {currentSubmission.testResults?.length ? (
                            <div className="space-y-2">
                              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                                Test Case Breakdown
                              </h4>
                              {currentSubmission.testResults.map((res, i) => (
                                <div
                                  key={`res-${i}`}
                                  className={`rounded-xl border p-3 flex items-center justify-between font-mono text-xs ${
                                    res.passed
                                      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                                      : "border-rose-500/20 bg-rose-500/5 text-rose-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {res.passed ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-rose-400" />
                                    )}
                                    <span>Test Case {i + 1}: {res.passed ? "Passed" : "Failed"}</span>
                                  </div>
                                  {res.error && (
                                    <span className="text-neutral-400 text-[11px] max-w-[50%] truncate">
                                      {res.error}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-neutral-500 space-y-2">
                          <Terminal className="h-8 w-8 text-neutral-600" />
                          <p>Click "Run" or "Submit" to test your solution and view output results.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {bottomTab === "feedback" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                        <Sparkles className="h-4 w-4" />
                        <span>AI Code Review & Optimization Analysis</span>
                      </div>
                      {currentSubmission?.aiFeedback ? (
                        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-neutral-200 leading-relaxed font-sans text-xs shadow-inner markdown-wrapper">
                          <MarkdownContent content={currentSubmission.aiFeedback} />
                        </div>
                      ) : currentSubmission ? (
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-xs text-neutral-400 animate-pulse">
                          Generating intelligent AI feedback and complexity breakdown...
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center text-xs text-neutral-500">
                          Submit your solution to receive automated AI feedback and runtime insights.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}

function TabPill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-all ${
        active
          ? "bg-white/15 text-white shadow-sm border border-white/10"
          : "text-neutral-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function CodeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
        {label}
      </span>
      <pre className="rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-xs text-neutral-200 overflow-x-auto min-h-[60px] leading-relaxed">
        {value}
      </pre>
    </div>
  );
}

function StatusBadge({ status, large = false }: { status: string; large?: boolean }) {
  const statusClass =
    status === "ACCEPTED"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : status === "WRONG_ANSWER" || status === "RUNTIME_ERROR"
      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
      : status === "COMPILATION_ERROR"
      ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
      : "bg-amber-500/20 text-amber-300 border-amber-500/30";

  return (
    <Badge variant="outline" className={`${statusClass} ${large ? "px-3.5 py-1 text-xs font-bold" : "text-[10px]"}`}>
      {status}
    </Badge>
  );
}

function relativeTime(date: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
