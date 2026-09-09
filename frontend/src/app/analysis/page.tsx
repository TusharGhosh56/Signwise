"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAnalysis } from "@/context/analysis-context";
import {
  ContractAnalysis,
  ClauseBreakdown,
  ChatQueryResponse,
} from "@/types/contract";
import { askContractQuestion } from "@/lib/api";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  Loader2,
  Printer,
  Sparkles,
  Lock,
  Scale,
  DollarSign,
  Clock,
  ChevronRight,
  AlertOctagon,
  Sun,
  Moon,
  Download,
  FileQuestion,
  Info,
  FileCheck,
} from "lucide-react";

export default function AnalysisPage() {
  const {
    currentAnalysis,
    isAnalyzing,
    analysisError,
    progressStage,
    fileName,
    theme,
    toggleTheme,
    analyzeFile,
    loadPreset,
  } = useAnalysis();

  const [activeSection, setActiveSection] = useState<string>("broad-spectrum");
  const [expandedSnippetId, setExpandedSnippetId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeEmailTab, setActiveEmailTab] = useState(0);

  // Grounded Chat state
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "user" | "assistant"; text: string; citations?: string[] }>
  >([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "broad-spectrum",
        "things-wrong",
        "things-right",
        "surrendered-rights",
        "obligations-finances",
        "negotiation-playbook",
        "contract-chat",
      ];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 220 && rect.bottom >= 220) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyEmail = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await analyzeFile(file);
        scrollToSection("broad-spectrum");
      } catch (err) {
        console.error("Analysis failed:", err);
      }
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim() || isChatLoading || !currentAnalysis) return;

    const userQ = chatQuestion.trim();
    setChatQuestion("");
    setChatHistory((prev) => [...prev, { role: "user", text: userQ }]);
    setIsChatLoading(true);

    try {
      const res: ChatQueryResponse = await askContractQuestion(
        userQ,
        undefined,
        currentAnalysis
      );
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.answer,
          citations: res.referencedSectionRefs,
        },
      ]);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to get answer.";
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ ${errMsg}`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Data helpers
  const clauses = currentAnalysis?.clauses || [];
  const wrongClauses = clauses.filter((c) => c.severity === "HIGH");
  const rightClauses = clauses.filter((c) => c.severity === "LOW");
  const reviewClauses = clauses.filter((c) => c.severity === "MEDIUM");

  // Calculate Asymmetry & Fairness metrics
  const redFlagWeight = wrongClauses.length * 28;
  const reviewWeight = reviewClauses.length * 8;
  const rawDeduction = redFlagWeight + reviewWeight;
  const fairnessScore = Math.max(35, Math.min(96, 100 - rawDeduction));

  const getAsymmetryLabel = (score: number) => {
    if (currentAnalysis?.documentCategory === "OTHER") {
      return {
        label: "INFORMATIONAL / NON-AGREEMENT DOCUMENT",
        color: "text-[var(--signal-safe)]",
        dotClass: "status-dot-safe",
        toneText: "No restrictive legal covenants or counterparty obligations detected.",
      };
    }
    if (score < 55) {
      return {
        label: "HEAVILY ASYMMETRIC (ONE-SIDED COUNTERPARTY LEVERAGE)",
        color: "text-[var(--signal-danger)]",
        dotClass: "status-dot-danger",
        toneText: "Strongly favors the drafting party with non-market liabilities.",
      };
    }
    if (score < 75) {
      return {
        label: "MODERATELY ASYMMETRIC (KEY CARVE-OUTS RECOMMENDED)",
        color: "text-[var(--signal-caution)]",
        dotClass: "status-dot-caution",
        toneText: "Standard commercial core, but contains 1-2 aggressive restrictions.",
      };
    }
    return {
      label: "BALANCED & EQUITABLE (MARKET MEDIAN NORMS)",
      color: "text-[var(--signal-safe)]",
      dotClass: "status-dot-safe",
      toneText: "Symmetric provisions with fair, standard commercial terms.",
    };
  };

  const asymmetry = getAsymmetryLabel(fairnessScore);

  const isNonContract =
    currentAnalysis?.documentCategory === "OTHER" ||
    (currentAnalysis !== null &&
      clauses.length === 0 &&
      (currentAnalysis.whatYouAreGivingUp?.length || 0) === 0);

  // Reusable Grounded Document Q&A Section
  const renderChatSection = (isStandalone: boolean = false) => (
    <section id="contract-chat" className="scroll-mt-36 space-y-8">
      <div className="space-y-3">
        <div className="chapter-marker">
          {isStandalone ? "Document Q&A Assistant" : "Chapter VII — Grounded Document Inquiry"}
        </div>
        <h2 className="headline-editorial text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal text-[var(--paper)]">
          {isStandalone ? "Ask questions about this document." : (
            <>
              Ask any question about{" "}
              <span className="italic text-[var(--gold)]">
                this agreement.
              </span>
            </>
          )}
        </h2>
        <p className="text-base text-[var(--paper-dim)] font-normal max-w-2xl">
          {isStandalone
            ? "Even though this file is not a binding legal contract, our AI intelligence can parse its contents, parameters, and details to answer your questions."
            : "Responses are verified strictly against the clauses in your agreement and cite the exact section numbers."}
        </p>
      </div>

      <div className="product-card rounded-xl border border-[var(--border-subtle)] p-6 sm:p-8 space-y-5">
        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 document-recess rounded-lg p-5 border border-[var(--border-subtle)]">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-xl p-4 rounded-lg text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[var(--gold-ghost)] border border-[var(--gold-dim)] text-[var(--gold)] font-medium"
                      : "document-recess text-[var(--paper)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {msg.text}

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center gap-2 label-mono text-[10px] text-[var(--gold)]">
                      <span>VERIFIED CITATIONS:</span>
                      {msg.citations.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-[var(--ink-surface)] border border-[var(--border-subtle)]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--gold)] p-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Scanning document text...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
        )}

        {/* Question Input Form */}
        <form onSubmit={handleChatSubmit} className="flex gap-3">
          <input
            type="text"
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            placeholder={
              isStandalone
                ? "e.g. What guidelines or specifications are defined in this document?"
                : "e.g. Can I still work on open-source projects? What happens if I resign early?"
            }
            className="flex-1 document-recess border border-[var(--border-subtle)] focus:border-[var(--gold)] rounded-lg px-4 py-3 text-sm text-[var(--paper)] placeholder:text-[var(--paper-muted)] outline-none transition-colors font-sans"
          />
          <button
            type="submit"
            disabled={!chatQuestion.trim() || isChatLoading}
            className="btn btn-md btn-primary disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Inquire</span>
          </button>
        </form>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)] flex flex-col selection:bg-[var(--gold-faint)] selection:text-[var(--paper)]">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Top Sticky Editorial Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--ink)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Masthead Wordmark & Back */}
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-baseline gap-2">
              <span className="font-serif italic text-2xl text-[var(--paper)] tracking-wide font-normal group-hover:text-[var(--gold)] transition-colors duration-300">
                Signwise
              </span>
            </Link>

            {/* Breadcrumb back */}
            <Link
              href="/"
              className="flex items-center gap-1.5 label-mono text-xs text-[var(--paper-muted)] hover:text-[var(--gold)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Overview</span>
            </Link>
          </div>

          {/* Quick Actions: Decluttered, unified controls */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button: Light <-> Dark */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
              className="btn btn-sm btn-secondary"
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

            {/* Print / Export PDF button */}
            {currentAnalysis && !isNonContract && (
              <button
                onClick={() => window.print()}
                disabled={isAnalyzing}
                title="Download or Print PDF Audit Report"
                className="btn btn-sm btn-secondary"
              >
                <Download className="h-3.5 w-3.5 text-[var(--gold)]" />
                <span>Export PDF</span>
              </button>
            )}

            {/* Upload File CTA */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm btn-primary"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Doc</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Chapter Sub-Nav (Shown only when analysis is loaded and is a contract) */}
      {currentAnalysis && !isNonContract && (
        <nav className="sticky top-16 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--ink-raised)]/95 backdrop-blur-md overflow-x-auto screen-only">
          <div className="mx-auto flex h-12 max-w-6xl items-center gap-6 px-6 text-xs font-mono tracking-wider uppercase whitespace-nowrap">
            {[
              { id: "broad-spectrum", label: "I. The Spectrum" },
              { id: "things-wrong", label: `II. What's Wrong (${wrongClauses.length})` },
              { id: "things-right", label: `III. What's Right (${rightClauses.length})` },
              { id: "surrendered-rights", label: "IV. Ceded Rights" },
              { id: "obligations-finances", label: "V. Obligations" },
              { id: "negotiation-playbook", label: "VI. Counter-Offers" },
              { id: "contract-chat", label: "VII. Q&A" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`h-full flex items-center border-b-2 font-medium transition-all duration-200 ${
                  activeSection === tab.id
                    ? "text-[var(--paper)] border-[var(--gold)] font-bold"
                    : "text-[var(--paper-muted)] border-transparent hover:text-[var(--gold)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Main Analysis Report */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-14 space-y-24">
        {/* Empty State: Prompt user to upload their agreement */}
        {!currentAnalysis && !isAnalyzing && (
          <div className="py-20 px-8 rounded-xl product-card border border-[var(--border-subtle)] text-center max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6 screen-only">
            <div className="w-16 h-16 rounded-full bg-[var(--gold-ghost)] border border-[var(--gold-dim)] flex items-center justify-center text-[var(--gold)]">
              <FileText className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <div className="chapter-marker justify-center">Document Intelligence Pipeline</div>
              <h2 className="headline-editorial text-3xl font-normal text-[var(--paper)]">
                Upload Your Agreement
              </h2>
              <p className="text-sm text-[var(--paper-dim)] max-w-md mx-auto leading-relaxed">
                Upload your contract, employment agreement, lease, or NDA to receive a complete, plain-English legal intelligence audit.
              </p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md p-8 border-2 border-dashed border-[var(--gold-dim)] rounded-lg bg-[var(--ink-surface)] hover:bg-[var(--gold-ghost)] transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 group"
            >
              <Upload className="h-6 w-6 text-[var(--gold)] group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold text-[var(--paper)]">
                Click to browse or drop document here
              </div>
              <div className="text-xs font-mono text-[var(--paper-muted)]">
                Supports PDF, DOCX, TXT (up to 25MB)
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[var(--paper-faint)]">
              <Lock className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>In-memory auditing &bull; Zero document retention &bull; Encrypted in-flight</span>
            </div>
          </div>
        )}

        {/* Loading Progress State */}
        {isAnalyzing && (
          <div className="py-20 rounded-xl product-card border border-[var(--border-subtle)] p-8 text-center relative overflow-hidden flex flex-col items-center justify-center screen-only">
            <Loader2 className="h-8 w-8 text-[var(--gold)] animate-spin mb-4" />
            <h3 className="headline-editorial text-2xl font-normal text-[var(--paper)]">
              Parsing and auditing agreement architecture...
            </h3>
            <p className="label-mono text-xs text-[var(--gold)] mt-2">
              {progressStage || "Scanning legal clauses and evaluating asymmetric risks..."}
            </p>
            {fileName && (
              <p className="text-xs font-mono text-[var(--paper-muted)] mt-2">
                Source Document: <span className="text-[var(--paper)]">{fileName}</span>
              </p>
            )}
          </div>
        )}

        {/* Error Alert */}
        {analysisError && !isAnalyzing && (
          <div className="p-5 rounded-lg border border-[var(--signal-danger-border)] bg-[var(--signal-danger-bg)] flex items-start gap-4 text-sm text-[var(--signal-danger)] screen-only">
            <AlertOctagon className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[var(--paper)]">Document Parsing Notice</p>
              <p className="text-xs text-[var(--paper-dim)] mt-1">{analysisError}</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-ghost text-xs py-1 px-3"
            >
              Try Another File
            </button>
          </div>
        )}

        {/* NON-CONTRACT INFORMATIONAL VIEW: Displayed when uploaded file is not a binding agreement */}
        {currentAnalysis && isNonContract && (
          <div className="screen-only space-y-12 max-w-4xl mx-auto pt-4">
            {/* Non-Contract Hero Notice Card */}
            <div className="product-card rounded-2xl p-8 sm:p-12 border border-[var(--border-subtle)] space-y-8 shadow-2xl relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--gold-faint)] rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />

              {/* Top Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--gold-faint)] border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)]">
                    <FileQuestion className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="label-mono text-xs font-bold text-[var(--gold)] tracking-wider block">
                      INFORMATIONAL / NON-AGREEMENT FILE
                    </span>
                    <span className="text-xs text-[var(--paper-muted)] font-mono">
                      No Contractual Liabilities Detected
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--ink-surface)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--paper-dim)]">
                  <FileText className="h-3.5 w-3.5 text-[var(--gold)]" />
                  <span>{currentAnalysis.fileName}</span>
                </div>
              </div>

              {/* Main Title & Extracted Summary */}
              <div className="space-y-4 relative z-10">
                <h1 className="headline-editorial text-3xl sm:text-4xl text-[var(--paper)] font-normal leading-tight">
                  {currentAnalysis.documentTitle}
                </h1>
                <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--ink-surface)]/60 leading-relaxed text-[var(--paper-dim)] text-sm sm:text-base font-sans">
                  <p>{currentAnalysis.headlineSummary}</p>
                </div>
              </div>

              {/* Explanatory Notice */}
              <div className="rounded-xl p-6 border-l-4 border-l-[var(--gold)] bg-[var(--gold-faint)] border border-[var(--gold)]/20 space-y-2.5 relative z-10">
                <div className="flex items-center gap-2 text-[var(--gold)] font-mono text-xs font-bold tracking-wider">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>WHY ARE THERE NO RISK SCORES OR CLAUSES?</span>
                </div>
                <p className="text-sm text-[var(--paper)] leading-relaxed font-sans">
                  Signwise is purpose-built to audit <strong>binding legal agreements</strong> (such as Employment Offer Letters, Leases, NDAs, Consulting Contracts, and Terms of Service) to uncover asymmetric legal risks and hidden liabilities.
                </p>
                <p className="text-xs text-[var(--paper-muted)] leading-relaxed font-sans">
                  Because this uploaded document is an informational or reference file, it does not contain counterparty covenants, personal liabilities, or restrictive clauses. Commercial fairness scoring and non-market trap analyses do not apply.
                </p>
              </div>

              {/* 3 Quick Vitals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                <div className="document-recess rounded-xl p-4 border border-[var(--border-subtle)] space-y-1.5">
                  <div className="label-mono text-[10px] text-[var(--signal-safe)] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>RESTRICTIVE COVENANTS</span>
                  </div>
                  <div className="headline-editorial text-2xl text-[var(--paper)]">
                    0 Detected
                  </div>
                  <p className="text-[11px] text-[var(--paper-muted)] font-mono">
                    No binding personal restrictions
                  </p>
                </div>

                <div className="document-recess rounded-xl p-4 border border-[var(--border-subtle)] space-y-1.5">
                  <div className="label-mono text-[10px] text-[var(--signal-safe)] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>FINANCIAL LIABILITIES</span>
                  </div>
                  <div className="headline-editorial text-2xl text-[var(--paper)]">
                    None
                  </div>
                  <p className="text-[11px] text-[var(--paper-muted)] font-mono">
                    Zero payment/penalty liabilities
                  </p>
                </div>

                <div className="document-recess rounded-xl p-4 border border-[var(--border-subtle)] space-y-1.5">
                  <div className="label-mono text-[10px] text-[var(--gold)] flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5" />
                    <span>DOCUMENT STATUS</span>
                  </div>
                  <div className="headline-editorial text-2xl text-[var(--paper)]">
                    Safe
                  </div>
                  <p className="text-[11px] text-[var(--paper-muted)] font-mono">
                    Non-binding reference file
                  </p>
                </div>
              </div>

              {/* Actions: Upload Contract or Load Presets */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-10">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-lg btn-primary"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload a Contract or Agreement</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--paper-muted)]">Test demo agreement:</span>
                  <button
                    onClick={() => loadPreset("employment")}
                    className="btn btn-sm btn-secondary"
                  >
                    Employment Offer
                  </button>
                  <button
                    onClick={() => loadPreset("lease")}
                    className="btn btn-sm btn-secondary"
                  >
                    Lease Agreement
                  </button>
                </div>
              </div>
            </div>

            {/* Document Q&A Assistant */}
            {renderChatSection(true)}
          </div>
        )}

        {/* INTERACTIVE WEB VIEW FOR CONTRACTS: HIDDEN ON PRINT */}
        {currentAnalysis && !isNonContract && (
          <div className="screen-only space-y-24">
            {/* ========================================================================= */}
            {/* CHAPTER I: THE BROAD SPECTRUM                                             */}
            {/* ========================================================================= */}
            <section id="broad-spectrum" className="scroll-mt-36 space-y-10">
              {/* Masthead Chapter Tag & Main Headline */}
              <div className="space-y-4">
                <div className="chapter-marker">Chapter I &mdash; The Executive Spectrum</div>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div>
                    <h1 className="headline-editorial text-[clamp(2.25rem,4vw,3.5rem)] font-normal text-[var(--paper)]">
                      {currentAnalysis.documentTitle}
                    </h1>
                    <p className="mt-3 text-base text-[var(--paper-dim)] font-normal max-w-2xl leading-relaxed">
                      {currentAnalysis.headlineSummary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[var(--paper-muted)]">
                    <span className="px-3 py-1 rounded bg-[var(--ink-surface)] border border-[var(--border-subtle)] text-[var(--gold)] font-semibold uppercase">
                      {currentAnalysis.documentCategory.replace("_", " ")}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--ink-surface)] border border-[var(--border-subtle)]">
                      <FileText className="h-3.5 w-3.5 text-[var(--paper-faint)]" />
                      <span>{currentAnalysis.fileName}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* The Audit Balance & Asymmetry Card */}
              <div className="product-card rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                {/* Product Card Top Window Header */}
                <div className="flex items-center justify-between px-6 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--ink-surface)]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="label-mono text-xs font-bold text-[var(--paper-dim)] tracking-wider">
                      SIGNWISE &mdash; BALANCE &amp; ASYMMETRY INDEX
                    </span>
                  </div>
                  <span className="label-mono text-xs text-[var(--paper-muted)]">
                    CONFIDENTIAL AUDIT
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8 space-y-7">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                    <div>
                      <div className="label-mono text-xs text-[var(--gold)] mb-1">
                        OVERALL FAIRNESS VERDICT
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`status-dot ${asymmetry.dotClass}`} />
                        <span className={`label-mono text-xs font-bold tracking-wider ${asymmetry.color}`}>
                          {asymmetry.label}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--paper-muted)] mt-1 font-mono">
                        {asymmetry.toneText}
                      </p>
                    </div>

                    <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                      <div className="flex items-baseline gap-1">
                        <span className="headline-editorial text-4xl sm:text-5xl text-[var(--paper)] font-normal">
                          {fairnessScore}
                        </span>
                        <span className="font-mono text-base text-[var(--paper-muted)]">
                          /100
                        </span>
                      </div>
                      <span className="label-mono text-[10px] text-[var(--paper-faint)]">
                        COMMERCIAL FAIRNESS SCORE
                      </span>
                    </div>
                  </div>

                  {/* Visual Segmented Asymmetry Track */}
                  <div className="space-y-2.5 pt-2">
                    <div className="relative h-3 w-full rounded-full bg-white/[0.04] border border-white/[0.08] p-0.5 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/80 via-amber-400/80 to-emerald-400/80 opacity-75" />
                      {/* Floating Indicator Needle */}
                      <div
                        className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-lg border border-black transform -translate-x-1/2 transition-all duration-700"
                        style={{ left: `${fairnessScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between label-mono text-[10px] text-[var(--paper-muted)] px-1">
                      <span className="text-[var(--signal-danger)]">One-Sided Drafting</span>
                      <span className="text-[var(--signal-caution)]">Commercial Median</span>
                      <span className="text-[var(--signal-safe)]">Balanced Protections</span>
                    </div>
                  </div>

                  {/* The 30-Second Bottom Line (3 Anchor Boxes) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3">
                    {/* The Big Protection */}
                    <div className="rounded-lg p-5 border-l-4 border-l-[var(--signal-safe)] bg-[var(--signal-safe-bg)] border border-white/[0.06] space-y-2">
                      <div className="label-mono text-[11px] font-bold text-[var(--signal-safe)] tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>THE BIG PROTECTION</span>
                      </div>
                      <p className="text-[13px] text-[var(--paper-dim)] leading-relaxed font-normal">
                        {rightClauses[0]?.whatItMeans ||
                          (currentAnalysis.documentCategory === "OTHER"
                            ? "No specific counterparty protective clauses isolated."
                            : "Guaranteed base compensation and standard mutual confidentiality clauses safeguard your position.")}
                      </p>
                    </div>

                    {/* The Major Trap */}
                    <div className="rounded-lg p-5 border-l-4 border-l-[var(--signal-danger)] bg-[var(--signal-danger-bg)] border border-white/[0.06] space-y-2">
                      <div className="label-mono text-[11px] font-bold text-[var(--signal-danger)] tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>THE MAJOR TRAP</span>
                      </div>
                      <p className="text-[13px] text-[var(--paper-dim)] leading-relaxed font-normal">
                        {wrongClauses[0]?.whatItMeans ||
                          (wrongClauses.length === 0
                            ? "No aggressive non-market traps or asymmetric liabilities detected."
                            : "Aggressive restrictive covenants work heavily against your mobility.")}
                      </p>
                    </div>

                    {/* The Ambiguous Catch */}
                    <div className="rounded-lg p-5 border-l-4 border-l-[var(--signal-caution)] bg-[var(--signal-caution-bg)] border border-white/[0.06] space-y-2">
                      <div className="label-mono text-[11px] font-bold text-[var(--signal-caution)] tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>THE AMBIGUOUS CATCH</span>
                      </div>
                      <p className="text-[13px] text-[var(--paper-dim)] leading-relaxed font-normal">
                        {reviewClauses[0]?.whatItMeans ||
                          (reviewClauses.length === 0
                            ? "No ambiguous clauses or vague terms requiring formal clarification."
                            : "Discretionary conditions or vague separation rules require formal written clarification before signing.")}
                      </p>
                    </div>
                  </div>

                  {/* 4 High-Contrast Vitals Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div className="document-recess rounded-lg p-4 border border-white/[0.08] space-y-1">
                      <div className="label-mono text-[10px] text-[var(--signal-danger)]">
                        RED FLAGS DETECTED
                      </div>
                      <div className="headline-editorial text-2xl text-[var(--signal-danger)]">
                        {wrongClauses.length}
                      </div>
                      <div className="text-[11px] text-[var(--paper-muted)] font-mono">
                        Terms to push back
                      </div>
                    </div>

                    <div className="document-recess rounded-lg p-4 border border-white/[0.08] space-y-1">
                      <div className="label-mono text-[10px] text-[var(--signal-safe)]">
                        STANDARD MARKET TERMS
                      </div>
                      <div className="headline-editorial text-2xl text-[var(--signal-safe)]">
                        {rightClauses.length}
                      </div>
                      <div className="text-[11px] text-[var(--paper-muted)] font-mono">
                        Accept without debate
                      </div>
                    </div>

                    <div className="document-recess rounded-lg p-4 border border-white/[0.08] space-y-1">
                      <div className="label-mono text-[10px] text-[var(--signal-caution)]">
                        CLARIFICATION ITEMS
                      </div>
                      <div className="headline-editorial text-2xl text-[var(--signal-caution)]">
                        {reviewClauses.length}
                      </div>
                      <div className="text-[11px] text-[var(--paper-muted)] font-mono">
                        Requires written answer
                      </div>
                    </div>

                    <div className="document-recess rounded-lg p-4 border border-white/[0.08] space-y-1">
                      <div className="label-mono text-[10px] text-[var(--gold)]">
                        RIGHTS CEDED
                      </div>
                      <div className="headline-editorial text-2xl text-[var(--gold)]">
                        {currentAnalysis.whatYouAreGivingUp?.length || 0}
                      </div>
                      <div className="text-[11px] text-[var(--paper-muted)] font-mono">
                        Surrendered upon signing
                      </div>
                    </div>
                  </div>

                  {/* Call-to-action button to step into Section 2 */}
                  <div className="pt-2 flex justify-start">
                    <button
                      onClick={() => scrollToSection("things-wrong")}
                      className="btn btn-md btn-primary"
                    >
                      <span>Begin Guided Examination (Step 1: Inspect Traps)</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Chapter Break Rule */}
            <div className="chapter-rule mx-auto max-w-6xl" />

            {/* ========================================================================= */}
            {/* CHAPTER II: THINGS THAT ARE WRONG (THE TRAPS)                             */}
            {/* ========================================================================= */}
            <section id="things-wrong" className="scroll-mt-36 space-y-8">
              <div className="space-y-3">
                <div className="chapter-marker">Chapter II &mdash; Things That Are Wrong</div>
                <h2 className="headline-editorial text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal text-[var(--paper)]">
                  Non-market covenants &amp;{" "}
                  <span className="italic text-[var(--signal-danger)]">
                    asymmetric traps.
                  </span>
                </h2>
                <p className="text-base text-[var(--paper-dim)] font-normal max-w-2xl">
                  These provisions heavily favor the counterparty or exceed standard commercial practice. We strongly advise pushing back with our drafted counter-proposals.
                </p>
              </div>

              {/* Cards List */}
              <div className="space-y-8">
                {wrongClauses.length === 0 ? (
                  <div className="product-card rounded-xl p-8 border border-[var(--border-subtle)] text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-[var(--signal-safe-bg)] border border-[var(--signal-safe)] flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-[var(--signal-safe)]" />
                    </div>
                    <h3 className="font-sans text-lg font-semibold text-[var(--paper)]">
                      No High-Risk Traps Detected
                    </h3>
                    <p className="text-sm text-[var(--paper-dim)] max-w-lg mx-auto leading-relaxed">
                      {currentAnalysis.documentCategory === "OTHER"
                        ? "This document is not a restrictive contract. No predatory covenants, 90-day lock-ins, or IP claims were detected."
                        : "Signwise did not identify any non-market red flags or heavily asymmetric traps in this agreement."}
                    </p>
                  </div>
                ) : (
                  wrongClauses.map((clause: ClauseBreakdown, idx: number) => (
                  <div
                    key={clause.id}
                    className="product-card rounded-xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl"
                  >
                    {/* Top Window Header */}
                    <div className="flex items-center justify-between px-6 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--ink-surface)]">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                        </div>
                        <span className="label-mono text-xs font-bold text-[var(--signal-danger)] tracking-wider">
                          TRAP #{idx + 1} &mdash; NON-MARKET CLAUSE
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[var(--paper-muted)]">
                        {clause.sectionRef} &bull; {clause.category}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 sm:p-7 space-y-5">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className="status-dot status-dot-danger" />
                          <span className="label-mono text-xs font-bold tracking-wider text-[var(--signal-danger)]">
                            HIGH ASYMMETRIC RISK
                          </span>
                        </div>
                      </div>

                      {/* Clause Title */}
                      <h3 className="text-xl sm:text-2xl text-[var(--paper)] font-semibold font-sans leading-snug tracking-tight">
                        {clause.title}
                      </h3>

                      {/* Recessed Original Contract Quote */}
                      <div className="document-recess rounded-lg p-4 sm:p-5 border border-[var(--border-subtle)]">
                        <div className="label-mono text-[11px] mb-2 font-bold text-[var(--paper-muted)] flex items-center justify-between">
                          <span>ORIGINAL CONTRACT LANGUAGE</span>
                          <span className="text-[10px] text-[var(--paper-faint)] font-mono font-normal">AS DRAFTED</span>
                        </div>
                        <p className="font-sans text-[14px] sm:text-[15px] leading-relaxed text-[var(--paper)] font-normal border-l-2 border-white/20 pl-3.5 my-1">
                          &ldquo;{clause.originalSnippet}&rdquo;
                        </p>
                      </div>

                      {/* Plain-English Verdict Block */}
                      <div className="rounded-lg p-4 sm:p-5 border-l-4 border-l-[var(--signal-danger)] bg-[var(--signal-danger-bg)] border border-[var(--border-subtle)] space-y-1.5">
                        <div className="label-mono text-[11px] font-bold tracking-wider text-[var(--signal-danger)]">
                          PLAIN-ENGLISH VERDICT
                        </div>
                        <div className="text-base sm:text-lg font-bold text-[var(--paper)] leading-snug">
                          {clause.whatItSays}
                        </div>
                        <p className="text-[14px] text-[var(--paper-dim)] leading-relaxed font-normal">
                          {clause.whatItMeans}
                        </p>
                        <div className="border-t border-[var(--border-subtle)] pt-2 mt-2">
                          <p className="text-xs text-[var(--paper-muted)] leading-relaxed">
                            <strong className="text-[var(--paper)] font-semibold">Strategic Impact:</strong> {clause.whyItMatters}
                          </p>
                        </div>
                      </div>

                      {/* Counter-Proposal Pushback Box */}
                      <div className="rounded-lg border border-[var(--gold-dim)] bg-[var(--gold-ghost)] p-4 sm:p-5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="label-mono text-xs font-bold text-[var(--gold)]">
                            SUGGESTED COUNTER-PROPOSAL
                          </span>
                          <button
                            onClick={() => handleCopy(clause.whatToAsk, clause.id)}
                            className="btn btn-sm btn-secondary"
                          >
                            {copiedId === clause.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-[var(--signal-safe)]" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy Counter-Offer</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="font-sans text-[14px] text-[var(--paper)] leading-relaxed font-medium pl-3 border-l-2 border-[var(--gold)]">
                          &ldquo;{clause.whatToAsk}&rdquo;
                        </p>
                        <div className="text-[11px] font-mono text-[var(--paper-muted)] tracking-wider pt-1">
                          Polite, professional wording designed to protect your leverage without hostility.
                        </div>
                      </div>
                    </div>
                  </div>
                )))}
              </div>

              {/* Next Step Jumper */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => scrollToSection("things-right")}
                  className="btn btn-md btn-secondary"
                >
                  <span>Next: Inspect Protections (Step 2)</span>
                  <ChevronRight className="h-4 w-4 text-[var(--signal-safe)]" />
                </button>
              </div>
            </section>

            {/* Chapter Break Rule */}
            <div className="chapter-rule mx-auto max-w-6xl" />

            {/* ========================================================================= */}
            {/* CHAPTER III: THINGS THAT ARE RIGHT (YOUR PROTECTIONS)                     */}
            {/* ========================================================================= */}
            <section id="things-right" className="scroll-mt-36 space-y-8">
              <div className="space-y-3">
                <div className="chapter-marker">Chapter III &mdash; Things That Are Right</div>
                <h2 className="headline-editorial text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal text-[var(--paper)]">
                  Guaranteed protections &amp;{" "}
                  <span className="italic text-[var(--signal-safe)]">
                    market-standard terms.
                  </span>
                </h2>
                <p className="text-base text-[var(--paper-dim)] font-normal max-w-2xl">
                  These terms meet or exceed market standards. Your compensation, mutual confidentiality, and statutory rights are respected here. Do not waste negotiation leverage on them.
                </p>
              </div>

              <div className="space-y-5">
                {rightClauses.length === 0 ? (
                  <div className="product-card rounded-xl p-8 border border-[var(--border-subtle)] text-center space-y-3">
                    <p className="text-sm text-[var(--paper-dim)] max-w-lg mx-auto leading-relaxed">
                      {currentAnalysis.documentCategory === "OTHER"
                        ? "No standard bilateral contractual protections to report (informational/non-agreement document)."
                        : "No specific market-standard clauses were isolated."}
                    </p>
                  </div>
                ) : (
                  rightClauses.map((clause: ClauseBreakdown) => (
                    <div
                      key={clause.id}
                      className="product-card rounded-xl p-6 sm:p-7 border border-[var(--border-subtle)] space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="status-dot status-dot-safe" />
                          <span className="label-mono text-xs font-bold text-[var(--signal-safe)] tracking-wider">
                            STANDARD &amp; PROTECTED TERM
                          </span>
                        </div>
                        <span className="font-mono text-xs text-[var(--paper-muted)]">
                          {clause.sectionRef} &bull; {clause.category}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-[var(--paper)] font-sans">
                        {clause.title}
                      </h3>

                      <p className="text-[14px] text-[var(--paper-dim)] leading-relaxed font-normal">
                        {clause.whatItMeans}
                      </p>

                      <div className="rounded-lg p-4 border-l-4 border-l-[var(--signal-safe)] bg-[var(--signal-safe-bg)] border border-[var(--border-subtle)]">
                        <div className="label-mono text-[11px] font-bold text-[var(--signal-safe)] mb-1">
                          RECOMMENDED ACTION
                        </div>
                        <p className="text-xs text-[var(--paper)] font-mono">
                          {clause.whatToAsk}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Next Step Jumper */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => scrollToSection("surrendered-rights")}
                  className="btn btn-md btn-secondary"
                >
                  <span>Next: Surrendered Rights (Step 3)</span>
                  <ChevronRight className="h-4 w-4 text-[var(--gold)]" />
                </button>
              </div>
            </section>

            {/* Chapter Break Rule */}
            <div className="chapter-rule mx-auto max-w-6xl" />

            {/* ========================================================================= */}
            {/* CHAPTER IV: RIGHTS YOU SURRENDER                                          */}
            {/* ========================================================================= */}
            <section id="surrendered-rights" className="scroll-mt-36 space-y-8">
              <div className="space-y-3">
                <div className="chapter-marker">Chapter IV &mdash; Rights You Surrender</div>
                <h2 className="headline-editorial text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal text-[var(--paper)]">
                  Rights and leverage{" "}
                  <span className="italic text-[var(--gold)]">
                    ceded upon signature.
                  </span>
                </h2>
                <p className="text-base text-[var(--paper-dim)] font-normal max-w-2xl">
                  Signing an agreement always involves trading flexibility for remuneration. Here is the unvarnished checklist of leverage you surrender under this draft.
                </p>
              </div>

              <div className="product-card rounded-xl p-6 sm:p-8 space-y-4 border border-[var(--border-subtle)]">
                <div className="space-y-4">
                  {currentAnalysis.whatYouAreGivingUp.map((item: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-baseline gap-4 text-[15px] text-[var(--paper-dim)] font-normal leading-relaxed border-b border-[var(--border-subtle)] pb-4 last:border-0 last:pb-0"
                    >
                      <span className="font-mono text-xs font-semibold text-[var(--gold)] tabular-nums shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step Jumper */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => scrollToSection("obligations-finances")}
                  className="btn btn-md btn-secondary"
                >
                  <span>Next: Obligations Ledger (Step 4)</span>
                  <ChevronRight className="h-4 w-4 text-[var(--gold)]" />
                </button>
              </div>
            </section>

            {/* Chapter Break Rule */}
            <div className="chapter-rule mx-auto max-w-6xl" />

            {/* ========================================================================= */}
            {/* CHAPTER V: OBLIGATIONS & FINANCIAL LEDGER                                  */}
            {/* ========================================================================= */}
            <section id="obligations-finances" className="scroll-mt-36 space-y-8">
              <div className="space-y-3">
                <div className="chapter-marker">Chapter V &mdash; The Obligations Ledger</div>
                <h2 className="headline-editorial text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal text-[var(--paper)]">
                  Who must do what, and the{" "}
                  <span className="italic text-[var(--gold)]">
                    financial terms.
                  </span>
                </h2>
                <p className="text-base text-[var(--paper-dim)] font-normal max-w-2xl">
                  A side-by-side audit of your mandatory commitments against the counterparty&apos;s duties, followed by guaranteed base money versus conditional clawbacks.
                </p>
              </div>

              {/* Obligations Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Your Duties */}
                <div className="product-card rounded-xl p-6 border border-[var(--border-subtle)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <span className="label-mono text-xs font-bold text-[var(--paper)]">
                      YOUR COMMITMENTS
                    </span>
                    <span className="label-mono text-xs text-[var(--signal-caution)]">
                      {currentAnalysis.obligations?.userMust?.length || 0} ITEMS
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {currentAnalysis.obligations?.userMust?.map((o) => (
                      <div
                        key={o.id}
                        className="document-recess rounded-lg p-3.5 border border-[var(--border-subtle)] text-xs flex items-start justify-between gap-3"
                      >
                        <span className="text-[var(--paper)] leading-relaxed">{o.action}</span>
                        {o.timeline && (
                          <span className="label-mono text-[10px] text-[var(--gold)] bg-[var(--gold-ghost)] px-2 py-0.5 rounded border border-[var(--gold-dim)] whitespace-nowrap">
                            {o.timeline}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Counterparty Duties */}
                <div className="product-card rounded-xl p-6 border border-[var(--border-subtle)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <span className="label-mono text-xs font-bold text-[var(--paper)]">
                      COUNTERPARTY DUTIES
                    </span>
                    <span className="label-mono text-xs text-[var(--signal-safe)]">
                      {currentAnalysis.obligations?.counterpartyMust?.length || 0} ITEMS
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {currentAnalysis.obligations?.counterpartyMust?.map((o) => (
                      <div
                        key={o.id}
                        className="document-recess rounded-lg p-3.5 border border-[var(--border-subtle)] text-xs flex items-start justify-between gap-3"
                      >
                        <span className="text-[var(--paper)] leading-relaxed">{o.action}</span>
                        {o.timeline && (
                          <span className="label-mono text-[10px] text-[var(--signal-safe)] bg-[var(--signal-safe-bg)] px-2 py-0.5 rounded border border-[var(--signal-safe-border)] whitespace-nowrap">
                            {o.timeline}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Financial Schedule */}
              <div className="product-card rounded-xl p-6 sm:p-8 border border-[var(--border-subtle)] space-y-5">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <span className="label-mono text-xs font-bold text-[var(--paper)]">
                    FINANCIAL SCHEDULE &amp; PENALTIES
                  </span>
                  <span className="label-mono text-xs text-[var(--gold)]">
                    FIXED VS. CONDITIONAL ALLOCATIONS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentAnalysis.financialTerms?.map((f) => (
                    <div
                      key={f.id}
                      className="document-recess rounded-lg p-4 border border-[var(--border-subtle)] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`label-mono text-[9px] font-bold px-2 py-0.5 rounded ${
                            f.category === "PENALTY"
                              ? "text-[var(--signal-danger)] bg-[var(--signal-danger-bg)] border border-[var(--signal-danger-border)]"
                              : f.category === "FIXED"
                              ? "text-[var(--signal-safe)] bg-[var(--signal-safe-bg)] border border-[var(--signal-safe-border)]"
                              : "text-[var(--signal-caution)] bg-[var(--signal-caution-bg)] border border-[var(--signal-caution-border)]"
                          }`}
                        >
                          {f.category}
                        </span>
                        {f.isConditional && (
                          <span className="label-mono text-[9px] text-[var(--signal-caution)]">
                            CONDITIONAL
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-[var(--paper)]">
                        {f.label}
                      </div>
                      <div className="headline-editorial text-xl text-[var(--gold)]">
                        {f.amount}
                      </div>
                      {f.conditionNote && (
                        <p className="text-[11px] text-[var(--paper-muted)] pt-1 border-t border-white/[0.06] leading-relaxed">
                          {f.conditionNote}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step Jumper */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => scrollToSection("negotiation-playbook")}
                  className="btn btn-md btn-secondary"
                >
                  <span>Next: Counter-Offer Playbook (Step 5)</span>
                  <ChevronRight className="h-4 w-4 text-[var(--gold)]" />
                </button>
              </div>
            </section>

            {/* Chapter Break Rule */}
            <div className="chapter-rule mx-auto max-w-6xl" />

            {/* ========================================================================= */}
            {/* CHAPTER VI: NEGOTIATION PLAYBOOK & EMAIL DRAFTS                           */}
            {/* ========================================================================= */}
            <section id="negotiation-playbook" className="scroll-mt-36 space-y-8">
              <div className="space-y-3">
                <div className="chapter-marker">Chapter VI &mdash; Ready-to-Send Counter-Offers</div>
                <h2 className="headline-editorial text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal text-[var(--paper)]">
                  The negotiation{" "}
                  <span className="italic text-[var(--gold)]">
                    playbook.
                  </span>
                </h2>
                <p className="text-base text-[var(--paper-dim)] font-normal max-w-2xl">
                  Do not sign under duress or ambiguity. Send these polite, calibrated counter-proposals to HR or counterparty counsel to resolve the red flags.
                </p>
              </div>

              {currentAnalysis.questionsBeforeSigning?.length > 0 && (
                <div className="product-card rounded-xl border border-[var(--border-subtle)] overflow-hidden">
                  {/* Email Drafts Window Header */}
                  <div className="flex items-center justify-between px-6 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--ink-surface)]">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[var(--gold)]" />
                      <span className="label-mono text-xs font-bold text-[var(--paper)] tracking-wider">
                        COUNTER-PROPOSAL DISPATCH
                      </span>
                    </div>
                    <span className="label-mono text-xs text-[var(--paper-muted)]">
                      READY TO SEND
                    </span>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-[var(--border-subtle)] bg-[var(--ink-raised)] px-6 overflow-x-auto">
                    {currentAnalysis.questionsBeforeSigning.map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => setActiveEmailTab(idx)}
                        className={`py-3 px-4 label-mono text-xs border-b-2 font-semibold transition-all whitespace-nowrap ${
                          activeEmailTab === idx
                            ? "text-[var(--paper)] border-[var(--gold)]"
                            : "text-[var(--paper-muted)] border-transparent hover:text-[var(--gold)]"
                        }`}
                      >
                        Counter-Offer #{idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Body */}
                  {currentAnalysis.questionsBeforeSigning[activeEmailTab] && (
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="document-recess rounded-lg p-5 border border-[var(--border-subtle)] space-y-1.5">
                        <div className="label-mono text-xs text-[var(--gold)]">
                          PRIMARY OBJECTIVE
                        </div>
                        <div className="text-base font-medium text-[var(--paper)]">
                          {currentAnalysis.questionsBeforeSigning[activeEmailTab].question}
                        </div>
                        <p className="text-xs text-[var(--paper-muted)]">
                          Why: {currentAnalysis.questionsBeforeSigning[activeEmailTab].whyAsk}
                        </p>
                      </div>

                      {/* Ready to send copyable email block */}
                      <div className="document-recess rounded-lg p-6 border border-[var(--border-subtle)] space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                          <span className="label-mono text-xs text-[var(--paper-muted)]">
                            READY-TO-SEND EMAIL COPY
                          </span>
                          <button
                            onClick={() =>
                              handleCopyEmail(
                                currentAnalysis.questionsBeforeSigning[activeEmailTab].emailSnippet
                              )
                            }
                            className="btn btn-sm btn-primary"
                          >
                            {copiedEmail ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-[var(--signal-safe)]" />
                                <span>Copied to Clipboard!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy Email Draft</span>
                              </>
                            )}
                          </button>
                        </div>

                        <pre className="text-[14px] font-sans text-[var(--paper)] whitespace-pre-wrap leading-relaxed">
                          {currentAnalysis.questionsBeforeSigning[activeEmailTab].emailSnippet}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Chapter Break Rule */}
            <div className="chapter-rule mx-auto max-w-6xl" />

            {/* Chapter VII: Grounded Document Inquiry */}
            {renderChatSection(false)}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* PRINT-ONLY EXECUTIVE LEGAL REPORT (Rendered solely during PDF Export)  */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {currentAnalysis && !isNonContract && (
          <div className="print-only w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white text-slate-900 font-sans space-y-8">
            {/* Masthead */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-baseline justify-between">
              <div>
                <span className="font-serif italic text-3xl font-bold text-slate-900">Signwise</span>
                <span className="ml-3 text-xs font-mono font-bold uppercase tracking-widest text-amber-700">
                  CONFIDENTIAL EXECUTIVE LEGAL REPORT
                </span>
              </div>
              <div className="text-right text-xs font-mono text-slate-500">
                <div>Audited: {new Date().toLocaleDateString()}</div>
                <div>Source: {currentAnalysis.fileName}</div>
              </div>
            </div>

            {/* Document Title & Asymmetry Executive Summary */}
            <div className="border border-slate-300 rounded-lg p-6 bg-slate-50 space-y-4 break-inside-avoid">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase font-bold text-amber-800">
                    {currentAnalysis.documentCategory.replace("_", " ")}
                  </span>
                  <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
                    {currentAnalysis.documentTitle}
                  </h1>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold text-slate-900">{fairnessScore}/100</div>
                  <div className="text-[10px] font-mono uppercase text-slate-600 font-semibold">{asymmetry.label}</div>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {currentAnalysis.headlineSummary}
              </p>

              {/* 3 Anchors in Print */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 border-l-4 border-emerald-600 bg-emerald-50 text-xs rounded">
                  <div className="font-bold text-emerald-800 mb-1">THE BIG PROTECTION</div>
                  <p className="text-slate-700">{rightClauses[0]?.whatItMeans || "Protected base compensation."}</p>
                </div>
                <div className="p-3 border-l-4 border-red-600 bg-red-50 text-xs rounded">
                  <div className="font-bold text-red-800 mb-1">THE MAJOR TRAP</div>
                  <p className="text-slate-700">{wrongClauses[0]?.whatItMeans || "Restrictive non-market covenants."}</p>
                </div>
                <div className="p-3 border-l-4 border-amber-600 bg-amber-50 text-xs rounded">
                  <div className="font-bold text-amber-800 mb-1">THE CATCH / CLARIFICATION</div>
                  <p className="text-slate-700">{reviewClauses[0]?.whatItMeans || "Ambiguous bonus/probation timeline."}</p>
                </div>
              </div>

              {/* Vitals Summary Row */}
              <div className="grid grid-cols-4 gap-3 pt-2 border-t border-slate-200 text-center text-xs">
                <div>
                  <div className="text-red-700 font-bold font-mono text-lg">{wrongClauses.length}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Red Flags</div>
                </div>
                <div>
                  <div className="text-emerald-700 font-bold font-mono text-lg">{rightClauses.length}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Standard Clauses</div>
                </div>
                <div>
                  <div className="text-amber-700 font-bold font-mono text-lg">{reviewClauses.length}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Clarifications</div>
                </div>
                <div>
                  <div className="text-amber-800 font-bold font-mono text-lg">{currentAnalysis.whatYouAreGivingUp?.length || 0}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Rights Ceded</div>
                </div>
              </div>
            </div>

            {/* Chapter I: Things That Are Wrong (Traps & Red Flags) */}
            {wrongClauses.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-red-800 border-b-2 border-red-300 pb-1">
                  Chapter I &mdash; Critical Pushback Items &amp; Non-Market Traps ({wrongClauses.length})
                </div>
                {wrongClauses.map((clause, i) => (
                  <div key={clause.id} className="border border-red-200 rounded-lg p-5 bg-white space-y-3 break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <div className="font-bold text-base text-red-900 font-serif">
                        Trap #{i + 1}: {clause.title}
                      </div>
                      <div className="text-xs font-mono text-slate-500">{clause.sectionRef} &bull; {clause.category}</div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 italic rounded">
                      &ldquo;{clause.originalSnippet}&rdquo;
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-red-50/60 border border-red-100 rounded">
                        <div className="font-bold text-red-800 mb-1">What It Dictates (Plain English):</div>
                        <p className="text-slate-700">{clause.whatItSays}</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                        <div className="font-bold text-slate-800 mb-1">Why This Hurts You (Consequence):</div>
                        <p className="text-slate-700">{clause.whatItMeans}</p>
                      </div>
                    </div>
                    {clause.whyItMatters && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                        <strong className="text-slate-800">Strategic Impact:</strong> {clause.whyItMatters}
                      </div>
                    )}
                    <div className="p-3 border border-amber-300 bg-amber-50/50 rounded text-xs">
                      <div className="font-bold text-amber-900 mb-1">Recommended Counter-Proposal / Pushback:</div>
                      <p className="font-serif italic text-slate-800">&ldquo;{clause.whatToAsk}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chapter II: Ambiguities & Clarification Items (Medium Severity) */}
            {reviewClauses.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 border-b-2 border-amber-300 pb-1">
                  Chapter II &mdash; Ambiguities &amp; Clarification Items ({reviewClauses.length})
                </div>
                {reviewClauses.map((clause, i) => (
                  <div key={clause.id} className="border border-amber-200 rounded-lg p-4 bg-white space-y-2.5 break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <div className="font-bold text-sm text-amber-900 font-serif">
                        Clarification #{i + 1}: {clause.title}
                      </div>
                      <div className="text-xs font-mono text-slate-500">{clause.sectionRef} &bull; {clause.category}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 italic rounded">
                      &ldquo;{clause.originalSnippet}&rdquo;
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">Plain English Breakdown:</span>
                        <p className="text-slate-600 mt-0.5">{clause.whatItSays}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">Potential Ambiguity / Catch:</span>
                        <p className="text-slate-600 mt-0.5">{clause.whatItMeans}</p>
                      </div>
                    </div>
                    <div className="p-2.5 bg-amber-50/50 border border-amber-200 rounded text-xs">
                      <span className="font-bold text-amber-900">Recommended Clarification Request:</span>
                      <p className="italic text-slate-700 mt-0.5">&ldquo;{clause.whatToAsk}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chapter III: Things That Are Right (Standard Protections) */}
            {rightClauses.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 border-b-2 border-emerald-300 pb-1">
                  Chapter III &mdash; Standard Market Protections &amp; Fair Terms ({rightClauses.length})
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {rightClauses.map((clause) => (
                    <div key={clause.id} className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/30 text-xs space-y-1.5 break-inside-avoid">
                      <div className="font-bold text-emerald-900">{clause.title} ({clause.sectionRef})</div>
                      <p className="text-slate-700">{clause.whatItMeans}</p>
                      <div className="font-mono text-[11px] text-emerald-800 font-semibold mt-1">Verdict: {clause.whatToAsk}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chapter IV: Rights Surrendered */}
            {currentAnalysis.whatYouAreGivingUp?.length > 0 && (
              <div className="space-y-3 break-inside-avoid">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-300 pb-1">
                  Chapter IV &mdash; Rights &amp; Leverage Ceded Upon Signature ({currentAnalysis.whatYouAreGivingUp.length})
                </div>
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
                  {currentAnalysis.whatYouAreGivingUp.map((item, idx) => (
                    <div key={idx} className="flex items-baseline gap-3 text-xs text-slate-800">
                      <span className="font-mono font-bold text-amber-800">{String(idx + 1).padStart(2, "0")}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chapter V: Obligations & Finances */}
            <div className="grid grid-cols-2 gap-4 break-inside-avoid">
              <div className="border border-slate-200 rounded-lg p-4 bg-white text-xs space-y-2">
                <div className="font-bold font-mono uppercase text-slate-900 border-b border-slate-200 pb-1">Your Mandatory Commitments</div>
                {currentAnalysis.obligations?.userMust?.map((o) => (
                  <div key={o.id} className="text-slate-700 flex justify-between py-1 border-b border-slate-100 last:border-0">
                    <span>{o.action}</span>
                    {o.timeline && <span className="font-mono text-amber-800 font-semibold">{o.timeline}</span>}
                  </div>
                ))}
              </div>
              <div className="border border-slate-200 rounded-lg p-4 bg-white text-xs space-y-2">
                <div className="font-bold font-mono uppercase text-slate-900 border-b border-slate-200 pb-1">Counterparty Mandatory Duties</div>
                {currentAnalysis.obligations?.counterpartyMust?.map((o) => (
                  <div key={o.id} className="text-slate-700 flex justify-between py-1 border-b border-slate-100 last:border-0">
                    <span>{o.action}</span>
                    {o.timeline && <span className="font-mono text-emerald-800 font-semibold">{o.timeline}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter VI: Financial Terms */}
            {currentAnalysis.financialTerms?.length > 0 && (
              <div className="border border-slate-200 rounded-lg p-4 bg-white text-xs space-y-3 break-inside-avoid">
                <div className="font-bold font-mono uppercase text-slate-900 border-b border-slate-200 pb-1">Financial Schedule &amp; Penalties</div>
                <div className="grid grid-cols-4 gap-3">
                  {currentAnalysis.financialTerms.map((f) => (
                    <div key={f.id} className="p-2.5 border border-slate-200 rounded bg-slate-50 space-y-1">
                      <div className="text-[10px] font-mono uppercase font-bold text-slate-500">{f.label}</div>
                      <div className="font-mono font-bold text-sm text-slate-900">{f.amount}</div>
                      {f.conditionNote && <p className="text-[10px] text-slate-600">{f.conditionNote}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chapter VII: Negotiation Drafts */}
            {currentAnalysis.questionsBeforeSigning?.length > 0 && (
              <div className="space-y-4 break-inside-avoid">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-300 pb-1">
                  Chapter VII &mdash; Ready-to-Send Negotiation Counter-Offers ({currentAnalysis.questionsBeforeSigning.length})
                </div>
                {currentAnalysis.questionsBeforeSigning.map((q, idx) => (
                  <div key={q.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-xs space-y-2">
                    <div className="font-bold text-slate-900">Counter-Offer #{idx + 1}: {q.question}</div>
                    {q.whyAsk && (
                      <div className="text-slate-600 text-[11px]"><strong className="text-slate-800">Strategy:</strong> {q.whyAsk}</div>
                    )}
                    <pre className="p-3 bg-white border border-slate-200 rounded font-sans text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {q.emailSnippet}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* Audit Legal Verification Seal & Notice */}
            <div className="border-t-2 border-slate-300 pt-4 text-[10px] font-mono text-slate-500 flex justify-between items-center break-inside-avoid">
              <div>
                <strong>SIGNWISE EPHEMERAL AUDIT</strong> &bull; Zero document retention &bull; Generated for counterparty evaluation
              </div>
              <div>Audit ID: {currentAnalysis.id} &bull; Status: VERIFIED</div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Editorial */}
      <footer className="border-t border-white/[0.08] py-10 text-center text-xs font-mono text-[var(--paper-muted)]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-base text-[var(--paper)]">Signwise</span>
            <span>&mdash; Know what you agree to before the ink dries</span>
          </div>
          <div className="text-[var(--paper-faint)] text-[11px]">
            In-Memory Ephemeral Auditing &bull; Zero Log Retention
          </div>
        </div>
      </footer>
    </div>
  );
}
