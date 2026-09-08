import json
import logging
import uuid
from typing import Optional
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

CRITICAL EDITORIAL GUIDELINES:
1. DO NOT use generic AI filler, alarmist red flags, or vague legal summaries.
2. Every clause breakdown MUST have 4 distinct components:
   - whatItSays: 1-sentence translation in crisp, plain English.
   - whatItMeans: The practical consequence for the signer's daily life or career.
   - whyItMatters: Why the signer should care (financial loss, mobility restriction, asymmetric risk).
   - whatToAsk: A direct, professional question or counter-proposal to ask HR / the counterparty.
3. Categorize document severity:
   - HIGH: Aggressive or non-market terms (e.g. 90+ day notice, all-encompassing 24/7 personal IP assignment, global non-compete, 100% cliff clawback, pre-payment copyright surrender).
   - MEDIUM: Terms worth reviewing or clarifying (unclear expense timelines, short inspection windows, standard probation conditions).
   - LOW: Standard market-norm symmetric provisions.
4. Extract all financial items (fixed salary/rent, variable bonuses/deposits, conditional penalties).
5. Extract explicit obligations for both the user (signer) and counterparty.
6. Provide an explicit list of "whatYouAreGivingUp" (rights, flexibility, leverage ceded).
7. Draft 2-3 polite, ready-to-send negotiation email snippets.
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
        Runs comprehensive contract analysis using Gemini 2.0 Flash with structured output.
        Falls back to deterministic mock analysis if no API key is available.
        """
        if not self.client:
            logger.warning("No valid GEMINI_API_KEY configured. Returning mock analysis for demonstration.")
            return get_mock_contract_analysis(file_name=file_name, text_snippet=contract_text[:500])

        try:
            from google.genai import types

            prompt = f"""
Analyze the following legal agreement text in full detail according to the ContractAnalysis schema.

File Name: {file_name}

=== BEGIN CONTRACT TEXT ===
{contract_text[:120000]}
=== END CONTRACT TEXT ===
"""

            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
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
            logger.error("Gemini API analysis failed: %s. Falling back to structured mock data.", str(e))
            return get_mock_contract_analysis(file_name=file_name, text_snippet=contract_text[:500])

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
