"use client";

import React, { useState } from "react";
import { SAMPLE_CONTRACTS } from "@/lib/sample-data";
import { ContractAnalysis, ClauseBreakdown } from "@/types/contract";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Mail,
  FileText,
  Upload,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface AgreementAuditProps {
  customAnalysis?: ContractAnalysis | null;
  isAnalyzing?: boolean;
  analysisError?: string | null;
  onFileSelect?: (file: File) => void;
  onResetCustom?: () => void;
}

export function AgreementAudit({
  customAnalysis,
  isAnalyzing,
  analysisError,
  onFileSelect,
  onResetCustom,
}: AgreementAuditProps) {
  const [activePreset, setActivePreset] = useState<string>("employment");
  const [expandedId, setExpandedId] = useState<string>("c-1");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (customAnalysis) {
      setActivePreset("custom");
      setExpandedId(customAnalysis.clauses[0]?.id || "");
    }
  }, [customAnalysis]);

  const contract: ContractAnalysis =
    activePreset === "custom" && customAnalysis
      ? customAnalysis
      : SAMPLE_CONTRACTS[activePreset] || SAMPLE_CONTRACTS.employment;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFullEmail = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const getSeverityIndicator = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return {
          label: "High Risk",
          dotClass: "status-dot-danger",
          textClass: "text-[var(--signal-danger)]",
        };
      case "MEDIUM":
        return {
          label: "Review",
          dotClass: "status-dot-caution",
          textClass: "text-[var(--signal-caution)]",
        };
      default:
        return {
          label: "Standard",
          dotClass: "status-dot-safe",
          textClass: "text-[var(--signal-safe)]",
        };
    }
  };

  const tabs = [
    ...(customAnalysis
      ? [{ key: "custom", label: "Uploaded Audit" }]
      : []),
    { key: "employment", label: "Tech Offer" },
    { key: "rental", label: "Apartment Lease" },
    { key: "freelance", label: "Consulting SOW" },
  ];

  return (
    <section id="dossier-preview" className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <div className="reveal mb-14">
          <div className="chapter-marker mb-4">Live Audit Preview</div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h2 className="headline-editorial text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal">
                Clause-by-clause breakdown.{" "}
                <span className="italic text-[var(--gold)]">
                  Zero legalese.
                </span>
              </h2>
              <p className="mt-3 text-base text-[var(--paper-dim)] font-normal max-w-lg">
                Upload your own agreement or select a preset to see exactly how Signwise identifies
                non-market terms and generates counter-proposals.
              </p>
            </div>

            {/* Controls: Tab Switcher + Upload Action */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileInput}
              />

              <div className="flex items-center gap-4 sm:gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActivePreset(tab.key);
                      if (tab.key === "custom" && customAnalysis) {
                        setExpandedId(customAnalysis.clauses[0]?.id || "");
                      } else {
                        setExpandedId(
                          SAMPLE_CONTRACTS[tab.key]?.clauses[0]?.id || ""
                        );
                      }
                    }}
                    className={`text-xs sm:text-sm font-mono tracking-wider uppercase pb-2 border-b-2 font-medium transition-all duration-200 ${
                      activePreset === tab.key
                        ? "text-white border-[var(--gold)] font-bold"
                        : "text-[var(--paper-muted)] border-transparent hover:text-white"
                    }`}
                  >
                    {tab.key === "custom" && (
                      <Sparkles className="inline h-3 w-3 mr-1 text-[var(--gold)]" />
                    )}
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="btn-editorial text-xs py-1.5 px-3 flex items-center gap-1.5 font-mono"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload File</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {analysisError && (
          <div className="mb-6 p-4 rounded-lg border border-[var(--signal-danger-border)] bg-[var(--signal-danger-bg)] flex items-center gap-3 text-sm text-[var(--signal-danger)]">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Analysis Notice</p>
              <p className="text-xs text-[var(--paper-dim)] mt-0.5">{analysisError}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="py-24 rounded-lg border border-white/[0.08] bg-[var(--ink-surface)] flex flex-col items-center justify-center text-center px-6">
            <Loader2 className="h-8 w-8 text-[var(--gold)] animate-spin mb-4" />
            <h3 className="headline-editorial text-xl font-normal text-white">
              Parsing and auditing agreement...
            </h3>
            <p className="text-xs font-mono text-[var(--paper-muted)] mt-2 max-w-md">
              Extracting legal clauses, evaluating restrictive obligations, and drafting plain-English counter-proposals with Gemini AI.
            </p>
          </div>
        )}

        {/* Document Content */}
        {!isAnalyzing && (
          <>
            {/* Document Metadata Bar */}
        <div className="reveal flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-6 rounded-t-lg bg-[var(--ink-surface)] border border-white/[0.08] border-b-0">
          <div className="flex items-center gap-3.5">
            <FileText className="h-5 w-5 text-[var(--gold)] shrink-0" />
            <div>
              <span className="font-mono text-xs text-[var(--paper-muted)] tracking-wider uppercase font-semibold">
                {contract.fileName}
              </span>
              <h3 className="text-base font-semibold text-white mt-0.5">
                {contract.documentTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[var(--signal-danger)] tracking-wider uppercase font-bold bg-[var(--signal-danger-bg)] px-2.5 py-1 rounded border border-[var(--signal-danger-border)]">
              {contract.stats.redFlagCount} flags detected
            </span>
            <button
              onClick={() =>
                handleCopyFullEmail(
                  contract.questionsBeforeSigning[0]?.emailSnippet || ""
                )
              }
              className="btn-ghost text-xs"
            >
              {copiedEmail ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--signal-safe)]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Mail className="h-3.5 w-3.5" />
                  <span>Copy Email Draft</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Clause List */}
        <div className="reveal border border-white/[0.08] rounded-b-lg overflow-hidden">
          {contract.clauses.map((clause: ClauseBreakdown, idx: number) => {
            const isExpanded = expandedId === clause.id;
            const severity = getSeverityIndicator(clause.severity);
            const isLast = idx === contract.clauses.length - 1;

            return (
              <div
                key={clause.id}
                className={`transition-colors duration-150 ${
                  !isLast ? "border-b border-white/[0.06]" : ""
                }`}
              >
                {/* Clause Row */}
                <div
                  onClick={() =>
                    setExpandedId(isExpanded ? "" : clause.id)
                  }
                  className={`flex cursor-pointer items-center justify-between px-6 py-4.5 transition-colors duration-150 ${
                    isExpanded
                      ? "bg-[var(--ink-surface)]"
                      : "bg-[var(--ink-raised)] hover:bg-[var(--ink-surface)]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`status-dot shrink-0 ${severity.dotClass}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs text-[var(--paper-muted)] tracking-wider font-semibold">
                          {clause.sectionRef}
                        </span>
                        <span className={`font-mono text-xs tracking-wider uppercase font-bold ${severity.textClass}`}>
                          {severity.label}
                        </span>
                      </div>
                      <h4 className="text-base text-[var(--paper)] font-semibold mt-0.5 truncate">
                        {clause.title}
                      </h4>
                    </div>
                  </div>

                  <div className="ml-4 shrink-0 text-[var(--paper-dim)]">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="bg-[var(--ink)] border-t border-white/[0.06] px-6 py-6 space-y-6">
                    {/* Original Quote */}
                    <div className="document-recess rounded-lg p-5 border border-white/[0.08]">
                      <div className="label-mono mb-2 text-xs font-bold text-[var(--paper-muted)] relative z-10 flex items-center justify-between">
                        <span>ORIGINAL CONTRACT TEXT</span>
                        <span className="text-[11px] font-mono font-normal text-[var(--paper-faint)]">EXACT EXCERPT</span>
                      </div>
                      <p className="font-sans text-[14px] sm:text-[15px] text-[var(--paper)] leading-relaxed relative z-10 border-l-2 border-white/20 pl-3.5 my-1 font-normal">
                        &ldquo;{clause.originalSnippet}&rdquo;
                      </p>
                    </div>

                    {/* Two-column: Impact + Pushback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Impact */}
                      <div className="space-y-3 bg-[var(--ink-surface)] p-5 rounded-lg border border-white/[0.06]">
                        <div className="label-mono text-xs font-bold text-[var(--signal-danger)]">
                          Real-World Impact
                        </div>
                        <p className="text-[14px] text-[var(--paper-dim)] leading-relaxed font-normal">
                          {clause.whatItMeans}
                        </p>
                        <div className="border-t border-white/[0.06] pt-3">
                          <p className="text-[13px] text-[var(--paper-muted)] leading-relaxed font-normal">
                            <strong className="text-white font-semibold">
                              Why it matters:
                            </strong>{" "}
                            {clause.whyItMatters}
                          </p>
                        </div>
                      </div>

                      {/* Pushback */}
                      <div className="rounded-lg border border-[var(--gold-dim)] bg-[var(--gold-ghost)] p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="label-mono text-xs font-bold text-[var(--gold)]">
                            Counter-Proposal
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(clause.whatToAsk || "", clause.id)
                            }
                            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--gold)] hover:text-white transition-colors uppercase tracking-wider bg-[var(--gold-faint)] px-2.5 py-1 rounded"
                          >
                            {copiedId === clause.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-[var(--signal-safe)]" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="font-sans text-[14px] text-[var(--paper)] leading-relaxed font-medium pl-3 border-l-2 border-[var(--gold)]">
                          &ldquo;{clause.whatToAsk}&rdquo;
                        </p>
                        <div className="text-[11px] font-mono text-[var(--paper-muted)] tracking-wider pt-2 border-t border-white/[0.06]">
                          Polite, non-confrontational, industry standard wording.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rights Surrendered — stark typographic list */}
        <div className="reveal mt-14 max-w-3xl">
          <div className="label-mono text-xs font-bold text-[var(--signal-danger)] mb-5 tracking-wider uppercase">
            Rights You Surrender Under This Draft
          </div>
          <div className="space-y-3.5">
            {contract.whatYouAreGivingUp.map((item, idx) => (
              <div
                key={idx}
                className="flex items-baseline gap-4 text-[15px] text-[var(--paper-dim)] font-normal leading-relaxed"
              >
                <span className="font-mono text-xs font-semibold text-[var(--gold)] tabular-nums shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    )}
  </div>
</section>
);
}
