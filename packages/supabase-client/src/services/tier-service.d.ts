/**
 * Tier Package Service
 * Implements ITierPackageService from shared-types
 * Feature: 007-tv-landing-tiers
 * Path: packages/supabase-client/src/services/tier-service.ts
 */
import { TierId, TierPackage, ITierPackageService } from "@masjid-suite/shared-types";
export declare class TierPackageService implements ITierPackageService {
    private tierCache;
    private tierCacheTimeout;
    /**
     * Fetch all tier packages
     */
    fetchAllTiers(): Promise<TierPackage[]>;
    /**
     * Fetch single tier by ID
     */
    fetchTierById(tierId: TierId): Promise<TierPackage | null>;
    /**
     * Fetch tiers optimized for landing page display
     */
    fetchTiersForLanding(): Promise<TierPackage[]>;
    /**
     * Compare tiers on specific dimensions
     */
    compareTiers(tierIds: TierId[]): Promise<Map<string, Record<TierId, unknown>>>;
    /**
     * Clear cache
     */
    clearCache(): void;
}
export declare const tierPackageService: TierPackageService;
//# sourceMappingURL=tier-service.d.ts.map