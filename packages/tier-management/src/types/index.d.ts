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
export type Tier = 'rakyat' | 'pro' | 'premium';
/**
 * Tier features configuration
 */
export interface TierFeatures {
    max_tv_displays: number;
    max_content_items: number;
    content_approval_required: boolean;
    custom_branding: boolean;
    custom_domain: boolean;
    white_label: boolean;
    api_access: boolean;
    webhook_notifications: boolean;
    dedicated_database: boolean;
    priority_support: boolean;
    local_admin_support: boolean;
    onboarding_assistance: boolean;
    advanced_analytics: boolean;
    export_capabilities: boolean;
    retention_days: number;
}
/**
 * Tier pricing information
 */
export interface TierPricing {
    tier: Tier;
    monthly_price: number;
    yearly_price: number;
    currency: string;
    includes_local_admin: boolean;
    local_admin_share: number | null;
    platform_share: number | null;
}
/**
 * Complete tier configuration
 */
export interface TierConfig {
    name: Tier;
    display_name: string;
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
    billing_cycle: 'monthly' | 'yearly';
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
    approaching_limit: boolean;
    at_limit: boolean;
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
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly?: number;
    recommended?: boolean;
}
//# sourceMappingURL=index.d.ts.map