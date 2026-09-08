import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const serifFont = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Signwise — Know What You Sign, Before The Ink Dries",
  description:
    "Plain-English contract intelligence and risk analysis. Understand what you are agreeing to, what you are giving up, and what to ask before signing.",
  icons: {
    icon: "/favicon.ico",
  },
};

import { AnalysisProvider } from "@/context/analysis-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${serifFont.variable} ${monoFont.variable} light h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Subtle grain texture for print-magazine feel */}
        <div className="noise-overlay" aria-hidden="true" />
        <AnalysisProvider>{children}</AnalysisProvider>
      </body>
    </html>
  );
}
