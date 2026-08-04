"use client";

import Link from "next/link";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useAuth } from "../context/AuthContext";

const navLinkClass = "text-muted-foreground hover:text-foreground";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-20 h-14 border-b border-border bg-background/95 px-6 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <Button
          variant="link"
          render={<Link href="/" />}
          className="h-auto p-0 text-xl font-bold text-[var(--accent)]"
        >
          Codexa
        </Button>

        {loading ? (
          <Skeleton className="h-8 w-40 bg-surface" />
        ) : user ? (
          <div className="flex items-center gap-1">
            <Button render={<Link href="/problems" />} variant="ghost" size="sm" className={navLinkClass}>
              Problems
            </Button>
            <Button render={<Link href="/doubts" />} variant="ghost" size="sm" className={navLinkClass}>
              Doubts
            </Button>
            {user.role === "TEACHER" && (
              <Button render={<Link href="/review" />} variant="ghost" size="sm" className={navLinkClass}>
                Review Queue
              </Button>
            )}
            <Badge
              variant={user.role === "TEACHER" ? "default" : "secondary"}
              className="ml-2"
            >
              {user.role}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logout}
              className="ml-2 text-muted-foreground hover:border-error hover:text-foreground"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Button render={<Link href="/login" />} variant="ghost" size="sm" className={navLinkClass}>
              Login
            </Button>
            <Button render={<Link href="/signup" />} size="sm">
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
