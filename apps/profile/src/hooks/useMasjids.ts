import { useState, useEffect } from "react";
import { supabase } from "@masjid-suite/supabase-client";

// Interface for masjid dropdown data
interface MasjidOption {
  id: string;
  name: string;
  address: any; // JSON field
}

interface UseMasjidsReturn {
  masjids: MasjidOption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch active masjids for dropdown selections
 */
export function useMasjids(): UseMasjidsReturn {
  const [masjids, setMasjids] = useState<MasjidOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMasjids = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("masjids")
        .select("id, name, address")
        .eq("status", "active")
        .order("name");

      if (fetchError) {
        throw fetchError;
      }

      setMasjids(data || []);
    } catch (err) {
      console.error("Error fetching masjids:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch masjids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasjids();
  }, []);

  return {
    masjids,
    loading,
    error,
    refetch: fetchMasjids,
  };
}
