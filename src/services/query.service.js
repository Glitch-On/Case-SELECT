import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "../config/index.js";

let pool = null;

function getPool() {
  if (pool) return pool;

  pool = new Pool({
    connectionString: config.databaseUrl,
  });

  return pool;
}

export const executePlayerQuery = async (sql) => {
  const trimmedSql = sql.trim();

  // Only allow SELECT queries for now
  if (!trimmedSql.toLowerCase().startsWith("select")) {
    throw new Error("Only SELECT queries are allowed");
  }

  // Block dangerous SQL keywords
  const forbiddenKeywords = [
    "insert",
    "update",
    "delete",
    "drop",
    "alter",
    "truncate",
    "create",
    "grant",
    "revoke",
  ];

  const lowerSql = trimmedSql.toLowerCase();

  for (const keyword of forbiddenKeywords) {
    if (lowerSql.includes(keyword)) {
      throw new Error(`SQL operation '${keyword}' is not allowed`);
    }
  }

  const db = getPool();

  const result = await db.query(trimmedSql);
  console.log(result)
  return {
    success: true,
    result: result.rows,
  };
};