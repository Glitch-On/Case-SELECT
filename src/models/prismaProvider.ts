import { PrismaPg } from "@prisma/adapter-pg";
import type { DatabaseProvider, ExecuteOutcome, QueryResult, SchemaInfo } from "./databaseProvider.ts";
import { serializeRows } from "../utils/serialize.ts";
import { config } from "../config/index.ts";

/**
 * Real-database provider backed by the application's main Prisma schema
 * (PostgreSQL). This is the path used when DB_MODE=prisma and a real
 * DATABASE_URL is supplied. It ships unconnected for the prototype — see
 * database.md for connection instructions.
 */
export class PrismaProvider implements DatabaseProvider {
  readonly dialect = "postgresql";
  private client: any = null;
  private connected = false;

  async connect(): Promise<void> {
    if (!config.databaseUrl) {
      throw new Error(
        "DATABASE_URL is not set. The real database is not connected yet — see database.md, or run with DB_MODE=dummy.",
      );
    }
    const { PrismaClient } = await import("../../generated/prisma/client.ts");
    const adapter = new PrismaPg({ connectionString: config.databaseUrl });
    this.client = new PrismaClient({ adapter });
    await this.client.$connect();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.$disconnect();
      this.client = null;
    }
    this.connected = false;
  }

  async getStatus() {
    return {
      connected: this.connected,
      mode: "prisma",
      message: this.connected
        ? "Connected to the application database (PostgreSQL via Prisma)."
        : "Disconnected. Set DATABASE_URL and run \\connect to attach to the real database.",
    };
  }

  async getSchema(): Promise<SchemaInfo> {
    this.ensureConnected();
    const tables = await this.client.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`,
    );

    const result: SchemaInfo = { tables: [] };
    for (const row of tables) {
      const tableName = row.table_name as string;
      const columns = await this.client.$queryRawUnsafe(
        `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        tableName,
      );
      result.tables.push({
        name: tableName,
        columns: columns.map((c: any) => ({
          name: c.column_name,
          type: c.data_type,
          nullable: c.is_nullable === "YES",
          isPrimaryKey: false,
        })),
      });
    }
    return result;
  }

  async executeQuery(sql: string): Promise<ExecuteOutcome> {
    try {
      this.ensureConnected();
      const start = performance.now();
      const raw = await this.client.$queryRawUnsafe(sql);
      const durationMs = Math.round((performance.now() - start) * 100) / 100;

      if (!Array.isArray(raw) || raw.length === 0) {
        return {
          success: true,
          result: { columns: [], rows: [], rowCount: 0, durationMs },
          message: `Query executed successfully. ${durationMs} ms`,
        };
      }

      const { rows, columns } = serializeRows(raw);
      return {
        success: true,
        result: { columns, rows, rowCount: rows.length, durationMs },
        message: `${rows.length} row(s) returned in ${durationMs} ms`,
      };
    } catch (error) {
      return { success: false, error: this.messageOf(error) };
    }
  }

  private ensureConnected(): void {
    if (!this.connected || !this.client) {
      throw new Error("Not connected to a database. Run \\connect first.");
    }
  }

  private messageOf(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }
}
