# Database Connection Guide

The SQL IDE connects to **PostgreSQL** by default. It is database-agnostic in
design: the IDE talks to the database only through a provider interface
(`src/models/databaseProvider.js`), so the active database is a configuration
decision rather than a code change.

---

## 1. How a database is expected to be connected

Every provider implements one contract:

| Method           | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `connect()`      | Open a connection to the configured database.                  |
| `disconnect()`   | Close the connection.                                          |
| `getStatus()`    | Report whether the IDE is currently connected.                 |
| `getSchema()`    | Return the database schema (tables + columns) for the explorer. |
| `executeQuery()` | Run a SQL string and return rows or a normalized error.        |

One provider ships with the project:

- **`PrismaProvider`** (`src/models/prismaProvider.js`) — **default and only.** The
  application's PostgreSQL database, accessed through the main Prisma schema
  (`prisma/schema.prisma`) and the `@prisma/adapter-pg` driver adapter.

The provider is selected by the `DB_MODE` environment variable in
`src/models/providerFactory.js` (default: `prisma`).

### Connection pinning

`PrismaProvider` creates its own `pg.Pool` with `max: 1` and hands it to
`PrismaPg` via `disposeExternalPool`, so the pool is torn down by
`$disconnect()`. Pinning to one connection is what makes transaction control
(`BEGIN` / `COMMIT` / `ROLLBACK` / `SAVEPOINT`) reliable: with the adapter's
default pool a later statement could be dispatched to a different connection
and silently escape the open transaction. The trade-off is that queries are
serialized — one slow query blocks the others.

### Multiple statements

`executeQuery()` takes a **single** statement. The driver adapter cannot run a
multi-statement batch: `node-postgres` returns one result per statement and
`@prisma/adapter-pg` destructures that array as a single result, which surfaced
as `Cannot read properties of undefined (reading 'map')`.

`queryService.runQuery()` therefore splits the script first (see
`src/utils/sqlStatements.js`) and calls the provider once per statement,
returning an ordered `statements[]` array. The provider also rejects a
multi-statement string defensively, so an adapter `TypeError` can never reach
the user.

---

## 2. Required environment variables / configuration

Variables are read from a `.env` file in the project root (gitignored) and from
the process environment. Start from the template:

```bash
cp .env.example .env
```

| Variable       | Required | Default  | Description                               |
| -------------- | -------- | -------- | ----------------------------------------- |
| `DATABASE_URL` | **yes**  | —        | PostgreSQL connection string for the IDE. |
| `DB_MODE`      | no       | `prisma` | `prisma` (PostgreSQL, default and only).  |
| `PORT`         | no       | `3000`   | Port the IDE listens on.                  |

`DB_MODE` is case-insensitive and ignores surrounding whitespace. Accepted
aliases: `prisma`, `postgres`, `postgresql`, `pg`, `real` → PostgreSQL. An
unrecognised value is rejected at startup with an error rather than falling back,
so a typo can never silently point the IDE at the wrong database. Leaving it unset
or blank uses the default (`prisma`).

> `DB_MODE=dummy` / `sqlite` were removed along with the SQLite sample database.
> They now fail at startup with a message telling you to use `prisma`.
>
> Check which database you are on with `\status` in the IDE terminal, or the
> mode shown in the startup banner.

The root `prisma7.config.ts` reads `DATABASE_URL` for **every** Prisma CLI
command (including `prisma generate`), so keep it set even before the real
database is provisioned.

---

## 3. Database connection format

PostgreSQL connection string:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
```

Variants:

```
# Managed Postgres (Neon / Supabase / RDS) — use the pooled or direct URL your provider gives you
postgresql://user:password@ep-example.us-east-2.aws.neon.tech/dbname?schema=public

# Local development
postgresql://postgres:postgres@localhost:5432/case_select?schema=public
```

Optional query parameters: `schema` (defaults to `public`), `sslmode`,
`connection_limit`.

> **Quoted identifiers.** Prisma maps camelCase model fields to camelCase
> PostgreSQL columns (e.g. `caseName` → `"caseName"`). PostgreSQL folds unquoted
> identifiers to lowercase, so raw SQL must quote them:
> `SELECT * FROM cases WHERE "caseId" = 1`. Lowercase / `snake_case` columns
> such as `users.username` need no quotes. The schema explorer shows the exact
> column names as stored, so copy them from there.

---

## 4. Setup

```bash
# 1. Install dependencies
npm install

# 2. Put your PostgreSQL connection string in .env
cp .env.example .env
#    edit DATABASE_URL

# 3. Generate the Prisma client for the main schema
npm run db:generate

# 4. Create the tables in your database (dev only)
npx prisma db push --schema prisma/schema.prisma

# 5. Start the IDE
npm run dev
```

Open http://localhost:3000, click **Connect**, and the schema explorer loads
your PostgreSQL schema.

> Step 4 (`db push`) is for local development. Use
> `npx prisma migrate deploy` against real environments.

### Pointing the IDE at a different PostgreSQL database

Edit `DATABASE_URL` in `.env` and restart (`npm run dev`). Nothing in `src/`
needs to change.

---

## 5. Frontend ↔ backend API contract

The frontend (`src/views/index.html` + `public/js/ide.js`) talks JSON to
`/api/ide`.

| Method | Endpoint       | Body      | Response                                        |
| ------ | -------------- | --------- | ----------------------------------------------- |
| GET    | `/status`      | —         | `{ connected, mode, message }`                  |
| POST   | `/connect`     | —         | `{ connected, mode, message }`                  |
| POST   | `/disconnect`  | —         | `{ connected, mode, message }`                  |
| GET    | `/schema`      | —         | `{ tables: [{ name, columns: [...] }] }`        |
| POST   | `/query`       | `{ sql }`  | `ExecuteOutcome`                                |
| POST   | `/command`     | `{ input }`| `ExecuteOutcome`                                |

`ExecuteOutcome` on success:

```json
{
  "success": true,
  "result": {
    "columns": ["id", "username"],
    "rows": [{ "id": 1, "username": "ada" }],
    "rowCount": 1,
    "durationMs": 5.78
  },
  "message": "1 row(s) returned in 5.78 ms"
}
```

On failure (`success: false`, no `result`):

```json
{ "success": false, "error": "relation \"no_such_table\" does not exist" }
```

When `sql` contains more than one statement, `statements` is present instead of
`result`, in execution order. Execution stops at the first failure, so the array
may be shorter than the number of statements submitted:

```json
{
  "success": false,
  "statements": [
    {
      "index": 1,
      "statement": "SELECT * FROM cases",
      "success": true,
      "result": { "columns": ["id"], "rows": [{ "id": 1 }], "rowCount": 1, "durationMs": 4.1 },
      "message": "1 row(s) returned in 4.1 ms"
    },
    {
      "index": 2,
      "statement": "SELECT * FROM nope",
      "success": false,
      "error": "relation \"nope\" does not exist"
    }
  ],
  "message": "Stopped at statement 2 of 3 — 1 of 2 executed statement(s) succeeded.",
  "error": "relation \"nope\" does not exist (statement 2 of 3)"
}
```

**Status codes** — `200` success · `400` malformed request · `422` statement ran
but failed · `502` database unreachable / not connected.

### Terminal commands

| Command      | Effect                                    |
| ------------ | ----------------------------------------- |
| `\connect`   | Connect to the configured database        |
| `\disconnect`| Disconnect                                |
| `\status`    | Connection status                         |
| `\dt`        | List tables                               |
| `\d <table>` | Describe a table's columns                |
| `\history`   | Executed query history                    |
| `\help`      | Help                                      |
| `\clear`     | Clear the terminal                        |

---

## 6. Project layout

```
prisma/                 # Main PostgreSQL schema + migrations (application-owned).
generated/
  prisma/               # Generated client for the main schema.
src/
  config/               # Env-driven configuration (DB_MODE, DATABASE_URL, paths).
  models/               # Provider interface, PrismaProvider, factory.
  services/             # Connection, schema, query/command services.
  controllers/          # HTTP handlers for /api/ide.
  routes/               # Express routes.
  middleware/           # 404 + error handling.
  utils/                # Row serialization, SQL statement splitting.
  views/index.html      # The SQL IDE page.
public/
  css/ide.css           # IDE styling.
test/                    # Unit tests (npm test).
  js/ide.js             # IDE frontend logic.
```
