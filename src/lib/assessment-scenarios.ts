/**
 * Discovery Questionnaire structure and 7 AI Trigger Scenarios
 * Grounding data for SolverX dynamic assessment.
 */

export interface QuestionOption {
  id: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface BaseQuestion {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  type: "single" | "multi";
  options: QuestionOption[];
}

export const BASE_QUESTIONS: BaseQuestion[] = [
  {
    id: "industry",
    step: 1,
    title: "What industry does your business operate in?",
    subtitle: "Select the primary sector that represents your operations.",
    type: "single",
    options: [
      { id: "fnb", label: "F&B, Catering & Hospitality", icon: "🍳", description: "Restaurants, catering services, bakeries, cafes" },
      { id: "retail", label: "Retail & E-Commerce", icon: "🛍️", description: "Online stores, physical retail, boutique fashion, FMCG" },
      { id: "services", label: "Professional Services & Agencies", icon: "💼", description: "Consulting, legal, accounting, creative & marketing agencies" },
      { id: "manufacturing", label: "Manufacturing, Logistics & Wholesale", icon: "🏭", description: "Factory, warehousing, B2B distribution, supply chain" },
      { id: "other", label: "Other / General SME", icon: "🏢", description: "Healthcare, education, construction, trades" },
    ],
  },
  {
    id: "teamSize",
    step: 2,
    title: "How many employees are in your team?",
    subtitle: "Includes full-time, part-time, and active operational staff.",
    type: "single",
    options: [
      { id: "solo", label: "1 (Solo Founder / Freelance)", icon: "👤", description: "Sole proprietor managing everything" },
      { id: "small", label: "2 - 9 team members", icon: "👥", description: "Micro-enterprise with agile, multi-hat staff" },
      { id: "medium", label: "10 - 49 team members", icon: "🏢", description: "Growing SME with distinct departments (sales, ops, admin)" },
      { id: "large", label: "50+ team members", icon: "🌐", description: "Established enterprise scaling across multiple branches" },
    ],
  },
  {
    id: "currentTools",
    step: 3,
    title: "What digital tools are currently in your stack?",
    subtitle: "Select all that you currently use in your day-to-day operations.",
    type: "multi",
    options: [
      { id: "free_email", label: "Personal Email (@gmail/@yahoo for work)", icon: "📧" },
      { id: "domain_email", label: "Company Branded Email (@company.com)", icon: "✉️" },
      { id: "whatsapp_only", label: "WhatsApp Personal for Customer Inquiries", icon: "💬" },
      { id: "basic_website", label: "Company Website / Landing Page", icon: "🌐" },
      { id: "ecommerce_store", label: "Online Store / Shopee / Lazada Shop", icon: "🛒" },
      { id: "spreadsheets", label: "Spreadsheets (Excel/Google Sheets) for Orders", icon: "📊" },
      { id: "crm_software", label: "Dedicated CRM or Sales Tracking Tool", icon: "🎯" },
      { id: "cloud_backup", label: "Automated Cloud Backup Solution", icon: "☁️" },
    ],
  },
  {
    id: "bottlenecks",
    step: 4,
    title: "What is your single biggest operational bottleneck?",
    subtitle: "Choose the area causing the most friction or lost time.",
    type: "single",
    options: [
      { id: "ops_workload", label: "Operational Workload & WhatsApp Chaos", icon: "⏳", description: "Drowning in repetitive messages, manual order taking, and unorganized chats." },
      { id: "lost_leads", label: "Lost Leads & Unstructured Sales Follow-ups", icon: "📉", description: "Inquiries go cold because there's no central tracking or follow-up discipline." },
      { id: "email_credibility", label: "Client Trust & Brand Credibility Gaps", icon: "👔", description: "Corporate clients question legitimacy due to free email and lacking presence." },
      { id: "retail_omnichannel", label: "Messy Multi-Channel Orders & Inventory", icon: "📦", description: "Hard to sync sales between WhatsApp, physical store, and Shopee/Lazada." },
      { id: "cybersecurity", label: "Data Loss & Ransomware Vulnerability", icon: "🛡️", description: "No reliable backups for financial files, customer lists, or critical documents." },
      { id: "website_presence", label: "Outdated or Non-Existent Web Presence", icon: "💻", description: "Customers can't find pricing, credibility, or service catalogs on Google." },
      { id: "ai_readiness", label: "Lagging Behind on AI & Modern Automation", icon: "🤖", description: "Want to automate routine processes and customer support with AI." },
    ],
  },
  {
    id: "primaryOutcome",
    step: 5,
    title: "What is your primary goal for the next 6-12 months?",
    subtitle: "This helps SolverX calibrate the recommended action plan.",
    type: "single",
    options: [
      { id: "save_time", label: "Save 10+ hours/week of manual staff labor", icon: "⚡" },
      { id: "increase_revenue", label: "Capture & convert 30%+ more sales inquiries", icon: "📈" },
      { id: "professional_brand", label: "Win bigger corporate/B2B contracts", icon: "🏆" },
      { id: "scale_multi_channel", label: "Expand seamlessly into omnichannel e-commerce", icon: "🚀" },
      { id: "secure_business", label: "Ensure 100% data safety & zero business downtime", icon: "🔒" },
    ],
  },
];

export interface TriggerScenario {
  id: string;
  name: string;
  triggerKey: string;
  fallbackQuestion: string;
  fallbackSubtitle: string;
  options: QuestionOption[];
  quantitativeField?: string; // e.g. hours_saved
  defaultRecommendedProductIds: string[];
}

export const TRIGGER_SCENARIOS: Record<string, TriggerScenario> = {
  ops_workload: {
    id: "ops_workload",
    name: "Operational Workload & WhatsApp Enquiry Overload",
    triggerKey: "ops_workload",
    fallbackQuestion: "How many hours per week does your team spend manually replying to customer messages and taking orders on WhatsApp?",
    fallbackSubtitle: "This helps calculate your exact potential labor cost savings.",
    quantitativeField: "weekly_whatsapp_hours",
    options: [
      { id: "hours_5", label: "1 - 5 hours/week (~1 hr/day)", description: "Light volume, mostly handled by founder" },
      { id: "hours_15", label: "10 - 20 hours/week (~15 hrs avg)", description: "Significant staff time dedicated to chatting & quoting" },
      { id: "hours_30", label: "25 - 40+ hours/week (Full-time workload)", description: "Requires 1-2 dedicated personnel just managing chats" },
    ],
    defaultRecommendedProductIds: ["freshchat-whatsapp", "lark-worksuite"],
  },
  lost_leads: {
    id: "lost_leads",
    name: "Lead Tracking & Conversion Gaps",
    triggerKey: "lost_leads",
    fallbackQuestion: "Where do client inquiries currently drop off or get forgotten?",
    fallbackSubtitle: "Identify the biggest leakage in your sales pipeline.",
    options: [
      { id: "no_followup", label: "Staff forget to follow up after sending quotations", icon: "📄" },
      { id: "whatsapp_lost", label: "Messages get buried inside personal WhatsApp chats", icon: "📱" },
      { id: "no_visibility", label: "Management has zero visibility into ongoing sales deals", icon: "👁️" },
    ],
    defaultRecommendedProductIds: ["freshsales-crm", "freshchat-whatsapp"],
  },
  email_credibility: {
    id: "email_credibility",
    name: "Business Credibility & Professional Identity",
    triggerKey: "email_credibility",
    fallbackQuestion: "What email addresses does your team currently use when pitching to clients?",
    fallbackSubtitle: "Enterprise buyers consistently favor verified domain addresses.",
    options: [
      { id: "personal_gmail", label: "Personal Gmail/Yahoo (@gmail.com / @yahoo.com)", icon: "⚠️" },
      { id: "inconsistent_domains", label: "Mixed personal & unmanaged custom emails", icon: "🔄" },
      { id: "outdated_webmail", label: "Old webmail with frequent spam/inbox delivery issues", icon: "🚫" },
    ],
    defaultRecommendedProductIds: ["ebiz-mail-pro", "google-workspace"],
  },
  retail_omnichannel: {
    id: "retail_omnichannel",
    name: "Retail Omnichannel & Multi-channel Chaos",
    triggerKey: "retail_omnichannel",
    fallbackQuestion: "Which selling channels are you struggling to coordinate?",
    fallbackSubtitle: "Select the combination causing inventory and payment headaches.",
    options: [
      { id: "whatsapp_plus_shopee", label: "WhatsApp manual orders + Shopee/Lazada marketplace", icon: "🛒" },
      { id: "physical_store_online", label: "Physical retail outlet + emerging online sales", icon: "🏬" },
      { id: "social_commerce", label: "TikTok Shop, Instagram DMs, and WhatsApp payments", icon: "📱" },
    ],
    defaultRecommendedProductIds: ["easystore-ecommerce", "business-cloud-hosting"],
  },
  cybersecurity: {
    id: "cybersecurity",
    name: "Data Protection & Disaster Recovery",
    triggerKey: "cybersecurity",
    fallbackQuestion: "If a laptop or office computer hard drive crashed today, how would your business recover?",
    fallbackSubtitle: "Assess your real downtime and data loss exposure.",
    options: [
      { id: "no_backup", label: "We would lose crucial client files, accounting, and order history", icon: "🚨" },
      { id: "manual_usb", label: "Manual USB flash drives or external drives (updated irregularly)", icon: "💾" },
      { id: "basic_free_cloud", label: "Free Google Drive/Dropbox with no ransomware versioning", icon: "📂" },
    ],
    defaultRecommendedProductIds: ["acronis-cyber-protect", "enterprise-ssl-security"],
  },
  website_presence: {
    id: "website_presence",
    name: "Web Presence & Customer Discovery",
    triggerKey: "website_presence",
    fallbackQuestion: "What is the biggest barrier preventing you from launching or upgrading your website?",
    fallbackSubtitle: "Pinpoint what's holding your online presence back.",
    options: [
      { id: "too_expensive", label: "Agency quotes are too expensive (RM 5,000 - RM 15,000+)", icon: "💸" },
      { id: "no_technical_staff", label: "No in-house technical staff to update or secure WordPress", icon: "👨‍💻" },
      { id: "slow_unreliable", label: "Existing website is painfully slow and not mobile-friendly", icon: "🐢" },
    ],
    defaultRecommendedProductIds: ["managed-wordpress-hosting", "business-cloud-hosting", "enterprise-ssl-security"],
  },
  ai_readiness: {
    id: "ai_readiness",
    name: "AI Readiness & Workflow Automation",
    triggerKey: "ai_readiness",
    fallbackQuestion: "Which area in your business would benefit most from immediate AI automation?",
    fallbackSubtitle: "Focus on the highest ROI automation opportunity.",
    options: [
      { id: "auto_customer_support", label: "24/7 WhatsApp AI Customer Support & FAQ answering", icon: "🤖" },
      { id: "internal_doc_search", label: "Team knowledge base & instant document search", icon: "🔍" },
      { id: "order_processing", label: "Automated invoice reading & approval workflows", icon: "⚡" },
    ],
    defaultRecommendedProductIds: ["lark-worksuite", "freshchat-whatsapp"],
  },
};

/** Demo Persona Presets for 1-Click Judging Demos */
export interface DemoPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  answers: {
    industry: string;
    teamSize: string;
    currentTools: string[];
    bottlenecks: string;
    primaryOutcome: string;
    followUpAnswer?: string;
  };
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "sarah_catering",
    name: "Sarah's Catering (Ops Bottleneck)",
    badge: "12 Staff · F&B",
    description: "High WhatsApp volume (15 hrs/week), personal WhatsApp, struggling with manual quotes.",
    answers: {
      industry: "fnb",
      teamSize: "medium",
      currentTools: ["free_email", "whatsapp_only", "spreadsheets"],
      bottlenecks: "ops_workload",
      primaryOutcome: "save_time",
      followUpAnswer: "hours_15",
    },
  },
  {
    id: "tan_retail",
    name: "Tan Boutique (Omnichannel Retail)",
    badge: "6 Staff · Retail",
    description: "Selling on Shopee + physical boutique + WhatsApp. Fragmented stock & payment links.",
    answers: {
      industry: "retail",
      teamSize: "small",
      currentTools: ["whatsapp_only", "ecommerce_store", "spreadsheets"],
      bottlenecks: "retail_omnichannel",
      primaryOutcome: "scale_multi_channel",
      followUpAnswer: "whatsapp_plus_shopee",
    },
  },
  {
    id: "alex_agency",
    name: "Alex Consulting (B2B Lead Tracking)",
    badge: "8 Staff · Services",
    description: "Professional services firm losing track of high-value client proposals & follow-ups.",
    answers: {
      industry: "services",
      teamSize: "small",
      currentTools: ["domain_email", "basic_website", "spreadsheets"],
      bottlenecks: "lost_leads",
      primaryOutcome: "increase_revenue",
      followUpAnswer: "no_followup",
    },
  },
];
