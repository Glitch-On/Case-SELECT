/**
 * Thin fetch wrapper around the existing Case-SELECT backend.
 *
 * This module only *reads* and *calls* endpoints the backend already exposes
 * (plus two read-only list endpoints added for the dashboard). It contains no
 * game logic and never invents response shapes — every function maps 1:1 onto a
 * route the server actually serves.
 *
 * Base URL is configurable so a deployed frontend can point at a remote API:
 *   VITE_API_BASE_URL=https://api.example.com
 */

const DEFAULT_BASE_URL = "http://localhost:3000";

export const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL
).replace(/\/+$/, "");

/** Demo player used until real authentication exists. See SUGGESTED_IMPROVEMENTS.md. */
export const DEMO_USER_ID = Number(import.meta.env?.VITE_DEMO_USER_ID || 2);

class ApiError extends Error {
  constructor(message, { status, path } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}

async function request(path, { method = "GET", body } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch only rejects on a transport failure, i.e. the API is unreachable.
    throw new ApiError(
      "DATABASE OFFLINE — could not reach the Case-SELECT API. Is the backend running?",
      { path },
    );
  }

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message || payload?.error || `Request failed (${response.status})`,
      { status: response.status, path },
    );
  }

  return payload;
}

/** Derives a column list from row objects, since the player-query endpoint returns a bare array. */
function columnsFromRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  return Object.keys(rows[0]);
}

export const api = {
  cases: {
    /** GET /api/cases — all cases, with step counts for the dashboard grid. */
    list: () => request("/api/cases"),

    /** GET /api/cases/:id — a single case. */
    get: (id) => request(`/api/cases/${encodeURIComponent(id)}`),

    /** GET /api/cases/:id/steps — the ordered case flow with nested dialogue/evidence/location/query. */
    getSteps: (id) => request(`/api/cases/${encodeURIComponent(id)}/steps`),
  },

  users: {
    /** GET /api/users/:id/progress — this player's progress row per case. */
    progress: (id) => request(`/api/users/${encodeURIComponent(id)}/progress`),
  },

  queries: {
    /**
     * POST /api/queries/:id/execute — runs the player's SELECT and returns rows.
     * Validation of whether the answer is "correct" is game logic and lives on
     * the backend; this endpoint currently returns no verdict.
     */
    execute: async (queryId, sql) => {
      const payload = await request(
        `/api/queries/${encodeURIComponent(queryId)}/execute`,
        { method: "POST", body: { sql } },
      );

      const rows = Array.isArray(payload?.result) ? payload.result : [];

      return {
        queryId: payload?.queryId ?? queryId,
        rows,
        columns: columnsFromRows(rows),
        rowCount: rows.length,
      };
    },
  },

  ide: {
    /** GET /api/ide/status — connection state of the SQL IDE provider. */
    status: () => request("/api/ide/status"),
  },
};

export { ApiError };
