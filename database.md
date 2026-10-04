# Database Connection Guide

This document explains how the SQL IDE connects to a database, how to run it
against the local dummy database, and how to switch to the real database.

The SQL IDE is **database-agnostic**: it talks to the database exclusively
through a provider interface (`src/models/databaseProvider.ts`). The active
provider is chosen at runtime from configuration, so switching databases is a
config change — not a code change.

---

## 1. How a database is expected to be connected

The backend exposes a single contract that every database provider implements:

| Method          | Purpose                                                        |
| --------------- | -------------------------------------------------------------- |
| `connect()`     | Open a connection to the configured database.                  |
| `disconnect()`  | Close the connection.                                          |
| `getStatus()`   | Report whether the IDE is currently connected.                 |
| `getSchema()`   | Return the database schema (tables + columns) for the explorer. |
| `executeQuery()`| Run a SQL string and return rows or a normalized error.        |

Two providers ship with the project:

- **`DummyProvider`** (`src/models/dummyProvider.ts`) — local SQLite database
  used for development and testing. This is the default.
- **`PrismaProvider`** (`src/models/prismaProvider.ts`) — the application's real
  database (PostgreSQL) via the main Prisma schema. Ships unconnected.

The provider is selected by the `DB_MODE` environment variable (see below) in
`src/models/providerFactory.ts`.

---

## 2. Required environment variables / configuration

Variables are read from a `.env` file in the project root (gitignored) and from
the process environment. Copy `.env.example` to `.env` to get started.

| Variable            | Required | Default   | Description                                                        |
| ------------------- | -------- | --------- | ------------------------------------------------------------------ |
| `DB_MODE`           | no       | `dummy`   | `dummy` for the SQLite sample DB, `prisma` for the real database. |
| `DUMMY_DATABASE_URL`| no       | `file:./dev.db` (relative to `prisma-dummy/schema.prisma`) | SQLite file path for the dummy database. |
| `DATABASE_URL`      | yes (prisma mode) | — | PostgreSQL connection string for the real database. |
| `PORT`              | no       | `3000`    | Port the web IDE listens on.                                       |

> The root `prisma7.config.ts` (used by the main Prisma schema) requires
> `DATABASE_URL` to be present in the environment for *any* Prisma CLI command,
> including `prisma generate`. A placeholder value is provided in `.env.example`
> so local tooling works while the real database stays unconnected.

---

## 3. Database connection format

**Dummy (SQLite)** — a local file, no server required:

```
DUMMY_DATABASE_URL="file:./dev.db"
```

The path is resolved relative to `prisma-dummy/schema.prisma`, so the default
creates `prisma-dummy/dev.db`.

**Real (PostgreSQL)** — a standard connection string:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

The real database uses the main Prisma schema (`prisma/schema.prisma`), whose
datasource is PostgreSQL. Prisma 7 connects through the `@prisma/adapter-pg`
driver adapter; the connection string is passed to it at runtime.

---

## 4. How to replace the dummy database with the real database

1. Set a real PostgreSQL connection string in `.env`:

   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

2. Switch the IDE into real-database mode:

   ```
   DB_MODE=prisma
   ```

3. Restart the IDE (`npm run dev`). The provider factory will now build a
   `PrismaProvider` instead of a `DummyProvider`.

4. In the IDE, click **Connect** (or run `\connect` in the terminal). The schema
   explorer will load the real database's tables, and queries will run against
   it.

To go back to the dummy database, set `DB_MODE=dummy` (or remove the line) and
restart.

> The dummy schema (`prisma-dummy/`) is fully self-contained and never imports
> from the main `prisma/` schema, so the two can evolve independently.

---

## 5. How to start / test the database locally

The dummy database is a SQLite file created and seeded locally — no external
database server is needed.

```bash
# 1. Install dependencies
npm install

# 2. Create the dummy database tables (generates a migration)
npm run db:dummy:migrate

# 3. Seed it with generic sample data
npm run db:dummy:seed

#    …or run both steps together:
npm run db:dummy:setup

# 4. Start the IDE
npm run dev
```

Then open http://localhost:3000, click **Connect**, and run queries such as:

```sql
SELECT * FROM customers LIMIT 10;
SELECT c.firstName, o.status, o.total
FROM customers c JOIN orders o ON o.customerId = c.id;
```

Useful terminal commands: `\dt` (list tables), `\d <table>` (describe a table),
`\status`, `\history`, `\help`.

To reset the dummy database, delete `prisma-dummy/dev.db` and re-run
`npm run db:dummy:setup`.

> `npm run db:dummy:migrate` also (re)generates the dummy Prisma client as a
> side effect, so no separate generate step is needed for dummy mode. For
> `DB_MODE=prisma`, generate the main client once `DATABASE_URL` is set:
> `npx prisma generate --schema prisma/schema.prisma`.

---

## 6. Frontend ↔ backend API contract

The IDE frontend (`src/views/index.html` + `public/js/ide.js`) communicates with
the backend over JSON under `/api/ide`. All endpoints are prefixed with
`/api/ide`.

| Method | Endpoint              | Body                  | Response                                                                 |
| ------ | --------------------- | --------------------- | ------------------------------------------------------------------------ |
| GET    | `/status`             | —                     | `{ connected, mode, message }`                                           |
| POST   | `/connect`            | —                     | `{ connected, mode, message }` (502 on failure)                           |
| POST   | `/disconnect`         | —                     | `{ connected, mode, message }`                                           |
| GET    | `/schema`             | —                     | `{ tables: [{ name, columns: [{ name, type, nullable, isPrimaryKey }] }] }` |
| POST   | `/query`              | `{ sql }`             | `ExecuteOutcome` (see below)                                             |
| POST   | `/command`            | `{ input }`           | `ExecuteOutcome` (see below)                                             |

**`ExecuteOutcome`** — the shared response shape for `/query` and `/command`:

```json
{
  "success": true,
  "result": {
    "columns": ["id", "firstName"],
    "rows": [{ "id": 1, "firstName": "Frank" }],
    "rowCount": 1,
    "durationMs": 1.23
  },
  "message": "1 row(s) returned in 1.23 ms"
}
```

On failure, `success` is `false` and an `error` string is returned instead of
`result`:

```json
{ "success": false, "error": "no such table: nope" }
```

**HTTP status codes**

- `200` — success.
- `400` — malformed request (missing/empty `sql` or `input`).
- `422` — the statement ran but failed (SQL error, unknown command).
- `502` — the backend could not reach the database (e.g. not connected, or the
  real database is unreachable).

The terminal's `\clear` command returns a `message` of `__CLEAR__`, which the
frontend uses to wipe the terminal output.

---

## 7. Project layout (relevant to the database)

```
prisma/                 # Main (real) application schema — PostgreSQL. Off-limits to the IDE.
prisma-dummy/           # Dummy SQLite schema, migration, and seed for local testing.
  schema.prisma
  prisma.config.ts
  seed.ts
  migrations/
  dev.db                # Generated SQLite file (gitignored)
generated/
  prisma/               # Generated client for the main schema (real DB).
  prisma-dummy/         # Generated client for the dummy schema.
src/
  config/               # Env-driven configuration (DB_MODE, paths, port).
  models/               # Provider interface + DummyProvider + PrismaProvider + factory.
  services/             # Connection, schema, and query/command services.
  controllers/          # HTTP handlers for the /api/ide endpoints.
  routes/               # Express route definitions.
  middleware/           # 404 + error handling.
  views/index.html      # The SQL IDE page.
public/
  css/ide.css           # IDE styling.
  js/ide.js             # IDE frontend logic.
```
