import { splitSqlStatements } from "../utils/sqlStatements.js";
import { getProvider } from "./providerManager.js";
import { connectionService } from "./connectionService.js";
import { schemaService } from "./schemaService.js";

const history = [];

export const queryService = {
  /**
   * Runs a SQL script through the active provider.
   *
   * A script may contain several statements. The driver adapter cannot execute
   * a multi-statement batch (node-postgres returns one result per statement),
   * so the script is split and each statement is run on its own, in order,
   * sharing one pinned connection so transaction control keeps working. Execution
   * stops at the first failure; statements that already succeeded are still
   * reported.
   */
  async runQuery(sql) {
    const statements = splitSqlStatements(sql);

    if (statements.length === 0) {
      return { success: false, error: "No executable SQL statement found." };
    }

    // Single statement: unchanged behaviour and response shape.
    if (statements.length === 1) {
      const outcome = await getProvider().executeQuery(statements[0]);
      if (outcome.success) {
        history.push(sql);
      }
      return outcome;
    }

    const provider = getProvider();
    const results = [];
    let failure = null;

    for (const [offset, statement] of statements.entries()) {
      const index = offset + 1;
      const outcome = await provider.executeQuery(statement);
      const entry = { index, statement, success: outcome.success };

      if (outcome.result) entry.result = outcome.result;
      if (outcome.message) entry.message = outcome.message;
      if (outcome.error) entry.error = outcome.error;

      results.push(entry);
      if (!outcome.success) {
        failure = entry;
        break;
      }
    }

    if (results.some((entry) => entry.success)) {
      history.push(sql);
    }

    const succeeded = results.filter((entry) => entry.success).length;
    const total = statements.length;
    const ran = results.length;

    if (failure) {
      return {
        success: false,
        statements: results,
        message:
          `Stopped at statement ${failure.index} of ${total} — ` +
          `${succeeded} of ${ran} executed statement(s) succeeded.`,
        error: `${failure.error ?? "Statement failed."} (statement ${failure.index} of ${total})`,
      };
    }

    const rows = results.reduce((sum, entry) => sum + (entry.result?.rowCount ?? 0), 0);
    return {
      success: true,
      statements: results,
      message: `${total} statement(s) executed, ${rows} row(s) returned.`,
    };
  },

  /**
   * Runs a backslash command (psql-style) in the SQL/database terminal.
   * Returns terminal-friendly output.
   */
  async runCommand(input) {
    const trimmed = input.trim();
    const [name, ...rest] = trimmed.slice(1).split(/\s+/);
    const command = (name ?? "").toLowerCase();
    const arg = rest.join(" ");

    switch (command) {
      case "connect":
      case "c": {
        const status = await connectionService.connect();
        return { success: true, message: status.message };
      }

      case "disconnect": {
        const status = await connectionService.disconnect();
        return { success: true, message: status.message };
      }

      case "status": {
        const status = await connectionService.status();
        return { success: true, message: status.message };
      }

      case "dt":
      case "tables": {
        const schema = await schemaService.loadSchema();
        if (schema.tables.length === 0) {
          return { success: true, message: "No tables found." };
        }
        const lines = schema.tables.map((t) => `  ${t.name} (${t.columns.length} columns)`);
        return { success: true, message: `Tables:\n${lines.join("\n")}` };
      }

      case "d":
      case "describe": {
        if (!arg) {
          return { success: false, error: "Usage: \\d <table>" };
        }
        const schema = await schemaService.loadSchema();
        const table = schema.tables.find((t) => t.name.toLowerCase() === arg.toLowerCase());
        if (!table) {
          return { success: false, error: `Table "${arg}" not found.` };
        }
        const lines = table.columns.map(
          (c) => `  ${c.name.padEnd(20)} ${c.type.padEnd(16)} ${c.nullable ? "null" : "not null"}${c.isPrimaryKey ? "  [PK]" : ""}`,
        );
        return { success: true, message: `Table "${table.name}":\n${lines.join("\n")}` };
      }

      case "history": {
        if (history.length === 0) {
          return { success: true, message: "No queries yet." };
        }
        const lines = history.map((q, i) => `  ${(i + 1).toString().padStart(3)}  ${q}`);
        return { success: true, message: `Query history:\n${lines.join("\n")}` };
      }

      case "help":
      case "?":
        return {
          success: true,
          message: [
            "Available commands:",
            "  \\connect              Connect to the configured database",
            "  \\disconnect           Disconnect from the database",
            "  \\status               Show connection status",
            "  \\dt, \\tables          List all tables",
            "  \\d <table>            Describe a table's columns",
            "  \\history              Show executed query history",
            "  \\help, \\?             Show this help",
            "  \\clear                Clear the terminal",
            "",
            "Any other input is treated as SQL and executed.",
          ].join("\n"),
        };

      case "clear":
        return { success: true, message: "__CLEAR__" };

      default:
        return { success: false, error: `Unknown command: \\${command}. Type \\help for available commands.` };
    }
  },

  getHistory() {
    return [...history];
  },
};
