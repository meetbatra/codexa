"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Code2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

export default function SignupPage() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="relative min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center pt-32 pb-16 px-4 overflow-hidden">
      {/* Soft Moving Ambient Background Gradient */}
      <div className="subtle-moving-bg" />

      <div className="w-full max-w-[400px] mx-auto relative z-10">
        {/* Card */}
        <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-7 shadow-xl">
          {/* Header */}
          <div className="flex flex-col items-start gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#ea580c]/10 border border-[#ea580c]/20 flex items-center justify-center text-[#ea580c] mb-1">
              <Code2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#fafafa]">Create a Codexa account</h1>
            <p className="text-xs text-[#a1a1aa]">Start accelerating your coding practice with AI.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Account Type Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#d4d4d8]">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#18181b] border border-[#27272a] rounded-lg">
                <button
                  type="button"
                  onClick={() => setRole("STUDENT")}
                  className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                    role === "STUDENT"
                      ? "bg-[#27272a] text-[#fafafa] shadow-sm font-semibold"
                      : "text-[#71717a] hover:text-[#d4d4d8]"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("TEACHER")}
                  className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                    role === "TEACHER"
                      ? "bg-[#27272a] text-[#fafafa] shadow-sm font-semibold"
                      : "text-[#71717a] hover:text-[#d4d4d8]"
                  }`}
                >
                  Educator
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-medium text-[#d4d4d8]">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Alex Rivers"
                autoComplete="name"
                className="w-full h-9.5 px-3.5 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-[#d4d4d8]">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                autoComplete="email"
                className="w-full h-9.5 px-3.5 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-[#d4d4d8]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full h-9.5 pl-3.5 pr-9 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71717a] hover:text-[#fafafa] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 bg-[#ea580c] hover:bg-[#c2410c] text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center disabled:opacity-50 mt-1"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-[#27272a]/60 text-center">
            <p className="text-xs text-[#a1a1aa]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#ea580c] hover:underline font-medium ml-1">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
