import type { Request, Response } from "express";
import { connectionService } from "../services/connectionService.ts";
import { schemaService } from "../services/schemaService.ts";
import { queryService } from "../services/queryService.ts";

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const sqlIdeController = {
  async status(_req: Request, res: Response) {
    const status = await connectionService.status();
    res.json(status);
  },

  async connect(_req: Request, res: Response) {
    try {
      const status = await connectionService.connect();
      res.json(status);
    } catch (error) {
      res.status(502).json({ connected: false, message: toMessage(error) });
    }
  },

  async disconnect(_req: Request, res: Response) {
    const status = await connectionService.disconnect();
    res.json(status);
  },

  async schema(_req: Request, res: Response) {
    try {
      const schema = await schemaService.loadSchema();
      res.json(schema);
    } catch (error) {
      res.status(502).json({ error: toMessage(error) });
    }
  },

  async query(req: Request, res: Response) {
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

  async command(req: Request, res: Response) {
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
