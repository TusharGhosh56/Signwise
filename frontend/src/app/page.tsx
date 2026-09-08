"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { AgreementAudit } from "@/components/agreement-audit";
import { ThreeQuestions } from "@/components/three-questions";
import { TestimonialsSection } from "@/components/testimonials";
import { TrustVault } from "@/components/trust-vault";
import { FooterEditorial } from "@/components/footer-editorial";
import { useAnalysis } from "@/context/analysis-context";

export default function HomePage() {
  const router = useRouter();
  const { analyzeFile, isAnalyzing, currentAnalysis, analysisError } = useAnalysis();

  const handleFileUpload = async (file: File) => {
    // Navigate immediately to dedicated analysis page to show analysis progress
    router.push("/analysis");
    try {
      await analyzeFile(file);
    } catch (err: unknown) {
      console.error("Upload error:", err);
    }
  };

  const handleReviewClick = () => {
    router.push("/analysis");
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onUploadClick={handleReviewClick} />

        <main className="flex-1">
          {/* I. The Opening Statement */}
          <HeroSlideshow
            onUploadClick={handleReviewClick}
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
            customAnalysis={currentAnalysis}
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
            onFileSelect={handleFileUpload}
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
