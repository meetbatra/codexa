"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { useAuth } from "../context/AuthContext";
import { Code2 } from "lucide-react";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  // Hide navbar on problem solving workspace (/problems/[id])
  const isProblemDetail = pathname?.startsWith("/problems/") && pathname !== "/problems";
  if (isProblemDetail) return null;

  const isProblemsActive = pathname === "/problems" || pathname?.startsWith("/problems/");
  const isDoubtsActive = pathname === "/doubts" || pathname?.startsWith("/doubts/");

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto w-[92%] md:w-[70%] max-w-5xl bg-[#080808]/75 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300">
        <div className="flex justify-between items-center px-6 md:px-8 py-3.5">
          {/* Left Section: Logo + Nav links */}
          <div className="flex items-center gap-8 md:gap-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 no-underline text-white font-extrabold text-2xl leading-none tracking-tight font-sans"
            >
              <Code2 className="w-7 h-7 text-pink-500 shrink-0" />
              <span>Codexa</span>
            </Link>

            {/* Navigation Links (Problems & Doubts) */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/problems"
                className={`inline-flex items-center text-sm leading-none pt-[6px] pb-[4px] tracking-wide transition-all duration-200 no-underline ${
                  isProblemsActive
                    ? "text-white font-semibold border-b-2 border-pink-500"
                    : "text-white/60 font-medium border-b-2 border-transparent hover:text-white"
                }`}
              >
                Problems
              </Link>
              <Link
                href="/doubts"
                className={`inline-flex items-center text-sm leading-none pt-[6px] pb-[4px] tracking-wide transition-all duration-200 no-underline ${
                  isDoubtsActive
                    ? "text-white font-semibold border-b-2 border-pink-500"
                    : "text-white/60 font-medium border-b-2 border-transparent hover:text-white"
                }`}
              >
                Doubts
              </Link>
            </div>
          </div>

          {/* Right Section: Auth buttons */}
          <div className="flex items-center gap-4">
            {loading ? (
              <>
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </>
            ) : user ? (
              <>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-[11px] bg-white/5 border-white/10 text-white/80"
                >
                  {user.role}
                </Badge>
                <button
                  onClick={() => signOut()}
                  className="bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-full font-bold text-sm cursor-pointer font-sans transition-colors duration-200 hover:bg-white/20"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white/80 text-sm font-medium no-underline hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-full font-bold text-sm no-underline backdrop-blur-md transition-colors duration-200 hover:bg-white/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
