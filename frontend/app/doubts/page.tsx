"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import MarkdownContent from "../../components/MarkdownContent";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { apiFetch } from "../../lib/api";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  HelpCircle,
  PlusCircle,
  XCircle,
  Send,
  MessageCircle,
} from "lucide-react";

type DoubtAnswer = {
  id: string;
  content: string;
  createdAt: string;
  state?: string;
};

type Doubt = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  studentId: string;
  answers?: DoubtAnswer[];
};

type DoubtsResponse = { data: Doubt[] };

export default function DoubtsPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#050505] text-[#e5e2e1]">
      {/* Fixed subtle moving ambient background gradient */}
      <div className="subtle-moving-bg" aria-hidden="true" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-32 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <DoubtsBoard />
      </div>
    </main>
  );
}

function DoubtsBoard() {
  const { user } = useAuth();
  const router = useRouter();

  const [allDoubts, setAllDoubts] = useState<Doubt[]>([]);
  const [myDoubts, setMyDoubts] = useState<Doubt[]>([]);
  const [myDoubtsLoaded, setMyDoubtsLoaded] = useState(false);
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>(null);

  // Tabs & Search State
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "answered" | "unanswered">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Loading & Errors
  const [loading, setLoading] = useState(true);
  const [loadingMine, setLoadingMine] = useState(false);
  const [error, setError] = useState("");

  // Ask Form & Modal Dialog State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isAskDialogOpen, setIsAskDialogOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDoubts() {
      try {
        const response = (await apiFetch("/api/doubts")) as DoubtsResponse;
        if (active) setAllDoubts((response.data ?? []).map(normalizeDoubt));
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load doubts");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDoubts();
    return () => {
      active = false;
    };
  }, []);

  function handleAskClick() {
    if (!user) {
      router.push("/login");
      return;
    }
    setFormError("");
    setFormMessage("");
    setIsAskDialogOpen(true);
  }

  async function handleTabChange(tab: "all" | "mine" | "answered" | "unanswered") {
    if (tab === "mine" && !user) {
      router.push("/login");
      return;
    }

    setActiveTab(tab);
    setExpandedDoubtId(null);
    setError("");

    if (tab === "mine" && !myDoubtsLoaded) {
      setLoadingMine(true);
      try {
        const response = (await apiFetch("/api/doubts/mine")) as DoubtsResponse;
        setMyDoubts((response.data ?? []).map(normalizeDoubt));
        setMyDoubtsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load your doubts");
      } finally {
        setLoadingMine(false);
      }
    }
  }

  async function handlePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    if (!title.trim() || !content.trim()) return;

    setPosting(true);
    setFormMessage("");
    setFormError("");

    try {
      const response = (await apiFetch("/api/doubts", {
        method: "POST",
        body: JSON.stringify({ title, content }),
      })) as { data: Doubt };

      const newDoubt = normalizeDoubt(response.data);
      setAllDoubts((items) => [newDoubt, ...items]);
      if (myDoubtsLoaded) {
        setMyDoubts((items) => [newDoubt, ...items]);
      }
      setTitle("");
      setContent("");
      setFormMessage("Doubt submitted! AI and instructors are reviewing it.");
      setIsAskDialogOpen(false);
      window.setTimeout(() => setFormMessage(""), 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to post doubt");
    } finally {
      setPosting(false);
    }
  }

  // Filter & Search Logic
  const filteredDoubts = useMemo(() => {
    let source = allDoubts;
    if (activeTab === "mine") source = myDoubts;
    else if (activeTab === "answered") source = allDoubts.filter((d) => (d.answers?.length ?? 0) > 0);
    else if (activeTab === "unanswered") source = allDoubts.filter((d) => (d.answers?.length ?? 0) === 0);

    if (!searchQuery.trim()) return source;

    const q = searchQuery.toLowerCase();
    return source.filter(
      (d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
    );
  }, [allDoubts, myDoubts, activeTab, searchQuery]);

  const totalAnsweredCount = useMemo(
    () => allDoubts.filter((d) => (d.answers?.length ?? 0) > 0).length,
    [allDoubts]
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#a1a1aa] backdrop-blur-md">
            <HelpCircle className="h-3.5 w-3.5 text-orange-400" />
            <span>Community Knowledge & AI Answers</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Doubt Board
          </h1>
          <p className="mt-2 text-base text-[#a1a1aa] max-w-xl">
            Ask technical questions, explore community doubts, and receive instant AI answers reviewed by expert instructors.
          </p>
        </div>

        {/* Action Controls & Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs backdrop-blur-md">
            <MessageSquare className="h-4 w-4 text-neutral-400" />
            <span className="text-[#a1a1aa]">Total:</span>
            <span className="font-semibold text-white">{allDoubts.length}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-300/80">Answered:</span>
            <span className="font-semibold text-emerald-300">{totalAnsweredCount}</span>
          </div>

          {user?.role?.toUpperCase() === "TEACHER" ? (
            <Button
              onClick={() => router.push("/review")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all border border-emerald-400/30 active:scale-[0.98]"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Review Doubts</span>
            </Button>
          ) : (
            <Button
              onClick={handleAskClick}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-700 transition-all border border-orange-400/30 active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Ask a Doubt</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Single-Column Layout: Controls & Doubts Feed */}
      <div className="space-y-6 min-w-0">
        {/* Controls Bar: Search & Category Tabs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-white/[0.02] p-2 backdrop-blur-md">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => void handleTabChange("all")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTab === "all"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
              }`}
            >
              All Doubts ({allDoubts.length})
            </button>
            <button
              onClick={() => void handleTabChange("answered")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTab === "answered"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
              }`}
            >
              Answered
            </button>
            <button
              onClick={() => void handleTabChange("unanswered")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTab === "unanswered"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
              }`}
            >
              Unanswered
            </button>
            {user?.role?.toUpperCase() === "STUDENT" && (
              <button
                onClick={() => void handleTabChange("mine")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeTab === "mine"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
                }`}
              >
                My Doubts ({myDoubts.length})
              </button>
            )}
          </div>

          {/* Realtime Search Input */}
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717a]" />
            <input
              type="text"
              placeholder="Search doubts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-xs text-white placeholder-[#71717a] transition-colors focus:border-white/25 focus:outline-none"
            />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Success Banner when posted outside modal */}
        {formMessage && !isAskDialogOpen && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{formMessage}</span>
          </div>
        )}

        {/* Doubts List / Skeletons */}
        {loading || (activeTab === "mine" && loadingMine) ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3"
              >
                <Skeleton className="h-5 w-3/4 bg-white/10" />
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-1/2 bg-white/5" />
              </div>
            ))}
          </div>
        ) : filteredDoubts.length ? (
          <div className="space-y-3">
            {filteredDoubts.map((doubt) => (
              <DoubtCard
                key={doubt.id}
                doubt={doubt}
                expanded={expandedDoubtId === doubt.id}
                onToggle={() =>
                  setExpandedDoubtId((current) => (current === doubt.id ? null : doubt.id))
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-md">
            <MessageCircle className="mx-auto h-10 w-10 text-[#71717a]" />
            <h3 className="mt-3 text-base font-semibold text-white">No doubts found</h3>
            <p className="mt-1 text-xs text-[#a1a1aa]">
              {searchQuery
                ? `No questions matching "${searchQuery}"`
                : activeTab === "mine"
                ? "You haven't submitted any doubts yet."
                : activeTab === "answered"
                ? "No answered doubts match this filter."
                : "No doubts have been posted yet."}
            </p>
          </div>
        )}
      </div>

      {/* Ask a Doubt Modal Dialog using shadcn Dialog */}
      <Dialog open={isAskDialogOpen} onOpenChange={setIsAskDialogOpen}>
        <DialogContent className="max-w-lg bg-[#0f0f13] border-white/15 text-white p-6 sm:p-7 rounded-2xl shadow-2xl backdrop-blur-2xl">
          <DialogHeader className="mb-2 space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-400" />
              <DialogTitle className="text-xl font-bold text-white">Ask a Doubt</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#a1a1aa]">
              Submit your programming query. Codexa AI generates an immediate answer which is verified by mentors.
            </DialogDescription>
          </DialogHeader>

          <AskForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            posting={posting}
            formMessage={formMessage}
            formError={formError}
            onSubmit={handlePost}
            onFocusAuth={() => {
              if (!user) {
                setIsAskDialogOpen(false);
                router.push("/login");
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reusable Ask Form Component
function AskForm({
  title,
  setTitle,
  content,
  setContent,
  posting,
  formMessage,
  formError,
  onSubmit,
  onFocusAuth,
}: {
  title: string;
  setTitle: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  posting: boolean;
  formMessage: string;
  formError: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onFocusAuth: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
          <Label htmlFor="doubt-title" className="text-xs font-medium text-white">
            Question Title
          </Label>
          <span>{title.length}/200</span>
        </div>
        <Input
          id="doubt-title"
          value={title}
          onFocus={onFocusAuth}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. How does recursion memory stack work?"
          maxLength={200}
          required
          className="border-white/10 bg-white/5 text-xs text-white placeholder-[#71717a] transition-colors focus:border-orange-500/50 focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
          <Label htmlFor="doubt-content" className="text-xs font-medium text-white">
            Detailed Explanation
          </Label>
          <span>{content.length}/2000</span>
        </div>
        <Textarea
          id="doubt-content"
          value={content}
          onFocus={onFocusAuth}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Include code snippets, error logs, or context..."
          maxLength={2000}
          required
          className="h-32 resize-none border-white/10 bg-white/5 text-xs text-white placeholder-[#71717a] transition-colors focus:border-orange-500/50 focus:outline-none"
        />
      </div>

      <Button
        type="submit"
        disabled={posting}
        className="w-full justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 font-medium text-white shadow-lg transition-all hover:from-orange-600 hover:to-amber-700 disabled:opacity-50"
      >
        {posting ? (
          <>
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Posting...</span>
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            <span>Post Doubt</span>
          </>
        )}
      </Button>

      {formMessage && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
          {formMessage}
        </p>
      )}
      {formError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
          {formError}
        </p>
      )}
    </form>
  );
}

// Doubt Card Item Component
function DoubtCard({
  doubt,
  expanded,
  onToggle,
}: {
  doubt: Doubt;
  expanded: boolean;
  onToggle: () => void;
}) {
  const answers = doubt.answers ?? [];
  const isAnswered = answers.length > 0;

  return (
    <div
      onClick={onToggle}
      className={`group cursor-pointer rounded-xl border transition-all duration-700 ease-in-out ${
        expanded
          ? "border-white/20 bg-white/[0.05] shadow-lg"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            {/* Status & Timestamp Header */}
            <div className="flex items-center gap-2.5 text-xs">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${
                  isAnswered
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                }`}
              >
                {isAnswered ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Answered</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>Pending</span>
                  </>
                )}
              </span>

              <span className="flex items-center gap-1 text-[#71717a]">
                <User className="h-3 w-3" />
                <span>Student</span>
              </span>

              <span className="text-[#52525b]">•</span>
              <span className="text-[#71717a]">{relativeTime(doubt.createdAt)}</span>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-white group-hover:text-orange-300 transition-colors break-words [overflow-wrap:anywhere]">
              {doubt.title}
            </h3>

            {/* Content Teaser when collapsed */}
            <div
              className={`grid transition-all duration-700 ease-in-out ${
                !expanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-xs text-[#a1a1aa] line-clamp-2 leading-relaxed break-words [overflow-wrap:anywhere]">
                  {doubt.content}
                </p>
              </div>
            </div>
          </div>

          {/* Right Badge & Expand Icon */}
          <div className="flex items-center gap-3 shrink-0">
            <Badge
              variant="outline"
              className="border-white/10 bg-white/5 text-xs font-normal text-[#a1a1aa]"
            >
              <MessageSquare className="mr-1.5 h-3 w-3 text-orange-400" />
              {answers.length} {answers.length === 1 ? "answer" : "answers"}
            </Badge>
            <div className={`text-[#71717a] transition-transform duration-700 ease-in-out group-hover:text-white ${expanded ? "rotate-180" : ""}`}>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Smooth CSS Grid Dropdown Container */}
        <div
          className={`grid transition-all duration-700 ease-in-out ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="overflow-hidden">
            <div className="mt-4 border-t border-white/10 pt-4 space-y-4">
              {/* Full Question Content */}
              <div className="rounded-lg bg-black/40 p-4 border border-white/5 overflow-hidden">
                <h4 className="text-xs font-medium text-[#71717a] uppercase tracking-wider mb-2">
                  Question Details
                </h4>
                <p className="whitespace-pre-wrap text-xs text-[#e5e2e1] leading-relaxed break-words [overflow-wrap:anywhere]">
                  {doubt.content}
                </p>
              </div>

              {/* Answers Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  <h4 className="text-sm font-semibold text-white">
                    Answers ({answers.length})
                  </h4>
                </div>
                <AnswersList answers={answers} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Answers List Component
function AnswersList({ answers }: { answers: DoubtAnswer[] }) {
  if (!answers.length) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] p-4 text-center text-xs text-[#71717a]">
        No instructor or AI answers posted yet. You will be notified once a response is approved.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {answers.map((ans) => (
        <div
          key={ans.id}
          className="rounded-xl border border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-transparent p-4 text-xs"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-orange-300 font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Assisted · Instructor Approved</span>
            </div>
            <span className="text-[10px] text-[#71717a]">{relativeTime(ans.createdAt)}</span>
          </div>

          <div className="mt-2 text-[#e5e2e1] leading-relaxed">
            <MarkdownContent content={ans.content} />
          </div>
        </div>
      ))}
    </div>
  );
}

function relativeTime(date: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function normalizeDoubt(doubt: Doubt): Doubt {
  return {
    ...doubt,
    answers: Array.isArray(doubt.answers)
      ? doubt.answers.filter(
          (answer) => !("state" in answer) || answer.state === "APPROVED"
        )
      : [],
  };
}
