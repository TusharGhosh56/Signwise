"use client";

import React, { useRef } from "react";
import {
  ShieldAlert,
  Code2,
  DollarSign,
  Scale,
  MessageSquareQuote,
  CheckCircle2,
  Upload,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface CapabilitiesSectionProps {
  onFileSelect?: (file: File) => void;
  onReviewClick?: () => void;
}

export function CapabilitiesSection({
  onFileSelect,
  onReviewClick,
}: CapabilitiesSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const capabilities = [
    {
      icon: ShieldAlert,
      tag: "Covenants & Mobility",
      title: "Spot Overreaching Non-Competes & Lock-Ins",
      description:
        "Catches 12 to 24-month non-compete restrictions across multi-state or global regions, excessive resignation notice periods (like 90-day lock-ins), and sweeping client/coworker non-solicit traps that freeze your career mobility.",
      whatWeCatch: [
        "Global or multi-state non-compete clauses",
        "Excessive 60–90 day resignation notice periods",
        "Overbroad non-solicitation of clients & colleagues",
      ],
    },
    {
      icon: Code2,
      tag: "IP Ownership",
      title: "Halt Intellectual Property Overreach",
      description:
        "Audits assignment of inventions clauses that attempt to seize your nights-and-weekends side projects, open-source repositories, or personal patents completely unrelated to company scope.",
      whatWeCatch: [
        "Claims on personal side projects built off-hours",
        "Perpetual IP assignment surviving past termination",
        "Vague definitions of 'proprietary technology'",
      ],
    },
    {
      icon: DollarSign,
      tag: "Compensation & Clawbacks",
      title: "Decode Bonus & Equity Repayment Traps",
      description:
        "Analyzes fine print on signing bonuses, relocation packages, and equity grants. Highlights hidden triggers where departing even one week early forces 100% lump-sum repayment.",
      whatWeCatch: [
        "100% cliff bonus clawbacks with zero proration",
        "Repayment penalties on involuntary termination",
        "Accelerated repayment windows (e.g. 14 days)",
      ],
    },
    {
      icon: Scale,
      tag: "Asymmetry Audit",
      title: "Separate Standard Market Terms from Predatory",
      description:
        "Instantly evaluates who holds the leverage. Breaks down unilateral termination, indemnification obligations, dispute venue, and attorney-fee shifting so you know your real financial exposure.",
      whatWeCatch: [
        "One-sided indemnification with uncapped liability",
        "Unfavorable out-of-state arbitration jurisdictions",
        "Disproportionate termination rights favoring the employer",
      ],
    },
    {
      icon: MessageSquareQuote,
      tag: "Negotiation Levers",
      title: "Generate Polite, Ready-to-Send Counter-Proposals",
      description:
        "Provides polite, non-confrontational pushback wording citing customary market norms. Copy-paste directly into an email to HR, recruiters, or landlords without burning bridges.",
      whatWeCatch: [
        "Word-for-word email counter-proposals",
        "Industry-standard amendment suggestions",
        "Tactful phrasing that maintains professional goodwill",
      ],
    },
    {
      icon: CheckCircle2,
      tag: "Clear Breakdown",
      title: "Instant What's Right vs. What's Wrong",
      description:
        "Rather than dumping legal jargon, Signwise categorizes every clause: green for standard fair terms, amber for points of caution, and red for predatory traps requiring immediate negotiation.",
      whatWeCatch: [
        "What is normal & customary (so you don't worry)",
        "What is aggressive or non-market (so you can push back)",
        "Plain-English translation of every legal obligation",
      ],
    },
  ];

  return (
    <section id="capabilities" className="py-24 sm:py-32 relative">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="chapter-marker mb-3">Capabilities</div>
          <h2 className="headline-editorial text-[clamp(2.25rem,4.5vw,3.75rem)] font-normal text-[var(--paper)] leading-[1.1] mb-6">
            What We Protect You From{" "}
            <span className="italic text-[var(--gold)]">
              Before You Sign.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--paper-dim)] font-light leading-relaxed">
            No canned templates. No generic AI legal summaries. Signwise
            systematically audits your actual agreement to expose hidden
            covenants, financial clawbacks, and one-sided liabilities—giving you
            the exact levers to negotiate fair terms.
          </p>
        </div>

        {/* 6 Core Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-black/10 dark:border-white/[0.08] bg-[var(--ink-surface)] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[var(--gold)]/60 hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-10 w-10 rounded-xl bg-[var(--gold-ghost)] border border-[var(--gold-dim)] flex items-center justify-center text-[var(--gold)] group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--gold)] bg-[var(--gold-faint)] px-2.5 py-1 rounded">
                      {cap.tag}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-[var(--paper)] mb-3 leading-snug group-hover:text-[var(--gold)] transition-colors">
                    {cap.title}
                  </h3>

                  <p className="text-sm text-[var(--paper-dim)] font-light leading-relaxed mb-6">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/[0.06] space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--paper-muted)] font-medium">
                    Identifies:
                  </span>
                  <ul className="space-y-1.5 text-xs text-[var(--paper-dim)]">
                    {cap.whatWeCatch.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[var(--gold)] font-bold shrink-0">
                          &bull;
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct Action Card (Auditing your actual contract, zero canned examples) */}
        <div className="rounded-2xl border border-[var(--gold)]/40 bg-[var(--ink-raised)] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--gold)]">
                <Sparkles className="h-4 w-4" />
                <span>Ready To Audit Your Agreement?</span>
              </div>
              <h3 className="headline-editorial text-2xl sm:text-3xl font-normal text-[var(--paper)]">
                Drop your contract in. Get answers in seconds.
              </h3>
              <p className="text-sm text-[var(--paper-dim)] font-light leading-relaxed">
                Upload any employment offer, NDA, consulting SOW, or lease.
                Zero document retention, completely private, and evaluated
                clause-by-clause.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-md btn-primary w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </button>

              {onReviewClick && (
                <button
                  onClick={onReviewClick}
                  className="btn btn-md btn-secondary w-full sm:w-auto"
                >
                  <span>Open Analysis Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
