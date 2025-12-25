/**
 * Tier Type Definitions
 * Feature: 007-multi-tenant-saas
 * Task: T024
 *
 * Type definitions for tier management and feature access control
 */

/**
 * Available subscription tiers
 */
export type Tier = "rakyat" | "pro" | "premium";

/**
 * Tier features configuration
 */
export interface TierFeatures {
  // Display Management
  max_tv_displays: number; // Rakyat: 1, Pro: 5, Premium: unlimited (-1)
  max_content_items: number; // Rakyat: 10, Pro: 50, Premium: unlimited (-1)
  content_approval_required: boolean; // Rakyat: true, Pro: false, Premium: false

  // Branding & Customization
  custom_branding: boolean; // Rakyat: false, Pro: false, Premium: true
  custom_domain: boolean; // Rakyat: false, Pro: false, Premium: true
  white_label: boolean; // Rakyat: false, Pro: false, Premium: true

  // Technical Features
  api_access: boolean; // Rakyat: false, Pro: true, Premium: true
  webhook_notifications: boolean; // Rakyat: false, Pro: true, Premium: true
  dedicated_database: boolean; // Rakyat: false, Pro: false, Premium: true

  // Support & Services
  priority_support: boolean; // Rakyat: false, Pro: false, Premium: true
  local_admin_support: boolean; // Rakyat: false, Pro: false, Premium: true
  onboarding_assistance: boolean; // Rakyat: false, Pro: false, Premium: true

  // Data & Analytics
  advanced_analytics: boolean; // Rakyat: false, Pro: true, Premium: true
  export_capabilities: boolean; // Rakyat: false, Pro: true, Premium: true
  retention_days: number; // Rakyat: 30, Pro: 90, Premium: 365
}

/**
 * Tier pricing information
 */
export interface TierPricing {
  tier: Tier;
  monthly_price: number; // RM 0 for Rakyat, 30 for Pro, 300-500 for Premium
  yearly_price: number; // Annual pricing with discount
  currency: string; // 'MYR'
  includes_local_admin: boolean; // false for Rakyat/Pro, true for Premium
  local_admin_share: number | null; // null for Rakyat/Pro, 150 for Premium
  platform_share: number | null; // null for Rakyat/Pro, 150-350 for Premium
}

/**
 * Complete tier configuration
 */
export interface TierConfig {
  name: Tier;
  display_name: string; // 'Rakyat', 'Pro', 'Premium'
  description: string;
  features: TierFeatures;
  pricing: TierPricing;
  recommended_for: string;
}

/**
 * Request to check feature access for a masjid
 */
export interface CheckFeatureAccessRequest {
  masjid_id: string;
  feature_key: keyof TierFeatures;
}

/**
 * Response after checking feature access
 */
export interface CheckFeatureAccessResponse {
  has_access: boolean;
  tier: Tier;
  feature_value: boolean | number;
  upgrade_required: boolean;
  recommended_tier?: Tier;
  message?: string;
}

/**
 * Request to upgrade/downgrade tier
 */
export interface ChangeTierRequest {
  masjid_id: string;
  new_tier: Tier;
  billing_cycle: "monthly" | "yearly";
  reason?: string;
}

/**
 * Response after tier change
 */
export interface ChangeTierResponse {
  success: boolean;
  subscription_id: string;
  new_tier: Tier;
  effective_date: string;
  message: string;
}

/**
 * Usage statistics for tier limits
 */
export interface TierUsageStats {
  masjid_id: string;
  tier: Tier;
  current_tv_displays: number;
  max_tv_displays: number;
  current_content_items: number;
  max_content_items: number;
  usage_percentage: number;
  approaching_limit: boolean; // true if usage > 80%
  at_limit: boolean; // true if usage >= 100%
}

/**
 * Feature comparison with bilingual descriptions
 */
export interface FeatureDescription {
  key: keyof TierFeatures;
  name_en: string;
  name_bm: string;
  description_en: string;
  description_bm: string;
  category: "display" | "branding" | "technical" | "support" | "analytics";
}

/**
 * Tier comparison data structure for comparison table
 */
export interface TierComparison {
  tier: Tier;
  name: string; // Bilingual name (same in BM/EN for "Rakyat", "Pro", "Premium")
  description: string; // Bilingual description
  priceMonthly: number; // Monthly price
  priceYearly?: number; // Annual price (optional)
  recommended?: boolean; // Highlight as recommended
}
