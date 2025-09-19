import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAddresses } from "../hooks/useAddresses";
import { profileService } from "@masjid-suite/supabase-client";

// Mock the dependencies
vi.mock("@masjid-suite/auth", () => ({
  useProfile: () => ({
    profile: {
      id: "test-profile-id",
      user_id: "test-user-id",
      full_name: "Test User",
      phone_number: "+60123456789",
      preferred_language: "en",
      is_complete: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  }),
}));

vi.mock("@masjid-suite/supabase-client", () => ({
  profileService: {
    getProfileAddresses: vi.fn(),
    addProfileAddress: vi.fn(),
    updateProfileAddress: vi.fn(),
    deleteProfileAddress: vi.fn(),
    setPrimaryAddress: vi.fn(),
  },
}));

describe("useAddresses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load addresses on mount", async () => {
    const mockAddresses = [
      {
        id: "addr-1",
        profile_id: "test-profile-id",
        address_line_1: "123 Test Street",
        address_line_2: null,
        city: "Kuala Lumpur",
        state: "Kuala Lumpur" as const,
        postcode: "50000",
        country: "MYS",
        address_type: "home" as const,
        is_primary: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    (profileService.getProfileAddresses as any).mockResolvedValue(
      mockAddresses
    );

    const { result } = renderHook(() => useAddresses());

    await waitFor(() => {
      expect(result.current.addresses).toEqual(mockAddresses);
      expect(result.current.loading).toBe(false);
    });

    expect(profileService.getProfileAddresses).toHaveBeenCalledWith(
      "test-profile-id"
    );
  });

  it("should add a new address", async () => {
    const newAddress = {
      id: "addr-2",
      profile_id: "test-profile-id",
      address_line_1: "456 New Street",
      address_line_2: "Unit 12",
      city: "Shah Alam",
      state: "Selangor" as const,
      postcode: "40000",
      country: "MYS",
      address_type: "work" as const,
      is_primary: false,
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
    };

    (profileService.getProfileAddresses as any).mockResolvedValue([]);
    (profileService.addProfileAddress as any).mockResolvedValue(newAddress);

    const { result } = renderHook(() => useAddresses());

    await act(async () => {
      await result.current.addAddress({
        address_line_1: "456 New Street",
        address_line_2: "Unit 12",
        city: "Shah Alam",
        state: "Selangor",
        postcode: "40000",
        address_type: "work",
        country: "MYS",
        is_primary: false,
      });
    });

    expect(profileService.addProfileAddress).toHaveBeenCalledWith({
      profile_id: "test-profile-id",
      address_line_1: "456 New Street",
      address_line_2: "Unit 12",
      city: "Shah Alam",
      state: "Selangor",
      postcode: "40000",
      address_type: "work",
      country: "MYS",
      is_primary: false,
    });

    expect(result.current.addresses).toContain(newAddress);
  });

  it("should delete an address", async () => {
    const initialAddresses = [
      {
        id: "addr-1",
        profile_id: "test-profile-id",
        address_line_1: "123 Test Street",
        address_line_2: null,
        city: "Kuala Lumpur",
        state: "Kuala Lumpur" as const,
        postcode: "50000",
        country: "MYS",
        address_type: "home" as const,
        is_primary: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    (profileService.getProfileAddresses as any).mockResolvedValue(
      initialAddresses
    );
    (profileService.deleteProfileAddress as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddresses());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.addresses).toEqual(initialAddresses);
    });

    await act(async () => {
      await result.current.deleteAddress("addr-1");
    });

    expect(profileService.deleteProfileAddress).toHaveBeenCalledWith("addr-1");
    expect(result.current.addresses).toHaveLength(0);
  });

  it("should set primary address", async () => {
    const addresses = [
      {
        id: "addr-1",
        profile_id: "test-profile-id",
        address_line_1: "123 Test Street",
        address_line_2: null,
        city: "Kuala Lumpur",
        state: "Kuala Lumpur" as const,
        postcode: "50000",
        country: "MYS",
        address_type: "home" as const,
        is_primary: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "addr-2",
        profile_id: "test-profile-id",
        address_line_1: "456 Work Street",
        address_line_2: null,
        city: "Shah Alam",
        state: "Selangor" as const,
        postcode: "40000",
        country: "MYS",
        address_type: "work" as const,
        is_primary: false,
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ];

    (profileService.getProfileAddresses as any).mockResolvedValue(addresses);
    (profileService.setPrimaryAddress as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddresses());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.addresses).toEqual(addresses);
    });

    await act(async () => {
      await result.current.setPrimaryAddress("addr-2");
    });

    expect(profileService.setPrimaryAddress).toHaveBeenCalledWith(
      "test-profile-id",
      "addr-2"
    );

    // Check that the addresses were updated locally
    const updatedAddresses = result.current.addresses;
    expect(updatedAddresses.find((a) => a.id === "addr-1")?.is_primary).toBe(
      false
    );
    expect(updatedAddresses.find((a) => a.id === "addr-2")?.is_primary).toBe(
      true
    );
  });

  it("should handle errors properly", async () => {
    (profileService.getProfileAddresses as any).mockRejectedValue(
      new Error("Failed to load addresses")
    );

    const { result } = renderHook(() => useAddresses());

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to load addresses");
      expect(result.current.loading).toBe(false);
    });
  });
});
