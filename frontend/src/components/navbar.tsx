"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface NavbarProps {
  onUploadClick?: () => void;
}

export function Navbar({ onUploadClick }: NavbarProps) {
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

        {/* CTA — crisp gold button/link */}
        <button
          onClick={onUploadClick}
          className="group flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[var(--gold)] hover:text-white transition-colors duration-200 font-semibold"
        >
          <span>Review Agreement</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </header>
  );
}
