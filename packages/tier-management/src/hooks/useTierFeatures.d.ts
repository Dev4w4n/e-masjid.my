import { TierFeatures, TierComparison } from '../types';
/**
 * React hook for fetching tier features and comparison data
 * Supports bilingual mode (Bahasa Malaysia / English)
 *
 * @param language - Language code ('bm' | 'en')
 * @returns Tier features, comparisons, loading state, and error
 */
export declare const useTierFeatures: (language?: "bm" | "en") => {
    features: Record<string, TierFeatures>;
    comparisons: TierComparison[];
    isLoading: boolean;
    error: Error | null;
};
/**
 * React hook for fetching feature descriptions for comparison table
 *
 * @param language - Language code ('bm' | 'en')
 * @returns Feature descriptions mapped by key
 */
export declare const useFeatureDescriptions: (language?: "bm" | "en") => {
    descriptions: Record<string, string>;
    isLoading: boolean;
    error: Error | null;
};
//# sourceMappingURL=useTierFeatures.d.ts.map