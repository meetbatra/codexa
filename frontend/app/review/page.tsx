"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { apiFetch } from "../../lib/api";
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Check, 
  HelpCircle,
  AlertCircle,
  Loader2,
  X,
  Eye,
  FileText
} from "lucide-react";

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
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
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
      // Close modal on successful review
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }
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
    <div className="relative min-h-screen bg-[#070709] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500/30 font-sans">
      {/* Background Glow Overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-emerald-600/10 via-teal-500/10 to-indigo-600/10 rounded-full blur-[140px] opacity-70 animate-pulse" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-5xl space-y-8">
        {/* Header Banner */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Instructor Portal</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Review Queue
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
              Click any pending doubt in the table to inspect student details, edit AI-drafted answers, and publish.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs sm:text-sm backdrop-blur-md self-start sm:self-auto">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-neutral-400">Pending Reviews:</span>
            <Badge variant="outline" className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 font-bold ml-1">
              {pendingItems.length}
            </Badge>
          </div>
        </header>

        {/* Load Error Alert */}
        {loadError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-md">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4 backdrop-blur-md">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between gap-4 py-2 border-b border-white/5">
                <Skeleton className="h-6 w-1/3 bg-white/10 rounded-md" />
                <Skeleton className="h-6 w-1/4 bg-white/10 rounded-md" />
                <Skeleton className="h-8 w-24 bg-white/10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : pendingItems.length === 0 ? (
          /* Empty State */
          <Card className="border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/10">
                <Check className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-white tracking-tight">All Caught Up!</h2>
              <p className="mt-2 text-sm text-neutral-400 max-w-sm leading-relaxed">
                There are currently no AI-drafted answers waiting for review. Check back later when new student doubts arrive.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Pending Queue Table */
          <div className="rounded-2xl border border-white/10 bg-[#121215]/80 backdrop-blur-md shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-white/[0.03] border-b border-white/10">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-xs uppercase font-bold text-neutral-400 py-4 px-6">Doubt Title & Preview</TableHead>
                  <TableHead className="text-xs uppercase font-bold text-neutral-400 py-4 px-4 w-40">Submitted</TableHead>
                  <TableHead className="text-xs uppercase font-bold text-neutral-400 py-4 px-4 w-32">Status</TableHead>
                  <TableHead className="text-xs uppercase font-bold text-neutral-400 py-4 px-6 text-right w-36">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingItems.map((item) => (
                  <motion.tr
                    key={item.id}
                    layoutId={`review-row-${item.id}`}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 34,
                      mass: 0.7,
                    }}
                    onClick={() => setSelectedItem(item)}
                    className="border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group transform-gpu will-change-transform"
                  >
                    {/* Title & Preview */}
                    <TableCell className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-orange-400 shrink-0" />
                          <span className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                            {item.doubt?.title ?? "Untitled Doubt"}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-1 pl-6">
                          {item.doubt?.body ?? "No description available."}
                        </p>
                      </div>
                    </TableCell>

                    {/* Submitted Date */}
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <Clock className="h-3.5 w-3.5 text-neutral-500" />
                        <span>{relativeTime(item.createdAt)}</span>
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="py-4 px-4">
                      <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                        Pending AI Review
                      </Badge>
                    </TableCell>

                    {/* Review Button */}
                    <TableCell className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1.5 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Review</span>
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Review Dialog Modal with Ultra-Smooth 60fps Morphing Shared Element Animation */}
      <AnimatePresence mode="wait">
        {selectedItem && perItem[selectedItem.id] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Glass Backdrop - GPU Accelerated */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md transform-gpu will-change-[opacity]"
            />

            {/* Expanding/Collapsing Modal Window - 60fps Spring & Hardware Accelerated */}
            <motion.div
              layoutId={`review-row-${selectedItem.id}`}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 34,
                mass: 0.7,
              }}
              className="relative z-10 w-full max-w-2xl bg-[#121215] border border-white/15 text-white p-6 sm:p-7 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 outline-none transform-gpu will-change-transform"
            >
              {/* Fade in child content smoothly to prevent text wrapping layout thrashing */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: 0.05 }}
                className="space-y-5"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="border-b border-white/10 pb-4 space-y-1.5 text-left pr-8">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full w-fit">
                    <HelpCircle className="h-3 w-3" />
                    <span>Student Doubt Review</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug mt-1">
                    {selectedItem.doubt?.title ?? "Untitled Doubt"}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Review the student question and AI draft before publishing to the board.
                  </p>
                </div>

                {/* Main Content (Student Doubt Body) */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Main Doubt Content</p>
                  <div className="rounded-xl border border-white/5 bg-black/50 p-4 text-sm text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto break-words [overflow-wrap:anywhere]">
                    {selectedItem.doubt?.body ?? "No doubt content available."}
                  </div>
                </div>

                {/* AI Answer (Editable Textarea) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      AI Drafted Answer
                    </span>
                    <span className="text-xs text-neutral-400">Editable before approval</span>
                  </div>
                  <Textarea
                    value={perItem[selectedItem.id].editedContent}
                    onChange={(e) => updateItem(selectedItem.id, { editedContent: e.target.value })}
                    disabled={perItem[selectedItem.id].submitting}
                    placeholder="Edit AI answer..."
                    className="min-h-[140px] resize-y rounded-xl border border-white/10 bg-black/60 p-4 text-sm leading-relaxed text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
                  />
                </div>

                {perItem[selectedItem.id].error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <span>{perItem[selectedItem.id].error}</span>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={perItem[selectedItem.id].submitting}
                    onClick={() => void review(selectedItem, "reject")}
                    className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/15 hover:border-red-500/50 hover:text-red-300 transition-all active:scale-[0.98]"
                  >
                    {perItem[selectedItem.id].submitting && activeAction[selectedItem.id] === "reject" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Rejecting...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Reject Answer</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    disabled={perItem[selectedItem.id].submitting}
                    onClick={() => void review(selectedItem, "approve")}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all border border-emerald-400/30 active:scale-[0.98]"
                  >
                    {perItem[selectedItem.id].submitting && activeAction[selectedItem.id] === "approve" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Approve & Publish</span>
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
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


