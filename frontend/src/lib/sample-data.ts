import { ContractAnalysis } from "@/types/contract";

export const SAMPLE_CONTRACTS: Record<string, ContractAnalysis> = {
  employment: {
    id: "sample-emp-1",
    fileName: "ApexTech_Employment_Agreement.pdf",
    documentTitle: "Software Engineer Offer & Employment Agreement",
    documentCategory: "EMPLOYMENT",
    overallRisk: "MEDIUM",
    headlineSummary:
      "A competitive compensation package with 2 significant flags: an unusually long 90-day notice period and an overly broad intellectual property assignment that claims ownership over personal side projects.",
    stats: {
      totalClauses: 18,
      reviewCount: 4,
      redFlagCount: 2,
    },
    whatYouAreGivingUp: [
      "Job transition agility due to a mandatory 90-day notice period.",
      "Ownership over personal projects built outside work hours if related to tech/software.",
      "Right to work with competitors or clients for 12 months after leaving.",
      "Immediate entitlement to variable bonus if you leave before December 31.",
    ],
    clauses: [
      {
        id: "c-1",
        title: "90-Day Resignation Notice Period",
        category: "TERMINATION",
        sectionRef: "Section 5.2",
        pageNumber: 4,
        originalSnippet:
          "The Employee agrees to provide not less than ninety (90) calendar days prior written notice of resignation. Early release remains at the sole discretion of the Company without buyout guarantee.",
        whatItSays: "You must give 3 full months of notice before you can leave your job.",
        whatItMeans:
          "If you receive another job offer, your new employer will have to wait 90 days before you can join them, unless ApexTech voluntarily agrees to release you early.",
        whyItMatters:
          "Most tech companies expect candidates to start within 30 to 45 days. A 90-day lock-in often causes other companies to withdraw their job offers.",
        whatToAsk:
          "Can we adjust the notice period during the probation period to 30 days, and 60 days thereafter?",
        severity: "HIGH",
      },
      {
        id: "c-2",
        title: "Broad Intellectual Property Assignment",
        category: "INTELLECTUAL_PROPERTY",
        sectionRef: "Section 8.1",
        pageNumber: 7,
        originalSnippet:
          "All inventions, software, designs, and derivative works created by Employee during the tenure of employment, whether during business hours or on personal equipment, shall vest exclusively in the Company.",
        whatItSays:
          "The company claims ownership of any code or app you write while employed here, even on weekends.",
        whatItMeans:
          "If you build an iOS app, SaaS side project, or open-source tool on your personal laptop during your free time, the company could legally claim 100% ownership.",
        whyItMatters:
          "You risk losing your own intellectual creations and could face legal disputes if a side project becomes commercially successful.",
        whatToAsk:
          "Can we add an exclusion schedule listing my pre-existing personal side projects and clarify that work done on personal time without company assets remains mine?",
        severity: "HIGH",
      },
      {
        id: "c-3",
        title: "Discretionary Variable Performance Bonus",
        category: "COMPENSATION",
        sectionRef: "Section 3.3",
        pageNumber: 2,
        originalSnippet:
          "The Employee shall be eligible for an annual target bonus of $25,000. Payment is contingent upon company EBITDA targets, individual performance review scores, and Employee remaining actively on payroll on the distribution date.",
        whatItSays:
          "The $25,000 bonus is not guaranteed and requires you to still be employed on the exact payout date.",
        whatItMeans:
          "Even if you achieve 100% of your performance metrics throughout the year, if you resign before the bonus payout date in March, you forfeit the entire sum.",
        whyItMatters:
          "Calculates a significant percentage of your total compensation as conditional rather than guaranteed base pay.",
        whatToAsk:
          "What percentage of this target bonus was paid out to engineering team members over the past two fiscal years?",
        severity: "MEDIUM",
      },
      {
        id: "c-4",
        title: "Post-Employment Non-Compete (12 Months)",
        category: "NON_COMPETE",
        sectionRef: "Section 9.4",
        pageNumber: 8,
        originalSnippet:
          "For a period of twelve (12) months following termination, Employee shall not engage directly or indirectly with any entity providing competitive cloud infrastructure solutions within North America.",
        whatItSays:
          "You cannot work for any competitor in cloud infrastructure for 1 full year after quitting.",
        whatItMeans:
          "Restricts your employment options strictly within your primary field of domain expertise.",
        whyItMatters:
          "Depending on your jurisdiction (e.g., California, FTC regulations), non-competes may be legally unenforceable, but companies still use them to deter departures.",
        whatToAsk:
          "Is the company willing to limit this non-compete to direct client solicitation rather than a blanket industry bar?",
        severity: "MEDIUM",
      },
    ],
    obligations: {
      userMust: [
        {
          id: "u-1",
          action: "Provide 90 days written notice before resigning",
          timeline: "90 days prior",
          mandatory: true,
        },
        {
          id: "u-2",
          action: "Surrender all company laptops, credentials, and data within 24 hours of exit",
          timeline: "Within 24 hours",
          mandatory: true,
        },
        {
          id: "u-3",
          action: "Keep technical architecture, customer lists, and financial figures confidential",
          timeline: "Indefinitely",
          mandatory: true,
        },
        {
          id: "u-4",
          action: "Dedicate full working time exclusively to company business (no secondary employment)",
          timeline: "During tenure",
          mandatory: true,
        },
      ],
      counterpartyMust: [
        {
          id: "cp-1",
          action: "Pay fixed base salary of $145,000 per annum via bi-weekly direct deposit",
          timeline: "Bi-weekly",
          mandatory: true,
        },
        {
          id: "cp-2",
          action: "Enroll employee in comprehensive health, dental, and vision insurance within 30 days",
          timeline: "Day 30",
          mandatory: true,
        },
        {
          id: "cp-3",
          action: "Provide $3,500 annual home-office equipment and learning stipend",
          timeline: "Annual cycle",
          mandatory: true,
        },
      ],
    },
    financialTerms: [
      {
        id: "f-1",
        label: "Base Salary",
        amount: "$145,000 / year",
        isConditional: false,
        category: "FIXED",
      },
      {
        id: "f-2",
        label: "Target Annual Bonus",
        amount: "$25,000 / year",
        isConditional: true,
        conditionNote: "Requires company EBITDA target achievement + active employment on payout date.",
        category: "VARIABLE",
      },
      {
        id: "f-3",
        label: "Signing Bonus",
        amount: "$15,000 one-time",
        isConditional: true,
        conditionNote: "Must be repaid proportionally if you depart within the first 12 months.",
        category: "VARIABLE",
      },
      {
        id: "f-4",
        label: "Remote Setup Stipend",
        amount: "$3,500 / year",
        isConditional: false,
        category: "FIXED",
      },
    ],
    questionsBeforeSigning: [
      {
        id: "q-1",
        question: "Is the 90-day notice period negotiable down to 30 or 60 days?",
        whyAsk:
          "90 days severely diminishes your marketability when seeking future opportunities.",
        emailSnippet:
          "Regarding Section 5.2, could we discuss adjusting the standard resignation notice period to 30 days during probation and 60 days thereafter, to better match prevailing market norms?",
      },
      {
        id: "q-2",
        question: "Can we carve out personal side projects from the IP assignment clause?",
        whyAsk:
          "Section 8.1 assigns rights over work done on personal devices outside working hours.",
        emailSnippet:
          "Regarding Section 8.1 (Intellectual Property), I would like to attach an Exhibit listing my personal open-source projects and clarify that non-work-related projects created on personal equipment remain my own.",
      },
      {
        id: "q-3",
        question: "What happens to accrued variable bonus in the event of mutual separation?",
        whyAsk:
          "Current language creates a complete forfeiture of bonus if not on payroll on the payout date.",
        emailSnippet:
          "Under Section 3.3, could we clarify whether the annual performance bonus is paid on a pro-rata basis if separation occurs late in the fiscal year?",
      },
    ],
  },
  rental: {
    id: "sample-rent-1",
    fileName: "Oakridge_Residential_Lease.pdf",
    documentTitle: "12-Month Residential Apartment Lease",
    documentCategory: "RENTAL_HOUSING",
    overallRisk: "MEDIUM",
    headlineSummary:
      "Standard residential lease with an aggressive 3-month security deposit, automatic 10% rent escalation on renewal, and strict guest limits of maximum 7 consecutive days.",
    stats: {
      totalClauses: 14,
      reviewCount: 3,
      redFlagCount: 1,
    },
    whatYouAreGivingUp: [
      "Immediate refund of your security deposit (Landlord retains up to 60 days post-moveout).",
      "Ability to host guests or family members for longer than 7 consecutive days without written consent.",
      "Rent predictability in Year 2 due to a pre-baked 10% escalation clause.",
      "Right to sublet or list on Airbnb under any circumstances.",
    ],
    clauses: [
      {
        id: "rc-1",
        title: "Automatic 10% Annual Rent Escalation",
        category: "COMPENSATION",
        sectionRef: "Clause 3",
        pageNumber: 2,
        originalSnippet:
          "Upon completion of the initial twelve (12) month term, should Tenant elect to renew, monthly Rent shall automatically escalate by ten percent (10%) over the prevailing rate.",
        whatItSays: "If you renew next year, your rent will automatically go up by 10%.",
        whatItMeans:
          "Your $2,600/month rent will jump to $2,860/month ($3,120 extra per year) without negotiation.",
        whyItMatters:
          "Inflation and prevailing local rent appreciation averages 3–5%. A fixed 10% clause is significantly above market rate.",
        whatToAsk:
          "Can the renewal escalation be capped at 4% or tied to the local Consumer Price Index (CPI)?",
        severity: "HIGH",
      },
      {
        id: "rc-2",
        title: "60-Day Security Deposit Return Window",
        category: "LIABILITY",
        sectionRef: "Clause 7.2",
        pageNumber: 3,
        originalSnippet:
          "The Security Deposit shall be refunded within sixty (60) business days following Tenant vacating the premises, subject to deductions for standard repainting and deep cleaning.",
        whatItSays: "Landlord can hold your $7,800 deposit for up to nearly 3 calendar months.",
        whatItMeans:
          "You will have to fund the deposit for your next apartment out of pocket before receiving this one back.",
        whyItMatters:
          "Many state and municipal laws require deposit returns within 14 to 30 days. Furthermore, routine repainting is considered normal wear and tear and cannot legally be deducted in many jurisdictions.",
        whatToAsk:
          "Can we update the refund timeline to 21 business days, and specify that normal wear and tear is excluded from deductions?",
        severity: "MEDIUM",
      },
      {
        id: "rc-3",
        title: "Strict Guest Policy (Max 7 Days)",
        category: "WORKING_CONDITIONS",
        sectionRef: "Clause 11",
        pageNumber: 5,
        originalSnippet:
          "No guest or visitor shall occupy the leased premises for more than seven (7) consecutive days or fourteen (14) days in any calendar quarter without prior written landlord authorization.",
        whatItSays: "No friend or family member can stay with you for more than a week.",
        whatItMeans:
          "If parents or partners visit for 10 days, you are technically in breach of the lease.",
        whyItMatters:
          "Can lead to nuisance disputes or lease termination notices if a landlord is overly intrusive.",
        whatToAsk:
          "Can we extend the consecutive guest allowance to 14 days for immediate family members?",
        severity: "LOW",
      },
    ],
    obligations: {
      userMust: [
        {
          id: "ru-1",
          action: "Pay monthly rent of $2,600 strictly on or before the 1st of each month",
          timeline: "Monthly (1st)",
          mandatory: true,
        },
        {
          id: "ru-2",
          action: "Provide 60 days advance written notice prior to lease expiration if vacating",
          timeline: "60 days prior",
          mandatory: true,
        },
        {
          id: "ru-3",
          action: "Maintain active renter's insurance with at least $100,000 liability coverage",
          timeline: "Continuous",
          mandatory: true,
        },
      ],
      counterpartyMust: [
        {
          id: "rcp-1",
          action: "Maintain structural integrity, plumbing, and building heating/HVAC services",
          timeline: "Continuous",
          mandatory: true,
        },
        {
          id: "rcp-2",
          action: "Provide 24 hours written notice before entering premises for routine inspections",
          timeline: "24 hours prior",
          mandatory: true,
        },
      ],
    },
    financialTerms: [
      {
        id: "rf-1",
        label: "Monthly Rent",
        amount: "$2,600 / month",
        isConditional: false,
        category: "FIXED",
      },
      {
        id: "rf-2",
        label: "Security Deposit",
        amount: "$7,800 (3 months)",
        isConditional: false,
        conditionNote: "Held for up to 60 business days post-tenancy.",
        category: "DEPOSIT",
      },
      {
        id: "rf-3",
        label: "Late Payment Fee",
        amount: "$150 flat fee",
        isConditional: true,
        conditionNote: "Assessed if payment received after the 4th calendar day of the month.",
        category: "PENALTY",
      },
    ],
    questionsBeforeSigning: [
      {
        id: "rq-1",
        question: "Can the renewal escalation be capped at 4% instead of 10%?",
        whyAsk: "10% compounding escalation quickly outpaces neighborhood rental trends.",
        emailSnippet:
          "Regarding Clause 3 (Renewal), could we agree to cap any lease renewal increase at 4%, or align it with the Consumer Price Index for urban renters?",
      },
      {
        id: "rq-2",
        question: "Can we specify that normal wear and tear cannot be deducted from the deposit?",
        whyAsk: "Prevents landlord from deducting basic repainting or appliance aging.",
        emailSnippet:
          "In Clause 7.2, I'd like to insert standard language affirming that deductions are limited to damage beyond reasonable wear and tear, with an itemized invoice provided within 21 days.",
      },
    ],
  },
  freelance: {
    id: "sample-free-1",
    fileName: "DesignSOW_MasterServicesAgreement.pdf",
    documentTitle: "Freelance UI/UX Master Services Agreement & SOW",
    documentCategory: "FREELANCE_SERVICES",
    overallRisk: "HIGH",
    headlineSummary:
      "Contains major cash flow and scope creep risks: Net-60 payment terms, un-capped revisions, and immediate transfer of all copyright before invoice payment is settled.",
    stats: {
      totalClauses: 11,
      reviewCount: 3,
      redFlagCount: 3,
    },
    whatYouAreGivingUp: [
      "Copyright ownership transferred BEFORE payment is cleared (Client gets your files even if they don't pay).",
      "Protection against infinite revision rounds (No scope limits defined).",
      "Prompt cash flow (Client can delay payment for up to 60 calendar days after invoice submission).",
    ],
    clauses: [
      {
        id: "fc-1",
        title: "IP Transfer Prior to Full Payment",
        category: "INTELLECTUAL_PROPERTY",
        sectionRef: "Section 4",
        pageNumber: 3,
        originalSnippet:
          "Contractor irrevocably assigns all right, title, and interest in all Deliverables upon creation. Client shall own all preliminary drafts, components, and final design assets immediately.",
        whatItSays: "Client owns your designs the second you create them, even before paying.",
        whatItMeans:
          "If the client ghosts you or refuses to pay your final invoice, they still legally own and can use your design files.",
        whyItMatters:
          "In freelance work, withholding copyright until payment clears is your primary leverage to ensure you get paid.",
        whatToAsk:
          "Can we amend this so that copyright ownership transfers upon receipt of full and final payment?",
        severity: "HIGH",
      },
      {
        id: "fc-2",
        title: "Net-60 Payment Terms",
        category: "COMPENSATION",
        sectionRef: "Section 2.2",
        pageNumber: 2,
        originalSnippet:
          "Invoices shall be processed and payable within sixty (60) days of receipt of an approved invoice by Client's accounts payable department.",
        whatItSays: "You could wait 2 whole months after finishing work to get paid.",
        whatItMeans:
          "If you submit your invoice on June 1st, they can legally wait until July 31st to send your money.",
        whyItMatters:
          "Net-60 severely impairs cash flow for independent contractors and freelancers.",
        whatToAsk:
          "Can we align with industry standard Net-15 or Net-30 payment terms, with a 50% upfront deposit?",
        severity: "HIGH",
      },
    ],
    obligations: {
      userMust: [
        {
          id: "fu-1",
          action: "Deliver Figma prototypes, design tokens, and production assets per milestone schedule",
          mandatory: true,
        },
        {
          id: "fu-2",
          action: "Indemnify client against any third-party font or asset licensing infringement",
          mandatory: true,
        },
      ],
      counterpartyMust: [
        {
          id: "fcp-1",
          action: "Pay total project contract fee of $12,500 across 3 milestone phases",
          timeline: "Milestone-based",
          mandatory: true,
        },
      ],
    },
    financialTerms: [
      {
        id: "ff-1",
        label: "Total Contract Value",
        amount: "$12,500",
        isConditional: false,
        category: "FIXED",
      },
      {
        id: "ff-2",
        label: "Payment Terms",
        amount: "Net-60 Days",
        isConditional: true,
        conditionNote: "Payment delayed up to 60 days following invoice approval.",
        category: "VARIABLE",
      },
    ],
    questionsBeforeSigning: [
      {
        id: "fq-1",
        question: "Can we change IP assignment to transfer strictly upon final payment receipt?",
        whyAsk: "Protects your work from being used commercially without paying your fee.",
        emailSnippet:
          "Under Section 4, I would like to update the phrasing to specify: 'All IP rights shall transfer to Client immediately upon Contractor's receipt of full and final payment.'",
      },
    ],
  },
};
