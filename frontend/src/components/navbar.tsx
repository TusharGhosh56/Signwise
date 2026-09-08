"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sun, Moon, Upload } from "lucide-react";
import { useAnalysis } from "@/context/analysis-context";

interface NavbarProps {
  onUploadClick?: () => void;
  onFileSelected?: (file: File) => void;
}

export function Navbar({ onUploadClick, onFileSelected }: NavbarProps) {
  const { theme, toggleTheme } = useAnalysis();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (onFileSelected && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (onUploadClick) {
      onUploadClick();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelected) {
      onFileSelected(file);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[var(--ink)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Masthead Wordmark */}
        <Link href="/" className="group flex items-baseline gap-1.5">
          <span className="font-serif italic text-xl text-[var(--paper)] tracking-wide font-normal group-hover:text-[var(--gold)] transition-colors duration-300">
            Signwise
          </span>
          <span className="text-[11px] font-mono text-[var(--paper-muted)] tracking-widest uppercase hidden sm:inline font-medium">
          </span>
        </Link>

        

        {/* Right Actions: Theme Toggle + Upload Document Action */}
        <div className="flex items-center gap-2.5">
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

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={handleButtonClick}
            className="btn btn-sm btn-primary"
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>
    </header>
  );
}
