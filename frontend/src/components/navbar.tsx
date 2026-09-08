"use client";

import Link from "next/link";
import { ArrowRight, Sun, Moon } from "lucide-react";
import { useAnalysis } from "@/context/analysis-context";

interface NavbarProps {
  onUploadClick?: () => void;
}

export function Navbar({ onUploadClick }: NavbarProps) {
  const { theme, toggleTheme } = useAnalysis();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[var(--ink)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Masthead Wordmark */}
        <Link href="/" className="group flex items-baseline gap-1.5">
          <span className="font-serif italic text-xl text-[var(--paper)] tracking-wide font-normal group-hover:text-[var(--gold)] transition-colors duration-300">
            Signwise
          </span>
          <span className="text-[11px] font-mono text-[var(--paper-muted)] tracking-widest uppercase hidden sm:inline font-medium">
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider uppercase text-[var(--paper-dim)] font-medium">
          <a
            href="#core-questions"
            className="hover:text-white transition-colors duration-200"
          >
            Method
          </a>
          <a
            href="#dossier-preview"
            className="hover:text-white transition-colors duration-200"
          >
            Live Audit
          </a>
          <Link
            href="/analysis"
            className="hover:text-white transition-colors duration-200 text-[var(--gold)]"
          >
            Dossier
          </Link>
          <a
            href="#testimonials"
            className="hover:text-white transition-colors duration-200"
          >
            Stories
          </a>
          <a
            href="#security-vault"
            className="hover:text-white transition-colors duration-200"
          >
            Trust
          </a>
        </nav>

        {/* Right Actions: Theme Toggle + Review Agreement */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[var(--border-subtle)] bg-[var(--ink-surface)] text-[var(--paper-dim)] hover:text-[var(--paper)] hover:border-[var(--gold)] transition-colors label-mono text-xs"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-3.5 w-3.5 text-[var(--gold)]" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-[var(--gold)]" />
                <span>Dark</span>
              </>
            )}
          </button>

          <button
            onClick={onUploadClick}
            className="group flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[var(--gold)] hover:text-white transition-colors duration-200 font-semibold"
          >
            <span>Review Agreement</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
