import { useState, useEffect } from "react";
import { TierService } from "../services/TierService";
import { TierFeatures, TierComparison } from "../types";

/**
 * React hook for fetching tier features and comparison data
 * Supports bilingual mode (Bahasa Malaysia / English)
 *
 * @param language - Language code ('bm' | 'en')
 * @returns Tier features, comparisons, loading state, and error
 */
export const useTierFeatures = (language: "bm" | "en" = "bm") => {
  const [features, setFeatures] = useState<Record<string, TierFeatures>>({});
  const [comparisons, setComparisons] = useState<TierComparison[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

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
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch tier data")
        );
      } finally {
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
export const useFeatureDescriptions = (language: "bm" | "en" = "bm") => {
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDescriptions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const featureDescriptions =
          TierService.getFeatureDescriptions(language);
        setDescriptions(featureDescriptions);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch feature descriptions")
        );
      } finally {
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
