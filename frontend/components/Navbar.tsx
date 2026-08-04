"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const navLinkClass =
  "rounded-md px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-20 h-14 border-b border-[var(--border)] bg-[var(--bg)] px-6">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[var(--accent)]">
          Codexa
        </Link>

        {loading ? (
          <div className="h-8 w-40 animate-pulse rounded-md bg-[var(--surface)]" />
        ) : user ? (
          <div className="flex items-center gap-2">
            <Link href="/problems" className={navLinkClass}>
              Problems
            </Link>
            <Link href="/doubts" className={navLinkClass}>
              Doubts
            </Link>
            {user.role === "TEACHER" && (
              <Link href="/review" className={navLinkClass}>
                Review Queue
              </Link>
            )}
            <span
              className={`ml-2 rounded-full px-3 py-1 text-xs font-semibold ${
                user.role === "TEACHER"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-slate-700 text-slate-100"
              }`}
            >
              {user.role}
            </span>
            <button
              type="button"
              onClick={logout}
              className="ml-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:border-[var(--error)] hover:text-white"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
