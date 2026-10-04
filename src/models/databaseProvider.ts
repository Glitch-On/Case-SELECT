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
  /**
   * Present when a script contained more than one statement. Entries are in
   * execution order and execution stops at the first failure, so a successful
   * outcome may list fewer statements than the script contained.
   */
  statements?: StatementOutcome[];
  /** Human-readable feedback (row counts, command output, timing). */
  message?: string;
  /** Present when the statement or command failed. */
  error?: string;
}

/** The result of running one statement from a multi-statement script. */
export interface StatementOutcome {
  /** 1-based position of the statement within the submitted script. */
  index: number;
  /** The SQL text that was sent to the database. */
  statement: string;
  success: boolean;
  result?: QueryResult;
  message?: string;
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
