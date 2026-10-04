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
(`src/models/databaseProvider.ts`), so switching databases is a configuration
change rather than a code change.

> Full connection, setup, and API details: **[`database.md`](database.md)**

## Requirements

- Node.js 22.18+ (runs the TypeScript sources directly via native type stripping)
- A PostgreSQL database

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

| Variable       | Required | Default  | Description                                         |
| -------------- | -------- | -------- | --------------------------------------------------- |
| `DATABASE_URL` | yes      | —        | PostgreSQL connection string.                       |
| `DB_MODE`      | no       | `prisma` | `prisma` (PostgreSQL) or `dummy` (SQLite, offline). |
| `PORT`         | no       | `3000`   | Port the IDE listens on.                            |

`DB_MODE` accepts case-insensitive aliases (`postgres`/`postgresql`/`pg`/`real`
→ PostgreSQL; `dummy`/`sqlite` → SQLite). An unrecognised value is rejected at
startup instead of falling back, so a typo can never silently point the IDE at
the wrong database. Run `\status` in the terminal to confirm which database is
active.

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

| Script                   | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `npm run dev`            | Start the IDE with file watching               |
| `npm start`              | Start the IDE                                  |
| `npm run db:generate`    | Generate the Prisma client from `prisma/`      |
| `npm run db:dummy:setup` | Create and seed the optional SQLite dummy DB   |

## Project layout

```
prisma/          # Main PostgreSQL schema and migrations
prisma-dummy/    # Optional SQLite dummy database (offline testing)
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
