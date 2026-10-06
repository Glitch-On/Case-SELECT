/**
 * Case display metadata and status derivation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DUMMY / TEST DATA — NOT PRODUCTION GAME CONTENT
 *
 * `Case` in prisma/schema.prisma currently stores only `id` and `caseName`, so
 * there is nowhere real for a blurb, a difficulty rating or a lock flag to live.
 * These entries exist purely so the dashboard can be developed and reviewed with
 * representative content. They are keyed by case id and are safe to delete the
 * moment the backend exposes these fields.
 *
 * Real replacements are specified in SUGGESTED_IMPROVEMENTS.md.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const DUMMY_CASE_META = {
  C001: {
    description:
      "A politician collapses mid-toast at a private dinner. Six guests had motives; the obvious suspect is not the murderer.",
    difficulty: "medium",
    locked: false,
  },
  C002: {
    description:
      "A financial analyst vanishes hours before a merger vote, taking a laptop full of ledgers with her.",
    difficulty: "hard",
    locked: false,
  },
  C003: {
    description:
      "A downtown gallery is emptied overnight. The alarm was never armed from the inside.",
    difficulty: "easy",
    locked: false,
  },
  C004: {
    description:
      "A witness to the heist goes quiet before the arraignment. Someone wants the testimony buried.",
    difficulty: "expert",
    locked: false,
  },
  C005: {
    description:
      "A partner is found dead at a closed negotiation, and the poison traces back to the company account.",
    difficulty: "hard",
    locked: true,
  },
};

const DEFAULT_META = {
  description: "Case file sealed. Further details unavailable.",
  difficulty: "medium",
  locked: false,
};

/** Presentation-only metadata for a case id. */
export function getCaseMeta(caseId) {
  return DUMMY_CASE_META[caseId] ?? DEFAULT_META;
}

export const DIFFICULTY_TONE = {
  easy: "success",
  medium: "warning",
  hard: "danger",
  expert: "info",
};

export const DIFFICULTY_ICON = {
  easy: "◆",
  medium: "◆◆",
  hard: "◆◆◆",
  expert: "◆◆◆◆",
};

/**
 * The four dashboard statuses.
 *
 * `LOCKED` and `NOT STARTED` have no backing column: the schema's
 * ProgressStatus enum only covers IN_PROGRESS and COMPLETED, and lock rules are
 * progression logic owned by the game team. The client therefore derives them:
 *
 *   COMPLETED   — the backend reports status COMPLETED
 *   IN_PROGRESS — the backend reports status IN_PROGRESS
 *   NOT STARTED — no progress row exists for this case
 *   LOCKED      — display-only flag from the dummy metadata above
 *
 * No progression rule is enforced here; the backend remains the source of truth
 * for anything that actually gates gameplay.
 */
export const CASE_STATUS = {
  COMPLETED: "COMPLETED",
  IN_PROGRESS: "IN PROGRESS",
  NOT_STARTED: "NOT STARTED",
  LOCKED: "LOCKED",
};

export const STATUS_TONE = {
  COMPLETED: "success",
  "IN PROGRESS": "warning",
  "NOT STARTED": "default",
  LOCKED: "danger",
};

export const STATUS_ICON = {
  COMPLETED: "✓",
  "IN PROGRESS": "►",
  "NOT STARTED": "○",
  LOCKED: "🔒",
};

export function resolveCaseStatus(caseId, progress, meta) {
  if (meta?.locked) return CASE_STATUS.LOCKED;
  if (progress?.status === "COMPLETED") return CASE_STATUS.COMPLETED;
  if (progress?.status === "IN_PROGRESS") return CASE_STATUS.IN_PROGRESS;
  return CASE_STATUS.NOT_STARTED;
}
