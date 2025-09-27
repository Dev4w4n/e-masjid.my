import { MalaysianState } from "@masjid-suite/shared-types";

// A simple, non-Supabase service to fetch data from an external API.
const API_URL = "https://api.waktusolat.app/v2/zones";

/**
 * The shape of the zone object returned by the external API.
 */
interface ApiJakimZone {
  code: string;
  name: string;
  state: string; // e.g., "JOHOR"
}

/**
 * The shape of the zone object our application's UI components expect.
 */
export interface UiJakimZone {
  value: string;
  label: string;
  state: MalaysianState;
}

// Helper to convert state names (e.g., "JOHOR" -> "Johor", "WILAYAH PERSEKUTUAN" -> "Wilayah Persekutuan")
function toTitleCase(str: string): string {
  if (!str) return "";
  // Special handling for "WILAYAH PERSEKUTUAN"
  if (str.toUpperCase() === "WILAYAH PERSEKUTUAN") {
    return "Wilayah Persekutuan";
  }
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

export class JakimService {
  /**
   * Fetches all JAKIM prayer time zones from the external API.
   * @returns A promise that resolves to an array of UiJakimZone objects.
   */
  async getZones(): Promise<UiJakimZone[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data: ApiJakimZone[] = await response.json();

      // Transform the data to match our application's UI needs
      const transformedZones: UiJakimZone[] = data.map((zone) => ({
        value: zone.code,
        label: `${zone.code} - ${zone.name}`,
        state: toTitleCase(zone.state) as MalaysianState,
      }));

      return transformedZones;
    } catch (error) {
      console.error("Failed to fetch JAKIM zones:", error);
      // Return an empty array to prevent the UI from crashing.
      return [];
    }
  }
}

export const jakimService = new JakimService();
