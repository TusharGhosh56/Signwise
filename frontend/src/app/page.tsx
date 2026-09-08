"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { AgreementAudit } from "@/components/agreement-audit";
import { ThreeQuestions } from "@/components/three-questions";
import { TestimonialsSection } from "@/components/testimonials";
import { TrustVault } from "@/components/trust-vault";
import { FooterEditorial } from "@/components/footer-editorial";

export default function HomePage() {
  const scrollToAudit = () => {
    const el = document.getElementById("dossier-preview");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onUploadClick={scrollToAudit} />

        <main className="flex-1">
          {/* I. The Opening Statement */}
          <HeroSlideshow onUploadClick={scrollToAudit} />

          {/* Chapter break */}
          <div className="chapter-rule mx-auto max-w-5xl" />

          {/* II. The Three Questions */}
          <ThreeQuestions />

          {/* Chapter break */}
          <div className="chapter-rule mx-auto max-w-5xl" />

          {/* III. The Dossier */}
          <AgreementAudit />

          {/* Chapter break */}
          <div className="chapter-rule mx-auto max-w-5xl" />

          {/* IV. Voices of Relief / Case Studies */}
          <TestimonialsSection />

          {/* Chapter break */}
          <div className="chapter-rule mx-auto max-w-5xl" />

          {/* V. Trust & Privacy */}
          <TrustVault />
        </main>

        <FooterEditorial />
      </div>
    </div>
  );
}
