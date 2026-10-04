import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import type { DatabaseProvider, ExecuteOutcome, QueryResult, SchemaInfo } from "./databaseProvider.ts";
import { serializeRows } from "../utils/serialize.ts";
import { config } from "../config/index.ts";

/**
 * Optional offline provider backed by the local SQLite dummy database.
 * Only used when DB_MODE=dummy; PostgreSQL is the default. Uses the Prisma
 * client generated from prisma-dummy/schema.prisma so the query path is
 * identical to the PostgreSQL provider.
 */
export class DummyProvider implements DatabaseProvider {
  readonly dialect = "sqlite";
  private client: any = null;
  private connected = false;

  async connect(): Promise<void> {
    const { PrismaClient } = await import("../../generated/prisma-dummy/client.ts");
    const adapter = new PrismaBetterSqlite3({ url: `file:${config.paths.dummyDatabase}` });
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
      mode: "dummy",
      message: this.connected
        ? "Connected to the local SQLite dummy database."
        : "Disconnected. Use \\connect to attach to the dummy database.",
    };
  }

  async getSchema(): Promise<SchemaInfo> {
    this.ensureConnected();
    const tables = await this.client.$queryRawUnsafe(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );

    const result: SchemaInfo = { tables: [] };
    for (const row of tables) {
      const tableName = row.name as string;
      if (tableName.startsWith("sqlite_") || tableName.startsWith("_prisma")) {
        continue;
      }
      const columns = await this.client.$queryRawUnsafe(`PRAGMA table_info("${tableName}")`);
      result.tables.push({
        name: tableName,
        columns: columns.map((c: any) => ({
          name: c.name,
          type: c.type,
          nullable: !c.notnull,
          isPrimaryKey: Boolean(c.pk),
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
    if (error instanceof Error) {
      const raw = error.message;
      const match = raw.match(/Raw query failed\. Code: `[^`]+`\. Message: `([^`]+)`/);
      if (match) return match[1];
      const prismaMatch = raw.match(/Invalid `[^`]+` invocation:\s*([\s\S]*)/);
      if (prismaMatch) return prismaMatch[1].trim();
      return raw;
    }
    return String(error);
  }
}
