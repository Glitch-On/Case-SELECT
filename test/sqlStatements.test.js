import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  isMultiStatement,
  isTransactionControl,
  splitSqlStatements,
} from "../src/utils/sqlStatements.js";

/**
 * The splitter strips the trailing `;` terminator from each statement (PostgreSQL
 * does not require it) but preserves all other text verbatim, including
 * leading/interior whitespace and comments.
 */

test("splits plain statements on top-level semicolons", () => {
  assert.deepEqual(splitSqlStatements("SELECT 1; SELECT 2;"), ["SELECT 1", " SELECT 2"]);
});

test("a single statement is returned whole", () => {
  assert.deepEqual(splitSqlStatements("SELECT * FROM cases"), ["SELECT * FROM cases"]);
});

test("strips the statement terminator", () => {
  assert.deepEqual(splitSqlStatements("SELECT 1 AS a;"), ["SELECT 1 AS a"]);
  assert.deepEqual(splitSqlStatements("SELECT 1 AS a"), ["SELECT 1 AS a"]);
});

test("ignores semicolons inside single-quoted literals", () => {
  assert.deepEqual(splitSqlStatements("SELECT ';' AS a;"), ["SELECT ';' AS a"]);
  assert.deepEqual(splitSqlStatements("SELECT ';' AS a; SELECT 'x;y' AS b;"), [
    "SELECT ';' AS a",
    " SELECT 'x;y' AS b",
  ]);
});

test("handles doubled single quotes as an escape", () => {
  assert.deepEqual(splitSqlStatements("SELECT 'it''s; fine' AS a;"), ["SELECT 'it''s; fine' AS a"]);
});

test("handles backslash escapes in E'' strings", () => {
  assert.deepEqual(splitSqlStatements("SELECT E'a\\';b' AS a;"), ["SELECT E'a\\';b' AS a"]);
});

test("ignores semicolons inside quoted identifiers", () => {
  assert.deepEqual(splitSqlStatements('SELECT 1 AS "a;b";'), ['SELECT 1 AS "a;b"']);
});

test("handles doubled double quotes in identifiers", () => {
  assert.deepEqual(splitSqlStatements('SELECT 1 AS "a""b;c";'), ['SELECT 1 AS "a""b;c"']);
});

test("ignores semicolons inside dollar-quoted bodies", () => {
  assert.deepEqual(splitSqlStatements("SELECT $$a;b$$ AS a;"), ["SELECT $$a;b$$ AS a"]);
  assert.deepEqual(splitSqlStatements("SELECT $body$a;b$body$ AS a; SELECT 2;"), [
    "SELECT $body$a;b$body$ AS a",
    " SELECT 2",
  ]);
});

test("does not treat positional placeholders as dollar quotes", () => {
  assert.deepEqual(splitSqlStatements("SELECT $1; SELECT $2;"), ["SELECT $1", " SELECT $2"]);
});

test("ignores semicolons inside line comments", () => {
  assert.deepEqual(splitSqlStatements("SELECT 1; -- trailing; note\nSELECT 2;"), [
    "SELECT 1",
    " -- trailing; note\nSELECT 2",
  ]);
});

test("ignores semicolons inside block comments", () => {
  assert.deepEqual(splitSqlStatements("SELECT /* a;b */ 1;"), ["SELECT /* a;b */ 1"]);
});

test("handles nested block comments", () => {
  const sql = "SELECT /* outer /* inner; */ still; */ 1; SELECT 2;";
  assert.deepEqual(splitSqlStatements(sql), [
    "SELECT /* outer /* inner; */ still; */ 1",
    " SELECT 2",
  ]);
});

test("a semicolon after a comment-continued statement still splits", () => {
  assert.equal(splitSqlStatements("SELECT 1\n-- comment\n; SELECT 2;").length, 2);
});

test("drops empty fragments from repeated and trailing semicolons", () => {
  assert.deepEqual(splitSqlStatements("SELECT 1;;;"), ["SELECT 1"]);
  assert.deepEqual(splitSqlStatements("; SELECT 1;"), [" SELECT 1"]);
});

test("returns an empty array for blank input", () => {
  assert.deepEqual(splitSqlStatements(""), []);
  assert.deepEqual(splitSqlStatements("   \n\t  "), []);
  assert.deepEqual(splitSqlStatements(";"), []);
});

test("returns an empty array for comment-only input", () => {
  assert.deepEqual(splitSqlStatements("-- nothing here"), []);
  assert.deepEqual(splitSqlStatements("/* nothing */"), []);
});

test("handles a realistic multi-statement script", () => {
  const sql = ["SELECT * FROM case_progress;", "", "SELECT * FROM cases;"].join("\n");
  const parts = splitSqlStatements(sql);
  assert.equal(parts.length, 2);
  assert.match(parts[0], /case_progress/);
  assert.match(parts[1], /cases/);
});

test("does not split inside a function body with a semicolon in a string", () => {
  const parts = splitSqlStatements("SELECT replace('a;b', ';', ',') AS r; SELECT 2;");
  assert.equal(parts.length, 2);
  assert.match(parts[0], /replace/);
});

test("preserves leading and trailing whitespace inside each statement", () => {
  assert.deepEqual(splitSqlStatements("  SELECT 1;  SELECT 2;  "), ["  SELECT 1", "  SELECT 2"]);
});

test("isMultiStatement reflects the statement count", () => {
  assert.equal(isMultiStatement("SELECT 1"), false);
  assert.equal(isMultiStatement("SELECT 1;"), false);
  assert.equal(isMultiStatement("SELECT 1; SELECT 2"), true);
  assert.equal(isMultiStatement("SELECT ';' AS a;"), false);
});

test("recognises transaction control statements", () => {
  for (const sql of [
    "BEGIN",
    "begin;",
    "COMMIT",
    "ROLLBACK",
    "SAVEPOINT sp1",
    "ROLLBACK TO sp1",
    "RELEASE sp1",
  ]) {
    assert.equal(isTransactionControl(sql), true, `expected ${sql} to be TCL`);
  }
});

test("does not treat ordinary statements as transaction control", () => {
  for (const sql of [
    "SELECT 1",
    "INSERT INTO t VALUES (1)",
    "BEGINNER",
    "-- BEGIN\nSELECT 1",
  ]) {
    assert.equal(isTransactionControl(sql), false, `expected ${sql} not to be TCL`);
  }
});