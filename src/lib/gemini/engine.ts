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
  maturityCategories: {
    website: number;
    cloud: number;
    crm: number;
    marketing: number;
    cybersecurity: number;
    aiAdoption: number;
  };
  aiReadiness: {
    leadership: number;
    dataAvailability: number;
    employeeSkills: number;
    digitalWorkflow: number;
    processMaturity: number;
  };
  isAiGenerated: boolean;
}

/**
 * Timeout wrapper for AI calls. 45s timeout allows full Gemini reasoning
 * paired with consultative telemetry stages to provide a smooth UX.
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
 * Derives deterministic 1-5 maturity category scores directly from assessment answers.
 * Used as the fallback when Gemini is unavailable — scores still reflect real user input.
 */
function deriveMaturityCategories(payload: AssessmentPayload): DiagnosisReport["maturityCategories"] {
  const tools = payload.currentTools || [];
  const bottleneck = payload.primaryBottleneck || "";
  const outcome = payload.primaryOutcome || "";

  // ── Website (1–5) ───────────────────────────────────────────────────────
  let website = 1; // default: no web presence
  if (tools.includes("ecommerce_store")) website = 4;       // active online store
  else if (tools.includes("basic_website")) website = 3;    // static site exists
  if (bottleneck === "website_presence") website = 1;       // they flagged it as broken

  // ── Cloud (1–5) ─────────────────────────────────────────────────────────
  let cloud = 1; // default: no cloud tools
  if (tools.includes("cloud_backup")) cloud = 3;            // cloud backup = using cloud
  if (payload.teamSize === "medium" || payload.teamSize === "large") cloud = Math.min(cloud + 1, 5);
  if (bottleneck === "cybersecurity") cloud = Math.min(cloud, 1); // flagged no backup → floor 1

  // ── CRM (1–5) ───────────────────────────────────────────────────────────
  let crm = 1; // default: no CRM
  if (tools.includes("crm_software")) crm = 4;              // actual CRM in place
  else if (tools.includes("spreadsheets")) crm = 2;         // spreadsheets as CRM proxy
  if (bottleneck === "lost_leads") crm = Math.min(crm, 1);  // actively losing leads → floor 1
  if (bottleneck === "ops_workload" && tools.includes("whatsapp_only")) crm = 1;

  // ── Marketing (1–5) ─────────────────────────────────────────────────────
  let marketing = 1; // default: no marketing
  if (tools.includes("ecommerce_store")) marketing = 3;     // marketplace = some marketing
  if (outcome === "increase_revenue" && tools.includes("basic_website")) marketing = 3;
  if (outcome === "scale_multi_channel") marketing = Math.max(marketing, 2);
  if (tools.includes("crm_software")) marketing = Math.min(marketing + 1, 5); // CRM + marketing synergy
  if (bottleneck === "retail_omnichannel") marketing = Math.min(marketing, 2); // messy = low score

  // ── Cybersecurity (1–5) ──────────────────────────────────────────────────
  let cybersecurity = 1; // default: no security posture
  if (tools.includes("cloud_backup")) cybersecurity = 3;    // cloud backup = basic protection
  if (tools.includes("domain_email")) cybersecurity = Math.max(cybersecurity, 2); // branded = some effort
  if (tools.includes("free_email") && !tools.includes("domain_email")) cybersecurity = 1;
  if (bottleneck === "cybersecurity") cybersecurity = 1;    // they flagged a real vulnerability

  // ── AI Adoption (1–5) ────────────────────────────────────────────────────
  let aiAdoption = 1; // default: no AI tools
  if (tools.includes("crm_software") && tools.includes("cloud_backup")) aiAdoption = 3; // structured enough for AI
  else if (tools.includes("crm_software") || tools.includes("cloud_backup")) aiAdoption = 2;
  if (bottleneck === "ai_readiness") aiAdoption = 1;        // they want AI but clearly don't have it
  if (outcome === "save_time" && tools.includes("crm_software")) aiAdoption = Math.min(aiAdoption + 1, 5);

  return {
    website: Math.min(5, Math.max(1, website)),
    cloud: Math.min(5, Math.max(1, cloud)),
    crm: Math.min(5, Math.max(1, crm)),
    marketing: Math.min(5, Math.max(1, marketing)),
    cybersecurity: Math.min(5, Math.max(1, cybersecurity)),
    aiAdoption: Math.min(5, Math.max(1, aiAdoption)),
  };
}

/**
 * Derives deterministic 1-5 AI readiness sub-scores from assessment answers.
 */
function deriveAiReadiness(payload: AssessmentPayload): DiagnosisReport["aiReadiness"] {
  const tools = payload.currentTools || [];
  const bottleneck = payload.primaryBottleneck || "";
  const teamSize = payload.teamSize || "solo";

  // Leadership: do they have digital intent / structured goals?
  let leadership = 2; // default: aware but passive
  if (bottleneck === "ai_readiness") leadership = 3;        // actively seeking AI
  if (payload.primaryOutcome === "increase_revenue" || payload.primaryOutcome === "scale_multi_channel") leadership = 3;
  if (teamSize === "large" || teamSize === "medium") leadership = Math.min(leadership + 1, 5);

  // Data availability: do they have structured data sources?
  let dataAvailability = 1;
  if (tools.includes("spreadsheets")) dataAvailability = 2; // at least structured in sheets
  if (tools.includes("crm_software")) dataAvailability = 3; // CRM = clean data
  if (tools.includes("cloud_backup")) dataAvailability = Math.max(dataAvailability, 2);

  // Employee skills: proxied by tool sophistication
  let employeeSkills = 1;
  const advancedTools = tools.filter(t => ["crm_software", "cloud_backup", "ecommerce_store"].includes(t)).length;
  if (advancedTools >= 2) employeeSkills = 3;
  else if (advancedTools === 1 || tools.includes("domain_email")) employeeSkills = 2;

  // Digital workflow: are processes online / structured?
  let digitalWorkflow = 1;
  if (tools.includes("crm_software")) digitalWorkflow = 3;
  else if (tools.includes("basic_website") || tools.includes("ecommerce_store")) digitalWorkflow = 2;
  if (tools.includes("whatsapp_only") && !tools.includes("crm_software")) digitalWorkflow = 1;

  // Process maturity: combination signal
  let processMaturity = 1;
  if (tools.includes("crm_software") && tools.includes("cloud_backup")) processMaturity = 3;
  else if (tools.includes("domain_email") && tools.includes("basic_website")) processMaturity = 2;
  else if (tools.includes("spreadsheets")) processMaturity = 2;

  return {
    leadership: Math.min(5, Math.max(1, leadership)),
    dataAvailability: Math.min(5, Math.max(1, dataAvailability)),
    employeeSkills: Math.min(5, Math.max(1, employeeSkills)),
    digitalWorkflow: Math.min(5, Math.max(1, digitalWorkflow)),
    processMaturity: Math.min(5, Math.max(1, processMaturity)),
  };
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
    // Map categorical team size to an average number
    let teamSizeNum = 5;
    if (payload.teamSize === "solo") teamSizeNum = 1;
    if (payload.teamSize === "small") teamSizeNum = 5;
    if (payload.teamSize === "medium") teamSizeNum = 25;
    if (payload.teamSize === "large") teamSizeNum = 60;

    // Use interactive simulator default (3.5 hrs/emp) unless they explicitly answered the hours probe
    let hoursPerWeek = teamSizeNum * 3.5; 
    if (followUpValue === "hours_5") hoursPerWeek = 5;
    if (followUpValue === "hours_15") hoursPerWeek = 15;
    if (followUpValue === "hours_30") hoursPerWeek = 30;

    const hourlyRateRM = 22; // aligned with main page simulator
    const annualHoursSaved = Math.round(hoursPerWeek * 50); // 50 weeks aligned with main page
    const estimatedAnnualSavingsRM = Math.round(annualHoursSaved * hourlyRateRM);

    roiEstimate = {
      hoursSavedWeekly: hoursPerWeek,
      annualHoursSaved,
      estimatedAnnualSavingsRM,
      calculationFormula: `${hoursPerWeek} hrs/wk × 50 weeks × RM 22/hr labor value = RM ${estimatedAnnualSavingsRM.toLocaleString()}/yr`,
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
      `Too much manual work across day-to-day operations and administrative bottlenecks.`,
      `Customer enquiries handled manually on personal WhatsApp with no centralized CRM.`,
      `Marketing campaigns and lead acquisition funnels are not measurable or automated.`,
      `Fragmented internal team workflows and absence of shared cloud knowledge repository.`,
      `No business-grade domain email causing lost client trust and elevated cyber risk.`,
    ],
    recommendedProducts: fallbackProducts,
    roiEstimate,
    immediateActionPlan: [
      `Deploy professional communications to secure brand credibility.`,
      `Automate repetitive WhatsApp inquiries with dedicated agent routing.`,
      `Consolidate customer data into a central tracking pipeline.`,
    ],
    maturityCategories: deriveMaturityCategories(payload),
    aiReadiness: deriveAiReadiness(payload),
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
3. Identify the Top 3 to 5 evidence-based business pain points/problems in their current setup (matching typical SME bottlenecks, e.g. Too much manual work, No CRM, Customer enquiries handled manually, Unmeasurable marketing, No internal knowledge management).
4. Provide a 3-step immediate action plan.
5. Score Digital Maturity Categories (website, cloud, crm, marketing, cybersecurity, aiAdoption) on a strict 1 to 5 integer scale:
   - 1 = Nascent / None (completely manual, consumer chat or no digital footprint)
   - 2 = Basic (ad-hoc tools, siloed spreadsheets)
   - 3 = Developing (standard SaaS/cloud adopted, partial integration)
   - 4 = Competent (centralized systems, structured digital workflows)
   - 5 = Mature (enterprise cloud, automated workflows, industry leader)
   Every category MUST be an integer between 1 and 5.
6. Score AI Readiness Dimensions (leadership, dataAvailability, employeeSkills, digitalWorkflow, processMaturity) on a strict 1 to 5 integer scale:
   - 1 = Nascent (unstructured data, manual paperwork/WhatsApp, no automation)
   - 2 = Exploring (interest exists, spreadsheets available, limited tech skills)
   - 3 = Operational (clear goals, cloud documents, receptive team)
   - 4 = Advanced (data-driven decisions, structured SaaS APIs in place)
   - 5 = Transformative (AI-ready structured datasets, high digital agility)
   Every dimension MUST be an integer between 1 and 5.

Respond ONLY with valid JSON matching this schema:
{
  "summary": "2-3 sentence executive diagnosis of their digital maturity and primary growth opportunity",
  "keyGaps": ["Top problem 1", "Top problem 2", "Top problem 3", "Top problem 4", "Top problem 5"],
  "recommendedProductIds": [
    {
      "id": "exact_catalog_product_id",
      "whyThisFitsYou": "Personalized 1-2 sentence rationale tailored to their business"
    }
  ],
  "immediateActionPlan": ["Step 1", "Step 2", "Step 3"],
  "maturityCategories": {
    "website": 3, "cloud": 2, "crm": 1, "marketing": 2, "cybersecurity": 2, "aiAdoption": 1
  },
  "aiReadiness": {
    "leadership": 3, "dataAvailability": 2, "employeeSkills": 2, "digitalWorkflow": 1, "processMaturity": 2
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
      if (!text) throw new Error("Empty AI diagnosis response");

      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null) throw new Error("Invalid JSON structure");

      const obj = parsed as Record<string, unknown>;
      const summary = typeof obj.summary === "string" ? obj.summary : fallbackReport.summary;
      const keyGaps = Array.isArray(obj.keyGaps)
        ? (obj.keyGaps as string[]).slice(0, 5)
        : fallbackReport.keyGaps;
      const immediateActionPlan = Array.isArray(obj.immediateActionPlan)
        ? (obj.immediateActionPlan as string[]).slice(0, 3)
        : fallbackReport.immediateActionPlan;

      const clampScore = (val: unknown, fallback: number): number => {
        const num = typeof val === "number" ? Math.round(val) : parseInt(String(val), 10);
        if (isNaN(num)) return fallback;
        return Math.min(5, Math.max(1, num));
      };

      const rawMaturity = (typeof obj.maturityCategories === "object" && obj.maturityCategories !== null)
        ? (obj.maturityCategories as Record<string, unknown>)
        : {};
      const maturityCategories: DiagnosisReport["maturityCategories"] = {
        website: clampScore(rawMaturity.website, fallbackReport.maturityCategories?.website ?? 3),
        cloud: clampScore(rawMaturity.cloud, fallbackReport.maturityCategories?.cloud ?? 2),
        crm: clampScore(rawMaturity.crm, fallbackReport.maturityCategories?.crm ?? 1),
        marketing: clampScore(rawMaturity.marketing, fallbackReport.maturityCategories?.marketing ?? 2),
        cybersecurity: clampScore(rawMaturity.cybersecurity, fallbackReport.maturityCategories?.cybersecurity ?? 2),
        aiAdoption: clampScore(rawMaturity.aiAdoption, fallbackReport.maturityCategories?.aiAdoption ?? 1),
      };

      const rawReadiness = (typeof obj.aiReadiness === "object" && obj.aiReadiness !== null)
        ? (obj.aiReadiness as Record<string, unknown>)
        : {};
      const aiReadiness: DiagnosisReport["aiReadiness"] = {
        leadership: clampScore(rawReadiness.leadership, fallbackReport.aiReadiness?.leadership ?? 3),
        dataAvailability: clampScore(rawReadiness.dataAvailability, fallbackReport.aiReadiness?.dataAvailability ?? 2),
        employeeSkills: clampScore(rawReadiness.employeeSkills, fallbackReport.aiReadiness?.employeeSkills ?? 2),
        digitalWorkflow: clampScore(rawReadiness.digitalWorkflow, fallbackReport.aiReadiness?.digitalWorkflow ?? 1),
        processMaturity: clampScore(rawReadiness.processMaturity, fallbackReport.aiReadiness?.processMaturity ?? 2),
      };

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
        maturityCategories,
        aiReadiness,
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
