import { getProvider } from "./providerManager.js";

export const connectionService = {
  async connect() {
    const provider = getProvider();
    await provider.connect();
    return provider.getStatus();
  },

  async disconnect() {
    const provider = getProvider();
    await provider.disconnect();
    return provider.getStatus();
  },

  async status() {
    return getProvider().getStatus();
  },
};
