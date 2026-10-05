import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { serializeRows } from "../utils/serialize.js";
import { splitSqlStatements } from "../utils/sqlStatements.js";

import { config } from "../config/index.js";

/**
 * Real-database provider backed by the application's main Prisma schema
 * (PostgreSQL). This is the path used when DB_MODE=prisma and a real
 * DATABASE_URL is supplied. It ships unconnected for the prototype — see
 * database.md for connection instructions.
 */
export class PrismaProvider {
  dialect = "postgresql";

  #client = null;
  #connected = false;

  async connect() {
    if (!config.databaseUrl) {
      throw new Error(
        "DATABASE_URL is not set. The database is not connected yet — see database.md.",
      );
    }

    const { PrismaClient } = await import("../../generated/prisma/client.ts");

    const pool = new Pool({
      connectionString: config.databaseUrl,
      max: 1,
    });

    const adapter = new PrismaPg(pool, {
      disposeExternalPool: true,
    });

    this.#client = new PrismaClient({ adapter });

    await this.#client.$connect();

    this.#connected = true;
  }

  async disconnect() {
    if (this.#client) {
      await this.#client.$disconnect();
      this.#client = null;
    }

    this.#connected = false;
  }

  async getStatus() {
    return {
      connected: this.#connected,
      mode: "prisma",
      message: this.#connected
        ? "Connected to the application database (PostgreSQL via Prisma)."
        : "Disconnected. Set DATABASE_URL and run \\connect to attach to the real database.",
    };
  }

  async getSchema() {
    this.ensureConnected();

    const tables = await this.#client.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = current_schema()
         AND table_type = 'BASE TABLE'
         AND table_name <> '_prisma_migrations'
       ORDER BY table_name`,
    );

    const result = { tables: [] };

    for (const row of tables) {
      const tableName = row.table_name;

      const columns = await this.#client.$queryRawUnsafe(
        `SELECT c.column_name,
                c.data_type,
                c.is_nullable,
                EXISTS (
                  SELECT 1
                  FROM information_schema.table_constraints tc
                  JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                   AND tc.table_schema = kcu.table_schema
                  WHERE tc.constraint_type = 'PRIMARY KEY'
                    AND tc.table_schema = current_schema()
                    AND tc.table_name = c.table_name
                    AND kcu.column_name = c.column_name
                ) AS is_pk
         FROM information_schema.columns c
         WHERE c.table_schema = current_schema() AND c.table_name = $1
         ORDER BY c.ordinal_position`,
        tableName,
      );

      result.tables.push({
        name: tableName,
        columns: columns.map((c) => ({
          name: c.column_name,
          type: c.data_type,
          nullable: c.is_nullable === "YES",
          isPrimaryKey: Boolean(c.is_pk),
        })),
      });
    }

    return result;
  }

  async executeQuery(sql) {
    try {
      this.ensureConnected();
      this.assertSingleStatement(sql);

      const start = performance.now();

      const raw = await this.#client.$queryRawUnsafe(sql);

      const durationMs =
        Math.round((performance.now() - start) * 100) / 100;

      if (!Array.isArray(raw) || raw.length === 0) {
        return {
          success: true,
          result: {
            columns: [],
            rows: [],
            rowCount: 0,
            durationMs,
          },
          message: `Query executed successfully. ${durationMs} ms`,
        };
      }

      const { rows, columns } = serializeRows(raw);

      return {
        success: true,
        result: {
          columns,
          rows,
          rowCount: rows.length,
          durationMs,
        },
        message: `${rows.length} row(s) returned in ${durationMs} ms`,
      };
    } catch (error) {
      return {
        success: false,
        error: this.messageOf(error),
      };
    }
  }

  /**
   * The driver adapter cannot execute a multi-statement script: node-postgres
   * returns one result per statement and the adapter destructures that array as
   * a single result, which surfaces as
   * "Cannot read properties of undefined (reading 'map')". The query service
   * splits scripts before calling in, so reaching this is a programming error —
   * fail with something actionable instead of the adapter's TypeError.
   */
  assertSingleStatement(sql) {
    const count = splitSqlStatements(sql).length;

    if (count > 1) {
      throw new Error(
        `This provider executes one statement at a time; received a script with ${count} statements.`,
      );
    }
  }

  ensureConnected() {
    if (!this.#connected || !this.#client) {
      throw new Error("Not connected to a database. Run \\connect first.");
    }
  }

  messageOf(error) {
    if (error instanceof Error) {
      const raw = error.message;

      const match = raw.match(
        /Raw query failed\. Code: `[^\`]+`\. Message: `([^\`]+)`/,
      );

      if (match) return match[1];

      const invocation = raw.match(
        /Invalid `[^\`]+` invocation:\s*([\s\S]*)/,
      );

      if (invocation) return invocation[1].trim();

      return raw;
    }

    return String(error);
  }
}