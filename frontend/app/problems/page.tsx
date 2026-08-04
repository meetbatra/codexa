"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import ProtectedRoute from "../../components/ProtectedRoute";
import { apiFetch } from "../../lib/api";

type Problem = {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
};

type ProblemsResponse = {
  data: Problem[];
};

export default function ProblemsPage() {
  return (
    <ProtectedRoute>
      <ProblemsContent />
    </ProtectedRoute>
  );
}

function ProblemsContent() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Problems</h1>
        <p className="mt-2 text-muted-foreground">Pick a problem and start coding.</p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Card className="overflow-hidden border-border bg-surface">
        <CardHeader className="sr-only">
          <CardTitle>Available problems</CardTitle>
          <CardDescription>Choose a problem to solve.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((row) => (
                <Skeleton key={row} className="h-12 w-full bg-[#222]" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="w-20 px-6 py-4 font-medium">#</th>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="w-40 px-6 py-4 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem, index) => (
                    <tr key={problem.id} className="border-b border-border last:border-0 hover:bg-[#222]">
                      <td className="px-6 py-4 text-muted-foreground">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{problem.title}</td>
                      <td className="px-6 py-4 text-right">
                        <Button render={<Link href={`/problems/${problem.id}`} />} size="sm">
                          Solve →
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!problems.length && !error && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                        No problems available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
