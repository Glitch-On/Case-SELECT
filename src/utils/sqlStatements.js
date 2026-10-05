/**
 * Splits a SQL script into individual statements on top-level semicolons.
 *
 * A plain `sql.split(";")` is not safe: PostgreSQL allows semicolons inside
 * string literals, quoted identifiers, dollar-quoted bodies, and comments. This
 * scanner tracks those contexts so only real statement terminators split.
 *
 * Recognised contexts:
 *   - 'text'        single-quoted literal; '' is an escaped quote
 *   - E'...'        escape string literal; backslash escapes are honoured
 *   - "ident"       quoted identifier; "" is an escaped quote
 *   - $tag$...$tag$ dollar-quoted body, with a matching closing tag
 *   - -- ...        line comment, ends at a newline
 *   - slash-star    block comment, ends at star-slash (nestable in PostgreSQL)
 */

function createState() {
  return {
    quote: null,
    backslashEscapes: false,
    dollarTag: null,
    blockDepth: 0,
    inLineComment: false,
  };
}

/**
 * Matches a dollar-quote opener such as `$$` or `$tag$` and returns the full tag.
 * Postgres tags follow the identifier rules, so a bare `$1` placeholder is not
 * a valid tag and is correctly rejected.
 */
function matchDollarTag(sql, at) {
  if (sql[at] !== "$") return null;
  let i = at + 1;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "$") return sql.slice(at, i + 1);
    const isTagStart = i === at + 1;
    if (!(ch === "_" || /[A-Za-z]/.test(ch) || (!isTagStart && /[0-9]/.test(ch)))) {
      return null;
    }
    i += 1;
  }
  return null;
}

/**
 * True when a fragment contains something the database can actually execute.
 * A fragment made only of whitespace and comments is not a statement, so it is
 * dropped rather than sent as a pointless round-trip. Comment removal here is
 * deliberately naive: it only guards a boolean, so being imprecise inside a
 * string literal can at worst keep a fragment we would otherwise have dropped.
 */
function hasExecutableContent(text) {
  const withoutComments = text
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ");
  return withoutComments.trim().length > 0;
}

/**
 * Splits a SQL script into statements. Returns an empty array for blank input.
 * Each returned entry keeps its original text (minus the terminating `;`) so it
 * can be sent to the database verbatim.
 */
export function splitSqlStatements(sql) {
  const statements = [];
  const state = createState();
  let start = 0;
  let i = 0;

  const push = (end) => {
    const text = sql.slice(start, end);
    if (hasExecutableContent(text)) statements.push(text);
  };

  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];

    // ── Line comment: -- to end of line ──
    if (state.inLineComment) {
      if (ch === "\n") state.inLineComment = false;
      i += 1;
      continue;
    }

    // ── Block comment: /* ... */, nestable ──
    if (state.blockDepth > 0) {
      if (ch === "/" && next === "*") {
        state.blockDepth += 1;
        i += 2;
        continue;
      }
      if (ch === "*" && next === "/") {
        state.blockDepth -= 1;
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }

    // ── Dollar-quoted body: $tag$ ... $tag$ ──
    if (state.dollarTag) {
      if (ch === "$" && sql.startsWith(state.dollarTag, i)) {
        i += state.dollarTag.length;
        state.dollarTag = null;
        continue;
      }
      i += 1;
      continue;
    }

    // ── Quoted literal or identifier ──
    if (state.quote) {
      if (state.backslashEscapes && ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === state.quote) {
        // Doubled quote is an escaped quote, not a terminator.
        if (next === state.quote) {
          i += 2;
          continue;
        }
        state.quote = null;
        state.backslashEscapes = false;
        i += 1;
        continue;
      }
      i += 1;
      continue;
    }

    // ── Not in any context: look for the next thing that starts one ──
    if (ch === "-" && next === "-") {
      state.inLineComment = true;
      i += 2;
      continue;
    }
    if (ch === "/" && next === "*") {
      state.blockDepth = 1;
      i += 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      state.quote = ch;
      state.backslashEscapes = false;
      i += 1;
      continue;
    }
    // E'' / e'' escape strings honour backslash escapes.
    if ((ch === "E" || ch === "e") && next === "'") {
      const before = sql[i - 1];
      const startsToken = before === undefined || !/[A-Za-z0-9_$]/.test(before);
      if (startsToken) {
        state.quote = "'";
        state.backslashEscapes = true;
        i += 2;
        continue;
      }
    }
    if (ch === "$") {
      const tag = matchDollarTag(sql, i);
      if (tag) {
        state.dollarTag = tag;
        i += tag.length;
        continue;
      }
    }
    if (ch === ";") {
      push(i);
      i += 1;
      start = i;
      continue;
    }

    i += 1;
  }

  push(sql.length);
  return statements;
}

/** True when the script contains more than one statement. */
export function isMultiStatement(sql) {
  return splitSqlStatements(sql).length > 1;
}

/**
 * True when the statement is transaction control (TCL). These must share a
 * connection with the statements around them, which the IDE guarantees by
 * pinning the provider to a single connection.
 */
export function isTransactionControl(sql) {
  const normalized = sql
    .replace(/--[^\n]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .trim()
    .toLowerCase()
    .replace(/;+$/, "")
    .trim();
  return /^(begin|start transaction|commit|end|rollback|savepoint|release|rollback to|prepare transaction|commit prepared|rollback prepared)\b/.test(
    normalized,
  );
}
