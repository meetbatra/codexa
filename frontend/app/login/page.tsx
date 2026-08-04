"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Spinner } from "../../components/ui/spinner";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = (await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })) as { data: { token: string } };
      login(response.data.token);
      window.location.href = "/problems";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-start justify-center px-6 pt-24">
      <Card className="w-full max-w-md border-border bg-surface shadow-2xl shadow-black/20">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight text-foreground">Welcome back</CardTitle>
          <CardDescription>Sign in to continue learning with Codexa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="h-11 bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="h-11 bg-background"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="h-11 w-full">
              {submitting && <Spinner className="mr-2" />}
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-indigo-300 hover:text-foreground">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
