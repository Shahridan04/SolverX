import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini/client";
import { EXABYTES_CATALOG, type ExabytesProduct } from "@/lib/exabytes-catalog";
import { TRIGGER_SCENARIOS, type TriggerScenario, type QuestionOption } from "@/lib/assessment-scenarios";
import type { RecommendedProduct, AssessmentPayload } from "@/lib/supabase/types";

export interface DynamicFollowUpProbe {
  id: string;
  question: string;
  subtitle: string;
  options: QuestionOption[];
  category: "severity" | "readiness";
}

export interface DynamicFollowUpResult {
  scenarioId: string;
  scenarioName: string;
  question: string;
  subtitle: string;
  options: QuestionOption[];
  probes: DynamicFollowUpProbe[];
  quantitativeField?: string;
  isAiGenerated: boolean;
}

export type MaturityTier = "Emerging (0-39)" | "Developing (40-69)" | "Digitally Mature (70-100)";

export interface DiagnosisReport {
  maturityScore: number;
  maturityTier: MaturityTier;
  summary: string;
  keyGaps: string[];
  recommendedProducts: (RecommendedProduct & {
    tagline: string;
    description: string;
    startingPrice: string;
    productUrl: string;
    features: string[];
  })[];
  roiEstimate: {
    hoursSavedWeekly: number;
    annualHoursSaved: number;
    estimatedAnnualSavingsRM: number;
    calculationFormula: string;
  } | null;
  immediateActionPlan: string[];
  isAiGenerated: boolean;
}

/**
 * Timeout wrapper for AI calls. 45s timeout allows full Gemini reasoning
 * while pre-fetching on Q5 removes user-perceived waiting latency.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 45000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI Request timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Step 1: AI Dynamic Follow-up Engine
 * Ingests 100% of customer context (Q1-Q5) and produces 2 consultative probes:
 * - Probe 1: Operational Severity & Friction depth
 * - Probe 2: Implementation Timeline & MDEC Grant Co-Funding Readiness
 */
export async function generateDynamicFollowUp(
  answers: {
    industry: string;
    teamSize: string;
    currentTools: string[];
    bottlenecks: string;
    primaryOutcome: string;
  }
): Promise<DynamicFollowUpResult> {
  const scenarioKey = answers.bottlenecks || "ops_workload";
  const scenario: TriggerScenario = TRIGGER_SCENARIOS[scenarioKey] || TRIGGER_SCENARIOS.ops_workload;

  const fallbackProbe1: DynamicFollowUpProbe = {
    id: "probe_severity",
    question: scenario.fallbackQuestion,
    subtitle: scenario.fallbackSubtitle,
    options: scenario.options,
    category: "severity",
  };

  const fallbackProbe2: DynamicFollowUpProbe = {
    id: "probe_readiness",
    question: "What is your target adoption timeline and grant assistance preference?",
    subtitle: "This calibrates your implementation pace and checks eligibility for the 50% MDEC Matching Grant.",
    category: "readiness",
    options: [
      {
        id: "ready_immediate",
        label: "Ready to deploy in < 30 days with Exabytes guidance",
        description: "Priority to resolve bottlenecks and plug operational waste as soon as possible.",
        icon: "⚡",
      },
      {
        id: "seeking_mdec_grant",
        label: "Applying for MDEC SME Digitalization Grant (50% co-funding)",
        description: "Seeking to optimize cash flow with Malaysian government grant co-funding.",
        icon: "🏛️",
      },
      {
        id: "exploratory_pilot",
        label: "Starting with a targeted starter pilot (60–90 days)",
        description: "Prefer validating core tools with a small team before enterprise roll-out.",
        icon: "🔍",
      },
    ],
  };

  const fallbackResult: DynamicFollowUpResult = {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    question: fallbackProbe1.question,
    subtitle: fallbackProbe1.subtitle,
    options: fallbackProbe1.options,
    probes: [fallbackProbe1, fallbackProbe2],
    quantitativeField: scenario.quantitativeField,
    isAiGenerated: false,
  };

  try {
    const ai = getGeminiClient();

    const prompt = `You are SolverX, an enterprise AI Digital Growth Advisor for Malaysian SMEs built for Exabytes.
The user has completed their complete base questionnaire:
- Industry: ${answers.industry}
- Team Size: ${answers.teamSize}
- Current Tools: ${answers.currentTools.join(", ") || "None mentioned / Basic"}
- Biggest Operational Bottleneck: ${answers.bottlenecks} (${scenario.name})
- 6-12 Month Business Goal: ${answers.primaryOutcome}

Your task:
Generate 2 sharp, highly consultative diagnostic probes tailored to this exact business context:

1. Probe 1 (Operational Severity & Root Cause):
Dig into the specific operational friction, deal leakage, or time waste caused by their bottleneck (${scenario.name}) in their industry (${answers.industry}) with team size (${answers.teamSize}).
Provide 3 realistic options with quantitative or behavioral distinctions.

2. Probe 2 (Implementation Readiness & Grant Preference):
Dig into their adoption urgency, timeline, or MDEC SME Matching Grant co-funding preference to achieve their goal (${answers.primaryOutcome}).
Provide 3 realistic options (e.g. fast onboarding in <30 days, applying for 50% MDEC grant, or staged starter pilot).

Respond ONLY with a valid JSON object matching this schema:
{
  "probe1": {
    "question": "Sharp question uncovering the exact depth of their bottleneck",
    "subtitle": "Why this metric determines their software architecture",
    "options": [
      {"id": "sev_1", "label": "Option 1 label", "description": "Short contextual detail"},
      {"id": "sev_2", "label": "Option 2 label", "description": "Short contextual detail"},
      {"id": "sev_3", "label": "Option 3 label", "description": "Short contextual detail"}
    ]
  },
  "probe2": {
    "question": "Strategic question regarding timeline, adoption speed, or MDEC grant co-funding",
    "subtitle": "Helps match the right Exabytes deployment package and subsidy eligibility",
    "options": [
      {"id": "read_1", "label": "Ready to deploy in < 30 days with Exabytes technical onboarding", "description": "High priority to plug operational leaks immediately"},
      {"id": "read_2", "label": "Seeking 50% MDEC Matching Grant co-funding assistance", "description": "Want to optimize cashflow with Malaysian government grant co-funding"},
      {"id": "read_3", "label": "Phased trial / starter package before full roll-out", "description": "Prefer validating core foundation tools first"}
    ]
  }
}`;

    const aiCall = async () => {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text?.trim();
      if (!text) throw new Error("Empty AI response");

      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null) throw new Error("Invalid JSON structure");

      const obj = parsed as Record<string, unknown>;
      const p1Raw = typeof obj.probe1 === "object" && obj.probe1 !== null ? (obj.probe1 as Record<string, unknown>) : null;
      const p2Raw = typeof obj.probe2 === "object" && obj.probe2 !== null ? (obj.probe2 as Record<string, unknown>) : null;

      if (!p1Raw || typeof p1Raw.question !== "string" || !Array.isArray(p1Raw.options)) {
        throw new Error("Missing probe1 in AI output");
      }

      const mapOptions = (rawList: unknown[], prefix: string): QuestionOption[] => {
        return rawList.map((item, idx) => {
          const optObj = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
          return {
            id: typeof optObj.id === "string" ? optObj.id : `${prefix}_${idx + 1}`,
            label: typeof optObj.label === "string" ? optObj.label : `Option ${idx + 1}`,
            description: typeof optObj.description === "string" ? optObj.description : undefined,
            icon: typeof optObj.icon === "string" ? optObj.icon : undefined,
          };
        });
      };

      const probe1Options = mapOptions(p1Raw.options, "sev");
      const probe1: DynamicFollowUpProbe = {
        id: "probe_severity",
        question: p1Raw.question,
        subtitle: typeof p1Raw.subtitle === "string" ? p1Raw.subtitle : scenario.fallbackSubtitle,
        options: probe1Options.length >= 2 ? probe1Options : scenario.options,
        category: "severity",
      };

      let probe2: DynamicFollowUpProbe = fallbackProbe2;
      if (p2Raw && typeof p2Raw.question === "string" && Array.isArray(p2Raw.options)) {
        const probe2Options = mapOptions(p2Raw.options, "read");
        if (probe2Options.length >= 2) {
          probe2 = {
            id: "probe_readiness",
            question: p2Raw.question,
            subtitle: typeof p2Raw.subtitle === "string" ? p2Raw.subtitle : fallbackProbe2.subtitle,
            options: probe2Options,
            category: "readiness",
          };
        }
      }

      return {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        question: probe1.question,
        subtitle: probe1.subtitle,
        options: probe1.options,
        probes: [probe1, probe2],
        quantitativeField: scenario.quantitativeField,
        isAiGenerated: true,
      };
    };

    // Run with 45s timeout
    return await withTimeout(aiCall(), 45000);
  } catch (err: unknown) {
    console.warn("[SolverX Engine] Dynamic Follow-up AI fallback triggered:", err instanceof Error ? err.message : err);
    return fallbackResult;
  }
}

/**
 * Calculates deterministic Digital Maturity Score (0-100) based on answer parameters.
 */
export function calculateMaturityScore(payload: AssessmentPayload): number {
  let score = 20; // baseline

  // Tool sophistication
  const tools = payload.currentTools || [];
  if (tools.includes("domain_email")) score += 15;
  if (tools.includes("basic_website")) score += 15;
  if (tools.includes("ecommerce_store")) score += 15;
  if (tools.includes("crm_software")) score += 15;
  if (tools.includes("cloud_backup")) score += 10;

  // Penalties for high manual friction
  if (tools.includes("free_email")) score -= 10;
  if (tools.includes("whatsapp_only")) score -= 5;
  if (tools.includes("spreadsheets")) score -= 5;

  // Team size scaling
  if (payload.teamSize === "medium" || payload.teamSize === "large") {
    score += 5;
  }

  return Math.min(Math.max(score, 15), 95);
}

/**
 * Step 2: AI Diagnosis & Recommendation Report Engine
 * Synthesizes full user assessment, matches Exabytes solutions, computes ROI,
 * and crafts personalized "Why this fits you" reasoning.
 */
export async function generateDiagnosisReport(payload: AssessmentPayload): Promise<DiagnosisReport> {
  const maturityScore = calculateMaturityScore(payload);
  const maturityTier: MaturityTier =
    maturityScore < 40 ? "Emerging (0-39)" : maturityScore < 70 ? "Developing (40-69)" : "Digitally Mature (70-100)";

  // Compute ROI / Savings for Operational bottlenecks or WhatsApp enquiry hours
  let roiEstimate: DiagnosisReport["roiEstimate"] = null;
  const followUpValue = Object.values(payload.followUpAnswers || {})[0] || "";

  if (payload.primaryBottleneck === "ops_workload" || followUpValue.includes("hours_") || payload.primaryOutcome === "save_time") {
    let hoursPerWeek = 15; // default avg
    if (followUpValue === "hours_5") hoursPerWeek = 5;
    if (followUpValue === "hours_15") hoursPerWeek = 15;
    if (followUpValue === "hours_30") hoursPerWeek = 30;

    const hourlyRateRM = 25; // standard Malaysian SME operational staff rate (RM 25/hr)
    const annualHoursSaved = hoursPerWeek * 52;
    const estimatedAnnualSavingsRM = annualHoursSaved * hourlyRateRM;

    roiEstimate = {
      hoursSavedWeekly: hoursPerWeek,
      annualHoursSaved,
      estimatedAnnualSavingsRM,
      calculationFormula: `${hoursPerWeek} hrs/wk × 52 weeks × RM 25/hr labor value = RM ${estimatedAnnualSavingsRM.toLocaleString()}/yr`,
    };
  }

  // Pre-filter relevant Exabytes catalog products
  const scenario = TRIGGER_SCENARIOS[payload.primaryBottleneck] || TRIGGER_SCENARIOS.ops_workload;
  const defaultRecommendedIds = scenario.defaultRecommendedProductIds || ["freshchat-whatsapp", "lark-worksuite"];

  // Helper to get product details
  const getProductDetails = (id: string): ExabytesProduct => {
    return EXABYTES_CATALOG.find((p) => p.id === id) || EXABYTES_CATALOG[0];
  };

  // Fallback report structure
  const fallbackProducts = defaultRecommendedIds.map((id) => {
    const prod = getProductDetails(id);
    return {
      id: prod.id,
      name: prod.name,
      category: prod.category,
      tagline: prod.tagline,
      description: prod.description,
      startingPrice: prod.startingPrice,
      productUrl: prod.productUrl,
      features: prod.features,
      whyThisFitsYou: `Directly resolves your ${payload.primaryBottleneck.replace("_", " ")} bottleneck for your ${payload.industry} business by upgrading manual workflows to Exabytes enterprise standards.`,
      estimatedRoiAnnual: roiEstimate ? roiEstimate.estimatedAnnualSavingsRM : null,
    };
  });

  const fallbackReport: DiagnosisReport = {
    maturityScore,
    maturityTier,
    summary: `Your ${payload.industry.toUpperCase()} business is currently in the ${maturityTier} stage. By addressing manual operational friction and unifying your digital channels, your team can unlock significant productivity and revenue gains.`,
    keyGaps: [
      `Reliance on manual workflows creates bottlenecks as order volumes grow.`,
      `Communication and customer inquiries are fragmented across personal tools.`,
      `Lack of unified business systems limits customer conversion rates.`,
    ],
    recommendedProducts: fallbackProducts,
    roiEstimate,
    immediateActionPlan: [
      `Deploy professional communications to secure brand credibility.`,
      `Automate repetitive WhatsApp inquiries with dedicated agent routing.`,
      `Consolidate customer data into a central tracking pipeline.`,
    ],
    isAiGenerated: false,
  };

  try {
    const ai = getGeminiClient();

    const catalogContext = EXABYTES_CATALOG.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      idealFor: p.idealFor,
      features: p.features,
      startingPrice: p.startingPrice,
    }));

    const prompt = `You are SolverX, the AI Digital Growth Advisor for Malaysian SMEs built for Exabytes.
Analyze the following SME Assessment profile and produce a high-impact, enterprise-grade diagnostic report with tailored Exabytes product recommendations.

SME PROFILE:
- Industry: ${payload.industry}
- Team Size: ${payload.teamSize}
- Current Tools: ${payload.currentTools.join(", ") || "None"}
- Primary Bottleneck: ${payload.primaryBottleneck}
- Secondary Bottleneck: ${payload.secondaryBottleneck || "None"}
- 6-12 Month Target: ${payload.primaryOutcome}
- Follow-up details: ${JSON.stringify(payload.followUpAnswers)}
- Calculated Digital Maturity Score: ${maturityScore}/100 (${maturityTier})

EXABYTES PRODUCT CATALOG AVAILABLE:
${JSON.stringify(catalogContext, null, 2)}

REQUIREMENTS:
1. Select the top 2-3 most relevant Exabytes products from the catalog that directly solve the SME's bottleneck.
2. For each product, write a personalized "whyThisFitsYou" explanation (1-2 sentences) directly mentioning their industry (${payload.industry}) and situation.
3. Identify 3 specific digital gaps in their current setup.
4. Provide a 3-step immediate action plan.

Respond ONLY with valid JSON matching this schema:
{
  "summary": "2-3 sentence executive diagnosis of their digital maturity and primary growth opportunity",
  "keyGaps": ["Specific gap 1", "Specific gap 2", "Specific gap 3"],
  "recommendedProductIds": [
    {
      "id": "exact_catalog_product_id",
      "whyThisFitsYou": "Personalized 1-2 sentence rationale tailored to their business"
    }
  ],
  "immediateActionPlan": ["Step 1", "Step 2", "Step 3"]
}`;

    const aiCall = async () => {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text?.trim();
      if (!text) throw new Error("Empty AI diagnosis response");

      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null) throw new Error("Invalid JSON structure");

      const obj = parsed as Record<string, unknown>;
      const summary = typeof obj.summary === "string" ? obj.summary : fallbackReport.summary;
      const keyGaps = Array.isArray(obj.keyGaps)
        ? (obj.keyGaps as string[]).slice(0, 3)
        : fallbackReport.keyGaps;
      const immediateActionPlan = Array.isArray(obj.immediateActionPlan)
        ? (obj.immediateActionPlan as string[]).slice(0, 3)
        : fallbackReport.immediateActionPlan;

      let aiProducts: DiagnosisReport["recommendedProducts"] = [];

      if (Array.isArray(obj.recommendedProductIds)) {
        for (const item of obj.recommendedProductIds) {
          if (typeof item === "object" && item !== null) {
            const itemObj = item as Record<string, unknown>;
            const prodId = typeof itemObj.id === "string" ? itemObj.id : "";
            const whyFit =
              typeof itemObj.whyThisFitsYou === "string" ? itemObj.whyThisFitsYou : "";
            const matched = EXABYTES_CATALOG.find((p) => p.id === prodId);

            if (matched) {
              aiProducts.push({
                id: matched.id,
                name: matched.name,
                category: matched.category,
                tagline: matched.tagline,
                description: matched.description,
                startingPrice: matched.startingPrice,
                productUrl: matched.productUrl,
                features: matched.features,
                whyThisFitsYou:
                  whyFit ||
                  `Engineered to eliminate ${payload.primaryBottleneck.replace("_", " ")} for ${payload.industry} businesses.`,
                estimatedRoiAnnual: roiEstimate ? roiEstimate.estimatedAnnualSavingsRM : null,
              });
            }
          }
        }
      }

      if (aiProducts.length === 0) {
        aiProducts = fallbackProducts;
      }

      return {
        maturityScore,
        maturityTier,
        summary,
        keyGaps,
        recommendedProducts: aiProducts,
        roiEstimate,
        immediateActionPlan,
        isAiGenerated: true,
      };
    };

    // Run with 45s timeout
    return await withTimeout(aiCall(), 45000);
  } catch (err: unknown) {
    console.warn("[SolverX Engine] Diagnosis AI fallback triggered:", err instanceof Error ? err.message : err);
    return fallbackReport;
  }
}
