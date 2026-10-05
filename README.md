# Case-SELECT

A web game, where people are given crime puzzles where they solve it using SQL commands.

## SQL IDE

A database-agnostic web interface for writing and running SQL against the
configured database. It provides:

- A SQL editor with syntax highlighting (`Ctrl`/`⌘` + `Enter` to run)
- A separate terminal for SQL/database `\commands`
- A schema explorer that loads the database schema dynamically
- A results table for query output, with error feedback
- An explicit database connection interface (`Connect` / `Disconnect`)

The IDE talks to the database only through a provider interface
(`src/models/databaseProvider.js`), so switching databases is a configuration
change rather than a code change.

> Full connection, setup, and API details: **[`database.md`](database.md)**

## Requirements

- Node.js 22.18+ (Prisma 7 generates a TypeScript client that Node loads
  natively, so the 22.18 type-stripping support is still required)
- A PostgreSQL database

No native build toolchain is required — `npm install` needs neither Visual Studio
C++ build tools nor Python/node-gyp. The project is pure JavaScript against
PostgreSQL.

## Getting started

```bash
npm install
cp .env.example .env      # then set DATABASE_URL to your PostgreSQL URL
npm run db:generate       # generate the Prisma client
npm run dev
```

Open <http://localhost:3000> and click **Connect**.

For local development against a fresh database, create the tables first:

```bash
npx prisma db push --schema prisma/schema.prisma
```

> Use `npx prisma migrate deploy` against real environments, not `db push`.

## Configuration

| Variable       | Required | Default  | Description                                   |
| -------------- | -------- | -------- | --------------------------------------------- |
| `DATABASE_URL` | yes      | —        | PostgreSQL connection string.                 |
| `DB_MODE`      | no       | `prisma` | `prisma` (PostgreSQL) — the only mode.        |
| `PORT`         | no       | `3000`   | Port the IDE listens on.                      |

`DB_MODE` accepts case-insensitive aliases (`postgres`/`postgresql`/`pg`/`real`
→ PostgreSQL). An unrecognised value is rejected at startup instead of falling
back, so a typo can never silently point the IDE at the wrong database. Run
`\status` in the terminal to confirm which database is active.

## Multiple statements

You can paste and run several statements at once. Each one runs in order and
gets its own labelled result block, so results with different columns stay
separate:

```sql
SELECT * FROM cases;
SELECT * FROM guests;
```

Execution stops at the first failing statement: results from statements that
already succeeded are still shown, and the error names the statement it came
from.

Statement splitting understands SQL properly, so semicolons inside string
literals, quoted identifiers, `$$` dollar-quoted bodies, and comments are not
mistaken for statement breaks:

```sql
SELECT ';' AS semicolon_in_a_string;   -- one statement
SELECT $$a;b$$ AS dollar_quoted;       -- one statement
```

### Transactions

`BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`, `ROLLBACK TO SAVEPOINT`, and
`RELEASE` all work, in a single submission or across several. The provider pins
its PostgreSQL pool to a single connection so transaction control reliably
applies to the statements that follow it:

```sql
BEGIN;
UPDATE cases SET "caseName" = 'Renamed' WHERE "caseId" = 1;
ROLLBACK;   -- change discarded
```

Because every statement shares one connection, concurrent queries are executed
one after another rather than in parallel.

> `INSERT`/`UPDATE`/`DELETE` execute successfully but report `0 row(s)`: the raw
> query API returns no result set for them, so affected-row counts are not
> available.

## Terminal commands

| Command       | Effect                              |
| ------------- | ----------------------------------- |
| `\connect`    | Connect to the configured database  |
| `\disconnect` | Disconnect                          |
| `\status`     | Show connection status              |
| `\dt`         | List all tables                     |
| `\d <table>`  | Describe a table's columns          |
| `\history`    | Show executed query history         |
| `\help`       | List available commands             |
| `\clear`      | Clear the terminal                  |

## Writing SQL against Prisma models

Prisma maps camelCase model fields to camelCase PostgreSQL columns, so raw SQL
must quote them. See [`database.md`](database.md) for details.

```sql
-- lowercase / snake_case columns need no quotes
SELECT guest_id, guest_name FROM guests WHERE is_suspect = true;

-- camelCase Prisma columns must be quoted
SELECT "caseName" FROM cases WHERE "caseId" = 1;
```

## Scripts

| Script                | Description                               |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Start the IDE with file watching          |
| `npm start`           | Start the IDE                             |
| `npm run db:generate` | Generate the Prisma client from `prisma/` |
| `npm test`            | Run the test suite                        |

## Project layout

```
prisma/          # Main PostgreSQL schema and migrations
src/
  config/        # Environment-driven configuration
  models/        # Provider interface, providers, factory
  services/      # Connection, schema, and query services
  controllers/   # HTTP handlers
  routes/        # Express routes
  middleware/    # Error handling
  views/         # SQL IDE page
public/          # IDE styles and frontend script
```
