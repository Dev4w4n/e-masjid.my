import { useState, useEffect } from "react";
import { profileService } from "@masjid-suite/supabase-client";
import { useProfile } from "@masjid-suite/auth";
import type { Database } from "@masjid-suite/shared-types";

type ProfileAddress = Database["public"]["Tables"]["profile_addresses"]["Row"];
type ProfileAddressInsert =
  Database["public"]["Tables"]["profile_addresses"]["Insert"];
type ProfileAddressUpdate =
  Database["public"]["Tables"]["profile_addresses"]["Update"];

/**
 * Hook for managing user addresses
 */
export function useAddresses() {
  const { profile } = useProfile();
  const [addresses, setAddresses] = useState<ProfileAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load addresses when profile is available
  useEffect(() => {
    if (profile?.id) {
      loadAddresses();
    }
  }, [profile?.id]);

  const loadAddresses = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfileAddresses(profile.id);
      setAddresses(data);
    } catch (err) {
      console.error("Failed to load addresses:", err);
      setError(err instanceof Error ? err.message : "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (
    addressData: Omit<ProfileAddressInsert, "profile_id">
  ) => {
    if (!profile?.id) {
      throw new Error("No profile available");
    }

    try {
      setLoading(true);
      setError(null);

      const newAddress = await profileService.addProfileAddress({
        ...addressData,
        profile_id: profile.id,
      });

      setAddresses((prev) => [...prev, newAddress]);
      return newAddress;
    } catch (err) {
      console.error("Failed to add address:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add address";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (
    addressId: string,
    updates: ProfileAddressUpdate
  ) => {
    try {
      setLoading(true);
      setError(null);

      const updatedAddress = await profileService.updateProfileAddress(
        addressId,
        updates
      );

      setAddresses((prev) =>
        prev.map((addr) => (addr.id === addressId ? updatedAddress : addr))
      );

      return updatedAddress;
    } catch (err) {
      console.error("Failed to update address:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update address";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      setLoading(true);
      setError(null);

      await profileService.deleteProfileAddress(addressId);

      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
    } catch (err) {
      console.error("Failed to delete address:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete address";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryAddress = async (addressId: string) => {
    if (!profile?.id) {
      throw new Error("No profile available");
    }

    try {
      setLoading(true);
      setError(null);

      await profileService.setPrimaryAddress(profile.id, addressId);

      // Update local state to reflect the change
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          is_primary: addr.id === addressId,
        }))
      );
    } catch (err) {
      console.error("Failed to set primary address:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to set primary address";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const primaryAddress = addresses.find((addr) => addr.is_primary);
  const nonPrimaryAddresses = addresses.filter((addr) => !addr.is_primary);

  return {
    addresses,
    primaryAddress,
    nonPrimaryAddresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setPrimaryAddress,
    refreshAddresses: loadAddresses,
  };
}
