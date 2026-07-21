/**
 * Contract: JAKIM Zone Discovery
 */

export type ZoneCode =
  `${Uppercase<string>}${Uppercase<string>}${Uppercase<string>}${number}${number}`;

export interface ZoneDTO {
  zone_code: string; // canonical key, e.g. JHR01
  zone_name_ms: string;
  zone_name_en: string;
  state_ms: string;
  state_en: string;
  masjid_count: number;
}

export interface GetZonesResponse {
  zones: ZoneDTO[];
}

export interface ZoneMosqueDTO {
  id: string; // uuid
  name: string;
  display_id: string; // uuid
}

export interface GetZoneByCodeResponse {
  zone_code: string;
  mosques: ZoneMosqueDTO[];
  primary_display_id: string;
}

/**
 * Endpoint Contracts
 * GET /api/zones -> 200 GetZonesResponse
 * GET /api/zones/:zone_code ->
 *   200 GetZoneByCodeResponse
 *   204 no mosques in zone
 *   400 invalid zone_code format
 *   404 zone not found
 * FR-013 ownership note: canonical-zone additions/metadata drift are reconciled
 * by scheduled sync and backfill paths before these endpoints are served.
 */
