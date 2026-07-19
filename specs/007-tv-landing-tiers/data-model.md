# Phase 1 Data Model: TV Landing Page with Tiered Package Marketing

## Entity: JAKIMZone

- Purpose: Official zone registry used for lookup and routing.
- Fields:
  - zone_code: string (PK, regex `^[A-Z]{3}\d{2}$`, canonical identifier)
  - zone_name_ms: string
  - zone_name_en: string
  - state_ms: string
  - state_en: string
  - region: enum (`peninsular`, `sabah`, `sarawak`)
  - is_active: boolean
  - created_at: timestamp
  - updated_at: timestamp
- Validation rules:
  - `zone_code` unique, uppercase, non-null.
  - `zone_name_ms` and `zone_name_en` required (display-only fields).

## Entity: Masjid

- Purpose: Discoverable mosque endpoint for free-tier zone entry and display routing.
- Fields:
  - id: uuid (PK)
  - name: string
  - zone_code: string (FK -> JAKIMZone.zone_code)
  - tier: enum (`asas`, `maju`, `gemilang`, `istimewa`)
  - display_id: uuid (unique, route token backing `/display/[display-id]` contract)
  - prayer_times_source: enum (`jakim_api`)
  - is_auto_populated: boolean
  - owner_id: uuid nullable
  - status: enum (`active`, `inactive`, `pending_approval`)
  - created_at: timestamp
  - updated_at: timestamp
- Validation rules:
  - MVP invariant: exactly one row per zone where `tier='asas' AND is_auto_populated=true AND status='active'`.
  - `display_id` unique and non-null.

## Entity: TierPackage

- Purpose: Marketing package metadata and capability gating input.
- Fields:
  - id: enum (`asas`, `maju`, `gemilang`, `istimewa`)
  - name_ms: string
  - name_en: string
  - description_ms: string
  - description_en: string
  - price_ms: string
  - price_en: string
  - max_screens: integer or null
  - requires_login: boolean or null
  - customization_type: enum (`none`, `managed`, `self_service`, `custom`)
  - support_level: enum (`basic`, `standard`, `priority`, `custom`)
  - features: json/string list
  - is_featured: boolean
  - display_order: integer
- Validation rules:
  - `display_order` unique.
  - ms/en labels required for all public-facing fields.

## Entity: PrayerTimesCache

- Purpose: Cache-first data source for display render before background refresh, backed by the existing `prayer_times` table.
- Fields:
  - masjid_id: uuid
  - prayer_date: date (Asia/Kuala_Lumpur)
  - fajr_time: string
  - sunrise_time: string
  - dhuhr_time: string
  - asr_time: string
  - maghrib_time: string
  - isha_time: string
  - source: enum (`jakim_api`)
  - fetched_at: timestamp
- Constraints:
  - Unique `(masjid_id, prayer_date)`.

## Entity: AnalyticsEvent

- Purpose: Track business outcomes tied to SC-010 and SC-011.
- Fields:
  - event_id: uuid (PK)
  - event_name: enum (`cta_click`, `zone_selection_success`, `upgrade_intent`, `faq_expand`)
  - event_time: timestamp
  - locale: enum (`ms`, `en`)
  - tier_context: enum (`asas`, `maju`, `gemilang`, `istimewa`) nullable
  - zone_code: string nullable
  - page_path: string
  - session_id: string
- Validation rules:
  - `event_name`, `event_time`, `page_path`, and `session_id` required.

## Relationships

- JAKIMZone (1) -> (1..\*) Masjid via `zone_code`
- JAKIMZone (1) -> (0..1 per local day) PrayerTimesCache
- Masjid (1) -> (1) Display route by `display_id`

## State Transitions

### Zone Discovery

1. Landing loads active JAKIMZone list.
2. User selects `zone_code`.
3. Service resolves primary Asas masjid in zone.
4. Route to `/display/[display-id]`.
5. If none available, show no-data guidance with fallback CTA.

### Prayer-Time Retrieval (SWR)

1. Read PrayerTimesCache by `(zone_code, today@Asia/Kuala_Lumpur)`.
2. Serve cached payload immediately when available.
3. Trigger background JAKIM refresh.
4. Upsert refreshed payload and timestamp.

### Upgrade Intent

1. User clicks upgrade from Asas display.
2. Select target tier.
3. Resolve target action (`contact_sales`, `signup`, or `checkout`).
4. Preserve existing settings/content and unlock target-tier features.
