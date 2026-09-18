/**
 * Official Exabytes Products and Solutions Catalog for SolverX
 * Used as grounding knowledge for the Gemini Recommendation Engine.
 * Verified against Exabytes Malaysia (https://www.exabytes.my/) - September 2026.
 */

export interface ExabytesProduct {
  id: string;
  name: string;
  category: "email" | "hosting" | "ecommerce" | "crm" | "operations" | "security";
  tagline: string;
  description: string;
  idealFor: string;
  startingPrice: string;
  features: string[];
  productUrl: string;
  targetScenarios: string[];
}

export const EXABYTES_CATALOG: ExabytesProduct[] = [
  {
    id: "ebiz-mail-pro",
    name: "Exabytes Business Email",
    category: "email",
    tagline: "Custom Domain Email with Enterprise Anti-Spam & 99.9% Uptime",
    description: "Replace generic @gmail.com or @yahoo.com addresses with a trusted professional brand email (@yourcompany.com). Includes SpamExperts filter and seamless multi-device sync.",
    idealFor: "SMEs relying on free personal emails who need brand credibility with corporate clients.",
    startingPrice: "RM 69.30/mo (10 users)",
    features: ["Custom Domain Email", "Premium Anti-Spam Filter", "Multi-device Mobile Sync", "Webmail & Outlook Integration"],
    productUrl: "https://www.exabytes.my/email/email-hosting",
    targetScenarios: ["email_credibility"]
  },
  {
    id: "google-workspace",
    name: "Google Workspace for Business",
    category: "email",
    tagline: "Gmail, Google Drive, Docs & Meet with Localized Malaysian Support",
    description: "Official Google Workspace deployment with localized Malaysian billing, SST invoicing, and 24/7 technical support from Exabytes. Seamless cloud collaboration.",
    idealFor: "Agencies, tech-forward teams, and businesses already familiar with Google cloud tools.",
    startingPrice: "RM 12.99/user/mo",
    features: ["Custom @company.com Gmail", "30GB - 2TB Cloud Storage", "Google Meet Video", "Real-time Docs & Sheets"],
    productUrl: "https://www.exabytes.my/google-workspace",
    targetScenarios: ["email_credibility", "ops_workload"]
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365 for Business",
    category: "email",
    tagline: "Word, Excel, Outlook & Teams with 1TB OneDrive Cloud Storage",
    description: "Enterprise-standard productivity suite deployed by Exabytes with Malaysian business support and automated licensing management.",
    idealFor: "Corporate firms, accountants, and businesses requiring desktop Office apps and cloud backups.",
    startingPrice: "RM 14.99/user/mo",
    features: ["Outlook, Word, Excel, PowerPoint", "1TB Cloud Storage", "Microsoft Teams Collaboration", "Exchange Enterprise Security"],
    productUrl: "https://www.exabytes.my/microsoft-365",
    targetScenarios: ["email_credibility", "ops_workload"]
  },
  {
    id: "business-cloud-hosting",
    name: "AI Business Cloud Hosting",
    category: "hosting",
    tagline: "High-Performance NVMe SSD Hosting for Corporate & SME Websites",
    description: "Ultra-fast, scalable web hosting powered by LiteSpeed web servers and NVMe storage. Guaranteed 99.9% uptime with free SSL and automated backups.",
    idealFor: "SMEs launching or scaling their official company website with dependable traffic performance.",
    startingPrice: "RM 29.99/mo",
    features: ["LiteSpeed Web Accelerator", "Free SSL Certificate", "Daily Automated Backups", "24/7/365 Tech Support"],
    productUrl: "https://www.exabytes.my/web-hosting/business-web-hosting",
    targetScenarios: ["website_presence"]
  },
  {
    id: "managed-wordpress-hosting",
    name: "AI WordPress Hosting (WP Boost)",
    category: "hosting",
    tagline: "Optimized, High-Speed WordPress with Built-in AI & Security Shield",
    description: "Turnkey WordPress environment with automatic core updates, malware scanning, AI assistant tools, and 1-click staging environments.",
    idealFor: "Service businesses, consultants, and brands building high-converting landing pages.",
    startingPrice: "RM 21.99/mo",
    features: ["1-Click WP Staging", "Smart Auto-Updates", "Built-in CDN & Caching", "WP Vulnerability Scanner"],
    productUrl: "https://www.exabytes.my/web-hosting/wp-hosting",
    targetScenarios: ["website_presence"]
  },
  {
    id: "domain-my",
    name: ".MY Official Malaysian Domain",
    category: "hosting",
    tagline: "Verified Malaysian Business Identity & Search Ranking Advantage",
    description: "Protect your corporate brand and establish instant Malaysian consumer trust with an official national top-level domain registered through Exabytes.",
    idealFor: "Malaysian registered businesses, sole proprietorships, and regional brands targeting local buyers.",
    startingPrice: "RM 7.99 1st year promo",
    features: ["Official .MY Registrar", "Free DNS Management", "Domain Theft Protection", "Instant Activation"],
    productUrl: "https://www.exabytes.my/domains/mydomain",
    targetScenarios: ["email_credibility", "website_presence"]
  },
  {
    id: "easystore-ecommerce",
    name: "Exabytes Commerce / Managed E-Commerce",
    category: "ecommerce",
    tagline: "Unified Multi-Channel Selling: Webstore, Shopee, Lazada & Social Commerce",
    description: "Centralize inventory, payment gateways, and order management across your own online store, marketplaces, and WhatsApp/social commerce channels.",
    idealFor: "Retailers and consumer brands managing fragmented orders across multiple platforms.",
    startingPrice: "Contact Sales / Custom Setup",
    features: ["Multi-Channel Inventory Sync", "Integrated Payment Gateways (FPX)", "Automated Order Tracking", "WhatsApp Order Capture"],
    productUrl: "https://www.exabytes.my/commerce",
    targetScenarios: ["retail_omnichannel"]
  },
  {
    id: "freshsales-crm",
    name: "Freshsales CRM by Exabytes",
    category: "crm",
    tagline: "AI-Powered CRM for Lead Tracking & Deal Pipeline Visibility",
    description: "Track customer leads from initial WhatsApp touch to closed contract. Prevent lost deals, automate follow-up reminders, and gain visibility into sales performance.",
    idealFor: "B2B SMEs, agencies, and high-ticket service businesses losing track of client inquiries.",
    startingPrice: "RM 44.00/agent/mo",
    features: ["Visual Deal Pipeline", "Automated Lead Scoring", "Email & Activity Log", "Custom Sales Performance Reports"],
    productUrl: "https://www.exabytes.my/freshworks/freshsales-crm",
    targetScenarios: ["lead_tracking"]
  },
  {
    id: "freshchat-whatsapp",
    name: "Freshchat (WhatsApp Live Chat & Bot)",
    category: "operations",
    tagline: "Official WhatsApp Multi-Agent Shared Inbox & 24/7 AI Bot",
    description: "Connect multiple customer support agents to a single verified WhatsApp Business number with automated FAQs, bot workflows, and enquiry routing.",
    idealFor: "Catering, clinics, retail, and hospitality receiving high volumes of WhatsApp inquiries.",
    startingPrice: "RM 141.00/agent/mo",
    features: ["Official WhatsApp Business API", "Multi-Agent Shared Inbox", "Automated FAQ Bot", "Customer Intent Routing"],
    productUrl: "https://www.exabytes.my/freshworks/live-chat",
    targetScenarios: ["ops_workload", "lead_tracking"]
  },
  {
    id: "freshdesk",
    name: "Freshdesk Customer Support Helpdesk",
    category: "operations",
    tagline: "Centralized Ticket Management & Service Level Agreements (SLA)",
    description: "Convert customer emails, phone calls, and chats into trackable support tickets to ensure zero unresolved customer complaints.",
    idealFor: "Growing SMEs with increasing support ticket volume and post-sale service inquiries.",
    startingPrice: "RM 141.00/agent/mo",
    features: ["Omnichannel Ticket Inbox", "Automated Ticket Dispatch", "SLA Resolution Tracking", "Customer Satisfaction (CSAT)"],
    productUrl: "https://www.exabytes.my/freshworks/helpdesk",
    targetScenarios: ["ops_workload"]
  },
  {
    id: "lark-worksuite",
    name: "Lark WorkSuite (Exabytes Enterprise Partner)",
    category: "operations",
    tagline: "All-in-One Collaboration: Chat, Video Meetings, Docs & Automated Approval Flows",
    description: "Replace messy WhatsApp work groups, scattered spreadsheets, and email chains with an enterprise collaboration hub featuring automated approval flows and Base database.",
    idealFor: "Growing teams (5-100+ staff) bogged down by manual approvals and internal operational friction.",
    startingPrice: "RM 55.95/user/mo",
    features: ["Enterprise Team Chat", "No-code Workflow Builder (Base)", "1080p Video Meetings", "Automated Attendance & Leave"],
    productUrl: "https://www.exabytes.my/lark",
    targetScenarios: ["ops_workload", "ai_readiness"]
  },
  {
    id: "acronis-cyber-protect",
    name: "Acronis Cyber Protect Cloud",
    category: "security",
    tagline: "Ransomware Defense, Disaster Recovery & Automated Cloud Backup",
    description: "Complete cybersecurity suite combining endpoint protection, AI anti-ransomware, and automated cloud backup for business laptops, servers, and Microsoft 365 data.",
    idealFor: "Companies with valuable financial records, client databases, and proprietary business documents.",
    startingPrice: "RM 24.24/device/mo",
    features: ["AI Anti-Ransomware Defense", "Continuous Cloud Backup", "One-Click System Rollback", "Zero-Downtime Data Recovery"],
    productUrl: "https://www.exabytes.my/acronis/cyber-protect",
    targetScenarios: ["cybersecurity"]
  },
  {
    id: "enterprise-ssl-security",
    name: "Exabytes SSL Certificate & Web Shield",
    category: "security",
    tagline: "256-bit Encryption, Trust Seal & Google Search Shield",
    description: "Establish customer trust, boost Google search rankings, and protect client payment data with an authenticated SSL certificate and vulnerability shield.",
    idealFor: "E-commerce websites, portals, and service firms processing sensitive client submissions.",
    startingPrice: "RM 13.25/mo",
    features: ["256-bit Strong Encryption", "Dynamic Site Trust Seal", "High Warranty Protection", "PCI-DSS Compliance Support"],
    productUrl: "https://www.exabytes.my/web-security/ssl",
    targetScenarios: ["cybersecurity", "website_presence"]
  },
  {
    id: "sucuri-security",
    name: "Sucuri Website Security & Antivirus",
    category: "security",
    tagline: "Complete Website Firewall, Malware Cleanup & Continuous Blacklist Monitoring",
    description: "Enterprise website security platform that shields web applications against DDoS, brute force attacks, and malware injection with guaranteed cleanup assistance.",
    idealFor: "Businesses whose websites have been previously flagged by Google or attacked by malicious bots.",
    startingPrice: "RM 99.00/mo",
    features: ["Web Application Firewall (WAF)", "Guaranteed Malware Removal", "DDoS Mitigation", "Continuous Blacklist Monitoring"],
    productUrl: "https://www.exabytes.my/web-security/sucuri-website-security",
    targetScenarios: ["cybersecurity", "website_presence"]
  },
  {
    id: "nvme-vps",
    name: "Exabytes NVMe Cloud VPS",
    category: "hosting",
    tagline: "Dedicated Virtual Cloud Server with Ultra-Fast NVMe Storage",
    description: "High-performance virtual private server with root access, dedicated compute resources, and high IOPS NVMe SSDs for custom applications and high-traffic databases.",
    idealFor: "Software developers, fast-growing digital agencies, and SMEs hosting custom ERP/CRM software.",
    startingPrice: "RM 60.00/mo",
    features: ["High-Speed NVMe Storage", "Dedicated CPU & RAM", "Full Root Access", "99.9% Network SLA"],
    productUrl: "https://www.exabytes.my/servers/nvme-vps",
    targetScenarios: ["website_presence"]
  },
  {
    id: "ai-website-builder",
    name: "Exabytes AI Website Builder",
    category: "hosting",
    tagline: "Launch a Professional Business Website in Under 10 Minutes — Zero Coding Required",
    description: "Malaysia's fastest AI-powered website builder for SMEs. Answer a few prompts, and the AI generates a complete, mobile-optimised company website with built-in SEO, booking forms, and WhatsApp integration — ready to publish instantly.",
    idealFor: "Non-technical SME owners who need a professional web presence fast without hiring a web developer.",
    startingPrice: "RM 9.99/mo",
    features: ["AI-Generated Website Layout", "Mobile-Responsive Design", "Built-in SEO Optimizer", "WhatsApp & Booking Integration", "Free .my Domain (1st Year)", "SSL Certificate Included"],
    productUrl: "https://www.exabytes.my/website-builder",
    targetScenarios: ["website_presence"]
  }
];

