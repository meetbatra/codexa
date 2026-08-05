"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Terminal, ArrowRight, Code2, Sparkles, Filter } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

type Problem = {
  id: string;
  title: string;
  description?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  createdAt?: string;
};

type ProblemsResponse = {
  data: Problem[];
};

export default function ProblemsPage() {
  return <ProblemsContent />;
}

function ProblemsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  useEffect(() => {
    let active = true;

    async function loadProblems() {
      try {
        const response = (await apiFetch("/api/problems")) as ProblemsResponse;
        if (active) setProblems(response.data ?? []);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load problems");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProblems();
    return () => {
      active = false;
    };
  }, []);

  function handleSolve(problemId: string) {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push(`/problems/${problemId}`);
  }

  // Derive difficulty consistently across filtering and rendering
  const enrichedProblems = problems.map((problem, index) => {
    const diff =
      problem.difficulty ||
      (index % 3 === 0 ? "Easy" : index % 3 === 1 ? "Medium" : "Hard");
    return { ...problem, computedDifficulty: diff };
  });

  // Filter problems based on search and difficulty tab
  const filteredProblems = enrichedProblems.filter((problem) => {
    const matchesSearch = problem.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === "All" ||
      problem.computedDifficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-28 pb-20 px-6 relative overflow-hidden">
      {/* Soft Moving Ambient Background Gradient */}
      <div className="subtle-moving-bg" />

      {/* Soft Ambient Radial Blur Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <main className="mx-auto w-full max-w-6xl relative z-10">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-zinc-300 mb-3">
              <Code2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Interactive Challenges</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#e2e8f0]">
              <span className="font-editorial italic font-normal text-[#cbd5e1] block sm:inline sm:ml-2">
                Master through practice.
              </span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
              Hone your skills with AI-guided problem solving, real-time code execution, and instant automated evaluation.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono text-zinc-400 block">AVAILABLE PROBLEMS</span>
              <span className="text-lg font-bold text-white font-mono">{problems.length}</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Difficulty Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#121216]/80 border border-white/10 rounded-xl w-full sm:w-auto">
            {["All", "Easy", "Medium", "Hard"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedDifficulty(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex-1 sm:flex-initial ${selectedDifficulty === tab
                  ? "bg-white/10 text-white shadow-sm border border-white/15"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems..."
              className="w-full pl-10 pr-4 py-2 bg-[#121216]/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>{error}</span>
          </div>
        )}

        {/* Problem List Table Container */}
        <div className="border border-white/10 rounded-2xl bg-[#0d0d11]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 px-6 py-3.5 border-b border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-zinc-400 bg-white/[0.02]">
            <div className="col-span-1">#</div>
            <div className="col-span-7">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 w-full bg-white/[0.03] border border-white/[0.05] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div>
              {filteredProblems.map((problem, index) => {
                const diff = problem.computedDifficulty;
                const diffStyle =
                  diff.toLowerCase() === "easy"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : diff.toLowerCase() === "hard"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20";

                return (
                  <div
                    key={problem.id}
                    onClick={() => handleSolve(problem.id)}
                    className="grid grid-cols-12 px-6 py-4 items-center border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03] transition-all duration-200 group cursor-pointer"
                  >
                    {/* Index */}
                    <div className="col-span-2 sm:col-span-1 font-mono text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* Title */}
                    <div className="col-span-10 sm:col-span-7 pr-4">
                      <div className="flex items-center gap-2.5">
                        <Terminal className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors shrink-0 hidden sm:block" />
                        <span className="font-medium text-sm text-[#e4e4e7] group-hover:text-white transition-colors line-clamp-1">
                          {problem.title}
                        </span>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="hidden sm:block sm:col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${diffStyle}`}>
                        {diff}
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="hidden sm:block sm:col-span-2 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSolve(problem.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium text-white transition-all duration-200 group-hover:border-white/30 shadow-sm ml-auto"
                      >
                        <span>Solve</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 text-zinc-400 group-hover:text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* No Results Found */}
              {filteredProblems.length === 0 && !loading && (
                <div className="py-16 px-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                    <Filter className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-zinc-300 font-medium">No problems found</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? `No problems match "${searchQuery}". Try a different keyword.`
                      : "No problems are available in this category yet."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

