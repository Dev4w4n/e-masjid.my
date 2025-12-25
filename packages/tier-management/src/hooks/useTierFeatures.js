import { useState, useEffect } from 'react';
import { TierService } from '../services/TierService';
/**
 * React hook for fetching tier features and comparison data
 * Supports bilingual mode (Bahasa Malaysia / English)
 *
 * @param language - Language code ('bm' | 'en')
 * @returns Tier features, comparisons, loading state, and error
 */
export const useTierFeatures = (language = 'bm') => {
    const [features, setFeatures] = useState({});
    const [comparisons, setComparisons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchTierData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // Fetch tier features (language-independent)
                const tierFeatures = TierService.getTierFeatures();
                // Fetch tier comparisons (language-dependent)
                const tierComparisons = TierService.getTierComparison(language);
                setFeatures(tierFeatures);
                setComparisons(tierComparisons);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch tier data'));
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchTierData();
    }, [language]);
    return {
        features,
        comparisons,
        isLoading,
        error,
    };
};
/**
 * React hook for fetching feature descriptions for comparison table
 *
 * @param language - Language code ('bm' | 'en')
 * @returns Feature descriptions mapped by key
 */
export const useFeatureDescriptions = (language = 'bm') => {
    const [descriptions, setDescriptions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchDescriptions = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const featureDescriptions = TierService.getFeatureDescriptions(language);
                setDescriptions(featureDescriptions);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch feature descriptions'));
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchDescriptions();
    }, [language]);
    return {
        descriptions,
        isLoading,
        error,
    };
};
//# sourceMappingURL=useTierFeatures.js.map