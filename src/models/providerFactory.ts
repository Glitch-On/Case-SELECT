import type { DatabaseProvider } from "./databaseProvider.ts";
import { PrismaProvider } from "./prismaProvider.ts";
import { config, type DatabaseMode } from "../config/index.ts";

/**
 * Selects the database provider from configuration. This is the single seam
 * that makes the IDE database-agnostic: changing which database is in use is a
 * config change (DB_MODE / DATABASE_URL), not a code change.
 */
export function createProvider(mode: DatabaseMode = config.dbMode): DatabaseProvider {
  switch (mode) {
    case "prisma":
      return new PrismaProvider();
    default: {
      // Unreachable: config.dbMode is validated at load. Fail loudly rather than
      // silently connecting the IDE to the wrong database.
      const unexpected: never = mode;
      throw new Error(`Unsupported DB_MODE: ${String(unexpected)}`);
    }
  }
}
