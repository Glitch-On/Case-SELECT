import { createProvider } from "../models/providerFactory.js";

/**
 * Process-wide holder for the active database provider. A single instance is
 * shared so connection state is consistent across services.
 */
let provider = null;

export function getProvider() {
  if (!provider) {
    provider = createProvider();
  }
  return provider;
}

export function setProvider(next) {
  provider = next;
}
