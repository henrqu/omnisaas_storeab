import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient(req: any) {
  const headerUrl = req.headers["x-supabase-url"] as string;
  const headerKey = req.headers["x-supabase-anon-key"] as string;
  
  const envUrl = process.env.SUPABASE_URL || "";
  const envKey = process.env.SUPABASE_ANON_KEY || "";
  
  const url = headerUrl || envUrl || "";
  const key = headerKey || envKey || "";
  
  console.log("[Supabase Serverless Audit] --- Começo da Auditoria de Conexão Supabase ---");
  console.log(`[Supabase Serverless Audit] process.env.SUPABASE_URL configurada: ${!!envUrl} (Tamanho: ${envUrl.length})`);
  console.log(`[Supabase Serverless Audit] process.env.SUPABASE_ANON_KEY configurada: ${!!envKey} (Tamanho: ${envKey.length})`);
  console.log(`[Supabase Serverless Audit] Header x-supabase-url presente: ${!!headerUrl}`);
  console.log(`[Supabase Serverless Audit] Header x-supabase-anon-key presente: ${!!headerKey}`);
  console.log(`[Supabase Serverless Audit] URL Final Resolvida (Ofuscada): ${url ? `${url.substring(0, 15)}...` : "NENHUMA"}`);
  console.log(`[Supabase Serverless Audit] Key Final Resolvida (Ofuscada): ${key ? `Presente (Tamanho: ${key.length})` : "NENHUMA"}`);

  if (!url || !key) {
    console.warn("[Supabase Serverless Audit] Alerta: URL ou Key ausentes. Abortando criação do cliente.");
    return { client: null, url: "", configured: false };
  }
  
  try {
    const client = createClient(url, key);
    console.log("[Supabase Serverless Audit] Sucesso: Cliente Supabase criado corretamente via createClient().");
    return { client, url, configured: true };
  } catch (err: any) {
    console.error("[Supabase Serverless Audit] Falha: Erro ao instanciar o createClient():", err.message || err);
    return { client: null, url, configured: true };
  }
}
