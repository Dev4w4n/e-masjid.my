# Data Model: Auto-Generated Masjid Display Mapping

## Entities

### GeneratedMasjidScope

Definition: Derived set of masjid records considered auto-generated for discovery enforcement, computed by join logic against official zone seed list.

Fields:

- masjid_id (uuid)
- zone_code (text)
- created_at (timestamptz)

Rules:

- Membership is derived, not persisted with a dedicated marker column.
- `zone_code` must map to the official seed list used by discovery.

### TvDisplay

Definition: Display endpoint record linked to masjid.

Fields:

- display_id (uuid/text depending on existing schema)
- masjid_id (uuid)
- is_active (boolean)
- created_at (timestamptz)

Rules:

- Used to validate one-to-one relationship with GeneratedMasjidScope.

### MappingVerificationResult

Definition: Output artifact from verification query/process.

Fields:

- generated_masjid_count (integer)
- linked_display_count (integer)
- violation_count (integer)
- excluded_generated_masjid_ids (uuid[])
- completed_at (timestamptz)

Rules:

- Must be computable within 2 minutes for deployment run.
- Drives release reporting and remediation workflows.

## Relationships

- GeneratedMasjidScope 1:1 TvDisplay (desired invariant for discoverable generated rows).
- MappingVerificationResult summarizes relationship integrity for a run.

## State Transitions

### Generated Masjid Discovery Eligibility

1. Candidate

- Row qualifies through zone-seed join.

2. Valid

- Exactly one linked display.
- Included in discovery queries.

3. InvalidExcluded

- Zero or multiple linked displays.
- Excluded from discovery.
- Included in verification output as excluded ID.

## Deterministic Selection Rule

For any zone with multiple Valid generated masjids:

- Order by `created_at ASC`, then `id ASC`.
- Select first row as discovery target.

## Integrity Checks

- Missing display: generated row with zero displays -> violation.
- Duplicate display mapping: generated row with more than one display -> violation.
- Discovery must only include Valid rows.
