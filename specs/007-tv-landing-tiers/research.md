# Phase 0 Research: TV Landing Page with Tiered Package Marketing

## Decision 1: Canonical JAKIM identity model

- Decision: Use official JAKIM `zone_code` (example: JHR01, KDH01) as the only canonical key for lookup/routing.
- Rationale: `zone_name_ms` and `zone_name_en` are display text and can change; canonical code avoids locale-driven drift.
- Alternatives considered:
  - `zone_name` as key: rejected due to translation volatility.
  - Mixed code/name fallback: rejected due to ambiguous routing behavior.

## Decision 2: MVP seed cardinality

- Decision: Seed exactly one Asas masjid per canonical active zone (58 total, 1:1).
- Rationale: Deterministic route target and simpler SQL invariant checks.
- Alternatives considered:
  - 1..N seeds per zone: deferred to post-MVP as it complicates primary display selection.

## Decision 3: Prayer-time freshness strategy

- Decision: FR-011 owns prayer-time freshness behavior: cache-first stale-while-revalidate on each display load with Asia/Kuala_Lumpur daily rollover.
- Rationale: Fast UX with predictable daily refresh boundary and graceful degradation under upstream latency.
- Alternatives considered:
  - Always-live fetch: rejected for outage sensitivity.
  - Scheduled-only refresh: rejected for stale-view risk on active screens.

## Decision 4: Zone synchronization strategy

- Decision: FR-013 owns canonical-set drift reconciliation via scheduled zone sync plus backfill path (migration/admin import) for newly introduced zones or metadata changes.
- Rationale: Covers both automated drift correction and operational recovery.
- Alternatives considered:
  - Migration-only updates: rejected because it requires manual intervention for every JAKIM change.

## Decision 5: Package ownership boundaries

- Decision: Zone/tier/routing validation and fallback behavior live in `packages/`; `apps/tv-display` renders UI and invokes package APIs.
- Rationale: Satisfies package-first principle and prevents app-level logic duplication.
- Alternatives considered:
  - App-local services under `apps/tv-display/src/lib`: rejected as constitutional mismatch for business rules.

## Decision 6: Frontend host runtime variance

- Decision: Standardize tv-display on Vite + React Router v6 shell for this feature scope, while preserving package-first logic boundaries.
- Rationale: Aligns with constitutional frontend constraints and keeps routing behavior explicit and testable across landing and display flows.
- Alternatives considered:
  - Keep existing Next.js host runtime: rejected due to constitution mismatch and increased cross-artifact inconsistency risk.

## Decision 7: Outcomes measurement strategy

- Decision: Add explicit analytics event contracts for CTA clicks, zone-selection success, and upgrade intents to support SC-010/SC-011 tracking.
- Rationale: Business outcomes require auditable telemetry, not only UI tests.
- Alternatives considered:
  - Manual support-ticket and CTR tracking only: rejected due to weak reproducibility.

## Resolved Clarifications

No unresolved `NEEDS CLARIFICATION` items remain for this feature.

- Zone source of truth: official JAKIM `zone_code`.
- Prayer-time update behavior (FR-011): SWR + KL midnight rollover.
- New zone handling (FR-013): scheduled sync + backfill path.
- Ownership boundary: package-first for business logic.
- MVP population strategy: 58 canonical active zones, 58 Asas masjids, 1:1 mapping.
