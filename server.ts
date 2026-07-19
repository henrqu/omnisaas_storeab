/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

dotenv.config();

console.log("Environment:", process.env.NODE_ENV);
console.log("Stripe Secret Exists:", !!process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header as required by guidelines
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
} catch (err) {
  console.error("Erro ao inicializar o SDK Gemini:", err);
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/// Proxy route for AI chat (supports OpenAI/Gemini requests transparently with robust fallbacks)
app.post("/api/chat", async (req, res) => {
  const { prompt, systemInstruction } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "O campo prompt é obrigatório." });
    return;
  }

  let aiResponse = "";
  let aiProvider = "";
  let success = false;

  // 1. Try OpenAI if configured
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log("Roteando solicitação de Copilot para a API Real-Time da OpenAI");
      const openAiUrl = "https://api.openai.com/v1/chat/completions";
      const openAiResponse = await fetch(openAiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemInstruction || "Você é o Copiloto Vesta AI, o cérebro analítico do OmniSaaS ERP. Analise os dados providos com rigor científico, clareza executiva e dê recomendações financeiras, operacionais ou de bem-estar concisas em português brasileiro."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      if (openAiResponse.ok) {
        const data = await openAiResponse.json();
        aiResponse = data.choices?.[0]?.message?.content || "";
        aiProvider = "OpenAI GPT-4o-mini (Real-Time Cloud API)";
        success = true;
        console.log("Chamada do OpenAI realizada com sucesso.");
      } else {
        const errorText = await openAiResponse.text();
        console.warn(`[OpenAI API Warning] Status: ${openAiResponse.status}, Error: ${errorText}. Falling back to Gemini / Simulator...`);
      }
    } catch (err: any) {
      console.warn(`[OpenAI Connection Exception] Error: ${err.message || err}. Falling back to Gemini / Simulator...`);
    }
  }

  // 2. Try Gemini if OpenAI wasn't successful and Gemini is available
  if (!success && ai) {
    try {
      console.log("Roteando solicitação de Copilot para a API da Gemini (Fallback)");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "Você é o co-piloto de inteligência artificial do OmniSaaS, uma plataforma completa de gestão de vida e negócios. Responda de forma estratégica, concisa, amigável e profissional em português.",
          temperature: 0.7,
        }
      });

      if (response && response.text) {
        aiResponse = response.text;
        aiProvider = "Gemini 3.5 Flash (Server-Side Proxy)";
        success = true;
        console.log("Chamada do Gemini realizada com sucesso como fallback.");
      }
    } catch (err: any) {
      console.warn(`[Gemini Connection Exception] Error: ${err.message || err}. Falling back to Simulator...`);
    }
  }

  // 3. Fallback to Local Simulator if both failed or were unconfigured
  if (!success) {
    console.log("Utilizando simulador inteligente local de IA");
    let simulatedResponse = "Olá! Sou o assistente OmniSaaS. ";

    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes("receita") || lowerPrompt.includes("financeiro") || lowerPrompt.includes("julho")) {
      simulatedResponse = "Análise de Saúde Financeira (Vesta Software):\n\n• Receita Bruta acumulada: R$ 17.700,00\n• Despesas Operacionais: R$ 1.880,00\n• Lucro Líquido Estimado: R$ 15.820,00 (Margem de 89.3%)\n\nAnálise de Riscos: A despesa com 'Infraestrutura AWS' representa 77.1% do total de gastos. Recomendo investigar instâncias reservadas ou plano de créditos AWS Startups para mitigar essa exposição.\n\nPróximo Passo sugerido: Criar um fundo de reserva tributária de 12% sobre o faturamento do trimestre.";
    } else if (lowerPrompt.includes("estoque") || lowerPrompt.includes("produto") || lowerPrompt.includes("sku")) {
      simulatedResponse = "Status do Controle de Estoque:\n\n• Alerta de Reabastecimento: O produto 'Mentoria Executiva All-in-One' (SKU: OS-MENTOR-HQ) está com apenas 8 unidades em estoque (Ponto de reabastecimento configurado em 2).\n• Sugestão: Emitir ordem de serviço interna ou liberar novos slots na agenda para evitar quebras de receita na consultoria.\n\n• Status Digital: 'Licença Mensal OmniSaaS Pro' possui estoque virtual infinito e responde por 82% das transações automatizadas.";
    } else if (lowerPrompt.includes("funcionário") || lowerPrompt.includes("salário") || lowerPrompt.includes("folha")) {
      simulatedResponse = "Dashboard de Gestão de RH:\n\n• Total de colaboradores ativos: 3\n• Custo mensal de folha salarial nominal: R$ 31.500,00\n• Status do Processamento (Competência atual): 2 processados/pagos, 1 aguardando validação.\n\nDiretriz Legal: Certifique-se de recolher o FGTS e INSS patronal de Bruno Almeida (Designer UI/UX) antes do dia 20 do mês corrente para evitar juros de mora.";
    } else if (lowerPrompt.includes("hábito") || lowerPrompt.includes("saúde") || lowerPrompt.includes("gravidez")) {
      simulatedResponse = "Resumo do Monitoramento de Bem-Estar e Gestão Corporal:\n\n• Hidratação: Excelente adesão (streak de 4 dias de beber 3L de água).\n• Gestações: Registro de 14 semanas indica que o bebê está do tamanho de um limão (aprox. 8.5 cm). Os enjoos matinais são comuns nessa transição do primeiro para o segundo trimestre. Recomenda-se fracionar as refeições em porções menores de carboidratos complexos.";
    } else {
      simulatedResponse = `Sua consulta: "${prompt}" foi processada pelo motor OmniSaaS.\n\nComo o seu OmniSaaS está rodando no ambiente de preview local, esta resposta foi estruturada estrategicamente pelo simulador integrado. Para ativar inteligência em tempo real ilimitada, configure sua chave no painel de segredos (Secrets) no menu superior direito do Google AI Studio e reinicie o servidor.`;
    }

    aiResponse = simulatedResponse;
    aiProvider = "OmniSaaS AI Engine (Local Simulator)";
  }

  res.json({
    success: true,
    response: aiResponse,
    provider: aiProvider
  });
});

// -------------------------------------------------------------
// SUPABASE CLOUD INTEGRATION ENDPOINTS
// -------------------------------------------------------------

// Helper to resolve Supabase credentials dynamically (headers or .env)
function getSupabaseClient(req: any) {
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

// 1. Connection Status Check
app.get("/api/supabase/status", async (req, res) => {
  const { client, url, configured } = getSupabaseClient(req);
  
  if (!configured) {
    return res.json({
      success: false,
      configured: false,
      connected: false,
      message: "Supabase não configurado no arquivo .env nem no Painel do Usuário."
    });
  }

  if (!client) {
    return res.json({
      success: false,
      configured: true,
      connected: false,
      message: "Cliente Supabase falhou ao carregar com as credenciais fornecidas"
    });
  }

  try {
    // Try a simple ping / query to verify connection and schema existence
    const { data, error } = await client
      .from("omnisaas_store")
      .select("key")
      .limit(1);

    if (error) {
      const isMissingTable = 
        error.code === '42P01' || 
        error.code === 'PGRST116' || 
        error.message?.toLowerCase().includes('relation "omnisaas_store" does not exist') || 
        error.message?.toLowerCase().includes('does not exist') ||
        error.message?.toLowerCase().includes('schema cache') ||
        error.message?.toLowerCase().includes('could not find the table');

      if (isMissingTable) {
        return res.json({
          success: true,
          configured: true,
          connected: true,
          tablesExist: false,
          message: "Conectado com sucesso, mas a tabela 'omnisaas_store' precisa ser criada.",
          sql: `CREATE TABLE omnisaas_store (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissões básicas para ler/escrever dados
ALTER TABLE omnisaas_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos" ON omnisaas_store FOR ALL USING (true) WITH CHECK (true);`
        });
      }
      throw error;
    }

    return res.json({
      success: true,
      configured: true,
      connected: true,
      tablesExist: true,
      message: "Conectado ao Supabase com sucesso e tabela 'omnisaas_store' ativa!",
      url: url
    });

  } catch (err: any) {
    return res.json({
      success: false,
      configured: true,
      connected: false,
      message: `Erro de conexão com o banco Supabase: ${err.message || err}`
    });
  }
});

// 2. Synchronize State to Cloud (Push)
app.post("/api/supabase/sync", async (req, res) => {
  const { client, url, configured } = getSupabaseClient(req);
  if (!client) {
    return res.status(500).json({ 
      success: false, 
      error: "Supabase client is not configured or failed to initialize." 
    });
  }

  const { data } = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ success: false, error: "Payload inválido para sincronização." });
  }

  try {
    const syncedKeys: string[] = [];
    
    // Save each key-value pair of the LocalDatabase to Supabase
    for (const [key, val] of Object.entries(data)) {
      const { error } = await client
        .from("omnisaas_store")
        .upsert({ 
          key, 
          value: val, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'key' });

      if (error) {
        console.error(`[Supabase Push Error] key "${key}":`, error);
        
        const isMissingTable = 
          error.code === '42P01' || 
          error.code === 'PGRST116' || 
          error.message?.toLowerCase().includes('relation "omnisaas_store" does not exist') || 
          error.message?.toLowerCase().includes('does not exist') ||
          error.message?.toLowerCase().includes('schema cache') ||
          error.message?.toLowerCase().includes('could not find the table');

        if (isMissingTable) {
          return res.status(404).json({
            success: false,
            needsInitialization: true,
            error: "A tabela 'omnisaas_store' não existe no banco de dados.",
            sql: `CREATE TABLE omnisaas_store (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE omnisaas_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos" ON omnisaas_store FOR ALL USING (true) WITH CHECK (true);`
          });
        }
        throw error;
      }
      syncedKeys.push(key);
    }

    res.json({
      success: true,
      message: "Push de sincronização realizado com sucesso!",
      syncedKeys
    });

  } catch (err: any) {
    console.error("[Supabase Push Exception]:", err);
    res.status(500).json({ success: false, error: err.message || err });
  }
});

// 3. Retrieve State from Cloud (Pull)
app.get("/api/supabase/pull", async (req, res) => {
  const { client, url, configured } = getSupabaseClient(req);
  if (!client) {
    return res.status(500).json({ 
      success: false, 
      error: "Supabase client is not configured or failed to initialize." 
    });
  }

  try {
    const { data, error } = await client
      .from("omnisaas_store")
      .select("*");

    if (error) {
      const isMissingTable = 
        error.code === '42P01' || 
        error.code === 'PGRST116' || 
        error.message?.toLowerCase().includes('relation "omnisaas_store" does not exist') || 
        error.message?.toLowerCase().includes('does not exist') ||
        error.message?.toLowerCase().includes('schema cache') ||
        error.message?.toLowerCase().includes('could not find the table');

      if (isMissingTable) {
        return res.status(404).json({
          success: false,
          needsInitialization: true,
          error: "A tabela 'omnisaas_store' não existe no banco de dados."
        });
      }
      throw error;
    }

    // Convert flat list back to key-value object map
    const storeMap: Record<string, any> = {};
    if (data) {
      for (const item of data) {
        storeMap[item.key] = item.value;
      }
    }

    res.json({
      success: true,
      message: "Pull de sincronização realizado com sucesso!",
      data: storeMap
    });

  } catch (err: any) {
    console.error("[Supabase Pull Exception]:", err);
    res.status(500).json({ success: false, error: err.message || err });
  }
});

// -------------------------------------------------------------
// STRIPE PAYMENT INTEGRATION ENDPOINTS
// -------------------------------------------------------------

// Lazy helper to get Stripe client instance safely without crashing server if keys are missing
let stripeInstance: Stripe | null = null;
const getStripeInstance = (): Stripe | null => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeInstance && stripeKey) {
    try {
      stripeInstance = new Stripe(stripeKey, {
        apiVersion: "2023-10-16" as any,
      });
      console.log("[Stripe Server] Cliente Stripe carregado com sucesso.");
    } catch (err) {
      console.error("[Stripe Server] Erro ao inicializar o cliente Stripe:", err);
    }
  }
  return stripeInstance;
};

// 1. Stripe config check (available currencies, configuration status)
app.get("/api/stripe/config", (req, res) => {
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Stripe Secret Exists:", !!process.env.STRIPE_SECRET_KEY);

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({
      success: false,
      error: "Missing STRIPE_SECRET_KEY environment variable."
    });
  }

  const isConfigured = !!process.env.STRIPE_SECRET_KEY;
  res.json({
    success: true,
    isConfigured,
    prices: {
      en: { currency: "USD", amount: 19.99, priceId: process.env.STRIPE_PRICE_USD || "" },
      es: { currency: "EUR", amount: 19.99, priceId: process.env.STRIPE_PRICE_EUR || "" },
      pt: { currency: "BRL", amount: 97.90, priceId: process.env.STRIPE_PRICE_BRL || "" }
    }
  });
});

// 2. Create Checkout Session based on language/country detected
app.post("/api/stripe/create-checkout-session", async (req, res) => {
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Stripe Secret Exists:", !!process.env.STRIPE_SECRET_KEY);

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({
      success: false,
      error: "Missing STRIPE_SECRET_KEY environment variable."
    });
  }

  const stripe = getStripeInstance();
  const { lang } = req.body; // 'pt' | 'es' | 'en'
  
  // Resolve pricing based on language detected/selected
  let currency = "USD";
  let unitAmount = 1999; // 19.99 in cents
  let priceId = process.env.STRIPE_PRICE_USD || "";
  let productName = "OmniSaaS Premium Workspace License (English)";
  let productDesc = "Complete lifetime access to OmniSaaS - Finances, Habits, Goals, and Copilot AI.";
  
  if (lang === "pt") {
    currency = "BRL";
    unitAmount = 9790; // 97.90 in cents
    priceId = process.env.STRIPE_PRICE_BRL || "";
    productName = "Licença do Espaço de Trabalho Premium OmniSaaS";
    productDesc = "Acesso completo vitalício ao ecossistema OmniSaaS - Finanças, Hábitos, Metas, Colaboradores e Copiloto de IA.";
  } else if (lang === "es") {
    currency = "EUR";
    unitAmount = 1999; // 19.99 in cents
    priceId = process.env.STRIPE_PRICE_EUR || "";
    productName = "Licencia del Espacio de Trabalho Premium OmniSaaS";
    productDesc = "Acceso completo de por vida a OmniSaaS: finanzas, hábitos, objetivos y Copiloto de IA.";
  }

  let hostUrl = process.env.APP_URL;
  if (!hostUrl) {
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.headers.host || (req.headers.origin ? String(req.headers.origin).replace(/^https?:\/\//, "") : "localhost:3000");
    hostUrl = `${protocol}://${host}`;
  }
  const successUrl = `${hostUrl}/?payment=success&lang=${lang || 'en'}`;
  const cancelUrl = `${hostUrl}/?payment=cancel&lang=${lang || 'en'}`;

  if (!stripe) {
    return res.status(500).json({
      success: false,
      error: "Missing STRIPE_SECRET_KEY environment variable."
    });
  }

  try {
    let mode = "payment";
    
    if (priceId) {
      try {
        const priceObj = await stripe.prices.retrieve(priceId);
        if (priceObj.type === "recurring" || priceObj.recurring) {
          mode = "subscription";
        }
      } catch (retrieveErr) {
        console.warn("[Stripe] Warning retrieving price, defaulting to 'payment':", retrieveErr);
      }
    }

    const createSessionWithMode = async (sessionMode: string) => {
      const sessionParam: any = {
        payment_method_types: ["card"],
        mode: sessionMode,
        success_url: successUrl,
        cancel_url: cancelUrl,
      };

      if (priceId) {
        sessionParam.line_items = [
          {
            price: priceId,
            quantity: 1,
          },
        ];
      } else {
        // Dynamic price creation using inline price_data (extremely robust)
        sessionParam.line_items = [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: productName,
                description: productDesc,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ];
      }
      return await stripe.checkout.sessions.create(sessionParam);
    };

    let session;
    try {
      session = await createSessionWithMode(mode);
    } catch (firstTryErr: any) {
      const errMsg = (firstTryErr.message || "").toLowerCase();
      // If we got an error indicating a subscription / payment mode mismatch, retry automatically with the other mode!
      if (errMsg.includes("recurring") || errMsg.includes("subscription") || errMsg.includes("payment")) {
        const fallbackMode = mode === "payment" ? "subscription" : "payment";
        console.log(`[Stripe Auto-Recovery] First attempt with mode '${mode}' failed. Retrying with mode '${fallbackMode}'...`);
        session = await createSessionWithMode(fallbackMode);
      } else {
        throw firstTryErr;
      }
    }
    
    return res.json({
      success: true,
      isConfigured: true,
      sessionId: session.id,
      checkoutUrl: session.url
    });

  } catch (err: any) {
    console.error("[Stripe Session Error]:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Erro ao gerar sessão de pagamento no Stripe."
    });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER & PRODUCTION STATICS
// -------------------------------------------------------------

async function startServer() {
  // Serve public folder directly to ensure static assets are always accessible
  app.use(express.static(path.join(process.cwd(), "public")));

  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OmniSaaS Fullstack Engine] Rodando na porta http://0.0.0.0:${PORT}`);
  });
}

startServer();
