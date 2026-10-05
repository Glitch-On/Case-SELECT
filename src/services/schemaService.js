import { getProvider } from "./providerManager.js";

export const schemaService = {
  async loadSchema() {
    return getProvider().getSchema();
  },
};
