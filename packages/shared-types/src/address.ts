// Malaysian address formatting and utilities

import type { MalaysianState, ProfileAddress } from "./types.js";
import type { MasjidAddress } from "./masjid.js";

// State mapping for different formats
export const STATE_MAPPING: Record<string, MalaysianState> = {
  "WP Kuala Lumpur": "Kuala Lumpur",
  "WP Labuan": "Labuan",
  "WP Putrajaya": "Putrajaya",
  "Pulau Pinang": "Penang",
  Melaka: "Malacca",
  N9: "Negeri Sembilan",
  "Negeri 9": "Negeri Sembilan",
};

// Normalize state name to match enum
export function normalizeStateName(state: string): MalaysianState | null {
  // Direct match
  if (Object.values(STATE_MAPPING).includes(state as MalaysianState)) {
    return state as MalaysianState;
  }

  // Check mapping
  if (STATE_MAPPING[state]) {
    return STATE_MAPPING[state];
  }

  // Case-insensitive search
  const normalized = state.toLowerCase();
  for (const [key, value] of Object.entries(STATE_MAPPING)) {
    if (key.toLowerCase() === normalized) {
      return value;
    }
  }

  // Check against valid states (case-insensitive)
  const validStates: MalaysianState[] = [
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
  ];

  for (const validState of validStates) {
    if (validState.toLowerCase() === normalized) {
      return validState;
    }
  }

  return null;
}

// Format address for display
export function formatAddress(address: ProfileAddress | MasjidAddress): string {
  const parts: string[] = [];

  if ("address_line_1" in address) {
    parts.push(address.address_line_1);
  }

  if ("address_line_2" in address && address.address_line_2) {
    parts.push(address.address_line_2);
  }

  if ("city" in address) {
    parts.push(address.city);
  }

  if ("postcode" in address && "state" in address) {
    parts.push(`${address.postcode} ${address.state}`);
  }

  return parts.join(", ");
}

// Format address for single line display
export function formatAddressSingleLine(
  address: ProfileAddress | MasjidAddress
): string {
  return formatAddress(address);
}

// Format address for multi-line display
export function formatAddressMultiLine(
  address: ProfileAddress | MasjidAddress
): string[] {
  const lines: string[] = [];

  if ("address_line_1" in address) {
    lines.push(address.address_line_1);
  }

  if ("address_line_2" in address && address.address_line_2) {
    lines.push(address.address_line_2);
  }

  if ("city" in address) {
    lines.push(address.city);
  }

  if ("postcode" in address && "state" in address) {
    lines.push(`${address.postcode} ${address.state}`);
  }

  return lines;
}

// Get state abbreviation for display
export function getStateAbbreviation(state: MalaysianState): string {
  const abbreviations: Record<MalaysianState, string> = {
    Johor: "JHR",
    Kedah: "KDH",
    Kelantan: "KTN",
    Malacca: "MLK",
    "Negeri Sembilan": "NS",
    Pahang: "PHG",
    Penang: "PNG",
    Perak: "PRK",
    Perlis: "PLS",
    Sabah: "SBH",
    Sarawak: "SWK",
    Selangor: "SGR",
    Terengganu: "TRG",
    "Kuala Lumpur": "KL",
    Labuan: "LBN",
    Putrajaya: "PJY",
  };

  return abbreviations[state] || state;
}

// Postal code to state mapping (major cities only)
export const POSTCODE_TO_STATE: Record<string, MalaysianState> = {
  // Kuala Lumpur
  "50": "Kuala Lumpur",
  "51": "Kuala Lumpur",
  "52": "Kuala Lumpur",
  "53": "Kuala Lumpur",
  "54": "Kuala Lumpur",
  "55": "Kuala Lumpur",
  "56": "Kuala Lumpur",
  "57": "Kuala Lumpur",
  "58": "Kuala Lumpur",
  "59": "Kuala Lumpur",

  // Selangor
  "40": "Selangor",
  "41": "Selangor",
  "42": "Selangor",
  "43": "Selangor",
  "44": "Selangor",
  "45": "Selangor",
  "46": "Selangor",
  "47": "Selangor",
  "48": "Selangor",

  // Penang
  "10": "Penang",
  "11": "Penang",
  "12": "Penang",
  "13": "Penang",
  "14": "Penang",

  // Johor
  "79": "Johor",
  "80": "Johor",
  "81": "Johor",
  "82": "Johor",
  "83": "Johor",
  "84": "Johor",
  "85": "Johor",
  "86": "Johor",

  // Sabah
  "88": "Sabah",
  "89": "Sabah",
  "90": "Sabah",
  "91": "Sabah",

  // Sarawak
  "93": "Sarawak",
  "94": "Sarawak",
  "95": "Sarawak",
  "96": "Sarawak",
  "97": "Sarawak",
  "98": "Sarawak",
};

// Guess state from postal code
export function guessStateFromPostcode(
  postcode: string
): MalaysianState | null {
  if (postcode.length !== 5) {
    return null;
  }

  const prefix = postcode.substring(0, 2);
  return POSTCODE_TO_STATE[prefix] || null;
}

// Validate postal code against state
export function isPostcodeValidForState(
  postcode: string,
  state: MalaysianState
): boolean {
  const guessedState = guessStateFromPostcode(postcode);

  if (!guessedState) {
    // If we can't guess, assume it's valid (manual verification needed)
    return true;
  }

  return guessedState === state;
}

// Get major cities for each state
export const STATE_CITIES: Record<MalaysianState, string[]> = {
  Johor: [
    "Johor Bahru",
    "Muar",
    "Batu Pahat",
    "Kluang",
    "Pontian",
    "Segamat",
    "Kulai",
  ],
  Kedah: ["Alor Setar", "Sungai Petani", "Kulim", "Langkawi", "Pendang"],
  Kelantan: [
    "Kota Bharu",
    "Kuala Krai",
    "Tanah Merah",
    "Machang",
    "Gua Musang",
  ],
  Malacca: ["Malacca City", "Ayer Keroh", "Jasin", "Masjid Tanah"],
  "Negeri Sembilan": [
    "Seremban",
    "Port Dickson",
    "Nilai",
    "Rembau",
    "Kuala Pilah",
  ],
  Pahang: ["Kuantan", "Temerloh", "Bentong", "Raub", "Pekan", "Jerantut"],
  Penang: [
    "George Town",
    "Butterworth",
    "Bukit Mertajam",
    "Nibong Tebal",
    "Balik Pulau",
  ],
  Perak: [
    "Ipoh",
    "Taiping",
    "Sitiawan",
    "Kuala Kangsar",
    "Teluk Intan",
    "Parit Buntar",
  ],
  Perlis: ["Kangar", "Arau", "Padang Besar"],
  Sabah: [
    "Kota Kinabalu",
    "Sandakan",
    "Tawau",
    "Lahad Datu",
    "Keningau",
    "Semporna",
  ],
  Sarawak: ["Kuching", "Miri", "Sibu", "Bintulu", "Sri Aman", "Kapit"],
  Selangor: [
    "Shah Alam",
    "Petaling Jaya",
    "Subang Jaya",
    "Klang",
    "Kajang",
    "Ampang",
  ],
  Terengganu: ["Kuala Terengganu", "Kemaman", "Dungun", "Chukai", "Marang"],
  "Kuala Lumpur": ["Kuala Lumpur"],
  Labuan: ["Victoria"],
  Putrajaya: ["Putrajaya"],
};

// Address validation helpers
export function isValidCityForState(
  city: string,
  state: MalaysianState
): boolean {
  const cities = STATE_CITIES[state];
  if (!cities) return true; // Allow if we don't have city data

  const normalizedCity = city.toLowerCase();
  return cities.some((validCity) =>
    validCity.toLowerCase().includes(normalizedCity)
  );
}

// Convert ProfileAddress to MasjidAddress format
export function profileAddressToMasjidAddress(
  address: ProfileAddress
): MasjidAddress {
  const result: MasjidAddress = {
    address_line_1: address.address_line_1,
    city: address.city,
    state: address.state,
    postcode: address.postcode,
    country: "MYS" as const,
  };

  if (address.address_line_2) {
    result.address_line_2 = address.address_line_2;
  }

  return result;
}

// Convert MasjidAddress to ProfileAddress format (for forms)
export function masjidAddressToProfileAddress(
  address: MasjidAddress,
  profileId: string,
  addressType: "home" | "work" | "other" = "home"
): Omit<ProfileAddress, "id" | "created_at" | "updated_at"> {
  return {
    profile_id: profileId,
    address_line_1: address.address_line_1,
    address_line_2: address.address_line_2 || null,
    city: address.city,
    state: address.state,
    postcode: address.postcode,
    country: address.country,
    address_type: addressType,
    is_primary: true,
  };
}
