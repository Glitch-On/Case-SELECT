import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "schema.prisma",

  migrations: {
    path: "migrations",
  },

  datasource: {
    url: process.env.DUMMY_DATABASE_URL ?? "file:./dev.db",
  },
});
