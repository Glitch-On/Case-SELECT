import type { DatabaseProvider } from "./databaseProvider.ts";
import { DummyProvider } from "./dummyProvider.ts";
import { PrismaProvider } from "./prismaProvider.ts";
import { config } from "../config/index.ts";

/**
 * Selects the database provider from configuration. This is the single seam
 * that makes the IDE database-agnostic: swapping the dummy database for the
 * real one is a config change (DB_MODE / DATABASE_URL), not a code change.
 */
export function createProvider(mode: "dummy" | "prisma" = config.dbMode): DatabaseProvider {
  switch (mode) {
    case "prisma":
      return new PrismaProvider();
    case "dummy":
    default:
      return new DummyProvider();
  }
}
