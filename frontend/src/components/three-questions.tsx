"use client";

import React from "react";

export function ThreeQuestions() {
  const questions = [
    {
      number: "01",
      question: "What am I actually agreeing to?",
      answer:
        "Contracts are drafted in archaic legal prose designed to discourage scrutiny. Signwise deconstructs every critical covenant into four clear realities: what it says, what it means for your daily life, why it matters, and what you should clarify before signing.",
    },
    {
      number: "02",
      question: "What am I giving up?",
      answer:
        "You don't think in abstract clauses — you care about freedom surrendered. We run a dedicated audit on restrictive covenants: whether the company claims your weekend side-projects, how long you are locked in after resigning, and what bonuses you forfeit upon leaving.",
    },
    {
      number: "03",
      question: "What do I ask before signing?",
      answer:
        "Identifying an aggressive clause is useless without leverage. Signwise produces tactfully phrased, zero-awkwardness emails ready to send directly to HR or your landlord — asking the exact questions that seasoned attorneys ask.",
    },
  ];

  return (
    <section id="core-questions" className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <div className="reveal mb-16 sm:mb-20">
          <div className="chapter-marker mb-4">The Signwise Method</div>
          <h2 className="headline-editorial text-[clamp(2rem,4vw,3.25rem)] max-w-3xl font-normal leading-tight">
            Not another document reader.{" "}
            <span className="italic text-[var(--gold)]">
              A decision engine for your biggest commitments.
            </span>
          </h2>
        </div>

        {/* Questions — editorial staggered layout */}
        <div className="space-y-0">
          {questions.map((q) => (
            <div
              key={q.number}
              className="reveal grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-12 sm:py-14 border-t border-white/[0.08] first:border-t-0 first:pt-0"
            >
              {/* Large question number */}
              <div className="md:col-span-2">
                <span className="font-mono text-[clamp(2.5rem,5vw,4.5rem)] font-semibold text-[var(--gold)]/40 leading-none tabular-nums">
                  {q.number}
                </span>
              </div>

              {/* Question as prominent statement */}
              <div className="md:col-span-5">
                <h3 className="font-serif text-[clamp(1.35rem,2.5vw,1.85rem)] text-[var(--paper)] leading-snug font-normal">
                  &ldquo;{q.question}&rdquo;
                </h3>
              </div>

              {/* Answer as body text */}
              <div className="md:col-span-5">
                <p className="font-sans text-[15px] sm:text-[16px] text-[var(--paper-dim)] leading-[1.8] font-normal">
                  {q.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
