import asyncio
import json
import logging
import uuid
from typing import Optional
from fastapi import HTTPException
from app.core.config import settings
from app.schemas.contract import (
    ContractAnalysis,
    AnalysisStats,
    ChatQueryResponse,
)
from app.services.mock_data import get_mock_contract_analysis

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are Signwise, an expert legal contract translation and risk-auditing intelligence system.
Your core principle is: "Know what you're agreeing to before you sign."
You explain contracts like a trusted, razor-sharp human advisor—clear, grounded, calm, and practical.

CRITICAL INSTRUCTIONS:
1. ACCURATELY IDENTIFY DOCUMENT TYPE:
   - Determine whether the text is a binding legal contract/agreement (e.g. Employment Offer/Agreement, NDA, Residential/Commercial Lease, Consulting/Freelance Agreement, Loan Agreement, SaaS Terms of Service, Licensing Agreement, Partnership Agreement).
   - NON-CONTRACT / NON-AGREEMENT HANDLING:
     If the document is NOT a legal contract or agreement (such as a technical security scan report, vulnerability audit, invoice, receipt, resume, research paper, marketing brochure, or meeting notes):
     * Set documentCategory to "OTHER".
     * Set documentTitle accurately based on the document text (e.g. "Security Scan Report - Attack Surface Monitoring" or the actual report header).
     * Set overallRisk to "LOW".
     * In headlineSummary, explicitly state what the document is, for example:
       "This document is a technical security audit / scan report and does not constitute a legally binding agreement. It contains infrastructure and security posture findings, but no restrictive legal covenants, employment restrictions, or counterparty obligations were detected."
     * Do NOT hallucinate employment clauses, 90-day resignation notices, intellectual property transfers, or legal traps that do not exist in the text!
     * Set clauses to [] (an empty list) unless there are actual enforceable legal terms.
     * Set obligations to empty { "userMust": [], "counterpartyMust": [] }.
     * Set whatYouAreGivingUp to [] (an empty list).
     * Set financialTerms to [] (or extract actual invoice amounts if an invoice).
     * Set questionsBeforeSigning to [] (or 1-2 relevant technical follow-up questions).

2. FOR REAL LEGAL CONTRACTS & AGREEMENTS:
   - DO NOT use generic AI filler, alarmist red flags, or vague legal summaries.
   - Every clause breakdown MUST have 4 distinct components:
     * whatItSays: 1-sentence translation in crisp, plain English.
     * whatItMeans: The practical consequence for the signer's daily life or career.
     * whyItMatters: Why the signer should care (financial loss, mobility restriction, asymmetric risk).
     * whatToAsk: A direct, professional question or counter-proposal to ask HR / the counterparty.
   - Categorize document severity:
     * HIGH: Aggressive or non-market terms (e.g. 90+ day notice, all-encompassing 24/7 personal IP assignment, global non-compete, 100% cliff clawback, pre-payment copyright surrender).
     * MEDIUM: Terms worth reviewing or clarifying (unclear expense timelines, short inspection windows, standard probation conditions).
     * LOW: Standard market-norm symmetric provisions.
   - Extract all financial items (fixed salary/rent, variable bonuses/deposits, conditional penalties).
   - Extract explicit obligations for both the user (signer) and counterparty.
   - Provide an explicit list of "whatYouAreGivingUp" (rights, flexibility, leverage ceded).
   - Draft 2-3 polite, ready-to-send negotiation email snippets.
"""

QNA_SYSTEM_PROMPT = """
You are Signwise's legal contract Q&A assistant.
Answer the user's specific question about their agreement using plain English, grounded citations, and actionable advice.
Directly cite the relevant Section numbers or Clauses.
If the agreement does not contain information to answer the question, state that clearly and advise asking the counterparty in writing.
"""


class GeminiAnalyzerService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Initialized Google Gemini client with model %s", settings.GEMINI_MODEL)
            except Exception as e:
                logger.error("Failed to initialize Google GenAI SDK: %s", str(e))

    async def analyze_contract(
        self,
        contract_text: str,
        file_name: str = "Agreement.pdf"
    ) -> ContractAnalysis:
        """
        Runs comprehensive contract analysis using Gemini with structured output.
        Retries transient errors and fails transparently instead of returning fake data.
        """
        if not self.client:
            logger.warning("No valid GEMINI_API_KEY configured. Returning mock analysis for local offline demo.")
            return get_mock_contract_analysis(file_name=file_name, text_snippet=contract_text[:500])

        from google.genai import types

        prompt = f"""
Analyze the following document text in full detail according to the ContractAnalysis schema.

File Name: {file_name}

=== BEGIN DOCUMENT TEXT ===
{contract_text[:120000]}
=== END DOCUMENT TEXT ===
"""

        # Model candidates with primary model first
        models_to_try = [settings.GEMINI_MODEL]
        for fallback in ["gemini-flash-latest", "gemini-3.5-flash", "gemini-2.5-pro"]:
            if fallback not in models_to_try:
                models_to_try.append(fallback)

        last_error = None

        for model_name in models_to_try:
            for attempt in range(2):
                try:
                    logger.info("Calling Gemini with model '%s' (attempt %d/2)...", model_name, attempt + 1)
                    response = self.client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=SYSTEM_PROMPT,
                            response_mime_type="application/json",
                            response_schema=ContractAnalysis,
                            temperature=0.1,
                        ),
                    )

                    raw_json = response.text
                    data = json.loads(raw_json)

                    # Ensure ID is unique if missing
                    if not data.get("id"):
                        data["id"] = f"analysis-{uuid.uuid4().hex[:8]}"
                    data["fileName"] = file_name

                    # Calculate stats
                    clauses = data.get("clauses", [])
                    data["stats"] = {
                        "totalClauses": len(clauses),
                        "reviewCount": sum(1 for c in clauses if c.get("severity") == "MEDIUM"),
                        "redFlagCount": sum(1 for c in clauses if c.get("severity") == "HIGH"),
                    }

                    return ContractAnalysis.model_validate(data)

                except Exception as e:
                    last_error = e
                    err_str = str(e)
                    logger.warning("Gemini call with model %s failed on attempt %d: %s", model_name, attempt + 1, err_str)

                    # Check for transient server load
                    if any(code in err_str for code in ["503", "429", "UNAVAILABLE", "RESOURCE_EXHAUSTED", "high demand"]):
                        await asyncio.sleep(1.5 * (attempt + 1))
                        continue
                    else:
                        # Non-transient error for this model (e.g. 404), advance to next fallback model
                        break

        # If all attempts across all models failed, do NOT return mock data! Return a clear HTTP error.
        logger.error("All Gemini API attempts exhausted. Last error: %s", str(last_error))
        raise HTTPException(
            status_code=503,
            detail="The Gemini AI service is currently experiencing high demand. Please try uploading your document again in a few moments."
        )

    async def ask_question(
        self,
        question: str,
        contract_text: Optional[str] = None,
        analysis: Optional[ContractAnalysis] = None,
    ) -> ChatQueryResponse:
        """
        Answers a targeted question regarding the contract.
        """
        if not self.client:
            return ChatQueryResponse(
                answer="Signwise Analysis Mode: Based on Section 5.1 of your agreement, resignation requires written notice. To enable live Gemini AI answers, please configure GEMINI_API_KEY in backend/.env.",
                referencedSectionRefs=["Section 5.1"],
                suggestedAction="Request an amendment in writing before signing.",
            )

        try:
            from google.genai import types

            context_str = ""
            if analysis:
                context_str += f"Summary: {analysis.headlineSummary}\n"
                context_str += f"Key Risks: {', '.join([c.title + ' (' + c.sectionRef + ')' for c in analysis.clauses if c.severity == 'HIGH'])}\n"
            if contract_text:
                context_str += f"\nContract Excerpt:\n{contract_text[:60000]}"

            prompt = f"""
Context:
{context_str}

User Question:
{question}
"""

            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=QNA_SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=ChatQueryResponse,
                    temperature=0.2,
                ),
            )

            return ChatQueryResponse.model_validate_json(response.text)

        except Exception as e:
            logger.error("Gemini Q&A failed: %s", str(e))
            return ChatQueryResponse(
                answer=f"Could not complete query via Gemini API: {str(e)}",
                referencedSectionRefs=[],
                suggestedAction="Verify network and API key settings.",
            )


gemini_service = GeminiAnalyzerService()
