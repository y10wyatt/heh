import type { AppDataProvider } from "./contracts";
import { mockDataProvider } from "./mock-provider";

// Keep one export point for app data. Supabase can replace this provider later
// without forcing screens to change their imports.
export const appData: AppDataProvider = mockDataProvider;
