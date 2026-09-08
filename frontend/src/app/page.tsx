"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { AgreementAudit } from "@/components/agreement-audit";
import { ThreeQuestions } from "@/components/three-questions";
import { TestimonialsSection } from "@/components/testimonials";
import { TrustVault } from "@/components/trust-vault";
import { FooterEditorial } from "@/components/footer-editorial";
import { analyzeContractFile } from "@/lib/api";
import { ContractAnalysis } from "@/types/contract";

export default function HomePage() {
  const [customAnalysis, setCustomAnalysis] = useState<ContractAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const scrollToAudit = () => {
    const el = document.getElementById("dossier-preview");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    // Smoothly scroll to the audit section to show the analysis progress
    scrollToAudit();

    try {
      const result = await analyzeContractFile(file);
      setCustomAnalysis(result);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to analyze document.";
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onUploadClick={scrollToAudit} />

        <main className="flex-1">
          {/* I. The Opening Statement */}
          <HeroSlideshow
            onUploadClick={scrollToAudit}
            onFileSelected={handleFileUpload}
            isAnalyzing={isAnalyzing}
          />

          {/* Chapter break */}
          <div className="chapter-rule mx-auto max-w-5xl" />

          {/* II. The Three Questions */}
          <ThreeQuestions />

          {/* Chapter break */}
          <div className="chapter-rule mx-auto max-w-5xl" />

          {/* III. The Dossier */}
          <AgreementAudit
            customAnalysis={customAnalysis}
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
            onFileSelect={handleFileUpload}
            onResetCustom={() => setCustomAnalysis(null)}
          />

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

