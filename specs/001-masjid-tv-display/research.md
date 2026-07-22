# Phase 0 Research: Auto-Generated Masjid Display Mapping

## Decision 1: Scope Identification Strategy

Decision: Identify auto-generated masjids via join logic against the official JAKIM zone seed list and related seed-derived records; do not add a dedicated generated marker column.

Rationale: This aligns with clarified requirements and avoids schema expansion solely for tagging. It keeps source-of-truth in seed and zone datasets already required by discovery.

Alternatives considered:

- Add `generated_source` marker column on masjids: rejected due to extra migration surface and lifecycle drift risk.
- Infer by naming convention: rejected as brittle and non-authoritative.

## Decision 2: Invalid Mapping Handling

Decision: Exclude invalid auto-generated masjid records from discovery and continue deployment; always emit verification output with violation counts and excluded identifiers.

Rationale: This prevents full deployment outages while preserving user-facing correctness for discoverable records and providing operational visibility for remediation.

Alternatives considered:

- Hard-fail deployment on any invalid row: rejected due to operational blast radius.
- Silent auto-fix of duplicates/missing rows: rejected due to data mutation risk and audit ambiguity.

## Decision 3: Deterministic Discovery Selection

Decision: For zones with multiple valid generated masjids, resolve the first target by `created_at ASC, id ASC`.

Rationale: Deterministic ordering is stable, testable, and reproducible across environments.

Alternatives considered:

- Name-based sort: rejected due to localization/rename instability.
- Random selection: rejected due to non-determinism and flaky tests.

## Decision 4: Verification Contract Shape

Decision: Verification output includes total generated masjid count, linked display count, violation count, and excluded generated masjid identifiers.

Rationale: This satisfies success criteria and creates a clear release gate artifact for operations and QA.

Alternatives considered:

- Pass/fail only: rejected as insufficient for remediation.
- Per-row verbose report always: rejected due to noise; identifiers + counts are sufficient baseline.

## Decision 5: Enforcement Layering

Decision: Enforce mapping integrity at database verification layer first, then reflect exclusion behavior in package/app discovery queries.

Rationale: Database truth prevents drift; package/app layer consumes verified, filtered records.

Alternatives considered:

- App-only filtering: rejected because it permits hidden data integrity debt.
- DB hard constraints only: rejected because exclusion behavior and reporting are required by clarified scope.
