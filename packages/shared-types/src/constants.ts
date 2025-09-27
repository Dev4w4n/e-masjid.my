import { z } from "zod";

/**
 * JAKIM API zone information
 * Reference data for validating jakim_zone_id
 */
export interface JakimZone {
  /** Zone identifier (e.g., "WLY01") */
  id: string;

  /** Zone name in Bahasa Malaysia */
  name: string;

  /** State or region */
  state: string;

  /** Whether zone is currently active in JAKIM API */
  is_active: boolean;
}

/**
 * Commonly used JAKIM zones for validation
 */
export const JAKIM_ZONES: readonly JakimZone[] = [
  {
    id: "WLY01",
    name: "Kuala Lumpur",
    state: "Wilayah Persekutuan",
    is_active: true,
  },
  {
    id: "WLY02",
    name: "Putrajaya",
    state: "Wilayah Persekutuan",
    is_active: true,
  },
  {
    id: "WLY03",
    name: "Labuan",
    state: "Wilayah Persekutuan",
    is_active: true,
  },
  {
    id: "JHR01",
    name: "Pulau Aur dan Pemanggil",
    state: "Johor",
    is_active: true,
  },
  { id: "JHR02", name: "Johor Bahru", state: "Johor", is_active: true },
  { id: "JHR03", name: "Kluang", state: "Johor", is_active: true },
  { id: "JHR04", name: "Mersing", state: "Johor", is_active: true },
  { id: "KDH01", name: "Kota Setar", state: "Kedah", is_active: true },
  { id: "KDH02", name: "Kuala Muda", state: "Kedah", is_active: true },
  { id: "KDH03", name: "Padang Terap", state: "Kedah", is_active: true },
  { id: "KDH04", name: "Langkawi", state: "Kedah", is_active: true },
  { id: "KTN01", name: "Kota Bharu", state: "Kelantan", is_active: true },
  { id: "KTN03", name: "Tanah Merah", state: "Kelantan", is_active: true },
  { id: "MLK01", name: "Bandar Melaka", state: "Melaka", is_active: true },
  { id: "NGS01", name: "Jelebu", state: "Negeri Sembilan", is_active: true },
  {
    id: "NGS02",
    name: "Kuala Pilah",
    state: "Negeri Sembilan",
    is_active: true,
  },
  { id: "PHG01", name: "Kuantan", state: "Pahang", is_active: true },
  { id: "PHG02", name: "Pekan", state: "Pahang", is_active: true },
  { id: "PHG03", name: "Maran", state: "Pahang", is_active: true },
  { id: "PRK01", name: "Ipoh", state: "Perak", is_active: true },
  { id: "PRK02", name: "Kuala Kangsar", state: "Perak", is_active: true },
  { id: "PRK03", name: "Pengkalan Hulu", state: "Perak", is_active: true },
  { id: "PLS01", name: "Kangar", state: "Perlis", is_active: true },
  {
    id: "PNG01",
    name: "Timur Laut Pulau Pinang",
    state: "Pulau Pinang",
    is_active: true,
  },
  {
    id: "PNG02",
    name: "Seberang Perai",
    state: "Pulau Pinang",
    is_active: true,
  },
  { id: "SBH01", name: "Kota Kinabalu", state: "Sabah", is_active: true },
  { id: "SBH02", name: "Kudat", state: "Sabah", is_active: true },
  { id: "SBH03", name: "Sandakan", state: "Sabah", is_active: true },
  { id: "SBH04", name: "Tawau", state: "Sabah", is_active: true },
  { id: "SWK01", name: "Kuching", state: "Sarawak", is_active: true },
  { id: "SWK02", name: "Sri Aman", state: "Sarawak", is_active: true },
  { id: "SWK03", name: "Sibu", state: "Sarawak", is_active: true },
  { id: "SWK04", name: "Bintulu", state: "Sarawak", is_active: true },
  { id: "SWK05", name: "Miri", state: "Sarawak", is_active: true },
  { id: "SGR01", name: "Gombak", state: "Selangor", is_active: true },
  { id: "SGR02", name: "Klang", state: "Selangor", is_active: true },
  { id: "SGR03", name: "Kuala Selangor", state: "Selangor", is_active: true },
  {
    id: "TRG01",
    name: "Kuala Terengganu",
    state: "Terengganu",
    is_active: true,
  },
  { id: "TRG02", name: "Besut", state: "Terengganu", is_active: true },
  { id: "TRG03", name: "Dungun", state: "Terengganu", is_active: true },
  { id: "TRG04", name: "Kemaman", state: "Terengganu", is_active: true },
] as const;

export const SUPPORTED_TIMEZONES: readonly string[] = [
  "Asia/Kuala_Lumpur",
  "Asia/Kuching", // For East Malaysia
] as const;

export const malaysianStates = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Malacca",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "Kuala Lumpur",
  "Labuan",
  "Putrajaya",
] as const;

export const prayerTimeSources = [
  { value: "manual", label: "Manual Input" },
  { value: "jakim", label: "JAKIM e-Solat" },
  { value: "auto", label: "Automatic (Future)" },
];

export const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending_verification", label: "Pending Verification" },
];

export const jakimZones = JAKIM_ZONES.map((zone) => ({
  value: zone.id,
  label: `${zone.id} - ${zone.name}`,
  state: zone.state,
}));
