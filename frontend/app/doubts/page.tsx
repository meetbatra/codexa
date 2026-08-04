"use client";

import { FormEvent, useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import { apiFetch } from "../../lib/api";

type AnswerState = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

type DoubtAnswer = {
  id: string;
  content: string;
  state?: AnswerState;
  createdAt: string;
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
    <ProtectedRoute>
      <DoubtsBoard />
    </ProtectedRoute>
  );
}

function DoubtsBoard() {
  const [allDoubts, setAllDoubts] = useState<Doubt[]>([]);
  const [myDoubts, setMyDoubts] = useState<Doubt[]>([]);
  const [myDoubtsLoaded, setMyDoubtsLoaded] = useState(false);
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>(null);
  const [showMyDoubts, setShowMyDoubts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMine, setLoadingMine] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [submittingDoubtId, setSubmittingDoubtId] = useState<string | null>(null);

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

  async function toggleMyDoubts() {
    const nextValue = !showMyDoubts;
    setShowMyDoubts(nextValue);
    setExpandedDoubtId(null);
    setError("");

    if (nextValue && !myDoubtsLoaded) {
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
    setPosting(true);
    setFormMessage("");
    setFormError("");

    try {
      const response = (await apiFetch("/api/doubts", {
        method: "POST",
        body: JSON.stringify({ title, content }),
      })) as { data: Doubt };
      setAllDoubts((items) => [normalizeDoubt(response.data), ...items]);
      setTitle("");
      setContent("");
      setFormMessage("Doubt posted! AI is drafting an answer.");
      window.setTimeout(() => setFormMessage(""), 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to post doubt");
    } finally {
      setPosting(false);
    }
  }

  async function submitForReview(doubtId: string) {
    setSubmittingDoubtId(doubtId);
    setError("");
    try {
      await apiFetch(`/api/doubts/${doubtId}/submit`, { method: "PATCH" });
      const response = (await apiFetch("/api/doubts/mine")) as DoubtsResponse;
      setMyDoubts((response.data ?? []).map(normalizeDoubt));
      setMyDoubtsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit answer for review");
    } finally {
      setSubmittingDoubtId(null);
    }
  }

  const visibleDoubts = showMyDoubts ? myDoubts : allDoubts;

  return (
    <main className="relative isolate mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-start gap-6 overflow-x-hidden p-6 md:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="min-w-0 flex-1">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Doubt Board</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Learn together by asking questions and sharing answers.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => void toggleMyDoubts()}>
            {showMyDoubts ? "All Doubts" : "My Doubts"}
          </Button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading || (showMyDoubts && loadingMine) ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-32 w-full rounded-xl bg-surface" />
            ))}
          </div>
        ) : visibleDoubts.length ? (
          <div>
            {visibleDoubts.map((doubt) => (
              <DoubtCard
                key={doubt.id}
                doubt={doubt}
                expanded={expandedDoubtId === doubt.id}
                mine={showMyDoubts}
                submitting={submittingDoubtId === doubt.id}
                onToggle={() => setExpandedDoubtId((current) => (current === doubt.id ? null : doubt.id))}
                onSubmit={() => void submitForReview(doubt.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-border bg-surface">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              {showMyDoubts ? "You have not posted any doubts yet." : "No doubts have been posted yet."}
            </CardContent>
          </Card>
        )}
      </section>

      <aside className="w-full min-w-0 self-start">
        <Card className="relative border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Ask a Doubt</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePost} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doubt-title">Title</Label>
                <Input
                  id="doubt-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What's your question?"
                  maxLength={200}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doubt-content">Details</Label>
                <Textarea
                  id="doubt-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Describe your doubt in detail..."
                  maxLength={2000}
                  required
                  className="h-32 resize-none bg-background"
                />
              </div>
              <Button type="submit" disabled={posting} className="w-full">
                {posting ? "Posting..." : "Post Doubt"}
              </Button>
              {formMessage && <p className="text-sm text-success">{formMessage}</p>}
              {formError && <p className="text-sm text-red-300">{formError}</p>}
            </form>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}

function DoubtCard({
  doubt,
  expanded,
  mine,
  submitting,
  onToggle,
  onSubmit,
}: {
  doubt: Doubt;
  expanded: boolean;
  mine: boolean;
  submitting: boolean;
  onToggle: () => void;
  onSubmit: () => void;
}) {
  const answers = doubt.answers ?? [];

  return (
    <Card
      className="mb-3 cursor-pointer border-border bg-surface transition-colors hover:bg-[#222]"
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-semibold text-foreground">{doubt.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {expanded ? doubt.content : `${doubt.content.slice(0, 120)}${doubt.content.length > 120 ? "..." : ""}`}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {answers.length} {answers.length === 1 ? "answer" : "answers"}
          </Badge>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">{relativeTime(doubt.createdAt)}</div>

        {expanded && (
          <div className="mt-5 border-t border-border pt-4" onClick={(event) => event.stopPropagation()}>
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{doubt.content}</p>
            <Answers
              answers={answers}
              mine={mine}
              submitting={submitting}
              onSubmit={onSubmit}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Answers({
  answers,
  mine,
  submitting,
  onSubmit,
}: {
  answers: DoubtAnswer[];
  mine: boolean;
  submitting: boolean;
  onSubmit: () => void;
}) {
  if (!answers.length) {
    return <p className="mt-4 text-sm text-muted-foreground">No approved answers yet.</p>;
  }

  return (
    <div className="mt-4 space-y-3">
      {answers.map((answer) => {
        const state = answer.state ?? "APPROVED";
        if (!mine && state !== "APPROVED") return null;

        if (mine && state !== "APPROVED") {
          return (
            <div key={answer.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StateBadge state={state} />
                {state === "DRAFT" && (
                  <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={onSubmit}>
                    {submitting ? "Submitting..." : "Submit for Review"}
                  </Button>
                )}
              </div>
              {state === "PENDING" && <p className="mt-3 text-sm text-muted-foreground">Awaiting teacher review</p>}
              {state === "REJECTED" && <p className="mt-3 text-sm text-red-300">Rejected by teacher</p>}
            </div>
          );
        }

        return (
          <div key={answer.id} className="rounded-r-lg border-l-4 border-accent bg-background p-4 text-sm">
            <p className="text-xs text-indigo-300">AI Assisted · Teacher Approved</p>
            <p className="mt-2 whitespace-pre-wrap leading-6 text-foreground">{answer.content}</p>
            <p className="mt-3 text-xs text-muted-foreground">{relativeTime(answer.createdAt)}</p>
          </div>
        );
      })}
    </div>
  );
}

function StateBadge({ state }: { state: AnswerState }) {
  const className =
    state === "DRAFT"
      ? "bg-slate-700 text-slate-100"
      : state === "PENDING"
        ? "bg-warning/20 text-yellow-300"
        : state === "APPROVED"
          ? "bg-success/20 text-success"
          : "bg-error/20 text-red-300";
  return <Badge className={className}>{state}</Badge>;
}

function relativeTime(date: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

function normalizeDoubt(doubt: Doubt): Doubt {
  return {
    ...doubt,
    answers: Array.isArray(doubt.answers) ? doubt.answers : [],
  };
}
