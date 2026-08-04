"use client";

import { useEffect, type ReactNode } from "react";
import { Spinner } from "../components/ui/spinner";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  requireTeacher = false,
}: {
  children: ReactNode;
  requireTeacher?: boolean;
}) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) window.location.href = "/login";
    if (!loading && user && requireTeacher && user.role !== "TEACHER") {
      window.location.href = "/problems";
    }
  }, [loading, requireTeacher, user]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[var(--bg)]">
        <Spinner className="size-8 text-[var(--accent)]" />
      </div>
    );
  }

  if (!user || (requireTeacher && user.role !== "TEACHER")) return null;
  return children;
}
