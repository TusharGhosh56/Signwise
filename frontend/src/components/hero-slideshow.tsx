"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Upload,
  ArrowRight,
} from "lucide-react";

export interface ClauseSlide {
  id: string;
  status: "SUSPICIOUS" | "FINE" | "CAUTION";
  category: string;
  title: string;
  contractSnippet: string;
  sectionRef: string;
  verdictTitle: string;
  verdictExplanation: string;
  pushbackPrompt?: string;
}

export const SLIDES: ClauseSlide[] = [
  {
    id: "s-1",
    status: "SUSPICIOUS",
    category: "Employment Offer",
    title: "The 90-Day Notice Trap",
    sectionRef: "Section 5.2",
    contractSnippet:
      "Employee agrees to furnish not less than ninety (90) calendar days prior written notice of voluntary cessation of employment. Early release remains at Employer's sole discretion.",
    verdictTitle: "Locked in for 3 full months after quitting",
    verdictExplanation:
      "Most employers will rescind a new job offer if you cannot start within 30 to 45 days. A 90-day lock-in severely diminishes your future career mobility.",
    pushbackPrompt:
      "Can we adjust the resignation notice period to 30 days during probation, and 60 days thereafter to match prevailing market standards?",
  },
  {
    id: "s-2",
    status: "FINE",
    category: "Employment Offer",
    title: "Fixed Base Salary Remittance",
    sectionRef: "Section 3.1",
    contractSnippet:
      "Company shall pay an annualized base salary of $145,000 USD, payable semi-monthly via direct deposit in accordance with standard payroll schedules.",
    verdictTitle: "Unconditional & protected base pay",
    verdictExplanation:
      "Fixed annual compensation is explicitly stated with standard bi-weekly frequency. No hidden prerequisites, escrow deductions, or clawbacks detected.",
  },
  {
    id: "s-3",
    status: "SUSPICIOUS",
    category: "Intellectual Property",
    title: "The 'Weekend Code' IP Grab",
    sectionRef: "Section 8.1",
    contractSnippet:
      "All inventions, software, and derivative works authored by Employee, whether created during business hours or on personal equipment during leisure, vest exclusively in Company.",
    verdictTitle: "They claim ownership of your personal side projects",
    verdictExplanation:
      "If you build an iOS app, SaaS product, or open-source repo on Saturday on your own laptop, the company's legal counsel can claim 100% ownership of your work.",
    pushbackPrompt:
      "Can we attach an Exhibit B explicitly carving out my personal pre-existing GitHub repositories and hobby side projects?",
  },
  {
    id: "s-4",
    status: "FINE",
    category: "Benefits & Perks",
    title: "Day-One Comprehensive Healthcare",
    sectionRef: "Section 4.1",
    contractSnippet:
      "Employee and eligible dependents shall be entitled to participate in comprehensive medical, dental, and vision insurance effective on the first calendar day of employment.",
    verdictTitle: "Immediate coverage with zero probation wait",
    verdictExplanation:
      "Full health benefits activate on Day 1 without an arbitrary 60 or 90-day waiting gap. Symmetrical and standard market terms.",
  },
  {
    id: "s-5",
    status: "SUSPICIOUS",
    category: "Apartment Lease",
    title: "Compounded 10% Rent Escalation",
    sectionRef: "Clause 3",
    contractSnippet:
      "Upon completion of the initial 12-month lease term, monthly Rent shall automatically escalate by ten percent (10%) compounded annually without further notice.",
    verdictTitle: "An automatic $3,120 extra out of your pocket next year",
    verdictExplanation:
      "Inflation and neighborhood rent appreciation typically average 3–4%. A fixed 10% compounding clause extracts unearned rent hikes without negotiation.",
    pushbackPrompt:
      "Can we cap the renewal escalation at 3.5% or align it with the regional Consumer Price Index for urban renters?",
  },
  {
    id: "s-6",
    status: "SUSPICIOUS",
    category: "Freelance SOW",
    title: "Pre-Payment Copyright Surrender",
    sectionRef: "Section 4.3",
    contractSnippet:
      "Contractor irrevocably assigns all copyright, title, and patent rights in all Deliverables upon creation, prior to invoice submission.",
    verdictTitle: "They own your work even if they refuse to pay your invoice",
    verdictExplanation:
      "Withholding copyright until payment clears is your primary leverage as a freelancer. Transferring IP upon creation leaves you completely exposed to non-payment.",
    pushbackPrompt:
      "Can we amend Section 4.3 to state that IP rights transfer strictly upon receipt of full and final invoice payment?",
  },
];

export function HeroSlideshow({
  onUploadClick,
}: {
  onUploadClick: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSlide = SLIDES[currentIndex];

  const goTo = useCallback(
    (idx: number) => {
      setCurrentIndex(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length);
      setProgressKey((k) => k + 1);
    },
    []
  );

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      goTo(currentIndex + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, currentIndex, goTo]);

  const handleCopyPushback = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuspicious = activeSlide.status === "SUSPICIOUS";

  return (
    <section className="relative pt-20 pb-24 lg:pt-28 lg:pb-32 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-start">
          {/* ── Left: Editorial Headline ── */}
          <div className="lg:col-span-5 space-y-8">
            {/* Chapter marker */}
            <div className="chapter-marker">Before You Sign</div>

            {/* The Headline — massive, unapologetic serif */}
            <h1 className="headline-editorial text-[clamp(2.75rem,5.5vw,4.5rem)] font-normal">
              Know what you
              <br />
              sign.{" "}
              <span className="italic text-[var(--gold)]">
                Before
                <br />
                the ink dries.
              </span>
            </h1>

            {/* Subtitle — high contrast, readable 16px font-normal */}
            <p className="text-base sm:text-lg text-[var(--paper-dim)] leading-relaxed max-w-lg font-normal">
              Contracts contain clauses you can safely ignore — and restrictive
              traps that will cost you. Signwise spots the difference in seconds.
            </p>

            {/* Upload CTA */}
            <div className="flex flex-col gap-4 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={onUploadClick}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-editorial w-fit"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Agreement</span>
                <ArrowRight className="h-4 w-4 ml-1 opacity-70" />
              </button>

              <div className="text-xs font-mono text-[var(--paper-muted)] pt-1">
                Supports PDF, DOCX, and TXT agreements
              </div>
            </div>
          </div>

          {/* ── Right: Product-Grade Clause Card ── */}
          <div
            className="lg:col-span-7"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="product-card rounded-xl p-0 overflow-hidden">
              {/* Card Top Bar — mimics real product chrome */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.08] bg-[var(--ink-surface)]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="label-mono text-xs font-bold text-[var(--paper-dim)] tracking-wider">
                    SIGNWISE — CLAUSE INSPECTOR
                  </span>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs text-[var(--paper-muted)] font-semibold tabular-nums">
                    {String(currentIndex + 1).padStart(2, "0")}/{String(SLIDES.length).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => goTo(currentIndex - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded bg-white/[0.04] text-[var(--paper-dim)] hover:text-white hover:bg-white/[0.1] transition-all"
                    aria-label="Previous clause"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => goTo(currentIndex + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded bg-white/[0.04] text-[var(--paper-dim)] hover:text-white hover:bg-white/[0.1] transition-all"
                    aria-label="Next clause"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 space-y-5">
                {/* Status + Meta Row */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`status-dot ${
                        isSuspicious ? "status-dot-danger" : "status-dot-safe"
                      }`}
                    />
                    <span className={`label-mono text-xs font-bold tracking-wider ${
                      isSuspicious ? "text-[var(--signal-danger)]" : "text-[var(--signal-safe)]"
                    }`}>
                      {isSuspicious ? "SUSPICIOUS COVENANT" : "STANDARD TERM"}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-[var(--paper-muted)] font-medium tracking-wide">
                    {activeSlide.category} &mdash; <span className="text-[var(--paper)] font-semibold">{activeSlide.sectionRef}</span>
                  </span>
                </div>

                {/* Clause Title */}
                <h3 className="text-xl sm:text-2xl text-[var(--paper)] font-semibold font-sans leading-snug tracking-tight">
                  {activeSlide.title}
                </h3>

                {/* Original Contract Quote — recessed document feel with crisp readable text */}
                <div className="document-recess rounded-lg p-4 sm:p-5 border border-white/[0.08]">
                  <div className="label-mono text-[11px] mb-2 font-bold text-[var(--paper-muted)] flex items-center justify-between">
                    <span>ORIGINAL CONTRACT LANGUAGE</span>
                    <span className="text-[10px] text-[var(--paper-faint)] font-mono font-normal">AS DRAFTED</span>
                  </div>
                  <p className="font-sans text-[14px] sm:text-[15px] leading-relaxed text-[var(--paper)] font-normal border-l-2 border-white/20 pl-3.5 my-1">
                    &ldquo;{activeSlide.contractSnippet}&rdquo;
                  </p>
                </div>

                {/* Verdict */}
                <div
                  className={`rounded-lg p-4 sm:p-5 border-l-4 ${
                    isSuspicious
                      ? "border-l-[var(--signal-danger)] bg-[var(--signal-danger-bg)] border border-white/[0.06]"
                      : "border-l-[var(--signal-safe)] bg-[var(--signal-safe-bg)] border border-white/[0.06]"
                  }`}
                >
                  <div
                    className={`label-mono text-[11px] font-bold tracking-wider mb-1.5 ${
                      isSuspicious
                        ? "text-[var(--signal-danger)]"
                        : "text-[var(--signal-safe)]"
                    }`}
                  >
                    PLAIN-ENGLISH VERDICT
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[var(--paper)] mb-1.5 leading-snug">
                    {activeSlide.verdictTitle}
                  </div>
                  <p className="text-[14px] text-[var(--paper-dim)] leading-relaxed font-normal">
                    {activeSlide.verdictExplanation}
                  </p>
                </div>

                {/* Pushback (if suspicious) */}
                {activeSlide.pushbackPrompt && (
                  <div className="rounded-lg border border-[var(--gold-dim)] bg-[var(--gold-ghost)] p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="label-mono text-[11px] font-bold text-[var(--gold)]">
                        RECOMMENDED PUSHBACK (COUNTER-PROPOSAL)
                      </span>
                      <button
                        onClick={() =>
                          handleCopyPushback(activeSlide.pushbackPrompt || "")
                        }
                        className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--gold)] hover:text-white transition-colors uppercase tracking-wider bg-[var(--gold-faint)] px-2.5 py-1 rounded"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[var(--signal-safe)]" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="font-sans text-[14px] text-[var(--paper)] leading-relaxed font-medium pl-3 border-l-2 border-[var(--gold)]">
                      &ldquo;{activeSlide.pushbackPrompt}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Bar at bottom */}
              <div className="progress-track">
                <div
                  key={progressKey}
                  className={`progress-fill ${isPaused ? "" : "progress-auto"}`}
                  style={isPaused ? { width: "100%" } : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
