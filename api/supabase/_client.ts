import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient(req: any) {
  const url = (req.headers["x-supabase-url"] as string) || process.env.SUPABASE_URL || "";
  const key = (req.headers["x-supabase-anon-key"] as string) || process.env.SUPABASE_ANON_KEY || "";
  
  if (!url || !key) {
    return { client: null, url: "", configured: false };
  }
  
  try {
    const client = createClient(url, key);
    return { client, url, configured: true };
  } catch (err) {
    console.error("[Supabase Server] Falha ao inicializar o cliente Supabase:", err);
    return { client: null, url, configured: true };
  }
}
