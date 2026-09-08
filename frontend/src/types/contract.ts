export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH";

export type DocumentCategory =
  | "EMPLOYMENT"
  | "RENTAL_HOUSING"
  | "FREELANCE_SERVICES"
  | "FINANCIAL_LOAN"
  | "NDA_CONFIDENTIALITY"
  | "CONSUMER_TERMS";

export interface ClauseBreakdown {
  id: string;
  title: string;
  category: string;
  sectionRef: string;
  pageNumber?: number;
  originalSnippet: string;
  whatItSays: string;
  whatItMeans: string;
  whyItMatters: string;
  whatToAsk: string;
  severity: RiskSeverity;
}

export interface ObligationItem {
  id: string;
  action: string;
  timeline?: string;
  mandatory: boolean;
}

export interface FinancialItem {
  id: string;
  label: string;
  amount: string;
  isConditional: boolean;
  conditionNote?: string;
  category: "FIXED" | "VARIABLE" | "DEPOSIT" | "PENALTY" | "OTHER";
}

export interface SuggestedQuestionItem {
  id: string;
  question: string;
  whyAsk: string;
  emailSnippet: string;
}

export interface ContractAnalysis {
  id: string;
  fileName: string;
  documentTitle: string;
  documentCategory: DocumentCategory;
  overallRisk: RiskSeverity;
  headlineSummary: string;
  stats: {
    totalClauses: number;
    reviewCount: number;
    redFlagCount: number;
  };
  whatYouAreGivingUp: string[];
  clauses: ClauseBreakdown[];
  obligations: {
    userMust: ObligationItem[];
    counterpartyMust: ObligationItem[];
  };
  financialTerms: FinancialItem[];
  questionsBeforeSigning: SuggestedQuestionItem[];
}
