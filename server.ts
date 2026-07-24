/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
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
  const { prompt, systemInstruction, language: rawLanguage } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "O campo prompt é obrigatório." });
    return;
  }

  // Detect and normalize language
  const acceptLang = req.headers["accept-language"] || "";
  const rawLang = rawLanguage || acceptLang || "en";
  const language = rawLang.toLowerCase().startsWith("pt") ? "pt" : rawLang.toLowerCase().startsWith("es") ? "es" : "en";

  const defaultSystemInstruction = language === "pt"
    ? "Você é o Life4Billion AI, o cérebro analítico da plataforma Life4Billion. Analise os dados providos com rigor científico, clareza executiva e dê recomendações financeiras, operacionais ou de bem-estar concisas em português brasileiro."
    : language === "es"
    ? "Eres el Life4Billion AI, el cerebro analítico de la plataforma Life4Billion. Analiza los datos proporcionados con rigor científico, claridad ejecutiva y brinda recomendaciones financieras, operativas o de bienestar concisas en español."
    : "You are the Life4Billion AI, the analytical brain of the Life4Billion platform. Analyze the provided data with scientific rigor, executive clarity, and give concise financial, operational, or well-being recommendations in English.";

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
              content: systemInstruction || defaultSystemInstruction
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
        aiProvider = language === "pt" ? "OpenAI GPT-4o-mini (API de Nuvem em Tempo Real)" : language === "es" ? "OpenAI GPT-4o-mini (API de nube en tiempo real)" : "OpenAI GPT-4o-mini (Real-Time Cloud API)";
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
          systemInstruction: systemInstruction || defaultSystemInstruction,
          temperature: 0.7,
        }
      });

      if (response && response.text) {
        aiResponse = response.text;
        aiProvider = language === "pt" ? "Gemini 3.5 Flash (Proxy do Servidor)" : language === "es" ? "Gemini 3.5 Flash (Proxy del servidor)" : "Gemini 3.5 Flash (Server-Side Proxy)";
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
    let simulatedResponse = "";

    const lowerPrompt = prompt.toLowerCase();
    
    if (language === "pt") {
      if (lowerPrompt.includes("receita") || lowerPrompt.includes("financeiro") || lowerPrompt.includes("julho") || lowerPrompt.includes("orçamento") || lowerPrompt.includes("caixa")) {
        simulatedResponse = "### Relatório de Saúde Financeira Life4Billion (Life4Billion AI)\n\n" +
          "• **Faturamento Bruto**: R$ 17.700,00\n" +
          "• **Gastos Operacionais**: R$ 1.880,00\n" +
          "• **Lucro Líquido Estimado**: R$ 15.820,00 (Margem Operacional de **89.3%**)\n\n" +
          "**Análise de Alocação de Recursos**:\n" +
          "Sua maior despesa recorrente está em *Infraestrutura Cloud (AWS/Supabase)*, correspondendo a **77.1%** do seu passivo mensal total. \n\n" +
          "**Recomendações Estratégicas**:\n" +
          "1. **Fundo Tributário**: Recomenda-se provisionar **12%** de cada entrada de faturamento em conta dedicada para cobrir o imposto trimestral (DAS/Simples Nacional).\n" +
          "2. **Otimização Cloud**: Considere solicitar o pacote de créditos de startups ou migrar para instâncias reservadas de 1 ano para reduzir custos de infraestrutura em até **32%**.";
      } else if (lowerPrompt.includes("estoque") || lowerPrompt.includes("produto") || lowerPrompt.includes("sku") || lowerPrompt.includes("venda")) {
        simulatedResponse = "### Auditoria de Estoque e Catálogo de Produtos (Life4Billion AI)\n\n" +
          "• **Status Geral**: Regular (1 SKU em ponto de reabastecimento crítico).\n" +
          "• **Alerta Vermelho**: O produto `'Mentoria Executiva All-in-One'` (SKU: `L4B-MENTOR-HQ`) possui apenas **8 unidades** virtuais livres na agenda atual (mínimo de segurança: 10).\n\n" +
          "**Análise de Risco**: Risco moderado de quebra de estoque intangível caso uma campanha ativa de marketing seja veiculada nas próximas 48 horas.\n\n" +
          "**Ações Imediatas Sugeridas**:\n" +
          "1. Aumentar os limites de slots ou liberar novas datas na agenda do ERP.\n" +
          "2. O SKU `'Licença Mensal Life4Billion Pro'` (Digital) opera com estoque automatizado infinito e responde por **82%** do seu fluxo recorrente.";
      } else if (lowerPrompt.includes("funcionário") || lowerPrompt.includes("salário") || lowerPrompt.includes("folha") || lowerPrompt.includes("clt") || lowerPrompt.includes("trabalhista")) {
        simulatedResponse = "### Auditoria de RH e Custos Trabalhistas (Life4Billion AI)\n\n" +
          "• **Colaboradores Ativos**: 3 contratados CLT/PJ.\n" +
          "• **Custo Nominal Mensal (Folha)**: R$ 31.500,00\n" +
          "• **Status de Processamento**: Competência atual processada para 2 colaboradores; 1 colaborador (Designer UI/UX) aguardando liberação manual de benefícios.\n\n" +
          "**Diretrizes Legais Importantes (Brasil)**:\n" +
          "• Lembre-se de efetuar o recolhimento do FGTS e da guia do INSS patronal de *Bruno Almeida* até o dia 20 do mês corrente para evitar multas moratórias de **2% ao mês**.";
      } else if (lowerPrompt.includes("hábito") || lowerPrompt.includes("saúde") || lowerPrompt.includes("gestação") || lowerPrompt.includes("gravidez") || lowerPrompt.includes("dieta")) {
        simulatedResponse = "### Diagnóstico Médico e Monitoramento Nutricional (Life4Billion AI)\n\n" +
          "• **Métrica Principal**: Excelente engajamento de hidratação (streak ativo de 4 dias consumindo 3L/dia).\n" +
          "• **Estágio Gravídico**: Seu registro indica **14 semanas de gestação** (o bebê tem o tamanho aproximado de um limão, ~8.5 cm de comprimento).\n\n" +
          "**Recomendações e Sintomas Previstos**:\n" +
          "1. Nesta transição para o segundo trimestre, os enjoos matinais tendem a diminuir. \n" +
          "2. **Nutrição**: Mantenha refeições fracionadas ao longo do dia, ricas em carboidratos complexos, ácido fólico e ferro.\n" +
          "3. Evite longos períodos de jejum para combater episódios de hipoglicemia gestacional.";
      } else {
        simulatedResponse = `### Relatório Estratégico Life4Billion\n\n` +
          `Sua pergunta: *"${prompt}"*\n\n` +
          `O Life4Billion processou sua solicitação utilizando o **Motor de Simulação Local Integrado** para garantir total funcionamento sem dependências externas.\n\n` +
          `**Recomendação Técnica**: Para ativar inteligência em tempo real avançada baseada em dados reais via OpenAI GPT-4o ou Gemini, certifique-se de configurar suas chaves de API secretas (OpenAI ou Gemini) no painel de segredos (Secrets) do seu console e reinicie o servidor de desenvolvimento.`;
      }
    } else if (language === "es") {
      if (lowerPrompt.includes("receita") || lowerPrompt.includes("financeiro") || lowerPrompt.includes("julho") || lowerPrompt.includes("ingresos") || lowerPrompt.includes("presupuesto") || lowerPrompt.includes("caja")) {
        simulatedResponse = "### Informe de Salud Financiera Life4Billion (Life4Billion AI)\n\n" +
          "• **Ingresos Brutos**: $17.700,00\n" +
          "• **Gastos Operativos**: $1.880,00\n" +
          "• **Beneficio Neto Estimado**: $15.820,00 (Margen Operativo del **89,3%**)\n\n" +
          "**Análisis de Asignación de Recursos**:\n" +
          "Su mayor gasto recurrente se encuentra en *Infraestructura Cloud (AWS/Supabase)*, lo que corresponde al **77,1%** de sus pasivos mensuales totales. \n\n" +
          "**Recomendaciones Estratégicas**:\n" +
          "1. **Provisión de Impuestos**: Se recomienda aprovisionar el **12%** de cada ingreso en una cuenta dedicada para cubrir los impuestos corporativos trimestrales.\n" +
          "2. **Optimización Cloud**: Considere solicitar un paquete de créditos para startups o migrar a instancias reservadas de 1 año para reducir los costos de infraestructura hasta en un **32%**.";
      } else if (lowerPrompt.includes("estoque") || lowerPrompt.includes("produto") || lowerPrompt.includes("sku") || lowerPrompt.includes("venda") || lowerPrompt.includes("inventario") || lowerPrompt.includes("stock") || lowerPrompt.includes("producto")) {
        simulatedResponse = "### Auditoría de Inventario y Catálogo de Productos (Life4Billion AI)\n\n" +
          "• **Estado General**: Regular (1 SKU en punto crítico de reposición).\n" +
          "• **Alerta Roja**: El producto `'Mentoría Ejecutiva All-in-One'` (SKU: `L4B-MENTOR-HQ`) tiene solo **8 unidades** virtuales libres en la agenda actual (mínimo de seguridad: 10).\n\n" +
          "**Análisis de Riesgo**: Riesgo moderado de desabastecimiento intangible si se lanza una campaña de marketing activa en las próximas 48 horas.\n\n" +
          "**Acciones Inmediatas Sugeridas**:\n" +
          "1. Aumentar los límites de cupos o liberar nuevas fechas en la agenda del ERP.\n" +
          "2. El SKU `'Licença Mensal Life4Billion Pro'` (Digital) opera con inventario automatizado infinito y representa el **82%** de su flujo recurrente.";
      } else if (lowerPrompt.includes("funcionário") || lowerPrompt.includes("salário") || lowerPrompt.includes("folha") || lowerPrompt.includes("clt") || lowerPrompt.includes("trabalhista") || lowerPrompt.includes("empleado") || lowerPrompt.includes("nómina") || lowerPrompt.includes("salario") || lowerPrompt.includes("trabajo")) {
        simulatedResponse = "### Auditoría de Recursos Humanos y Costos de Nómina (Life4Billion AI)\n\n" +
          "• **Colaboradores Activos**: 3 contratados.\n" +
          "• **Costo Nominal Mensual (Nómina)**: $31.500,00\n" +
          "• **Estado de Procesamiento**: Nómina actual procesada para 2 colaboradores; 1 colaborador (Diseñador UI/UX) en espera de aprobación manual de beneficios.\n\n" +
          "**Directrices Legales Importantes**:\n" +
          "• Asegúrese de realizar la declaración de impuestos sobre la nómina y las contribuciones patronales antes de la fecha de vencimiento para evitar recargos por mora del **2% mensual**.";
      } else if (lowerPrompt.includes("hábito") || lowerPrompt.includes("saúde") || lowerPrompt.includes("gestação") || lowerPrompt.includes("gravidez") || lowerPrompt.includes("dieta") || lowerPrompt.includes("embarazo") || lowerPrompt.includes("gestación")) {
        simulatedResponse = "### Diagnóstico Médico y Monitoreo Nutricional (Life4Billion AI)\n\n" +
          "• **Métrica Principal**: Excelente nivel de hidratación (racha activa de 4 días consumiendo 3L/día).\n" +
          "• **Etapa de Embarazo**: Su registro indica **14 semanas de gestación** (el bebé tiene el tamaño aproximado de un limón, ~8,5 cm de longitud).\n\n" +
          "**Recomendaciones y Síntomas Previstos**:\n" +
          "1. En esta transición al segundo trimestre, las náuseas matutinas tienden a disminuir.\n" +
          "2. **Nutrición**: Mantenga comidas fraccionadas a lo largo del día, ricas en carbohidratos complejos, ácido fólico e hierro.\n" +
          "3. Evite períodos prolongados de ayuno para combatir episodios de hipoglicemia gestacional.";
      } else {
        simulatedResponse = `### Informe Estratégico Life4Billion\n\n` +
          `Su pregunta: *"${prompt}"*\n\n` +
          `Life4Billion procesó su solicitud utilizando el **Motor de Simulación Local Integrado** para garantizar el funcionamiento completo sin dependencias externas.\n\n` +
          `**Recomendación Técnica**: Para activar la inteligencia avanzada en tiempo real basada en datos reales a través de OpenAI GPT-4o o Gemini, asegúrese de configurar sus claves de API secretas (OpenAI o Gemini) en el panel de secretos (Secrets) de su consola y reinicie el servidor de desarrollo.`;
      }
    } else {
      if (lowerPrompt.includes("receita") || lowerPrompt.includes("financeiro") || lowerPrompt.includes("julho") || lowerPrompt.includes("revenue") || lowerPrompt.includes("finance") || lowerPrompt.includes("july") || lowerPrompt.includes("budget") || lowerPrompt.includes("cash")) {
        simulatedResponse = "### Life4Billion Financial Health Report (Life4Billion AI)\n\n" +
          "• **Gross Revenue**: $17,700.00\n" +
          "• **Operating Expenses**: $1,880.00\n" +
          "• **Estimated Net Profit**: $15,820.00 (Operating Margin of **89.3%**)\n\n" +
          "**Resource Allocation Analysis**:\n" +
          "Your largest recurring expense is in *Cloud Infrastructure (AWS/Supabase)*, corresponding to **77.1%** of your total monthly liabilities. \n\n" +
          "**Strategic Recommendations**:\n" +
          "1. **Tax Provisioning**: It is recommended to provision **12%** of each revenue entry into a dedicated account to cover quarterly corporate taxes.\n" +
          "2. **Cloud Optimization**: Consider applying for a startup credits package or migrating to 1-year reserved instances to reduce infrastructure costs by up to **32%**.";
      } else if (lowerPrompt.includes("estoque") || lowerPrompt.includes("produto") || lowerPrompt.includes("sku") || lowerPrompt.includes("venda") || lowerPrompt.includes("stock") || lowerPrompt.includes("sku") || lowerPrompt.includes("product") || lowerPrompt.includes("sale") || lowerPrompt.includes("inventory")) {
        simulatedResponse = "### Stock Audit and Product Catalog (Life4Billion AI)\n\n" +
          "• **General Status**: Fair (1 SKU at critical replenishment point).\n" +
          "• **Red Alert**: The product `'All-in-One Executive Mentorship'` (SKU: `L4B-MENTOR-HQ`) has only **8 virtual units** free in the current schedule (safety minimum: 10).\n\n" +
          "**Risk Analysis**: Moderate risk of intangible stockout if an active marketing campaign runs in the next 48 hours.\n\n" +
          "**Immediate Action Suggested**:\n" +
          "1. Increase slot limits or release new dates in the ERP calendar.\n" +
          "2. The SKU `'Life4Billion Pro Monthly License'` (Digital) operates with infinite automated inventory and accounts for **82%** of your recurring flow.";
      } else if (lowerPrompt.includes("funcionário") || lowerPrompt.includes("salário") || lowerPrompt.includes("folha") || lowerPrompt.includes("clt") || lowerPrompt.includes("trabalhista") || lowerPrompt.includes("employee") || lowerPrompt.includes("salary") || lowerPrompt.includes("payroll") || lowerPrompt.includes("tax") || lowerPrompt.includes("job")) {
        simulatedResponse = "### HR Audit and Payroll Costs (Life4Billion AI)\n\n" +
          "• **Active Collaborators**: 3 contractors/employees.\n" +
          "• **Nominal Monthly Cost (Payroll)**: $31,500.00\n" +
          "• **Processing Status**: Current payroll processed for 2 collaborators; 1 collaborator (UI/UX Designer) awaiting manual benefits approval.\n\n" +
          "**Important Legal Guidelines**:\n" +
          "• Ensure you complete the payroll tax filing and employer social contributions by the due date to avoid late payment penalties of **2% per month**.";
      } else if (lowerPrompt.includes("hábito") || lowerPrompt.includes("saúde") || lowerPrompt.includes("gestação") || lowerPrompt.includes("gravidez") || lowerPrompt.includes("dieta") || lowerPrompt.includes("habit") || lowerPrompt.includes("health") || lowerPrompt.includes("pregnancy") || lowerPrompt.includes("baby") || lowerPrompt.includes("diet")) {
        simulatedResponse = "### Medical Diagnostic & Nutritional Monitoring (Life4Billion AI)\n\n" +
          "• **Key Metric**: Excellent hydration engagement (active 4-day streak of drinking 3L/day).\n" +
          "• **Pregnancy Stage**: Your record indicates **14 weeks of pregnancy** (the baby is approximately the size of a lemon, ~8.5 cm in length).\n\n" +
          "**Predicted Symptoms & Recommendations**:\n" +
          "1. During this transition to the second trimester, morning sickness tends to decrease.\n" +
          "2. **Nutrition**: Keep small, frequent meals throughout the day, rich in complex carbohydrates, folic acid, and iron.\n" +
          "3. Avoid long fasting periods to prevent gestational hypoglycemia.";
      } else {
        simulatedResponse = `### Life4Billion Strategic Report\n\n` +
          `Your question: *"${prompt}"*\n\n` +
          `Life4Billion processed your request using the **Integrated Local Simulation Engine** to ensure complete functionality without external dependencies.\n\n` +
          `**Technical Recommendation**: To activate advanced real-time intelligence based on real data via OpenAI GPT-4o or Gemini, please configure your secret API keys (OpenAI or Gemini) in the secrets panel of your console and restart the development server.`;
      }
    }

    aiResponse = simulatedResponse;
    aiProvider = language === "pt" ? "Motor de IA Life4Billion (Simulador Local)" : language === "es" ? "Motor de IA Life4Billion (Simulador Local)" : "Life4Billion AI Engine (Local Simulator)";
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

// Helper to resolve Supabase credentials dynamically (headers or .env) with safe auditing logs
function getSupabaseClient(req: any) {
  const headerUrl = req.headers["x-supabase-url"] as string;
  const headerKey = req.headers["x-supabase-anon-key"] as string;
  
  const envUrl = process.env.SUPABASE_URL || "";
  const envKey = process.env.SUPABASE_ANON_KEY || "";
  
  const url = headerUrl || envUrl || "";
  const key = headerKey || envKey || "";
  
  console.log("[Supabase Server Audit] --- Começo da Auditoria de Conexão Supabase ---");
  console.log(`[Supabase Server Audit] process.env.SUPABASE_URL configurada: ${!!envUrl} (Tamanho: ${envUrl.length})`);
  console.log(`[Supabase Server Audit] process.env.SUPABASE_ANON_KEY configurada: ${!!envKey} (Tamanho: ${envKey.length})`);
  console.log(`[Supabase Server Audit] Header x-supabase-url presente: ${!!headerUrl}`);
  console.log(`[Supabase Server Audit] Header x-supabase-anon-key presente: ${!!headerKey}`);
  console.log(`[Supabase Server Audit] URL Final Resolvida (Ofuscada): ${url ? `${url.substring(0, 15)}...` : "NENHUMA"}`);
  console.log(`[Supabase Server Audit] Key Final Resolvida (Ofuscada): ${key ? `Presente (Tamanho: ${key.length})` : "NENHUMA"}`);

  if (!url || !key) {
    console.warn("[Supabase Server Audit] Alerta: URL ou Key ausentes. Abortando criação do cliente.");
    return { client: null, url: "", configured: false };
  }
  
  try {
    const client = createClient(url, key);
    console.log("[Supabase Server Audit] Sucesso: Cliente Supabase criado corretamente via createClient().");
    return { client, url, configured: true };
  } catch (err: any) {
    console.error("[Supabase Server Audit] Falha: Erro ao instanciar o createClient():", err.message || err);
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
    console.log("[Supabase Connection Test] Realizando consulta ping na tabela 'life4billion_store'...");
    // Try a simple ping / query to verify connection and schema existence
    let { data, error } = await client
      .from("life4billion_store")
      .select("key")
      .limit(1);

    if (error) {
      const fallback = await client.from("omnisaas_store").select("key").limit(1);
      if (!fallback.error) {
        data = fallback.data;
        error = null;
      }
    }

    if (error) {
      console.warn(`[Supabase Connection Test] Banco de dados respondeu com código de erro ${error.code}: ${error.message}`);
      const isMissingTable = 
        error.code === '42P01' || 
        error.code === 'PGRST116' || 
        error.message?.toLowerCase().includes('does not exist') || 
        error.message?.toLowerCase().includes('schema cache') ||
        error.message?.toLowerCase().includes('could not find the table');

      if (isMissingTable) {
        console.log("[Supabase Connection Test] Resultado da auditoria: CONEXÃO ESTABELECIDA COM SUCESSO! No entanto, a tabela 'life4billion_store' não foi encontrada. O usuário deve criá-la no editor SQL do console Supabase.");
        return res.json({
          success: true,
          configured: true,
          connected: true,
          tablesExist: false,
          message: "Conectado com sucesso, mas a tabela 'life4billion_store' precisa ser criada.",
          sql: `CREATE TABLE life4billion_store (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissões básicas para ler/escrever dados
ALTER TABLE life4billion_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos" ON life4billion_store FOR ALL USING (true) WITH CHECK (true);`
        });
      }
      throw error;
    }

    console.log("[Supabase Connection Test] Resultado da auditoria: CONEXÃO ESTABELECIDA E ATIVA! Tabela de armazenamento do Life4Billion está funcionando perfeitamente.");
    return res.json({
      success: true,
      configured: true,
      connected: true,
      tablesExist: true,
      message: "Conectado ao Supabase com sucesso e tabela de armazenamento do Life4Billion ativa!",
      url: url
    });

  } catch (err: any) {
    console.error("[Supabase Connection Test] Erro crítico de comunicação com o Supabase:", err.message || err);
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
    
    let tableName = "life4billion_store";
    // Quick test if life4billion_store exists, otherwise try omnisaas_store
    const testCheck = await client.from("life4billion_store").select("key").limit(1);
    if (testCheck.error) {
      const fallbackCheck = await client.from("omnisaas_store").select("key").limit(1);
      if (!fallbackCheck.error) {
        tableName = "omnisaas_store";
      }
    }

    // Save each key-value pair of the LocalDatabase to Supabase
    for (const [key, val] of Object.entries(data)) {
      const { error } = await client
        .from(tableName)
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
          error.message?.toLowerCase().includes('does not exist') || 
          error.message?.toLowerCase().includes('schema cache') ||
          error.message?.toLowerCase().includes('could not find the table');

        if (isMissingTable) {
          return res.status(404).json({
            success: false,
            needsInitialization: true,
            error: "A tabela 'life4billion_store' não existe no banco de dados.",
            sql: `CREATE TABLE life4billion_store (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE life4billion_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos" ON life4billion_store FOR ALL USING (true) WITH CHECK (true);`
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
    let { data, error } = await client
      .from("life4billion_store")
      .select("*");

    if (error) {
      const fallback = await client.from("omnisaas_store").select("*");
      if (!fallback.error) {
        data = fallback.data;
        error = null;
      }
    }

    if (error) {
      const isMissingTable = 
        error.code === '42P01' || 
        error.code === 'PGRST116' || 
        error.message?.toLowerCase().includes('does not exist') || 
        error.message?.toLowerCase().includes('schema cache') ||
        error.message?.toLowerCase().includes('could not find the table');

      if (isMissingTable) {
        return res.status(404).json({
          success: false,
          needsInitialization: true,
          error: "A tabela 'life4billion_store' não existe no banco de dados."
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

// Founder Spots State Management
let founderSpotsRemaining = 23;
const FOUNDER_SPOTS_FILE = path.join(process.cwd(), ".founder_spots.json");
try {
  if (fs.existsSync(FOUNDER_SPOTS_FILE)) {
    const data = JSON.parse(fs.readFileSync(FOUNDER_SPOTS_FILE, "utf-8"));
    if (typeof data.remaining === "number") {
      founderSpotsRemaining = Math.max(0, data.remaining);
    }
  } else {
    fs.writeFileSync(FOUNDER_SPOTS_FILE, JSON.stringify({ remaining: 23, total: 30 }));
  }
} catch (err) {
  console.warn("Could not load founder spots file:", err);
}

function saveFounderSpots(val: number) {
  founderSpotsRemaining = Math.max(0, val);
  try {
    fs.writeFileSync(FOUNDER_SPOTS_FILE, JSON.stringify({ remaining: founderSpotsRemaining, total: 30 }));
  } catch (err) {
    console.warn("Could not save founder spots file:", err);
  }
}

// Endpoint to fetch remaining Founder spots in real-time
app.get("/api/pricing/founder-spots", (req, res) => {
  res.json({
    remaining: founderSpotsRemaining,
    total: 30,
    soldOut: founderSpotsRemaining <= 0
  });
});

// Endpoint to simulate/decrement Founder spot purchase
app.post("/api/pricing/buy-founder", (req, res) => {
  if (founderSpotsRemaining > 0) {
    saveFounderSpots(founderSpotsRemaining - 1);
  }
  res.json({
    success: true,
    remaining: founderSpotsRemaining,
    total: 30,
    soldOut: founderSpotsRemaining <= 0
  });
});

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

  const isConfigured = !!process.env.STRIPE_SECRET_KEY;
  res.json({
    success: true,
    isConfigured,
    founderSpots: {
      remaining: founderSpotsRemaining,
      total: 30
    },
    prices: {
      en: {
        monthly: { currency: "USD", amount: 19.99, priceId: "price_1TrfkaQgM79UmffPY33Spfuc" },
        annual: { currency: "USD", amount: 119.88, monthlyEquivalent: 9.99, priceId: "price_1TwimKQgM79UmffPlbyeMuPI" },
        founder: { currency: "USD", amount: 99.00, priceId: "price_1Twip6QgM79UmffPy9urRCrr" }
      },
      es: {
        monthly: { currency: "EUR", amount: 19.99, priceId: "price_1TrfnaQgM79UmffPZE43dIsx" },
        annual: { currency: "EUR", amount: 118.80, monthlyEquivalent: 9.90, priceId: "price_1TwinCQgM79UmffPjj7PuFKa" },
        founder: { currency: "EUR", amount: 99.00, priceId: "price_1Twiq5QgM79UmffPFo3AqSUB" }
      },
      pt: {
        monthly: { currency: "BRL", amount: 97.90, priceId: "price_1TrfmcQgM79UmffPGSpl0cLV" },
        annual: { currency: "BRL", amount: 598.80, monthlyEquivalent: 49.90, priceId: "price_1TwinfQgM79UmffPNdXFOtaa" },
        founder: { currency: "BRL", amount: 497.00, priceId: "price_1Twir1QgM79UmffPAsh0E1LA" }
      }
    }
  });
});

// 2. Create Checkout Session based on selected plan and language
app.post("/api/stripe/create-checkout-session", async (req, res) => {
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Stripe Secret Exists:", !!process.env.STRIPE_SECRET_KEY);

  const { lang, planId, priceId, price_id } = req.body || {}; // lang: 'pt'|'es'|'en', planId: 'monthly'|'annual'|'founder'
  const targetPlan = planId || 'annual';
  const targetLang = (lang === 'pt' || lang === 'es' || lang === 'en') ? lang : 'en';

  // Stripe Price IDs provided for each plan and currency
  const DEFAULT_STRIPE_PRICES: Record<string, Record<string, string>> = {
    monthly: {
      en: "price_1TrfkaQgM79UmffPY33Spfuc", // $19.99 USD
      es: "price_1TrfnaQgM79UmffPZE43dIsx", // €19.99 EUR
      pt: "price_1TrfmcQgM79UmffPGSpl0cLV", // R$97.90 BRL
    },
    annual: {
      en: "price_1TwimKQgM79UmffPlbyeMuPI", // $119.88 USD
      es: "price_1TwinCQgM79UmffPjj7PuFKa", // €118.80 EUR
      pt: "price_1TwinfQgM79UmffPNdXFOtaa", // R$598.80 BRL
    },
    founder: {
      en: "price_1Twip6QgM79UmffPy9urRCrr", // $99 USD
      es: "price_1Twiq5QgM79UmffPFo3AqSUB", // €99 EUR
      pt: "price_1Twir1QgM79UmffPAsh0E1LA", // R$497 BRL
    }
  };

  // Resolve Stripe Price ID
  let stripePriceId = priceId || price_id;
  if (!stripePriceId) {
    if (targetPlan === 'founder' && process.env.STRIPE_PRICE_FOUNDER) {
      stripePriceId = process.env.STRIPE_PRICE_FOUNDER;
    } else if (targetPlan === 'annual' && process.env.STRIPE_PRICE_ANNUAL) {
      stripePriceId = process.env.STRIPE_PRICE_ANNUAL;
    } else if (targetPlan === 'monthly' && process.env.STRIPE_PRICE_MONTHLY) {
      stripePriceId = process.env.STRIPE_PRICE_MONTHLY;
    } else if (process.env.STRIPE_PRICE_ID) {
      stripePriceId = process.env.STRIPE_PRICE_ID;
    } else {
      stripePriceId = DEFAULT_STRIPE_PRICES[targetPlan]?.[targetLang] || DEFAULT_STRIPE_PRICES[targetPlan]?.['en'];
    }
  }

  // Check founder spots if founder plan requested
  if (targetPlan === 'founder') {
    if (founderSpotsRemaining <= 0) {
      return res.status(400).json({
        success: false,
        error: "O Plano Fundador está esgotado (0 de 30 vagas restantes)."
      });
    }
  }

  // Resolve exact currency & unit amounts
  let currency = "USD";
  let unitAmount = 1999;
  let mode = "subscription";
  let recurringInterval: "month" | "year" | null = "month";
  let productName = "Life4Billion Plan";
  let productDesc = "Complete access to Life4Billion ERP, Finances, Habits, and AI Copilot.";

  if (targetPlan === "founder") {
    mode = "payment";
    recurringInterval = null;
    if (lang === "pt") {
      currency = "BRL";
      unitAmount = 49700; // R$ 497.00
      productName = "Plano Fundador Life4Billion — Acesso Vitalício";
      productDesc = "Oferta exclusiva de lançamento. Acesso vitalício sem mensalidades com garantia de 7 dias.";
    } else if (lang === "es") {
      currency = "EUR";
      unitAmount = 9900; // € 99.00
      productName = "Plan Fundador Life4Billion — Acceso De Por Vida";
      productDesc = "Oferta exclusiva de lanzamiento. Acceso de por vida sin cuotas mensuales con garantía de 7 días.";
    } else {
      currency = "USD";
      unitAmount = 9900; // $ 99.00
      productName = "Life4Billion Founder Plan — Lifetime Access";
      productDesc = "Exclusive launch offer. Lifetime access with zero monthly fees backed by a 7-day refund guarantee.";
    }
  } else if (targetPlan === "annual") {
    mode = "subscription";
    recurringInterval = "year";
    if (lang === "pt") {
      currency = "BRL";
      unitAmount = 59880; // R$ 598.80 / ano (R$ 49.90 / mês)
      productName = "Plano Anual Life4Billion (Mais Popular)";
      productDesc = "Economize 50% no plano anual. R$ 49,90/mês faturados anualmente (R$ 598,80/ano) com garantia de 7 dias.";
    } else if (lang === "es") {
      currency = "EUR";
      unitAmount = 11880; // € 118.80 / año (€ 9.90 / mes)
      productName = "Plan Anual Life4Billion (Más Popular)";
      productDesc = "Ahorra 50% en el plan anual. €9.90/mes facturados anualmente con garantía de 7 días.";
    } else {
      currency = "USD";
      unitAmount = 11988; // $ 119.88 / year ($ 9.99 / month)
      productName = "Life4Billion Annual Plan (Most Popular)";
      productDesc = "Save 50% with annual billing. $9.99/month billed annually ($119.88/yr) backed by a 7-day refund guarantee.";
    }
  } else {
    // Monthly plan
    mode = "subscription";
    recurringInterval = "month";
    if (lang === "pt") {
      currency = "BRL";
      unitAmount = 9790; // R$ 97.90 / mês
      productName = "Plano Mensal Life4Billion";
      productDesc = "Acesso flexível sem compromisso. Cancele quando quiser com garantia de reembolso de 7 dias.";
    } else if (lang === "es") {
      currency = "EUR";
      unitAmount = 1999; // € 19.99 / mês
      productName = "Plan Mensual Life4Billion";
      productDesc = "Acceso flexible sin compromiso. Cancela cuando quieras con garantía de reembolso de 7 días.";
    } else {
      currency = "USD";
      unitAmount = 1999; // $ 19.99 / month
      productName = "Life4Billion Monthly Plan";
      productDesc = "Flexible monthly access. Cancel anytime with a 100% 7-day money-back guarantee.";
    }
  }

  let hostUrl = process.env.APP_URL;
  if (!hostUrl) {
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.headers.host || (req.headers.origin ? String(req.headers.origin).replace(/^https?:\/\//, "") : "localhost:3000");
    hostUrl = `${protocol}://${host}`;
  }
  const successUrl = `${hostUrl}/?payment=success&lang=${lang || 'en'}&plan=${targetPlan}`;
  const cancelUrl = `${hostUrl}/?payment=cancel&lang=${lang || 'en'}`;

  const stripe = getStripeInstance();
  if (!stripe || !process.env.STRIPE_SECRET_KEY) {
    // Return simulated success parameters if Stripe key is missing so demo UI works smoothly
    if (targetPlan === 'founder' && founderSpotsRemaining > 0) {
      saveFounderSpots(founderSpotsRemaining - 1);
    }
    return res.json({
      success: true,
      isConfigured: false,
      simulated: true,
      plan: targetPlan,
      remainingFounderSpots: founderSpotsRemaining,
      message: "Modo simulação ativo. Servidor processou o checkout com sucesso."
    });
  }

  try {
    const lineItems = stripePriceId
      ? [{ price: stripePriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: productName,
                description: productDesc,
              },
              unit_amount: unitAmount,
              ...(mode === "subscription" && recurringInterval ? { recurring: { interval: recurringInterval } } : {}),
            },
            quantity: 1,
          },
        ];

    const sessionParam: any = {
      payment_method_types: ["card"],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: lineItems,
    };

    const session = await stripe.checkout.sessions.create(sessionParam);

    if (targetPlan === 'founder' && founderSpotsRemaining > 0) {
      saveFounderSpots(founderSpotsRemaining - 1);
    }
    
    return res.json({
      success: true,
      isConfigured: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      remainingFounderSpots: founderSpotsRemaining
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
    console.log(`[Life4Billion Fullstack Engine] Rodando na porta http://0.0.0.0:${PORT}`);
  });
}

startServer();
