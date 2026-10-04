import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT ?? 3000),

  /**
   * Which database the SQL IDE talks to.
   * - "prisma" : the application's real database via the main Prisma schema (default)
   * - "dummy"  : local SQLite sample database (optional, for offline testing)
   */
  dbMode: (process.env.DB_MODE ?? "prisma") as "dummy" | "prisma",

  // Connection string for the real database (prisma mode). Set DATABASE_URL to
  // your PostgreSQL connection string — see database.md.
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
