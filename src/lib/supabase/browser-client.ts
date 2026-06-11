"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseBrowserEnv } from "./env";

export function createSupabaseBrowserClient() {
  const { publishableKey, url } = getSupabaseBrowserEnv();

  return createBrowserClient<Database>(url, publishableKey);
}
