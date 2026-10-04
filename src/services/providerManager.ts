import type { DatabaseProvider } from "../models/databaseProvider.ts";
import { createProvider } from "../models/providerFactory.ts";

/**
 * Process-wide holder for the active database provider. A single instance is
 * shared so connection state is consistent across services.
 */
let provider: DatabaseProvider | null = null;

export function getProvider(): DatabaseProvider {
  if (!provider) {
    provider = createProvider();
  }
  return provider;
}

export function setProvider(next: DatabaseProvider): void {
  provider = next;
}
