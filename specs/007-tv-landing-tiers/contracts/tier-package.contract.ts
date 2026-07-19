/**
 * Contract: Tier Package Metadata for Landing + Upgrade
 */

export type TierId = 'asas' | 'maju' | 'gemilang' | 'istimewa';

export interface TierFeatureDTO {
  key: string;
  name_ms: string;
  name_en: string;
}

export interface TierPackageDTO {
  id: TierId;
  name_ms: string;
  name_en: string;
  description_ms: string;
  description_en: string;
  price_ms: string;
  price_en: string;
  max_screens: number | null;
  requires_login: boolean | null;
  customization_type: 'none' | 'managed' | 'self_service' | 'custom';
  support_level: 'basic' | 'standard' | 'priority' | 'custom';
  features: TierFeatureDTO[];
  is_featured: boolean;
  display_order: number;
}

export interface GetTierPackagesResponse {
  tiers: TierPackageDTO[];
}

export interface UpgradeIntent {
  current_tier: TierId;
  target_tier: Exclude<TierId, 'asas'>;
  action: 'contact_sales' | 'signup' | 'checkout';
}
