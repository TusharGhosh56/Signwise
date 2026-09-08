"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ContractAnalysis } from "@/types/contract";
import { analyzeContractFile } from "@/lib/api";
import { SAMPLE_CONTRACTS } from "@/lib/sample-data";

interface AnalysisContextType {
  currentAnalysis: ContractAnalysis | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  fileName: string | null;
  progressStage: string;
  theme: "dark" | "light";
  toggleTheme: () => void;
  analyzeFile: (file: File) => Promise<ContractAnalysis>;
  loadPreset: (presetKey: string) => void;
  setAnalysis: (analysis: ContractAnalysis) => void;
  clearAnalysis: () => void;
}

const STORAGE_KEY = "signwise_active_analysis";
const THEME_KEY = "signwise_theme";

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [currentAnalysis, setCurrentAnalysis] = useState<ContractAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState<string>("");
  const [theme, setTheme] = useState<"dark" | "light">("light");

  // Hydrate theme & cached analysis
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY) as "dark" | "light" | null;
      const initialTheme = savedTheme === "dark" ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.classList.toggle("light", initialTheme === "light");
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
    } catch (e) {
      console.warn("Failed to load theme preference:", e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, nextTheme);
        document.documentElement.classList.toggle("light", nextTheme === "light");
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
      } catch (e) {
        console.warn("Failed to save theme:", e);
      }
      return nextTheme;
    });
  }, []);

  // Hydrate from sessionStorage if available
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCurrentAnalysis(parsed);
        setFileName(parsed.fileName || null);
      }
    } catch (e) {
      console.warn("Failed to load cached analysis:", e);
    }
  }, []);

  const setAnalysis = useCallback((analysis: ContractAnalysis) => {
    setCurrentAnalysis(analysis);
    setFileName(analysis.fileName || null);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(analysis));
    } catch (e) {
      console.warn("Failed to save analysis to sessionStorage:", e);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setFileName(null);
    setAnalysisError(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear analysis from sessionStorage:", e);
    }
  }, []);

  const loadPreset = useCallback(
    (presetKey: string) => {
      const preset = SAMPLE_CONTRACTS[presetKey] || SAMPLE_CONTRACTS.employment;
      setAnalysis(preset);
    },
    [setAnalysis]
  );

  const analyzeFile = useCallback(
    async (file: File): Promise<ContractAnalysis> => {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setFileName(file.name);
      setProgressStage("Reading and parsing document format...");

      // Staged progress indicators for great UX
      const timer1 = setTimeout(() => {
        setProgressStage("Auditing clauses, liabilities, and obligations...");
      }, 1500);

      const timer2 = setTimeout(() => {
        setProgressStage("Scoring asymmetric risk and extracting negotiation levers...");
      }, 3500);

      try {
        const result = await analyzeContractFile(file);
        setAnalysis(result);
        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to analyze document.";
        setAnalysisError(msg);
        throw err;
      } finally {
        clearTimeout(timer1);
        clearTimeout(timer2);
        setIsAnalyzing(false);
        setProgressStage("");
      }
    },
    [setAnalysis]
  );

  return (
    <AnalysisContext.Provider
      value={{
        currentAnalysis,
        isAnalyzing,
        analysisError,
        fileName,
        progressStage,
        theme,
        toggleTheme,
        analyzeFile,
        loadPreset,
        setAnalysis,
        clearAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
