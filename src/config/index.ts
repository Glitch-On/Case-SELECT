import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type DatabaseMode = "prisma";

const DB_MODE_ALIASES: Record<string, DatabaseMode> = {
  prisma: "prisma",
  postgres: "prisma",
  postgresql: "prisma",
  pg: "prisma",
  real: "prisma",
};

/** Modes that used to select the optional SQLite dummy database, now removed. */
const REMOVED_DB_MODES = new Set(["dummy", "sqlite"]);

/**
 * Resolves DB_MODE to a known database mode. Throws on an unrecognised value
 * rather than defaulting, so a typo can never silently point the IDE at the
 * wrong database. An unset or blank value falls back to the default (prisma).
 */
function resolveDatabaseMode(raw: string | undefined): DatabaseMode {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "") {
    return "prisma";
  }
  if (REMOVED_DB_MODES.has(value)) {
    throw new Error(
      `DB_MODE=${value} was removed: the SQLite dummy database no longer exists. ` +
        `The IDE talks to PostgreSQL only — set DB_MODE=prisma or unset it entirely.`,
    );
  }
  const mode = DB_MODE_ALIASES[value];
  if (!mode) {
    throw new Error(
      `Invalid DB_MODE "${raw}". Valid values: prisma (PostgreSQL). ` +
        `Accepted aliases: ${Object.keys(DB_MODE_ALIASES).join(", ")}.`,
    );
  }
  return mode;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),

  /**
   * Which database the SQL IDE talks to. "prisma" is currently the only mode:
   * the application's real database via the main Prisma schema (default).
   */
  dbMode: resolveDatabaseMode(process.env.DB_MODE),

  // Connection string for the real database (prisma mode). Set DATABASE_URL to
  // your PostgreSQL connection string — see database.md.
  databaseUrl: process.env.DATABASE_URL ?? "",

  // Paths are resolved relative to the project root (one level up from src/).
  paths: {
    root: path.join(__dirname, "..", ".."),
    mainClient: path.join(__dirname, "..", "..", "generated", "prisma", "client.ts"),
    views: path.join(__dirname, "..", "views"),
    public: path.join(__dirname, "..", "..", "public"),
  },
} as const;
