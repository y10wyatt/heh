import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseBrowserEnv } from "./env";

export async function createSupabaseServerClient() {
  const { publishableKey, url } = getSupabaseBrowserEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always set cookies directly.
          // Middleware refreshes sessions for normal requests.
        }
      },
    },
  });
}
