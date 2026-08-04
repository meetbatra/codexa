import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";
import { TooltipProvider } from "../components/ui/tooltip";

export const metadata: Metadata = {
  title: "Codexa",
  description: "AI-powered learning for better code.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="min-h-full bg-[var(--bg)] antialiased">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
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
