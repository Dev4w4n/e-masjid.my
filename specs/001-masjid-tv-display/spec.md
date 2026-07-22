# Feature Specification: Auto-Generated Masjid Display Mapping

**Feature Branch**: `001-masjid-tv-display`  
**Created**: 2026-07-18  
**Status**: Draft  
**Input**: User description: "the auto generated masjids in the sqlshould have 1 tv-display per masjid."

**Constitutional Requirements Checklist**:

- [x] Package-first architecture (business logic in `packages/`)
- [x] TDD approach (tests written first)
- [x] Database migrations if schema changes needed
- [x] Multilingual support (Bahasa Malaysia/English)
- [x] Documentation plan for `/docs`

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Guarantee One Display Per Auto-Generated Masjid (Priority: P1)

As a platform operator, I need every auto-generated masjid record to have exactly one TV display so users can always route from zone discovery to a valid display page.

**Why this priority**: This is a core data integrity rule for the free-tier discovery flow. If any generated masjid has zero displays or multiple displays, routing and user experience can fail.

**Independent Test**: Run migration and verification checks, then confirm every auto-generated masjid has exactly one linked display and no duplicates.

**Acceptance Scenarios**:

1. **Given** the migration runs on an empty environment, **When** auto-generated masjids are inserted, **Then** each generated masjid has one and only one TV display record.
2. **Given** generated masjid data already exists, **When** migration logic is re-applied through normal deployment workflow, **Then** no generated masjid ends up with duplicate TV displays.
3. **Given** zone-based discovery is used, **When** a user selects a zone and lands on the first generated masjid, **Then** routing resolves to a single valid display target.
4. **Given** multiple valid auto-generated masjids exist in the same zone, **When** discovery resolves the first target, **Then** selection uses deterministic order: `created_at` ascending, then `id` ascending.

---

### User Story 2 - Prevent Invalid Generated Data States (Priority: P2)

As a maintainer, I need safeguards so schema or seed updates cannot create auto-generated masjids without displays or with multiple displays.

**Why this priority**: Preventing regressions avoids production incidents during future migration updates.

**Independent Test**: Execute data verification checks that identify invalid generated masjid mappings, exclude those masjids from discovery, and allow deployment to continue.

**Acceptance Scenarios**:

1. **Given** new zones or auto-generated masjids are added in a future seed update, **When** validation runs, **Then** any generated masjid that does not map to exactly one display is excluded from discovery and reported.
2. **Given** duplicate display mappings are attempted for a generated masjid, **When** constraints or checks are evaluated, **Then** the invalid state is rejected.

---

### User Story 3 - Audit Mapping Completeness (Priority: P3)

As an admin reviewer, I need a clear verification output showing generated masjid-to-display mapping completeness so I can approve deployments confidently.

**Why this priority**: Operational confidence and release governance require measurable proof of integrity.

**Independent Test**: Run verification and receive counts for generated masjids, displays, and violations.

**Acceptance Scenarios**:

1. **Given** verification is executed after migration, **When** it completes, **Then** it reports total generated masjids, total linked displays, violation counts, and excluded generated masjid identifiers.

---

### Edge Cases

- What happens when an auto-generated masjid insert partially succeeds but display creation fails? The migration/verification flow must exclude the invalid generated masjid from discovery and report the violation explicitly.
- What happens when auto-generated masjid records are updated later? Existing one-to-one mapping must remain valid and not create duplicate displays.
- What happens when a zone has no valid generated masjid due to upstream data issues? Discovery must return a clear no-data state while verification reports the excluded or invalid generated records.
- What happens when more than one valid auto-generated masjid exists in a zone? Discovery uses deterministic ordering by `created_at` ascending, then `id` ascending.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST ensure every discoverable auto-generated masjid resolves to exactly one TV display.
- **FR-002**: System MUST treat auto-generated masjids with multiple linked displays as invalid for discovery and exclude them.
- **FR-003**: System MUST treat auto-generated masjids with no linked display as invalid for discovery and exclude them.
- **FR-004**: System MUST include post-migration verification that validates one-to-one auto-generated masjid-to-display mapping, where auto-generated scope is derived by joining against the official zone seed list.
- **FR-005**: System MUST exclude invalid auto-generated masjids from discovery and report violations without blocking deployment.
- **FR-006**: Zone discovery flow MUST continue to resolve each valid auto-generated masjid to one unique display target.
- **FR-007**: Documentation MUST describe the one-to-one invariant, exclusion behavior for invalid mappings, and the verification procedure for release checks in Bahasa Malaysia and English.
- **FR-008**: System MUST identify auto-generated masjids for enforcement and verification by join logic against the official zone seed list in `packages/prayer-times/src/jakim-api.ts` (`MALAYSIAN_ZONES`); no dedicated generated marker column is required.
- **FR-009**: When discovery needs the first generated masjid for a zone, selection MUST be deterministic using `created_at` ascending, then `id` ascending.
- **FR-010**: Rejection semantics for this feature MUST be verification-time and discovery-time only: invalid auto-generated mappings are excluded from discovery queries and reported in verification output; deployment is not blocked.
- **FR-011**: Discovery MUST only consider auto-generated masjids whose single linked TV display is active and available for routing.

### Key Entities _(include if feature involves data)_

- **Generated Masjid**: A mosque record treated as seed-generated for this feature through zone-seed-list join logic; key attributes include unique identifier and zone code.
- **TV Display**: A display endpoint linked to a masjid; key attributes include unique identifier, masjid reference, and active status.
- **Mapping Verification Result**: Validation output containing generated masjid count, linked display count, violation count, and excluded generated masjid identifiers.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of discoverable auto-generated masjids have exactly one linked TV display after migration.
- **SC-002**: 0 discoverable auto-generated masjids have missing display links.
- **SC-003**: 0 discoverable auto-generated masjids have duplicate display links.
- **SC-004**: Verification completes within 2 minutes for a standard deployment run and returns a clear result with violation counts and excluded generated masjid identifiers.
- **SC-005**: Repeated discovery requests for the same zone return the same selected generated masjid while data is unchanged.

## Assumptions

- One-to-one masjid-to-display enforcement in this feature applies to auto-generated masjids used for discovery.
- Auto-generated masjid scope is determined by joining masjid records with `packages/prayer-times/src/jakim-api.ts` (`MALAYSIAN_ZONES`), not by a dedicated generated marker field.
- The current display routing model remains unchanged and uses existing display identifiers.
- Existing manually created masjids are outside the enforcement scope for this feature.

## Dependencies & Constraints

- Depends on existing migration and seed flow for auto-generated masjid and display records.
- Must remain compatible with existing zone discovery and display routing behavior.
- Must align with existing RLS and deployment governance in the repository.

## Clarifications

### Session 2026-07-18

- Q: How should generated masjids be identified and enforced as one-to-one with tv-display? → A: Apply one-to-one enforcement only to auto-generated masjids.
- Q: For existing invalid mappings, should deployment fail or continue? → A: Exclude invalid auto-generated masjids from discovery and continue deployment while reporting violations.
- Q: What lifecycle scope should the one-to-one rule apply to? → A: Apply only to auto-generated masjids.
- Q: How should auto-generated masjids be identified for enforcement and verification? → A: Use join logic against the official zone seed list; no dedicated marker column.
- Q: How should discovery select the first generated masjid when multiple valid records exist in one zone? → A: Deterministic sort by `created_at` ascending, then `id` ascending.
