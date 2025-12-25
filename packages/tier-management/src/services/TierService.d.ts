/**
 * Tier Service
 * Feature: 007-multi-tenant-saas
 * Tasks: T031-T032 (User Story 1)
 *
 * Handles tier feature access checks and tier comparisons
 */
import type { TierFeatures, Tier, TierComparison } from "../types";
export declare class TierService {
    /**
     * Get feature matrix for all tiers
     * Task: T031
     */
    static getTierFeatures(): Record<Tier, TierFeatures>;
    /**
     * Get tier comparison with bilingual descriptions
     * Task: T032
     */
    static getTierComparison(language?: "en" | "bm"): TierComparison[];
    /**
     * Get feature descriptions for comparison table
     */
    static getFeatureDescriptions(language?: "en" | "bm"): Record<string, string>;
    /**
     * Check if a feature is available for a tier
     */
    static hasFeature(tier: Tier, feature: keyof TierFeatures): boolean;
    /**
     * Check if tier usage is within limits
     */
    static checkLimit(tier: Tier, feature: keyof TierFeatures, currentValue: number): {
        allowed: boolean;
        limit: number;
        usage: number;
        percentage: number;
    };
    /**
     * Get recommended tier based on usage patterns
     */
    static getRecommendedTier(usage: {
        tv_displays: number;
        content_items: number;
        needs_api: boolean;
        needs_custom_branding: boolean;
        needs_local_admin: boolean;
    }): Tier;
}
//# sourceMappingURL=TierService.d.ts.map