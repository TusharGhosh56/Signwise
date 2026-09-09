"use client";

import React from "react";

export function TrustVault() {
  return (
    <section id="security-vault" className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="reveal grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
          {/* Left: Headline + Body */}
          <div className="md:col-span-7 space-y-6">
            <div className="chapter-marker mb-4">Trust & Privacy</div>

            <h3 className="headline-editorial text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal">
              Strictly confidential.{" "}
              <span className="italic text-[var(--gold)]">
                Never retained.
              </span>
            </h3>

            <p className="text-base text-[var(--paper-dim)] leading-[1.8] font-normal max-w-lg">
              Agreements contain private salaries, personal addresses, and
              commercial trade secrets. Signwise analyzes documents in ephemeral
              memory with end-to-end encryption. Your data is never used to
              train public models and is purged upon request.
            </p>
          </div>

          {/* Right: Trust Marks — stacked, minimal */}
          <div className="md:col-span-5 space-y-4 md:pt-10">
            {[
              { mark: "Zero AI Training", desc: "Documents never feed model training pipelines" },
              { mark: "256-Bit TLS", desc: "End-to-end encryption in transit and at rest" },
              { mark: "Single-Click Purge", desc: "Instant, irrecoverable deletion on demand" },
            ].map((item) => (
              <div
                key={item.mark}
                className="flex items-start gap-4 py-3.5 border-b border-[var(--border-subtle)] last:border-b-0"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--gold)] mt-2 shrink-0 shadow-[0_0_8px_rgba(223,177,91,0.5)]" />
                <div>
                  <div className="text-base font-semibold text-[var(--paper)]">
                    {item.mark}
                  </div>
                  <div className="text-sm text-[var(--paper-dim)] font-normal mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Disclaimer — footnote style */}
        <div className="reveal mt-16 pt-6 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--paper-muted)] leading-relaxed font-normal max-w-3xl">
            <span className="font-mono text-xs text-[var(--paper-dim)] font-bold tracking-wider uppercase mr-2">
              Important:
            </span>
            Signwise provides AI-powered contract analysis designed to empower
            human understanding. It is an educational tool, not a legal
            practice, and does not provide formal legal advice. For litigation,
            M&amp;A, or complex property transactions, we advise consultation
            with a licensed attorney.
          </p>
        </div>
      </div>
    </section>
  );
}
