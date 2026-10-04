import type { ExecuteOutcome } from "../models/databaseProvider.ts";
import { getProvider } from "./providerManager.ts";
import { connectionService } from "./connectionService.ts";
import { schemaService } from "./schemaService.ts";

const history: string[] = [];

export const queryService = {
  /** Runs a SQL statement through the active provider. */
  async runQuery(sql: string): Promise<ExecuteOutcome> {
    const outcome = await getProvider().executeQuery(sql);
    if (outcome.success) {
      history.push(sql);
    }
    return outcome;
  },

  /**
   * Runs a backslash command (psql-style) in the SQL/database terminal.
   * Returns terminal-friendly output.
   */
  async runCommand(input: string): Promise<ExecuteOutcome> {
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

  getHistory(): string[] {
    return [...history];
  },
};
