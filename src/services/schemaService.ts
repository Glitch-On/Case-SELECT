import type { SchemaInfo } from "../models/databaseProvider.ts";
import { getProvider } from "./providerManager.ts";

export const schemaService = {
  async loadSchema(): Promise<SchemaInfo> {
    return getProvider().getSchema();
  },
};
