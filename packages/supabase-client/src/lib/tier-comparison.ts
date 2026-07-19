import { TierId } from "@masjid-suite/shared-types";

export type TierComparisonKey =
  | "max_screens"
  | "requires_login"
  | "customization_type"
  | "support_level"
  | "prayer_times_display"
  | "prayer_times_sync"
  | "content_scheduling"
  | "analytics";

export interface ComparisonDimension {
  key: TierComparisonKey;
  label_ms: string;
  label_en: string;
}

export interface ComparisonValue {
  type: "boolean" | "number" | "text";
  value: string | number | boolean;
  label_ms: string;
  label_en: string;
  icon?: "checkmark" | "cross" | "star" | "none";
}

export interface ComparisonMatrixRow {
  dimension: ComparisonDimension;
  values: Record<TierId, ComparisonValue>;
}

export const COMPARISON_DIMENSIONS: ComparisonDimension[] = [
  {
    key: "max_screens",
    label_ms: "Bilangan Skrin Paparan",
    label_en: "Number of Displays",
  },
  {
    key: "requires_login",
    label_ms: "Memerlukan Log Masuk",
    label_en: "Requires Login",
  },
  {
    key: "customization_type",
    label_ms: "Jenis Penyesuaian",
    label_en: "Customization Type",
  },
  {
    key: "support_level",
    label_ms: "Tahap Sokongan",
    label_en: "Support Level",
  },
  {
    key: "prayer_times_display",
    label_ms: "Paparan Waktu Solat",
    label_en: "Prayer Times Display",
  },
  {
    key: "prayer_times_sync",
    label_ms: "Penyegerakan Waktu Solat",
    label_en: "Prayer Times Sync",
  },
  {
    key: "content_scheduling",
    label_ms: "Penjadualan Kandungan",
    label_en: "Content Scheduling",
  },
  {
    key: "analytics",
    label_ms: "Analitik",
    label_en: "Analytics",
  },
];

const UNLIMITED = 999;

export const TIER_COMPARISON_DATA: Record<
  TierId,
  Record<TierComparisonKey, ComparisonValue>
> = {
  asas: {
    max_screens: {
      type: "number",
      value: 1,
      label_ms: "1 Skrin",
      label_en: "1 Display",
      icon: "none",
    },
    requires_login: {
      type: "boolean",
      value: false,
      label_ms: "Tidak Perlu",
      label_en: "Not Required",
      icon: "checkmark",
    },
    customization_type: {
      type: "text",
      value: "none",
      label_ms: "Tetap",
      label_en: "Fixed",
      icon: "cross",
    },
    support_level: {
      type: "text",
      value: "basic",
      label_ms: "Asas",
      label_en: "Basic",
      icon: "none",
    },
    prayer_times_display: {
      type: "text",
      value: "standard",
      label_ms: "Standard",
      label_en: "Standard",
      icon: "checkmark",
    },
    prayer_times_sync: {
      type: "text",
      value: "daily",
      label_ms: "Setiap Hari",
      label_en: "Daily",
      icon: "none",
    },
    content_scheduling: {
      type: "boolean",
      value: false,
      label_ms: "Tidak Tersedia",
      label_en: "Not Available",
      icon: "cross",
    },
    analytics: {
      type: "boolean",
      value: false,
      label_ms: "Tidak Tersedia",
      label_en: "Not Available",
      icon: "cross",
    },
  },
  maju: {
    max_screens: {
      type: "number",
      value: 1,
      label_ms: "1 Skrin",
      label_en: "1 Display",
      icon: "none",
    },
    requires_login: {
      type: "boolean",
      value: false,
      label_ms: "Tidak Perlu",
      label_en: "Not Required",
      icon: "checkmark",
    },
    customization_type: {
      type: "text",
      value: "managed",
      label_ms: "WhatsApp Terurus",
      label_en: "Managed via WhatsApp",
      icon: "checkmark",
    },
    support_level: {
      type: "text",
      value: "standard",
      label_ms: "Piawai",
      label_en: "Standard",
      icon: "checkmark",
    },
    prayer_times_display: {
      type: "text",
      value: "standard",
      label_ms: "Standard",
      label_en: "Standard",
      icon: "checkmark",
    },
    prayer_times_sync: {
      type: "text",
      value: "daily",
      label_ms: "Setiap Hari",
      label_en: "Daily",
      icon: "none",
    },
    content_scheduling: {
      type: "boolean",
      value: true,
      label_ms: "Tersedia",
      label_en: "Available",
      icon: "checkmark",
    },
    analytics: {
      type: "boolean",
      value: false,
      label_ms: "Tidak Tersedia",
      label_en: "Not Available",
      icon: "cross",
    },
  },
  gemilang: {
    max_screens: {
      type: "number",
      value: UNLIMITED,
      label_ms: "Tanpa Had",
      label_en: "Unlimited",
      icon: "star",
    },
    requires_login: {
      type: "boolean",
      value: true,
      label_ms: "Perlu",
      label_en: "Required",
      icon: "checkmark",
    },
    customization_type: {
      type: "text",
      value: "self-service",
      label_ms: "Papan Pemuka Sendiri",
      label_en: "Self-Service Dashboard",
      icon: "star",
    },
    support_level: {
      type: "text",
      value: "priority",
      label_ms: "Keutamaan",
      label_en: "Priority",
      icon: "star",
    },
    prayer_times_display: {
      type: "text",
      value: "advanced",
      label_ms: "Lanjutan",
      label_en: "Advanced",
      icon: "star",
    },
    prayer_times_sync: {
      type: "text",
      value: "realtime",
      label_ms: "Masa Nyata",
      label_en: "Real-time",
      icon: "star",
    },
    content_scheduling: {
      type: "boolean",
      value: true,
      label_ms: "Tersedia",
      label_en: "Available",
      icon: "checkmark",
    },
    analytics: {
      type: "boolean",
      value: true,
      label_ms: "Tersedia",
      label_en: "Available",
      icon: "checkmark",
    },
  },
  istimewa: {
    max_screens: {
      type: "number",
      value: UNLIMITED,
      label_ms: "Tanpa Had",
      label_en: "Unlimited",
      icon: "star",
    },
    requires_login: {
      type: "boolean",
      value: true,
      label_ms: "Perlu",
      label_en: "Required",
      icon: "checkmark",
    },
    customization_type: {
      type: "text",
      value: "custom",
      label_ms: "Integrasi Tersuai",
      label_en: "Custom Integration",
      icon: "star",
    },
    support_level: {
      type: "text",
      value: "dedicated",
      label_ms: "Khusus",
      label_en: "Dedicated",
      icon: "star",
    },
    prayer_times_display: {
      type: "text",
      value: "enterprise",
      label_ms: "Perusahaan",
      label_en: "Enterprise",
      icon: "star",
    },
    prayer_times_sync: {
      type: "text",
      value: "realtime",
      label_ms: "Masa Nyata",
      label_en: "Real-time",
      icon: "star",
    },
    content_scheduling: {
      type: "boolean",
      value: true,
      label_ms: "Tersedia",
      label_en: "Available",
      icon: "checkmark",
    },
    analytics: {
      type: "boolean",
      value: true,
      label_ms: "Tersedia",
      label_en: "Available",
      icon: "checkmark",
    },
  },
};

export function compareTiers(
  tierIds: TierId[] = ["asas", "maju", "gemilang", "istimewa"],
): ComparisonMatrixRow[] {
  return COMPARISON_DIMENSIONS.map((dimension) => ({
    dimension,
    values: tierIds.reduce(
      (acc, tierId) => {
        acc[tierId] = TIER_COMPARISON_DATA[tierId][dimension.key];
        return acc;
      },
      {} as Record<TierId, ComparisonValue>,
    ),
  }));
}

export function getTierComparisonValue(
  tierId: TierId,
  dimensionKey: TierComparisonKey,
): ComparisonValue {
  return TIER_COMPARISON_DATA[tierId][dimensionKey];
}
