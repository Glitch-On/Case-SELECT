# Suggested Improvements

Everything in this file is **out of scope for the frontend task** and was
deliberately *not* implemented. Each entry records what the frontend needs, why,
and what the responsible team should build.

The rule applied throughout: if a UI feature required game logic, backend
business logic or a schema change, it was documented here instead of being
invented in the browser.

---

## 1. Player stats, XP and level

**[Suggested Improvement]** Persist detective progression (level, XP, evidence
count, queries run) instead of deriving headline numbers from case counts.

**Problem:**
The dashboard needs a player header showing level, XP, evidence discovered and
queries performed. The `User` model has only `id`, `username`, `email`,
`password`, and `UserProgress` carries only `status`, `locationId` and
`sequenceId`. There is nowhere to store a score.

**Why the frontend requires this:**
Progression and scoring are game rules. The frontend currently reports only
counts it can prove from the API (cases completed / in progress / not started /
locked) and deliberately shows nothing for XP or level rather than inventing
numbers.

**Required backend/game change:**
Add progression fields and the rules that update them.

```prisma
model User {
  // ...existing
  xp        Int @default(0)
  level     Int @default(1)
  // evidenceFound / queriesRun could live here or be derived per case
}
```

Plus an endpoint returning the aggregate, e.g. `GET /api/users/:id/stats`.

**Expected frontend contract:**
```json
{
  "userId": 2,
  "username": "detective",
  "level": 3,
  "xp": 1250,
  "xpToNextLevel": 2000,
  "casesCompleted": 1,
  "casesInProgress": 1,
  "evidenceDiscovered": 12,
  "queriesExecuted": 47
}
```

The dashboard's `StatCard` row is already laid out to consume exactly this.

---

## 2. Case metadata: description, difficulty, locked

**[Suggested Improvement]** Store per-case display metadata in the database.

**Problem:**
`Case` has only `id` and `caseName`. The case card needs a short description, a
difficulty rating and a locked/unlocked flag.

**Why the frontend requires this:**
These are case content. The frontend currently ships placeholder copy in
`frontend/src/data/caseMeta.js`, explicitly marked as dummy data and keyed by
case id. It cannot invent descriptions for real cases, and it must not be the
source of truth for difficulty.

**Required backend/game change:**
```prisma
model Case {
  id          String  @id
  caseName    String
  description String? // New
  difficulty  String? // New: easy | medium | hard | expert
  // locked depends on progression rules — see item 3
}
```

**Expected frontend contract:**
`GET /api/cases` returns:
```json
{
  "id": "C001",
  "caseName": "The Murderer Is Not a Suspect",
  "description": "A politician collapses mid-toast...",
  "difficulty": "medium",
  "stepCount": 16
}
```

Once available, delete `DUMMY_CASE_META` from `frontend/src/data/caseMeta.js`.

---

## 3. Lock / unlock progression rules

**[Suggested Improvement]** Make case availability a server decision.

**Problem:**
The `ProgressStatus` enum only has `IN_PROGRESS` and `COMPLETED`. There is no
`LOCKED` or `NOT_STARTED`, and no rule deciding when a case opens up.

**Why the frontend requires this:**
Unlock rules are progression logic. The frontend currently derives:

| Status | Source |
| --- | --- |
| `COMPLETED` | backend reports `COMPLETED` |
| `IN PROGRESS` | backend reports `IN_PROGRESS` |
| `NOT STARTED` | no progress row exists |
| `LOCKED` | display-only flag in dummy metadata |

The first three are safe inferences. **`LOCKED` is not** — it is currently a
hardcoded flag, so a locked case could be opened by navigating straight to
`/game/:id`.

**Required backend/game change:**
Either add the states to the enum, or expose availability on the case list:
```json
{ "id": "C005", "caseName": "The Poisoned Deal", "locked": true, "unlockRule": "complete:C004" }
```
and have `GET /api/cases/:id` reject a locked case for the current player.

**Expected frontend contract:**
`locked: boolean` on each case, and a 403 from the case-detail route when a
player opens a case they have not unlocked. The frontend's `CaseCard` already
disables locked cards and would consume the flag directly.

---

## 4. Culprit submission and validation

**[Suggested Improvement]** Add an endpoint that judges an accusation.

**Problem:**
There is no culprit/verdict endpoint. The game screen has an accusation UI, but
nothing on the server can accept or evaluate it.

**Why the frontend requires this:**
Deciding whether the named suspect is the culprit *is* the core game mechanic.
The frontend therefore implements selection, confirmation, submitting and
loading/error feedback, then attempts the endpoint below. When the server
answers `404` it reports honestly that validation does not exist yet — it never
fabricates a verdict client-side.

**Required backend/game change:**
```
POST /api/cases/:id/submit-culprit
Body: { "suspectName": "Rohan Mehra" }
```
The handler compares against the case solution, updates progress, awards XP and
unlocks follow-on cases.

**Expected frontend contract:**
```json
{
  "success": true,
  "correct": false,
  "message": "Rohan Mehra was in the kitchen, but the poison came from elsewhere.",
  "rewardXp": 0,
  "caseCompleted": false
}
```
`CulpritSubmit` renders `correct` and `message` as-is and needs no rework.

---

## 5. Suspects list endpoint

**[Suggested Improvement]** Expose suspects so players pick rather than type.

**Problem:**
The app has no way to list the people who can be accused.

**Why the frontend requires this:**
`guests.is_suspect` exists in the schema, but there is no endpoint shaped for
the UI, and the frontend must not hardcode a suspects list. The accusation box
is therefore a free-text input.

**Required backend/game change:**
```
GET /api/cases/:id/suspects
```
Returning only the fields needed to choose a suspect.

**Expected frontend contract:**
```json
[{ "id": "G002", "name": "Neha Kapoor", "role": "Political Rival" }]
```
The input then becomes a `<select>`, matching the reference design.

---

## 6. Movement, map and scene APIs

**[Suggested Improvement]** Expose player position and map/scene data.

**Problem:**
The game screen needs **Move**, **Map** and **Scene** controls. `UserProgress`
stores `locationId` and `sequenceId`, but nothing moves the player and there is
no map or scene endpoint.

**Why the frontend requires this:**
Movement is a game-state machine and locations are authored content. The
controls are rendered **disabled** with tooltips pointing here, and the scene
frame falls back to a static summary of the case's locations.

Note: the existing Phaser scene in `frontend/src/game/Game.jsx` already
implements client-side movement for case C001 only. That is pre-existing game
logic and was left untouched — it is not a reusable API.

**Required backend/game change:**
```
GET  /api/cases/:id/state            → current location, step, inventory
POST /api/cases/:id/move             → { "toLocationId": "L003" }
GET  /api/cases/:id/map              → map data
GET  /api/cases/:id/locations/:id    → NPCs and interactables at a location
```

**Expected frontend contract:**
```json
{
  "caseId": "C001",
  "locationId": "L001",
  "locationName": "The Red Lantern Diner",
  "sequenceId": 1,
  "availableExits": [{ "toLocationId": "L002", "label": "Main Dining Hall" }],
  "npcs": [{ "id": "N001", "name": "NPC1" }]
}
```
The controls are wired to be enabled as soon as this exists.

---

## 7. Hint system

**[Suggested Improvement]** Serve in-game hints.

**Problem:**
The reference design includes a **Hint** button; there is no hint content or
endpoint.

**Why the frontend requires this:**
Hints are authored content that usually depends on how stuck a player is. The
button renders disabled.

**Required backend/game change:**
```
GET /api/cases/:id/hints?step=:sequenceId
```

**Expected frontend contract:**
```json
{ "hint": "Check who entered the kitchen after 19:44.", "costXp": 50 }
```

---

## 8. Evidence archive endpoint

**[Suggested Improvement]** List discovered evidence across all cases.

**Problem:**
`/evidence` in the sidebar has nothing to show. Evidence rows exist
(`evidences`, linked via `EvidenceToQuery`) but no endpoint aggregates them.

**Why the frontend requires this:**
The page is a placeholder naming this endpoint.

**Required backend/game change:**
```
GET /api/evidence?userId=:id
```

**Expected frontend contract:**
```json
[{ "id": "EV001", "caseId": "C001", "name": "Mushroom Risotto Order", "foundAt": "2026-10-05T19:50:00Z" }]
```

---

## 9. Notes persistence

**[Suggested Improvement]** Store per-case detective notes.

**Problem:**
The `/notes` page has no backend. Notes are player-authored, not game content.

**Why the frontend requires this:**
Placeholder page only.

**Required backend/game change:**
```
GET  /api/users/:id/notes?caseId=:caseId
POST /api/users/:id/notes   { "caseId": "C001", "body": "..." }
```

**Expected frontend contract:**
```json
[{ "id": 12, "caseId": "C001", "body": "Rohan served the risotto", "updatedAt": "..." }]
```

---

## 10. Authentication and the hardcoded demo user

**[Suggested Improvement]** Replace the fixed demo user with real sessions.

**Problem:**
There is no authentication. The dashboard reads progress for a fixed id from
`VITE_DEMO_USER_ID` (default `2`), and `GET /api/users/:id/progress` takes that
id straight from the URL with no authorisation check.

**Why the frontend requires this:**
Login, session handling and authorisation are the auth team's work. The
frontend exposes no user switcher and stores nothing sensitive.

**Required backend/game change:**
JWT sessions, `POST /api/auth/login`, an auth middleware, and derivation of the
current user server-side instead of from the URL.

**Expected frontend contract:**
```
GET /api/me            → the signed-in player
GET /api/me/progress   → their progress, no id in the path
```
The frontend then drops `VITE_DEMO_USER_ID` and reads `/api/me`.

> The seeded `users.password` value is a placeholder string, not a hash. It must
> be replaced by real authentication work before any deployment.

---

## 11. Query correctness feedback

**[Suggested Improvement]** Tell the player whether a query produced the right answer.

**Problem:**
`Query.queryOutput` stores the expected answer and each query links to the
evidence it unlocks, but `POST /api/queries/:id/execute` returns only
`{ queryId, success, result }`. There is no verdict.

**Why the frontend requires this:**
Grading a query is game logic. The inline console shows the rows returned and
stops there — it does not guess whether the answer was right.

Related: `frontend/src/game/Game.jsx` already reads `data.correct` from this
endpoint, which does not exist in the response. That is pre-existing game code
and was left untouched.

**Required backend/game change:**
Include a verdict in the execute response:
```json
{ "queryId": "Q001", "correct": true, "result": [...], "unlockedEvidence": ["EV001"] }
```

**Expected frontend contract:**
The console can then show a correct/incorrect notice and refresh the evidence
log without a reload.

---

## 12. `GET /api/cases` — new endpoint (implemented, flagged for review)

For transparency: this task **did** add two read-only endpoints because no
existing route could supply the data, and they contain no game logic.

| Endpoint | Why it was needed |
| --- | --- |
| `GET /api/cases` | No case-list route existed; the dashboard cannot build a grid from `/:id` alone. Returns cases with a `stepCount`. |
| `GET /api/users/:id/progress` | No route exposed a player's progress; the dashboard needs it to show case status. |

Both are plain passthroughs over existing models. If the backend team prefers
different shapes or names, they should be adjusted — the frontend only consumes
`id`, `caseName`, `stepCount`, and `{ caseId, status, sequenceId, locationName }`.
