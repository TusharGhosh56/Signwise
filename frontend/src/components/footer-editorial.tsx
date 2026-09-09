"use client";

import React from "react";

export function FooterEditorial() {
  return (
    <footer className="border-t border-white/[0.08] py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Wordmark */}
          <div className="flex items-baseline gap-3">
            <span className="font-serif italic text-lg text-[var(--paper)] font-normal">
              Signwise
            </span>
            <span className="text-[var(--paper-muted)]">&mdash;</span>
            <span className="text-xs text-[var(--paper-muted)] font-normal">
              Know what you agree to before you sign.
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {[
              { label: "Method", href: "#core-questions" },
              { label: "Capabilities", href: "#capabilities" },
              { label: "Stories", href: "#testimonials" },
              { label: "Trust", href: "#security-vault" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-mono tracking-wider uppercase text-[var(--paper-dim)] hover:text-[var(--paper)] transition-colors duration-200 font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-xs font-mono text-[var(--paper-muted)] tracking-wider">
            &copy; {new Date().getFullYear()} Signwise
          </div>
        </div>
      </div>
    </footer>
  );
}
