/**
 * App-wide limits and tunable values: every cap, size, duration and count the app enforces or
 * depends on, in one place. Single source of truth for the `docs/spec.md` "参照 > リミット値" table —
 * one entry per table row, referenced there as `LIMITS.<name>`. Values may change during
 * development or operation: change them here only, and update the spec table in the same change.
 *
 * Imported by both `apps/frontend` (to validate and show the limit in the UI) and `apps/backend`
 * (to enforce it in the API), so the two can never disagree.
 *
 * Conventions for each entry:
 * - Name it after what it limits, with the unit as a suffix: `...Bytes`, `...Px`, `...Days`,
 *   `...Minutes`, `...MaxLength` (characters, counted with `charLength`), a plain noun for a count.
 * - Write the value in its readable form (`300 * 1024 * 1024`, not `314572800`).
 * - JSDoc: what it limits, the unit, where it's checked (UI / API / both), and "Provisional." if
 *   the spec marks it 暫定値.
 */
export const LIMITS = {
  /** Next demonstration inspection interval, in hours. Applied in the UI data simulation. Provisional. */
  inspectionIntervalHours: 8,
  /** Minimum PIN length, in digits. Checked in the UI; also required in the future API. */
  pinMinLength: 4,
  /** Maximum PIN length, in digits. Checked in the UI; also required in the future API. */
  pinMaxLength: 6,
  /** PIN inactivity timeout, in seconds. Checked in the UI. Provisional. */
  pinTimeoutSec: 30,
  /** Logical grid columns. Checked in layout validation in the UI. */
  layoutColumns: 4,
  /** Logical grid rows. Checked in layout validation in the UI. */
  layoutRows: 2,
  /** System area height, in CSS pixels. Applied in the UI. */
  systemAreaHeightPx: 60,
  /** Maximum hospital default layouts. Checked in UI settings. Provisional. */
  hospitalLayouts: 1,
  /** Maximum layouts per role and ward scope (including no ward). Checked in the UI. Provisional. */
  layoutsPerScope: 1,
  /** Maximum instances of one component type per layout. Checked in the UI. Provisional. */
  componentInstancesPerLayout: 1,
} as const
