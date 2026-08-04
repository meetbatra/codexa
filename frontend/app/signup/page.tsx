"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

const inputClass =
  "mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30";

export default function SignupPage() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = (await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      })) as { data: { token: string } };
      login(response.data.token);
      window.location.href = "/problems";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-start justify-center px-6 pt-16">
      <section className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl shadow-black/20">
        <h1 className="text-3xl font-bold tracking-tight text-white">Create your account</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Start building stronger coding habits with Codexa.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-[var(--text)]">
            Name
            <input
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="name"
            />
          </label>
          <label className="block text-sm font-medium text-[var(--text)]">
            Email
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="block text-sm font-medium text-[var(--text)]">
            Password
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          <label className="block text-sm font-medium text-[var(--text)]">
            Role
            <select
              className={inputClass}
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </label>

          {error && (
            <p className="rounded-lg border border-[var(--error)]/40 bg-[var(--error)]/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--accent)] px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-300 hover:text-white">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
