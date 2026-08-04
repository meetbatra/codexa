"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import { apiFetch } from "../../lib/api";

type PendingItem = {
  id: string;
  doubtId: string;
  content: string;
  state: string;
  teacherEdit?: string | null;
  createdAt: string;
  doubt?: {
    id: string;
    title: string;
    body: string;
    createdAt: string;
  };
};

type PendingResponse = { data: PendingItem[] };

type ItemState = {
  editedContent: string;
  submitting: boolean;
  error: string | null;
};

type Action = "approve" | "reject";

export default function ReviewPage() {
  return (
    <ProtectedRoute requireTeacher>
      <ReviewQueue />
    </ProtectedRoute>
  );
}

function ReviewQueue() {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [perItem, setPerItem] = useState<Record<string, ItemState>>({});
  const [activeAction, setActiveAction] = useState<Record<string, Action | null>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPending() {
      try {
        const response = (await apiFetch("/api/doubts/pending")) as PendingResponse;
        if (!active) return;
        const items = response.data ?? [];
        setPendingItems(items);
        setPerItem((current) => {
          const next = { ...current };
          for (const item of items) {
            next[item.id] ??= {
              editedContent: item.content,
              submitting: false,
              error: null,
            };
          }
          return next;
        });
      } catch (err) {
        if (active) setLoadError(err instanceof Error ? err.message : "Unable to load review queue");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPending();
    return () => {
      active = false;
    };
  }, []);

  function updateItem(itemId: string, update: Partial<ItemState>) {
    setPerItem((current) => ({
      ...current,
      [itemId]: { ...current[itemId], ...update },
    }));
  }

  async function review(item: PendingItem, action: Action) {
    const state = perItem[item.id];
    if (!state) return;

    updateItem(item.id, { submitting: true, error: null });
    setActiveAction((current) => ({ ...current, [item.id]: action }));

    try {
      await apiFetch(`/api/doubts/${item.doubtId}/review`, {
        method: "PATCH",
        body: JSON.stringify(
          action === "approve"
            ? {
                action,
                editedContent: state.editedContent,
              }
            : {
                action,
              }
        ),
      });
      setPendingItems((current) => current.filter((pending) => pending.id !== item.id));
      setPerItem((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
    } catch (err) {
      updateItem(item.id, {
        submitting: false,
        error: err instanceof Error ? err.message : "Unable to save review",
      });
    } finally {
      setActiveAction((current) => ({ ...current, [item.id]: null }));
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Review Queue</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-drafted answers awaiting your review. Edit if needed, then approve or reject.
          </p>
        </div>
        <Badge className="shrink-0 bg-accent text-white">
          {pendingItems.length} pending
        </Badge>
      </header>

      {loadError && (
        <p className="mb-4 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-red-300">
          {loadError}
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <Skeleton key={item} className="h-64 w-full rounded-xl bg-surface" />
          ))}
        </div>
      ) : pendingItems.length === 0 ? (
        <Card className="border-border bg-surface">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="text-4xl text-success" aria-hidden="true">✓</span>
            <h2 className="mt-4 text-lg font-semibold text-foreground">All caught up!</h2>
            <p className="mt-1 text-sm text-muted-foreground">No pending answers to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => {
            const state = perItem[item.id];
            if (!state) return null;
            return (
              <ReviewCard
                key={item.id}
                item={item}
                state={state}
                action={activeAction[item.id] ?? null}
                onChange={(update) => updateItem(item.id, update)}
                onReview={(reviewAction) => void review(item, reviewAction)}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

function ReviewCard({
  item,
  state,
  action,
  onChange,
  onReview,
}: {
  item: PendingItem;
  state: ItemState;
  action: Action | null;
  onChange: (update: Partial<ItemState>) => void;
  onReview: (action: Action) => void;
}) {
  return (
    <Card className="border-border bg-surface">
      <CardContent className="p-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-muted-foreground">DOUBT</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">{item.doubt?.title ?? "Untitled doubt"}</h2>
          <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {item.doubt?.body ?? "No doubt content available."}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{relativeTime(item.createdAt)}</p>
        </div>

        <div className="my-4 border-t border-border" />

        <div>
          <p className="text-xs font-medium tracking-wider text-indigo-300">AI DRAFTED ANSWER</p>
          <Textarea
            value={state.editedContent}
            onChange={(event) => onChange({ editedContent: event.target.value })}
            disabled={state.submitting}
            className="mt-3 min-h-[120px] resize-y bg-background text-foreground"
          />
          <p className="mt-2 text-xs text-muted-foreground">You can edit the answer before approving.</p>
        </div>

        {state.error && <p className="mt-4 text-sm text-red-300">{state.error}</p>}

        <div className="mt-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={state.submitting}
            onClick={() => onReview("reject")}
            className="border-error text-error hover:bg-error hover:text-white"
          >
            {state.submitting && action === "reject" ? "Saving..." : "Reject"}
          </Button>
          <Button
            type="button"
            disabled={state.submitting}
            onClick={() => onReview("approve")}
            className="bg-success text-white hover:bg-green-600"
          >
            {state.submitting && action === "approve" ? "Saving..." : "Approve"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
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
