import uuid
from app.schemas.contract import (
    ContractAnalysis,
    AnalysisStats,
    ClauseBreakdown,
    ObligationItem,
    ObligationsGroup,
    FinancialItem,
    SuggestedQuestionItem,
)


def get_mock_contract_analysis(file_name: str = "Employment_Agreement.pdf", text_snippet: str = "") -> ContractAnalysis:
    """
    Returns a realistic mock ContractAnalysis when no GEMINI_API_KEY is configured.
    """
    analysis_id = f"analysis-{uuid.uuid4().hex[:8]}"

    # Heuristic detection for category
    lower_text = (file_name + " " + text_snippet).lower()
    if any(k in lower_text for k in ["lease", "rent", "tenant", "landlord", "apartment"]):
        category = "RENTAL_HOUSING"
        title = "Residential Lease Agreement"
        headline = "Standard lease with strict penalty provisions: 10% annual rent escalation, non-refundable cleaning fee, and 24h landlord entry."
        giving_up = [
            "Right to withhold rent for minor habitability repairs",
            "Automatic lease renewal price protection (10% compounding)",
            "Guest stays exceeding 14 consecutive calendar days",
            "Right to install external fixtures or smart locks without written consent",
        ]
        clauses = [
            ClauseBreakdown(
                id="c-1",
                title="10% Compounding Annual Rent Escalation",
                category="Financial",
                sectionRef="Section 11.2",
                pageNumber=3,
                originalSnippet="Upon expiration of the initial term, the monthly rent shall automatically increase by ten percent (10%) annually compounded.",
                whatItSays="Your rent automatically increases by 10% every single year without exception.",
                whatItMeans="If your starting rent is $2,500/mo, by Year 3 you will pay over $3,025/mo without renegotiation leverage.",
                whyItMatters="Most municipal markets cap increases between 3% to 5%. An automatic 10% clause is predatory.",
                whatToAsk="Could we tie annual increases to the regional Consumer Price Index (CPI) with a maximum cap of 4%?",
                severity="HIGH",
            ),
            ClauseBreakdown(
                id="c-2",
                title="24-Hour Landlord Right of Entry",
                category="Privacy & Quiet Enjoyment",
                sectionRef="Section 8.1",
                pageNumber=2,
                originalSnippet="Landlord or authorized agents may enter the leased premises at any time with twenty-four (24) hours electronic notice.",
                whatItSays="The landlord can enter with only 24 hours notice for any reason.",
                whatItMeans="Non-emergency inspections can be scheduled with short notice while you are at work or away.",
                whyItMatters="Can infringe on your privacy unless limited to legitimate repair or inspection reasons.",
                whatToAsk="Can we specify that routine inspections require 48 hours notice and occur strictly during standard business hours?",
                severity="MEDIUM",
            ),
        ]
        financial = [
            FinancialItem(id="f-1", label="Monthly Base Rent", amount="$2,650 / month", isConditional=False, category="FIXED"),
            FinancialItem(id="f-2", label="Security Deposit", amount="$5,300 (2 Months)", isConditional=True, conditionNote="Refundable within 21 days minus repair deductions", category="DEPOSIT"),
            FinancialItem(id="f-3", label="Late Payment Surcharge", amount="$150 after 3rd of month", isConditional=True, conditionNote="Applies after 5:00 PM on day 3", category="PENALTY"),
        ]
        questions = [
            SuggestedQuestionItem(
                id="q-1",
                question="Can we cap the annual rent increase to regional CPI (max 3.5%)?",
                whyAsk="Guarantees rent predictability and prevents forced relocation due to compounding escalations.",
                emailSnippet="Hi [Landlord/Property Manager],\n\nThank you for sharing the lease draft. Regarding Section 11.2 (Annual Escalation), would it be possible to benchmark annual adjustments to local CPI capped at 3.5% rather than a fixed 10%?\n\nBest regards,\n[Your Name]",
            )
        ]
    else:
        category = "EMPLOYMENT"
        title = "Executive Software Engineering Employment Agreement"
        headline = "Competitive offer letter containing two high-risk provisions: 90-day resignation notice period and an all-encompassing 24/7 personal IP assignment clause."
        giving_up = [
            "All software and inventions created during leisure hours on personal devices (§8.2)",
            "Standard 30-day resignation mobility (locked into 90 days)",
            "Right to work for competing cloud infrastructure firms for 12 months (§9.4)",
            "Bonus clawback is 100% cliff instead of monthly proration (§6.3)",
        ]
        clauses = [
            ClauseBreakdown(
                id="c-1",
                title="All-Encompassing Intellectual Property Assignment",
                category="IP & Copyright",
                sectionRef="Section 8.2",
                pageNumber=4,
                originalSnippet="Employee hereby assigns to Company all right, title and interest in and to all inventions, software, and works created during the period of employment, whether during business hours or leisure hours, and whether using Company equipment or personal devices.",
                whatItSays="The employer claims ownership of software you build on weekends, on your own laptop, on your own time.",
                whatItMeans="Your side-projects, open-source repositories, and independent apps become company property.",
                whyItMatters="Destroys your ability to maintain independent open source software or found a side business.",
                whatToAsk="Can we attach an Exhibit B listing my pre-existing personal projects and limit IP assignment strictly to company business line code built during working hours?",
                severity="HIGH",
            ),
            ClauseBreakdown(
                id="c-2",
                title="90-Day Resignation Notice Period",
                category="Termination",
                sectionRef="Section 5.1",
                pageNumber=3,
                originalSnippet="Employee may terminate employment at any time by providing not less than ninety (90) calendar days prior written notice to the Company.",
                whatItSays="You are legally obligated to work for 3 months after resigning.",
                whatItMeans="Future employers rarely wait 90 days for you to start, crippling your career mobility.",
                whyItMatters="Far exceeds the standard tech industry benchmark of 14 to 30 days.",
                whatToAsk="Could we align the notice period with standard 30-day market norms?",
                severity="HIGH",
            ),
            ClauseBreakdown(
                id="c-3",
                title="100% Cliff Relocation & Bonus Clawback",
                category="Compensation",
                sectionRef="Section 6.3",
                pageNumber=3,
                originalSnippet="If Employee resigns within twenty-four (24) months of the Start Date, Employee shall repay one hundred percent (100%) of the Sign-On Bonus and Relocation Allowance.",
                whatItSays="If you depart even at Month 23, you must pay back 100% of your starting bonus.",
                whatItMeans="A sudden job departure could trigger an immediate $25,000 cash liability.",
                whyItMatters="Standard practice is monthly or quarterly proration over the retention period.",
                whatToAsk="Could we structure the repayment with standard monthly proration (1/24th forgiven per month)?",
                severity="MEDIUM",
            ),
        ]
        financial = [
            FinancialItem(id="f-1", label="Base Salary", amount="$165,000 / year", isConditional=False, category="FIXED"),
            FinancialItem(id="f-2", label="Sign-on Bonus", amount="$20,000", isConditional=True, conditionNote="Subject to 24-month repayment clawback cliff", category="VARIABLE"),
            FinancialItem(id="f-3", label="Relocation Assistance", amount="$10,000", isConditional=True, conditionNote="Paid upon receipt validation", category="VARIABLE"),
        ]
        questions = [
            SuggestedQuestionItem(
                id="q-1",
                question="Can we carve out pre-existing side-projects in Exhibit B and narrow IP scope?",
                whyAsk="Protects your independent intellectual property and weekend open-source work.",
                emailSnippet="Hi [HR / Hiring Manager],\n\nI am thrilled about the offer and looking forward to joining the team! While reviewing Section 8.2 (Inventions Assignment), I wanted to ensure my pre-existing personal projects and weekend open-source contributions are carved out. Could we attach an Exhibit B acknowledging these existing projects?\n\nBest regards,\n[Your Name]",
            ),
            SuggestedQuestionItem(
                id="q-2",
                question="Can we adjust the notice period from 90 days to 30 days?",
                whyAsk="Ensures standard industry flexibility for future career mobility.",
                emailSnippet="Hi [HR Manager],\n\nRegarding Section 5.1, I noticed the notice period is set to 90 days. In engineering roles, 30 days is typically standard. Would it be possible to amend this to 30 days?\n\nBest regards,\n[Your Name]",
            ),
        ]

    return ContractAnalysis(
        id=analysis_id,
        fileName=file_name,
        documentTitle=title,
        documentCategory=category,
        overallRisk="HIGH",
        headlineSummary=headline,
        stats=AnalysisStats(
            totalClauses=len(clauses),
            reviewCount=sum(1 for c in clauses if c.severity == "MEDIUM"),
            redFlagCount=sum(1 for c in clauses if c.severity == "HIGH"),
        ),
        whatYouAreGivingUp=giving_up,
        clauses=clauses,
        obligations=ObligationsGroup(
            userMust=[
                ObligationItem(id="o-1", action="Provide written resignation notice", timeline="90 days in advance", mandatory=True),
                ObligationItem(id="o-2", action="Surrender all company hardware and access credentials", timeline="Immediate upon departure", mandatory=True),
            ],
            counterpartyMust=[
                ObligationItem(id="o-3", action="Pay bi-weekly base salary on scheduled payroll dates", timeline="Bi-weekly", mandatory=True),
                ObligationItem(id="o-4", action="Maintain health and retirement benefit contributions", timeline="Monthly", mandatory=True),
            ],
        ),
        financialTerms=financial,
        questionsBeforeSigning=questions,
    )
