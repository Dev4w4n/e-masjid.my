/**
 * Tier Package Service
 * Implements ITierPackageService from shared-types
 * Feature: 007-tv-landing-tiers
 * Path: packages/supabase-client/src/services/tier-service.ts
 */
import { ServiceError, ServiceErrorCode, DEFAULT_TIER_FEATURES, } from "@masjid-suite/shared-types";
/**
 * Static tier package data
 * In production, source from database or CMS
 */
const TIER_PACKAGES = {
    asas: {
        id: "asas",
        name_ms: "Asas",
        name_en: "Asas (Free)",
        description_ms: "Percuma, tanpa pendaftaran. Sempurna untuk masjid kecil. Paparkan waktu solat JAKIM di TV anda tanpa bayaran selamanya.",
        description_en: "Free, no sign-up required. Perfect for small mosques. Display JAKIM prayer times on your TV at no cost forever.",
        price_ms: "Percuma",
        price_en: "Free",
        max_screens: 1,
        requires_login: false,
        customization_type: "none",
        support_level: "basic",
        features: DEFAULT_TIER_FEATURES.asas,
        display_order: 1,
        is_featured: true,
    },
    maju: {
        id: "maju",
        name_ms: "Maju",
        name_en: "Maju",
        description_ms: "Perkhidmatan terurus. Kami mengendalikan pembaruan kandungan melalui WhatsApp. Ideal untuk masjid yang mahir teknologi sederhana.",
        description_en: "Managed service. We handle content updates via WhatsApp. Ideal for tech-savvy mosques with basic needs.",
        price_ms: "RM ~75/bulan",
        price_en: "~RM 75/month",
        max_screens: 1,
        requires_login: false,
        customization_type: "managed",
        support_level: "standard",
        features: DEFAULT_TIER_FEATURES.maju,
        display_order: 2,
    },
    gemilang: {
        id: "gemilang",
        name_ms: "Gemilang",
        name_en: "Gemilang",
        description_ms: "Kawalan sendiri. Papan pemuka pentadbir untuk masjid sederhana hingga besar. Berbilang skrin, tiada had.",
        description_en: "Self-service. Admin dashboard for medium to large mosques. Multiple screens, unlimited customization.",
        price_ms: "RM ~150/bulan",
        price_en: "~RM 150/month",
        max_screens: null, // unlimited
        requires_login: true,
        customization_type: "self-service",
        support_level: "priority",
        features: DEFAULT_TIER_FEATURES.gemilang,
        display_order: 3,
        is_featured: true,
    },
    istimewa: {
        id: "istimewa",
        name_ms: "Istimewa",
        name_en: "Istimewa",
        description_ms: "Perusahaan. Penyepaduan API tersuai, berbilang cawangan, sokongan khusus. Untuk organisasi besar dan kompleks.",
        description_en: "Enterprise. Custom API integration, multi-branch support, dedicated account manager. For large organizations.",
        price_ms: "Harga tersuai",
        price_en: "Custom pricing",
        max_screens: null, // unlimited
        requires_login: true,
        customization_type: "custom",
        support_level: "custom",
        features: DEFAULT_TIER_FEATURES.istimewa,
        display_order: 4,
    },
};
export class TierPackageService {
    constructor() {
        this.tierCache = new Map();
        this.tierCacheTimeout = 3600000; // 1 hour in ms
    }
    /**
     * Fetch all tier packages
     */
    async fetchAllTiers() {
        try {
            const cacheKey = "all_tiers";
            const cached = this.tierCache.get(cacheKey);
            if (cached && Array.isArray(cached)) {
                return cached;
            }
            const tiers = Object.values(TIER_PACKAGES).sort((a, b) => a.display_order - b.display_order);
            // Cache result
            this.tierCache.set(cacheKey, tiers);
            setTimeout(() => this.tierCache.delete(cacheKey), this.tierCacheTimeout);
            return tiers;
        }
        catch (error) {
            throw new ServiceError(ServiceErrorCode.SERVICE_UNAVAILABLE, `Failed to fetch tiers: ${error}`, 500, { error });
        }
    }
    /**
     * Fetch single tier by ID
     */
    async fetchTierById(tierId) {
        try {
            // Validate tierId
            if (!["asas", "maju", "gemilang", "istimewa"].includes(tierId)) {
                throw new ServiceError(ServiceErrorCode.TIER_NOT_FOUND, `Invalid tier ID: ${tierId}`, 400);
            }
            const cacheKey = `tier_${tierId}`;
            const cached = this.tierCache.get(cacheKey);
            if (cached && !Array.isArray(cached)) {
                return cached;
            }
            const tier = TIER_PACKAGES[tierId];
            if (!tier) {
                throw new ServiceError(ServiceErrorCode.TIER_NOT_FOUND, `Tier not found: ${tierId}`, 404);
            }
            // Cache result
            this.tierCache.set(cacheKey, tier);
            setTimeout(() => this.tierCache.delete(cacheKey), this.tierCacheTimeout);
            return tier;
        }
        catch (error) {
            if (error instanceof ServiceError)
                throw error;
            throw new ServiceError(ServiceErrorCode.DATABASE_ERROR, `Tier fetch error: ${error}`, 500, { error });
        }
    }
    /**
     * Fetch tiers optimized for landing page display
     */
    async fetchTiersForLanding() {
        try {
            const tiers = await this.fetchAllTiers();
            // Return tiers sorted by display_order, with featured tiers highlighted
            return tiers.sort((a, b) => {
                // Featured tiers first, then by display order
                if (a.is_featured && !b.is_featured)
                    return -1;
                if (!a.is_featured && b.is_featured)
                    return 1;
                return a.display_order - b.display_order;
            });
        }
        catch (error) {
            throw new ServiceError(ServiceErrorCode.SERVICE_UNAVAILABLE, `Failed to fetch landing page tiers: ${error}`, 500, { error });
        }
    }
    /**
     * Compare tiers on specific dimensions
     */
    async compareTiers(tierIds) {
        try {
            const tiers = await Promise.all(tierIds.map((id) => this.fetchTierById(id)));
            const comparison = new Map();
            // Define comparison dimensions
            const dimensions = [
                "price_ms",
                "price_en",
                "max_screens",
                "requires_login",
                "customization_type",
                "support_level",
            ];
            for (const dimension of dimensions) {
                const dimensionData = {};
                for (let i = 0; i < tierIds.length; i++) {
                    const tier = tiers[i];
                    const tierId = tierIds[i];
                    if (tier && tierId) {
                        dimensionData[tierId] = tier[dimension];
                    }
                }
                comparison.set(dimension, dimensionData);
            }
            return comparison;
        }
        catch (error) {
            if (error instanceof ServiceError)
                throw error;
            throw new ServiceError(ServiceErrorCode.DATABASE_ERROR, `Tier comparison error: ${error}`, 500, { error });
        }
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.tierCache.clear();
    }
}
// Export singleton instance
export const tierPackageService = new TierPackageService();
//# sourceMappingURL=tier-service.js.map