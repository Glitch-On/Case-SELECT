import type { ConnectionStatus } from "../models/databaseProvider.ts";
import { getProvider } from "./providerManager.ts";

export const connectionService = {
  async connect(): Promise<ConnectionStatus> {
    const provider = getProvider();
    await provider.connect();
    return provider.getStatus();
  },

  async disconnect(): Promise<ConnectionStatus> {
    const provider = getProvider();
    await provider.disconnect();
    return provider.getStatus();
  },

  async status(): Promise<ConnectionStatus> {
    return getProvider().getStatus();
  },
};
