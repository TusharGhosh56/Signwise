from typing import List, Optional, Literal
from pydantic import BaseModel, Field

# Types matching frontend/src/types/contract.ts
RiskSeverity = Literal["LOW", "MEDIUM", "HIGH"]

DocumentCategory = Literal[
    "EMPLOYMENT",
    "RENTAL_HOUSING",
    "FREELANCE_SERVICES",
    "FINANCIAL_LOAN",
    "NDA_CONFIDENTIALITY",
    "CONSUMER_TERMS",
]

FinancialCategory = Literal["FIXED", "VARIABLE", "DEPOSIT", "PENALTY", "OTHER"]


class ClauseBreakdown(BaseModel):
    id: str = Field(..., description="Unique ID for the clause, e.g. 'c-1'")
    title: str = Field(..., description="Short name of clause, e.g. '90-Day Resignation Lock-In'")
    category: str = Field(..., description="Category like 'Termination', 'IP Ownership', 'Liability'")
    sectionRef: str = Field(..., description="Section reference, e.g. 'Section 5.1'")
    pageNumber: Optional[int] = Field(None, description="Page number where clause appears")
    originalSnippet: str = Field(..., description="Excerpt of original legal text")
    whatItSays: str = Field(..., description="Clear one-sentence translation in plain English")
    whatItMeans: str = Field(..., description="Practical real-world consequence for the signer")
    whyItMatters: str = Field(..., description="Risk or leverage loss explaining why they should care")
    whatToAsk: str = Field(..., description="Direct, professional clarification question or counter-proposal")
    severity: RiskSeverity = Field(..., description="LOW, MEDIUM, or HIGH risk")


class ObligationItem(BaseModel):
    id: str = Field(..., description="Unique ID, e.g. 'o-1'")
    action: str = Field(..., description="Specific action required")
    timeline: Optional[str] = Field(None, description="Deadline, e.g. 'Within 30 days'")
    mandatory: bool = Field(True, description="Whether this obligation is mandatory")


class ObligationsGroup(BaseModel):
    userMust: List[ObligationItem] = Field(default_factory=list, description="Obligations required of the signer")
    counterpartyMust: List[ObligationItem] = Field(default_factory=list, description="Obligations required of employer/counterparty")


class FinancialItem(BaseModel):
    id: str = Field(..., description="Unique ID, e.g. 'f-1'")
    label: str = Field(..., description="e.g. 'Base Salary', 'Security Deposit', 'Penalty'")
    amount: str = Field(..., description="Monetary value or formula, e.g. '$140,000 / year'")
    isConditional: bool = Field(False, description="Whether this payment is conditional")
    conditionNote: Optional[str] = Field(None, description="Condition details if conditional")
    category: FinancialCategory = Field("FIXED", description="Category of payment")


class SuggestedQuestionItem(BaseModel):
    id: str = Field(..., description="Unique ID, e.g. 'q-1'")
    question: str = Field(..., description="Polite question to ask before signing")
    whyAsk: str = Field(..., description="Context on why this protects the signer")
    emailSnippet: str = Field(..., description="Ready-to-send email copy snippet to HR/counterparty")


class AnalysisStats(BaseModel):
    totalClauses: int = Field(0, description="Total clauses inspected")
    reviewCount: int = Field(0, description="Clauses flagged for review (Medium risk)")
    redFlagCount: int = Field(0, description="Red flag clauses (High risk)")


class ContractAnalysis(BaseModel):
    id: str = Field(..., description="Unique analysis ID, e.g. 'analysis-123'")
    fileName: str = Field(..., description="Original file or document name")
    documentTitle: str = Field(..., description="Title of agreement, e.g. 'Senior Engineering Offer Letter'")
    documentCategory: DocumentCategory = Field(..., description="Category of document")
    overallRisk: RiskSeverity = Field(..., description="Overall risk: LOW, MEDIUM, or HIGH")
    headlineSummary: str = Field(..., description="High-level plain English executive summary")
    stats: AnalysisStats = Field(..., description="Clause and risk counts")
    whatYouAreGivingUp: List[str] = Field(default_factory=list, description="Explicit bulleted list of rights ceded")
    clauses: List[ClauseBreakdown] = Field(default_factory=list, description="Detailed clause-by-clause audit")
    obligations: ObligationsGroup = Field(default_factory=ObligationsGroup, description="Mapped obligations")
    financialTerms: List[FinancialItem] = Field(default_factory=list, description="Financial terms, deposits, and compensation")
    questionsBeforeSigning: List[SuggestedQuestionItem] = Field(default_factory=list, description="Drafted negotiation questions and emails")


class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=20, description="Raw contract text to analyze")
    fileName: Optional[str] = Field("Pasted_Contract.txt", description="Optional file name")


class ChatQueryRequest(BaseModel):
    question: str = Field(..., min_length=3, description="User question about the contract")
    documentText: Optional[str] = Field(None, description="Original contract text")
    analysis: Optional[ContractAnalysis] = Field(None, description="Existing contract analysis object")


class ChatQueryResponse(BaseModel):
    answer: str = Field(..., description="Direct plain English answer with legal citations")
    referencedSectionRefs: List[str] = Field(default_factory=list, description="Referenced clause sections, e.g. ['Section 4.2']")
    suggestedAction: Optional[str] = Field(None, description="Actionable recommendation")
