/**
 * Converts raw driver values into JSON-safe primitives and returns the
 * column names shared by every row. BigInt and Date are not JSON-serializable
 * out of the box, so they are normalized here.
 */
export function serializeRows(raw: unknown[]): {
  columns: string[];
  rows: Record<string, unknown>[];
} {
  if (raw.length === 0) {
    return { columns: [], rows: [] };
  }

  const columns = Object.keys(raw[0] as Record<string, unknown>);
  const rows = raw.map((row) => {
    const out: Record<string, unknown> = {};
    for (const column of columns) {
      out[column] = serializeValue((row as Record<string, unknown>)[column]);
    }
    return out;
  });

  return { columns, rows };
}

function serializeValue(value: unknown): unknown {
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "object") {
    return JSON.parse(JSON.stringify(value, (_key, v) => (typeof v === "bigint" ? Number(v) : v)));
  }
  return value;
}
