export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** JSON payload of the full assessment session */
export interface AssessmentPayload {
  industry: string;
  teamSize: string;
  currentTools: string[];
  primaryBottleneck: string;
  secondaryBottleneck: string | null;
  primaryOutcome: string;
  followUpAnswers: Record<string, string>;
}

/** A recommended Exabytes product with AI-generated reasoning */
export interface RecommendedProduct {
  id: string;
  name: string;
  category: string;
  whyThisFitsYou: string;
  estimatedRoiAnnual: number | null;
}

/** Row shape for the `leads` table */
export interface LeadRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string | null;
  industry: string;
  team_size: string;
  maturity_score: number;
  recommended_products: Json;
  assessment_payload: Json;
}

/** Insert shape for the `leads` table */
export interface LeadInsert {
  id?: string;
  created_at?: string;
  name: string;
  email: string;
  company?: string | null;
  industry: string;
  team_size: string;
  maturity_score: number;
  recommended_products: Json;
  assessment_payload: Json;
}

/** Update shape for the `leads` table */
export interface LeadUpdate {
  id?: string;
  created_at?: string;
  name?: string;
  email?: string;
  company?: string | null;
  industry?: string;
  team_size?: string;
  maturity_score?: number;
  recommended_products?: Json;
  assessment_payload?: Json;
}

/** Database type map consumed by Supabase JS client generic */
export type Database = {
  public: {
    Tables: {
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: LeadUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
