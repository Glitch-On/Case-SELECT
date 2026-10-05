import { connectionService } from "../services/connectionService.js";
import { schemaService } from "../services/schemaService.js";
import { queryService } from "../services/queryService.js";

function toMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const sqlIdeController = {
  async status(_req, res) {
    const status = await connectionService.status();
    res.json(status);
  },

  async connect(_req, res) {
    try {
      const status = await connectionService.connect();
      res.json(status);
    } catch (error) {
      res.status(502).json({ connected: false, message: toMessage(error) });
    }
  },

  async disconnect(_req, res) {
    const status = await connectionService.disconnect();
    res.json(status);
  },

  async schema(_req, res) {
    try {
      const schema = await schemaService.loadSchema();
      res.json(schema);
    } catch (error) {
      res.status(502).json({ error: toMessage(error) });
    }
  },

  async query(req, res) {
    const sql = typeof req.body?.sql === "string" ? req.body.sql : "";
    if (!sql.trim()) {
      res.status(400).json({ success: false, error: "Request body must include a non-empty 'sql' string." });
      return;
    }
    try {
      const outcome = await queryService.runQuery(sql);
      res.status(outcome.success ? 200 : 422).json(outcome);
    } catch (error) {
      res.status(502).json({ success: false, error: toMessage(error) });
    }
  },

  async command(req, res) {
    const input = typeof req.body?.input === "string" ? req.body.input : "";
    if (!input.trim()) {
      res.status(400).json({ success: false, error: "Request body must include a non-empty 'input' string." });
      return;
    }
    try {
      const outcome = await queryService.runCommand(input);
      res.status(outcome.success ? 200 : 422).json(outcome);
    } catch (error) {
      res.status(502).json({ success: false, error: toMessage(error) });
    }
  },
};
