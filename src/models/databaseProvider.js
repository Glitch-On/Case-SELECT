/**
 * Database provider contract for the SQL IDE.
 *
 * The IDE only ever talks to this contract, which keeps it database-agnostic: any
 * database the backend can reach is exposed through a provider implementing it.
 * PrismaProvider is currently the only implementation (PostgreSQL); adding
 * another dialect means adding a provider, not touching the IDE.
 *
 * This file documents that contract. It intentionally exports nothing — the
 * shapes below are described in prose because this is a plain JavaScript project
 * with no type checker. `src/models/prismaProvider.js` is the reference
 * implementation.
 *
 * Every provider must expose:
 *
 *   dialect            Short label for the provider, e.g. "postgresql".
 *   connect()          Opens the connection. Rejects if it cannot connect.
 *   disconnect()       Closes the connection. Safe to call when not connected.
 *   getStatus()        -> { connected: boolean, mode: string, message: string }
 *   getSchema()        -> { tables: TableInfo[] }
 *   executeQuery(sql)  -> ExecuteOutcome
 *
 * Where TableInfo is { name: string, columns: ColumnInfo[] } and ColumnInfo is
 * { name: string, type: string, nullable: boolean, isPrimaryKey: boolean }.
 *
 * ExecuteOutcome describes the run of one script:
 *
 *   success      boolean. Whether every executed statement succeeded.
 *   result       Present when a single statement returned rows (a query).
 *                QueryResult is { columns: string[], rows: object[],
 *                rowCount: number, durationMs: number }.
 *   statements   Present when the script contained more than one statement.
 *                Entries are StatementOutcome objects in execution order:
 *                { index: number (1-based), statement: string, success: boolean,
 *                result?: QueryResult, message?: string, error?: string }.
 *                Execution stops at the first failure, so a successful outcome
 *                may list fewer statements than the script contained.
 *   message      Human-readable feedback (row counts, command output, timing).
 *   error        Present when the statement or command failed.
 */