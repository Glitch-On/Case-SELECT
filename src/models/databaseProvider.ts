/**
 * Database provider contract for the SQL IDE.
 *
 * The IDE only ever talks to this interface, which keeps it database-agnostic:
 * any database the backend can reach is exposed through a provider implementing
 * it. PrismaProvider is currently the only implementation (PostgreSQL); adding
 * another dialect means adding a provider, not touching the IDE.
 */

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
}

export interface SchemaInfo {
  tables: TableInfo[];
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  durationMs: number;
}

export interface ExecuteOutcome {
  success: boolean;
  /** Present when the statement returned rows (a query). */
  result?: QueryResult;
  /** Human-readable feedback (row counts, command output, timing). */
  message?: string;
  /** Present when the statement or command failed. */
  error?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  mode: string;
  message: string;
}

export interface DatabaseProvider {
  /** Short label for the provider, e.g. "postgresql". */
  readonly dialect: string;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): Promise<ConnectionStatus>;
  getSchema(): Promise<SchemaInfo>;
  executeQuery(sql: string): Promise<ExecuteOutcome>;
}
