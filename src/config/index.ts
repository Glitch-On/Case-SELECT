import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT ?? 3000),

  /**
   * Which database the SQL IDE talks to.
   * - "dummy"  : local SQLite sample database (default, for development/testing)
   * - "prisma" : the application's real database via the main Prisma schema
   */
  dbMode: (process.env.DB_MODE ?? "dummy") as "dummy" | "prisma",

  // Connection string for the real database (prisma mode). Left unconnected
  // for the prototype — see database.md for how to provide a real one.
  databaseUrl: process.env.DATABASE_URL ?? "",

  // Paths are resolved relative to the project root (one level up from src/).
  paths: {
    root: path.join(__dirname, "..", ".."),
    dummySchema: path.join(__dirname, "..", "..", "prisma-dummy", "schema.prisma"),
    dummyMigrations: path.join(__dirname, "..", "..", "prisma-dummy", "migrations"),
    dummyDatabase: path.join(__dirname, "..", "..", "prisma-dummy", "dev.db"),
    dummyClient: path.join(__dirname, "..", "..", "generated", "prisma-dummy", "client.ts"),
    mainClient: path.join(__dirname, "..", "..", "generated", "prisma", "client.ts"),
    views: path.join(__dirname, "..", "views"),
    public: path.join(__dirname, "..", "..", "public"),
  },
} as const;
