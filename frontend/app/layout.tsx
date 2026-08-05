import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";
import { TooltipProvider } from "../components/ui/tooltip";

export const metadata: Metadata = {
  title: "Codexa — AI-powered Code Learning",
  description: "The hyper-fast environment for modern developers. Instant compilation, real-time AI context, and sub-millisecond grading.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="min-h-full antialiased">
      <body className="min-h-screen flex flex-col relative bg-[#050505] text-[#e5e2e1]">
        <TooltipProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
