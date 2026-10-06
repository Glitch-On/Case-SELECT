# Case-SELECT

A detective game where you investigate crime scenes and solve cases by writing
SQL. Explore an environment, gather clues, interrogate the case database, and
name the culprit.

The project has two halves that run as separate servers:

- **Backend** — Express + Prisma, serves a SQL IDE and the game's REST API.
- **Frontend** — React + Vite, serves the pixel-art detective dashboard and the
  investigation game screen.

---

## Overview

| Piece | Stack | Port |
| --- | --- | --- |
| Backend API + SQL IDE | Express 5, Prisma 7, PostgreSQL | `3000` |
| Frontend dashboard + game screen | React 19, Vite 8, react-router-dom 7 | `5173` |

## Features

- **Detective dashboard** — case statistics and a case grid showing each case's
  status (`LOCKED`, `NOT STARTED`, `IN PROGRESS`, `COMPLETED`).
- **Investigation game screen** — scene frame, case briefing, evidence log, an
  inline SQL console, culprit submission and an in-game terminal.
- **In-game SQL terminal** — opens the existing SQL IDE inside the game screen.
- **SQL IDE** — a standalone database workbench: syntax-highlighted editor,
  terminal for `\commands`, schema explorer and a results table.
- **Light / dark theme** — one token set drives both, on every screen.
- **Responsive layout** — desktop-first, usable down to laptop and tablet widths.

## Architecture

The backend follows the existing MVC layout and is unchanged apart from two
read-only endpoints added for the dashboard.

```
src/
  app.js            Express app: middleware, routers, static views
  config/           Environment-driven configuration
  models/           Database provider interface, providers, factory
  services/         Connection, schema and query services
  controllers/      HTTP handlers (one per resource)
  routes/           Express routers mounted in app.js
  middleware/       404 + error handling
  views/            SQL IDE page (server-rendered HTML)
public/             SQL IDE stylesheet and script
prisma/             Schema, migrations, seed, dev data script
frontend/           React app (dashboard, game screen, pixel components)
```

Data flows one way: **frontend → fetch → router → controller → Prisma →
PostgreSQL**. Controllers never touch Prisma directly and the frontend never
touches the database.

## Frontend Structure

```
frontend/src/
  api/client.js            fetch wrapper; one function per backend route
  components/pixel/        Reusable pixel-art components
  context/                 ThemeContext + ThemeProvider
  data/caseMeta.js         Display metadata + status derivation (dummy data)
  pages/                   Dashboard, GameScreen, PlaceholderPage
  styles/tokens.css        Design tokens: the light/dark palettes
  styles/pixel.css         Component styles, built on those tokens
  game/Game.jsx            Existing Phaser scene (untouched)
  App.jsx                  Routes
```

Reusable components: `PixelButton`, `PixelPanel`, `PixelCard`, `PixelBadge`,
`CaseCard`, `ProgressBar`, `StatCard`, `Sidebar`, `ThemeToggle`, `Modal`,
`Terminal`, `ResultTable`, `CulpritSubmit`, plus `LoadingState`, `ErrorState`
and `EmptyState`.

Routes:

| Route | Screen |
| --- | --- |
| `/` | Dashboard (also `/cases`) |
| `/game/:caseId` | Investigation screen for one case |
| `/evidence`, `/notes`, `/profile` | Placeholders naming the endpoint each needs |
| SQL IDE | Served by the backend at `http://localhost:3000/` |

## Backend Integration

The frontend is database-agnostic: it only knows these HTTP routes. Case
metadata, suspects, evidence and locations are never hardcoded — the one
exception is clearly-marked placeholder copy in `frontend/src/data/caseMeta.js`.

### Endpoints used by the frontend

| Method | Route | Used for |
| --- | --- | --- |
| `GET` | `/api/cases` | Case grid (id, name, step count) |
| `GET` | `/api/cases/:id` | Game screen briefing |
| `GET` | `/api/cases/:id/steps` | Evidence log, locations, active query |
| `GET` | `/api/users/:id/progress` | Per-case status on the dashboard |
| `POST` | `/api/queries/:id/execute` | Inline SQL console (read-only SELECT) |
| `GET` | `/api/ide/status` | SQL IDE connection state |

`GET /api/cases` and `GET /api/users/:id/progress` were added for the dashboard
because no existing route supplied that data. Both are plain read-only
passthroughs over existing models — no game rules, no schema changes. See
[SUGGESTED_IMPROVEMENTS.md](SUGGESTED_IMPROVEMENTS.md) §12.

### Endpoints that do not exist yet

The game screen renders UI for these but cannot function without them, so each
is documented rather than faked:

- Culprit submission and validation
- Suspects list
- Movement / map / scene state
- Hints
- Player XP, level and stats
- Evidence archive and notes

## Game Flow

1. **Dashboard** (`/`) — review your stats and pick a case file.
2. **Open a case** — click a case card to enter `/game/:caseId`.
3. **Briefing** — read the case description and see the evidence log.
4. **Investigate** — write `SELECT` queries in the inline console, or open the
   full **SQL Terminal** for the complete IDE.
5. **Accuse** — name the suspect you believe is responsible.

Progression, query grading and culprit validation are backend responsibilities.
The UI reports what the API returns and does not decide outcomes itself.

## Dashboard

- **Sidebar** — Dashboard, Cases, Evidence, Notes, Profile, SQL IDE, theme toggle.
- **Player header** — the current demo player and a refresh action.
- **Statistics** — completed / in progress / not started / locked / total, all
  derived from the API.
- **Case grid** — case id, title, description, difficulty, status, step progress
  and a start/continue/review action. Locked cases are disabled.
- **Achievements** — earned from status data the backend already returns.

## Game Screen

Laid out to match the game-screen reference:

- **Scene** — investigation area. Shows a static summary of the case's
  locations; the existing Phaser scene can be loaded on demand.
- **Scene controls** — Move, Map, Hint and Menu. Move/Map/Hint render disabled
  because they need game state that does not exist yet.
- **Evidence log** — evidence attached to the case's steps.
- **Case briefing** — description and progress.
- **SQL terminal** — inline console with Run and Full IDE, or open the full IDE.
- **Accuse a suspect** — select, confirm, submit, with loading and feedback states.

## SQL IDE

Available standalone at `http://localhost:3000/` and in-game via **SQL
Terminal**. Provides:

- A syntax-highlighted editor (`Ctrl`/`⌘` + `Enter` to run)
- A terminal for `\commands`
- A schema explorer
- A results table with error feedback
- Explicit `Connect` / `Disconnect`

The IDE reaches the database only through a provider interface
(`src/models/databaseProvider.js`), so changing databases is configuration, not
code. The game screen embeds this page in an iframe rather than duplicating any
of it.

### Multiple statements

Paste several statements at once; each runs in order and gets its own result
block. Execution stops at the first failure, and the error names the statement.

```sql
SELECT * FROM cases;
SELECT * FROM guests;
```

Statement splitting understands SQL, so semicolons inside string literals,
quoted identifiers, `$$` bodies and comments are not mistaken for breaks.

### Transactions

`BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`, `ROLLBACK TO SAVEPOINT` and
`RELEASE` work, in one submission or across several. The provider pins its pool
to a single connection so transaction control applies reliably.

```sql
BEGIN;
UPDATE cases SET "caseName" = 'Renamed' WHERE id = 'C001';
ROLLBACK;   -- change discarded
```

> `INSERT`/`UPDATE`/`DELETE` report `0 row(s)`: the raw query API returns no
> result set for them, so affected-row counts are unavailable.

### Terminal commands

| Command | Effect |
| --- | --- |
| `\connect` | Connect to the configured database |
| `\disconnect` | Disconnect |
| `\status` | Show connection status |
| `\dt` | List all tables |
| `\d <table>` | Describe a table's columns |
| `\history` | Show executed query history |
| `\help` | List available commands |
| `\clear` | Clear the terminal |

### Writing SQL against Prisma models

Prisma maps camelCase model fields to camelCase PostgreSQL columns, so raw SQL
must quote them:

```sql
-- lowercase / snake_case columns need no quotes
SELECT guest_id, guest_name FROM guests WHERE is_suspect = true;

-- camelCase Prisma columns must be quoted
SELECT "caseName" FROM cases WHERE id = 'C001';
```

See [`database.md`](database.md) for full connection and provider details.

## Theme System

`frontend/src/styles/tokens.css` defines one token set; light and dark differ
only in colour values. `ThemeProvider` sets `data-theme` on `<html>`, so every
screen — dashboard, game screen, modal, terminal — reads the same variables and
stays visually consistent. The choice persists in `localStorage` and falls back
to `prefers-color-scheme`.

| | Light | Dark |
| --- | --- | --- |
| Background | `#FFFDF5` warm ivory | `#0D0D0D` near-black |
| Secondary | `#FFF7D6` cream | `#17130F` charcoal |
| Primary | `#FFE58A` | `#24180D` |
| Accent | `#FFD23F` / `#E6A800` gold | `#FF8A00` / `#FFB52E` amber |
| Text | `#3A2A12` deep brown | `#FFF1D0` warm white |

Status colours (success green, warning yellow, danger red, info cyan, evidence
teal, special purple) are accents only, never the base palette.

## Dummy Data

Two separate sources, deliberately kept apart from game logic:

| Source | Contains | Owner |
| --- | --- | --- |
| `prisma/seed.js` | Case C001 and its full investigation dataset | Content team |
| `prisma/dummy-frontend-cases.sql` | Demo player + 4 placeholder cases | Frontend dev only |

The dummy script exists so every dashboard state can be reviewed. It contains
**no** suspects, evidence, locations or clues, and it is idempotent.

```bash
psql "$DATABASE_URL" -f prisma/dummy-frontend-cases.sql
```

It produces:

| Case | Name | Dashboard status |
| --- | --- | --- |
| C001 | The Murderer Is Not a Suspect | `COMPLETED` |
| C002 | The Missing Analyst | `IN PROGRESS` |
| C003 | The Downtown Heist | `NOT STARTED` |
| C004 | The Silent Witness | `NOT STARTED` |
| C005 | The Poisoned Deal | `LOCKED` |

`COMPLETED` and `IN PROGRESS` come from the database. `NOT STARTED` is derived
from a missing progress row. **`LOCKED` is display-only** — a placeholder flag
in `frontend/src/data/caseMeta.js`, because lock rules are progression logic the
frontend must not own. See SUGGESTED_IMPROVEMENTS.md §3.

## Environment Variables

**Backend** — copy `.env.example` to `.env`:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | — | PostgreSQL connection string |
| `DB_MODE` | no | `prisma` | `prisma` (PostgreSQL) — the only mode |
| `PORT` | no | `3000` | Backend port |

`DB_MODE` accepts case-insensitive aliases (`postgres`/`postgresql`/`pg`/`real`).
An unrecognised value is rejected at startup rather than silently falling back.
Run `\status` in the IDE terminal to confirm the active database.

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | no | `http://localhost:3000` | Backend origin |
| `VITE_DEMO_USER_ID` | no | `2` | Player whose progress the dashboard reads |
| `VITE_PORT` | no | `5173` | Dev server port |

> `VITE_DEMO_USER_ID` exists only because the app has no authentication yet.
> See SUGGESTED_IMPROVEMENTS.md §10.

## Installation

### Prerequisites

- **Node.js 22.18+** — Prisma 7 generates a TypeScript client that Node loads
  natively, so type-stripping support is required.
- **npm** (bundled with Node).
- **PostgreSQL** — local or hosted (Neon, Supabase, RDS…).

No native build toolchain is needed: `npm install` requires neither Visual
Studio C++ build tools nor Python/node-gyp.

### Steps

```bash
# 1. Backend dependencies
npm install

# 2. Configure the database
cp .env.example .env
#    edit DATABASE_URL

# 3. Generate the Prisma client
npm run db:generate

# 4. Create the tables
npx prisma db push --schema prisma/schema.prisma   # dev
# npx prisma migrate deploy --schema prisma/schema.prisma   # real environments

# 5. Load content (optional but recommended)
node prisma/seed.js

# 6. Load frontend dev data (optional)
psql "$DATABASE_URL" -f prisma/dummy-frontend-cases.sql

# 7. Frontend dependencies
cd frontend && npm install && cd ..
```

## Running Locally

Two terminals:

```bash
# Terminal 1 — backend on :3000
npm run dev
```

```bash
# Terminal 2 — frontend on :5173
cd frontend && npm run dev
```

Then open:

| URL | What |
| --- | --- |
| <http://localhost:5173> | Dashboard + game screen |
| <http://localhost:3000> | Standalone SQL IDE |

The frontend calls the backend cross-origin, so `src/app.js` allows
`http://localhost:5173` via CORS. If you change the frontend port, update the
CORS origin there too.

## Development

| Script | Description |
| --- | --- |
| `npm run dev` | Backend with file watching |
| `npm start` | Backend, no watching |
| `npm test` | Backend test suite (23 tests) |
| `npm run db:generate` | Regenerate the Prisma client |

| Script (in `frontend/`) | Description |
| --- | --- |
| `npm run dev` | Frontend dev server |
| `npm run build` | Production build to `frontend/dist` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

### Production build

```bash
cd frontend
npm run build      # outputs to frontend/dist
npm run preview    # verify the build locally
```

The dashboard bundle is ~285 kB; the Phaser scene is code-split into its own
chunk and only fetched when a player opens the interactive scene.

## API Expectations

The frontend depends on these response shapes. If the backend team changes
them, `frontend/src/api/client.js` is the only file that needs updating.

```jsonc
// GET /api/cases
[{ "id": "C001", "caseName": "…", "stepCount": 16 }]

// GET /api/cases/:id
{ "id": "C001", "caseName": "…" }

// GET /api/cases/:id/steps
// dialogue/evidence/location/query are null when the step has none
[{ "id": "S001", "caseId": "C001", "sequenceId": 1,
   "dialogueId": "D001", "evidenceId": null, "locationId": "L001", "queryId": null,
   "dialogue": { "id": "D001", "caseId": "C001", "npcId": "N001", "locationId": "L001",
                 "dialoguesList": ["…"],
                 "npc": { "id": "N001", "npcName": "NPC1" } },
   "evidence": null,
   "location": { "id": "L001", "locationName": "The Red Lantern Diner" },
   "query": null }]

// GET /api/users/:id/progress
// sequenceId/locationId/locationName are null unless the player is mid-step
[{ "id": 5, "userId": 2, "caseId": "C001", "status": "COMPLETED",
   "sequenceId": null, "locationId": null, "locationName": null }]

// POST /api/queries/:id/execute
{ "queryId": "Q001", "success": true, "result": [{ "column": "value" }] }
```

Note that the execute endpoint returns rows only — it has no correctness
verdict. See SUGGESTED_IMPROVEMENTS.md §11.

## Project Structure

```
.
├── prisma/
│   ├── schema.prisma              # Prisma schema (PostgreSQL)
│   ├── migrations/                # Applied migrations
│   ├── seed.js                    # Case C001 + investigation content
│   └── dummy-frontend-cases.sql   # Frontend dev data (idempotent)
├── src/                           # Backend (Express, MVC)
│   ├── app.js  server.js  config/  models/  services/
│   ├── controllers/  routes/  middleware/  utils/  views/
├── public/                        # SQL IDE styles + script
├── frontend/
│   ├── src/
│   │   ├── api/  components/pixel/  context/  data/
│   │   ├── pages/  styles/  game/
│   │   ├── App.jsx  main.jsx  index.css
│   │   └── .env.example
│   └── package.json  vite.config.js
├── test/                          # Backend tests
├── database.md                    # Database connection guide
└── SUGGESTED_IMPROVEMENTS.md      # Backend work the frontend cannot own
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `EADDRINUSE` on :3000 | `pkill -f "node src/server.js"` |
| Frontend on :5174 instead of :5173 | :5173 was busy; set `VITE_PORT` or free the port |
| "Could not resolve react-router-dom" | `cd frontend && npm install` — it must be in `package-lock.json` |
| `DATABASE OFFLINE` on the dashboard | Backend not running, or `VITE_API_BASE_URL` is wrong |
| CORS error in the console | Frontend origin must match the CORS origin in `src/app.js` |
| Prisma client errors | `npm run db:generate` |
| Tables missing | `npx prisma db push --schema prisma/schema.prisma` |
| Empty case grid | Load data: `node prisma/seed.js` then the dummy script |
| IDE says "Not connected" | Press **Connect** in the IDE, or run `\connect` |
| Accusation returns "no endpoint yet" | Expected — see SUGGESTED_IMPROVEMENTS.md §4 |
| Google Fonts blocked offline | Fonts fall back to monospace; layout is unaffected |
| Phaser scene blank | It only loads on demand; click "Load interactive scene" |

## Team Responsibility Boundaries

| Area | Responsible |
| --- | --- |
| Backend API, SQL engine, provider abstraction | Backend team |
| Database schema and migrations | Backend team |
| Game logic, progression, scoring, query grading | Game logic team |
| Culprit validation and case solutions | Game logic team |
| Authentication and authorisation | Backend team |
| Case content, story and dialogue | Content team |
| Dashboard, game screen, components, theming, API calls | Frontend team |

The frontend task added only two read-only endpoints (`GET /api/cases`,
`GET /api/users/:id/progress`) because no existing route supplied the data the
dashboard needs. Everything else requiring game or backend logic is recorded in
[SUGGESTED_IMPROVEMENTS.md](SUGGESTED_IMPROVEMENTS.md) rather than implemented.
