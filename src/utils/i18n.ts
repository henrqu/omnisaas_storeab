/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext } from 'react';

export type Language = 'pt' | 'en' | 'es';
export type Theme = 'light' | 'dark';

export interface TranslationDict {
  [key: string]: {
    pt: string;
    en: string;
    es: string;
  };
}

export const translations: TranslationDict = {
  // Sidebar & Navigation
  dashboard: { pt: 'Painel Executivo', en: 'Executive Dashboard', es: 'Tablero Ejecutivo' },
  finance: { pt: 'Finanças & Orçamentos', en: 'Finances & Budgets', es: 'Finanzas y Presupuestos' },
  habits: { pt: 'Hábitos & Metas', en: 'Habits & Goals', es: 'Hábitos y Metas' },
  health: { pt: 'Sinais Vitais & Dieta', en: 'Vital Signs & Diet', es: 'Signos Vitales y Dieta' },
  family: { pt: 'Gestão Familiar', en: 'Family Management', es: 'Gestión Familiar' },
  company: { pt: 'Empresa & Folha CLT', en: 'Company & HR Payroll', es: 'Empresa y Nómina' },
  crm: { pt: 'Vendas & CRM', en: 'Sales & CRM', es: 'Ventas y CRM' },
  ai: { pt: 'Copiloto Vesta AI', en: 'Vesta AI Copilot', es: 'Copiloto Vesta AI' },
  profile: { pt: 'Assinatura & Perfil', en: 'Subscription & Profile', es: 'Suscripción y Perfil' },
  workspaceView: { pt: 'Visão de Workspace', en: 'Workspace View', es: 'Vista de Workspace' },
  secureSandbox: { pt: 'Banco Sandbox Seguro', en: 'Secure Sandbox Database', es: 'Base de Datos Segura' },
  proPlan: { pt: 'Plano Pro', en: 'Pro Plan', es: 'Plan Pro' },
  welcome: { pt: 'Bem-vindo de volta', en: 'Welcome back', es: 'Bienvenido de nuevo' },
  logout: { pt: 'Sair / Fazer Logout', en: 'Log Out', es: 'Cerrar Sesión' },
  settings: { pt: 'Definições / Configurações', en: 'Settings', es: 'Configuración' },
  editProfile: { pt: 'Editar Perfil', en: 'Edit Profile', es: 'Editar Perfil' },
  
  // Actions
  save: { pt: 'Salvar', en: 'Save', es: 'Guardar' },
  add: { pt: 'Adicionar', en: 'Add', es: 'Añadir' },
  delete: { pt: 'Excluir', en: 'Delete', es: 'Eliminar' },
  cancel: { pt: 'Cancelar', en: 'Cancel', es: 'Cancelar' },
  edit: { pt: 'Editar', en: 'Edit', es: 'Editar' },
  exportPdf: { pt: 'Exportar PDF', en: 'Export PDF', es: 'Exportar PDF' },
  exportDocs: { pt: 'Exportar DOCS', en: 'Export DOCS', es: 'Exportar DOCS' },
  exportExcel: { pt: 'Exportar EXCEL', en: 'Export EXCEL', es: 'Exportar EXCEL' },
  print: { pt: 'Imprimir', en: 'Print', es: 'Imprimir' },
  exportButton: { pt: 'Exportar / Imprimir', en: 'Export / Print', es: 'Exportar / Imprimir' },

  // General & Dashboards
  totalRevenue: { pt: 'Receita Bruta Acumulada', en: 'Total Gross Revenue', es: 'Ingresos Brutos Totales' },
  operatingExpenses: { pt: 'Despesas Operacionais', en: 'Operating Expenses', es: 'Gastos Operativos' },
  netCashFlow: { pt: 'Fluxo de Caixa Líquido', en: 'Net Cash Flow', es: 'Flujo de Caja Neto' },
  activeHabits: { pt: 'Hábitos Ativos', en: 'Active Habits', es: 'Hábitos Activos' },
  pregnancyWeek: { pt: 'Semana de Gravidez', en: 'Pregnancy Week', es: 'Semana de Embarazo' },
  systolicPressure: { pt: 'Pressão Sistólica', en: 'Systolic Pressure', es: 'Presión Sistólica' },
  diastolicPressure: { pt: 'Pressão Diastólica', en: 'Diastolic Pressure', es: 'Presión Diastólica' },
  weight: { pt: 'Peso', en: 'Weight', es: 'Peso' },
  sleep: { pt: 'Sono', en: 'Sleep', es: 'Sueño' },
  calories: { pt: 'Calorias', en: 'Calories', es: 'Calorías' },
  water: { pt: 'Água Diária', en: 'Daily Water', es: 'Agua Diaria' },
  
  // Excel Sheet budget planner
  excelBudgetTitle: { pt: 'Planilha Orçamentária Estilo Excel (I Love Mi)', en: 'Excel-Style Budget Planner (I Love Mi)', es: 'Planilla de Presupuesto estilo Excel (I Love Mi)' },
  excelBudgetDesc: { pt: 'Planejamento financeiro de vida com linhas editáveis integradas.', en: 'Comprehensive life budget sheet with inline editable grid rows.', es: 'Planificación financeira con filas editables integradas.' },
  category: { pt: 'Categoria', en: 'Category', es: 'Categoría' },
  plannedValue: { pt: 'Valor Previsto', en: 'Planned Value', es: 'Valor Previsto' },
  actualValue: { pt: 'Valor Realizado', en: 'Actual Value', es: 'Valor Realizado' },
  difference: { pt: 'Diferença', en: 'Difference', es: 'Diferencia' },
  status: { pt: 'Status', en: 'Status', es: 'Estado' },
  notes: { pt: 'Anotações', en: 'Notes', es: 'Notas' },
  addRow: { pt: 'Nova Linha', en: 'Add Row', es: 'Añadir Fila' },
  resetSheet: { pt: 'Redefinir Planilha', en: 'Reset Sheet', es: 'Restablecer Planilla' },
  
  // SaaS Pages Translation
  monthlyNetBalance: { pt: 'Saldo Líquido Mensal', en: 'Monthly Net Balance', es: 'Saldo Neto Mensual' },
  grossRevenue: { pt: 'Receita Bruta (Entradas)', en: 'Gross Revenue (Inflow)', es: 'Ingresos Brutos (Entradas)' },
  erpEmployees: { pt: 'Colaboradores ERP', en: 'ERP Employees', es: 'Colaboradores ERP' },
  habitFidelity: { pt: 'Fidelidade aos Hábitos', en: 'Habits Fidelity', es: 'Fidelidad a los Hábitos' },
  operationalSystem: { pt: 'Sistema Operacional Ativo', en: 'Operational System Active', es: 'Sistema Operativo Activo' },
  welcomeMessage: { pt: 'Seu OmniSaaS unificado está sincronizado.', en: 'Your unified OmniSaaS is synced.', es: 'Su OmniSaaS unificado está sincronizado.' },
  activeEmployees: { pt: 'Colaboradores Ativos', en: 'Active Employees', es: 'Colaboradores Activos' },
  retentionRate: { pt: 'taxa de retenção', en: 'retention rate', es: 'tasa de retención' },
  habitsCompletedToday: { pt: 'hábitos concluídos hoje', en: 'habits completed today', es: 'habits completados hoy' },
  bestStreak: { pt: 'Melhor streak', en: 'Best streak', es: 'Mejor racha' },
  registerSale: { pt: 'Registrar Venda', en: 'Register Sale', es: 'Registrar Venta' },
  consultAi: { pt: 'Consultar IA', en: 'Consult AI', es: 'Consultar IA' },
  financialOverview: { pt: 'Resumo Financeiro', en: 'Financial Summary', es: 'Resumen Financiero' },
  recentTransactions: { pt: 'Transações Recentes', en: 'Recent Transactions', es: 'Transacciones Recientes' },
  netMargin: { pt: 'margem líquida', en: 'net margin', es: 'margen neto' },
  thisWeekEst: { pt: 'esta semana (est.)', en: 'this week (est.)', es: 'esta semana (est.)' },
  today: { pt: 'Hoje', en: 'Today', es: 'Hoy' },

  // Categories
  sleepCat: { pt: 'Sono', en: 'Sleep', es: 'Sueño' },
  healthCat: { pt: 'Saúde', en: 'Health', es: 'Salud' },
  moneyCat: { pt: 'Dinheiro', en: 'Money', es: 'Dinero' },
  productivityCat: { pt: 'Produtividade', en: 'Productivity', es: 'Productividad' },
  studiesCat: { pt: 'Estudos', en: 'Studies', es: 'Estudios' },
  familyCat: { pt: 'Família', en: 'Family', es: 'Familia' },
  workCat: { pt: 'Trabalho', en: 'Work', es: 'Trabajo' },
  debtCat: { pt: 'Quitar Dívida', en: 'Pay Off Debt', es: 'Pagar Deuda' },
  
  // New Dashboard Translations
  searchPlaceholder: { pt: 'Pesquisar transações, hábitos ou metas...', en: 'Search transactions, habits, or goals...', es: 'Buscar transacciones, hábitos o metas...' },
  monthlyBalanceComp: { pt: 'Balanço do Mês (Comparativo)', en: 'Monthly Balance (Comparative)', es: 'Balance Mensual (Comparativo)' },
  competencePeriod: { pt: 'Competência Julho 2026', en: 'Reporting Period July 2026', es: 'Período de Reporte Julio 2026' },
  monetaryInflow: { pt: 'Receitas Monetárias (Entradas)', en: 'Monetary Inflow (Receivables)', es: 'Ingresos Monetarios (Entradas)' },
  monetaryOutflow: { pt: 'Despesas & Custos (Saídas)', en: 'Monetary Outflow (Expenses)', es: 'Egresos Monetarios (Salidas)' },
  expenseRatioText: { pt: 'Sua despesa representa {ratio}% da entrada líquida.', en: 'Your expenses represent {ratio}% of total inflows.', es: 'Sus gastos representan el {ratio}% de los ingresos totales.' },
  cashFlowBtn: { pt: 'Fluxo de Caixa', en: 'Cash Flow', es: 'Flujo de Caja' },
  viewAll: { pt: 'Ver todas', en: 'View All', es: 'Ver todo' },
  tableDesc: { pt: 'Descrição', en: 'Description', es: 'Descripción' },
  tableCat: { pt: 'Categoria', en: 'Category', es: 'Categoría' },
  tableDate: { pt: 'Data', en: 'Date', es: 'Fecha' },
  tableValue: { pt: 'Valor', en: 'Amount', es: 'Valor' },
  noTransactions: { pt: 'Nenhum lançamento financeiro registrado.', en: 'No financial transactions registered.', es: 'No hay transacciones financieras registradas.' },
  lowStockAlert: { pt: 'Alerta de Estoque Baixo', en: 'Low Stock Alert', es: 'Alerta de Stock Bajo' },
  restockBtn: { pt: 'Abastecer ou Ver Produtos', en: 'Restock or View Products', es: 'Abastecer o Ver Productos' },
  activeGoals: { pt: 'Metas Ativas', en: 'Active Goals', es: 'Metas Activas' },
  manageBtn: { pt: 'Gerenciar', en: 'Manage', es: 'Gestionar' },
  noGoals: { pt: 'Nenhuma meta ativa cadastrada.', en: 'No active goals registered.', es: 'No hay metas activas registradas.' },
  habitCheckoff: { pt: 'Checkoff de Hábitos', en: 'Habits Checkoff', es: 'Control de Hábitos' },
  configureBtn: { pt: 'Configurar', en: 'Configure', es: 'Configurar' },
  noHabits: { pt: 'Nenhum hábito cadastrado para hoje.', en: 'No habits registered for today.', es: 'No hay hábitos registrados para hoy.' },
  
  // App-level layout translations
  successLabel: { pt: 'Sucesso', en: 'Success', es: 'Éxito' },
  allNotifsRead: { pt: 'Todas as notificações foram lidas.', en: 'All notifications have been marked as read.', es: 'Todas las notificaciones han sido marcadas como leídas.' },
  alertsCleared: { pt: 'Central Limpa', en: 'Alert Center Cleared', es: 'Alertas Limpias' },
  alertsReset: { pt: 'Histórico de alertas foi redefinido.', en: 'Alert history has been reset.', es: 'El historial de alertas ha sido restablecido.' },
  logoutSuccess: { pt: 'Logout realizado com sucesso.', en: 'Logged out successfully.', es: 'Sesión cerrada con éxito.' },
  languageLabel: { pt: 'Idioma / Língua', en: 'Language', es: 'Idioma' },
  languageDesc: { pt: 'Mude a tradução completa do SaaS, incluindo moedas e métricas.', en: 'Change the complete translation of the SaaS, including currencies and metrics.', es: 'Cambie la traducción completa del SaaS, incluyendo monedas y métricas.' },
  visualTheme: { pt: 'Visual / Tema', en: 'Visual Theme', es: 'Visual / Tema' },
  visualThemeDesc: { pt: 'Selecione o seu modo de contraste preferido do sistema.', en: 'Select your preferred contrast mode for the system.', es: 'Seleccione su modo de contraste preferido para el sistema.' },
  doneBtn: { pt: 'OK / Concluído', en: 'OK / Done', es: 'Aceptar / Hecho' },
  alertsCenter: { pt: 'Central de Alertas', en: 'Alerts Center', es: 'Centro de Alertas' },
  markAllRead: { pt: 'Marcar tudo como lido', en: 'Mark all as read', es: 'Marcar todo como leído' },
  clearHistory: { pt: 'Limpar histórico', en: 'Clear history', es: 'Limpiar historial' },
  everythingQuiet: { pt: 'Tudo calmo por aqui', en: 'Everything is quiet here', es: 'Todo tranquilo por aquí' },
  noAlertsRegistered: { pt: 'Nenhum alerta cadastrado na central de auditoria.', en: 'No alerts registered in the audit center.', es: 'No hay alertas registradas en el centro de auditoría.' },
  alertsFooterWarning: { pt: 'Alertas são gerados dinamicamente no OmniSaaS a cada transação, pagamento do Stripe ou check-off de hábitos.', en: 'Alerts are dynamically generated in OmniSaaS with every transaction, Stripe payment, or habit check-off.', es: 'Las alertas se generan dinámicamente en OmniSaaS con cada transacción, pago de Stripe o control de hábitos.' },
  defaultUser: { pt: 'Usuário Omni', en: 'Omni User', es: 'Usuario Omni' },
  themeLight: { pt: 'Luz Sofisticada', en: 'Sophisticated Light', es: 'Luz Sofisticada' },
  themeDark: { pt: 'Escuro Sofisticado', en: 'Sophisticated Dark', es: 'Oscuro Sofisticado' },
  themeUpdated: { pt: 'Tema Atualizado', en: 'Theme Updated', es: 'Tema Actualizado' },
  themeDefinedTo: { pt: 'Tema definido para', en: 'Theme defined to', es: 'Tema definido a' },
  
  // Supabase Sync Translations
  supabaseSyncTitle: { pt: 'Nuvem Supabase Cloud', en: 'Supabase Cloud Sync', es: 'Nube Supabase Cloud' },
  supabaseSyncDesc: { pt: 'Sincronize todo o estado do OmniSaaS (Hábitos, Finanças, Metas e Colaboradores) de forma bidirecional com o seu banco de dados Supabase.', en: 'Synchronize all OmniSaaS state (Habits, Finances, Goals, and Employees) bidirectionally with your Supabase database.', es: 'Sincronice todo el estado de OmniSaaS (Hábitos, Finanzas, Metas y Colaboradores) bidireccionalmente con su base de datos Supabase.' },
  supabaseStatusConnected: { pt: 'Conectado com Sucesso', en: 'Connected Successfully', es: 'Conectado con Éxito' },
  supabaseStatusDisconnected: { pt: 'Supabase Não Configurado', en: 'Supabase Not Configured', es: 'Supabase No Configurado' },
  supabaseStatusPendingInit: { pt: 'Esquema Pendente', en: 'Schema Pending', es: 'Esquema Pendiente' },
  supabaseSyncNowBtn: { pt: 'Enviar Dados (Push)', en: 'Push Data (Sync)', es: 'Enviar Datos (Sincronizar)' },
  supabasePullNowBtn: { pt: 'Baixar Dados (Pull)', en: 'Pull Data (Sync)', es: 'Descargar Datos (Pull)' },
  supabaseSyncSuccess: { pt: 'Dados sincronizados com o Supabase!', en: 'Data synchronized with Supabase!', es: '¡Dados sincronizados com Supabase!' },
  supabasePullSuccess: { pt: 'Estado restaurado com sucesso!', en: 'State restored successfully!', es: '¡Estado restaurado con éxito!' },
  supabaseInitRequired: { pt: 'Atenção: A tabela "omnisaas_store" não foi encontrada. Clique abaixo para ver o comando SQL de inicialização.', en: 'Warning: The table "omnisaas_store" was not found. Click below to see the SQL initialization command.', es: 'Atención: No se encontró la tabla "omnisaas_store". Haga clic a continuación para ver el comando SQL de inicialización.' },
  supabaseInitShowSql: { pt: 'Exibir SQL de Setup', en: 'Show SQL Setup', es: 'Mostrar SQL de Setup' },
  
  // Stripe Checkout Translations
  stripeCheckoutTitle: { pt: 'Ativação do Espaço de Trabalho Premium', en: 'Premium Workspace Activation', es: 'Activación del Espacio de Trabalho Premium' },
  stripeCheckoutDesc: { pt: 'Antes de poder se inscrever ou entrar, você deve efetuar o pagamento. A plataforma completa de ERP, Finanças, Hábitos e Copiloto Inteligente requer uma licença ativa.', en: 'Before signing up or logging in, you must complete the payment. The complete ERP, Finance, Habits, and AI Copilot platform requires an active license.', es: 'Antes de registrarse o iniciar sesión, debe realizar el pago. La plataforma completa de ERP, Finanzas, Hábitos y Copiloto Inteligente requiere una licencia activa.' },
  stripePayNowBtn: { pt: 'Efetuar Pagamento Seguro com Stripe', en: 'Proceed to Secure Stripe Checkout', es: 'Proceder al Pago Seguro con Stripe' },
  stripeBackToPay: { pt: 'Voltar ao Pagamento', en: 'Back to Payment', es: 'Volver al Pago' },
  stripePaidSuccessToast: { pt: 'Pagamento de licença verificado com sucesso pelo Stripe! Crie sua conta.', en: 'Workspace license payment successfully verified by Stripe! Please create your account.', es: '¡Pago de licencia verificado con éxito por Stripe! Crea tu cuenta.' },
  stripePriceDetails: { pt: 'Acesso vitalício completo por apenas BRL 97,90', en: 'Lifetime access for only USD 19.99', es: 'Acceso de por vida por solo EUR 19.99' },
  stripeDetectedLanguage: { pt: 'Preço e moeda adaptados automaticamente para o idioma detectado.', en: 'Pricing and currency automatically tailored for your detected language.', es: 'Precio y moneda adaptados automáticamente al idioma detectado.' },
  stripeTestModeDisclaimer: { pt: 'Modo Teste / Simulação: O servidor não detectou a variável de ambiente STRIPE_SECRET_KEY. O fluxo de checkout será simulado com alta fidelidade para homologação imediata.', en: 'Test / Demo Mode: The server did not detect the STRIPE_SECRET_KEY environment variable. The checkout flow will be simulated with high fidelity for immediate verification.', es: 'Modo de prueba / simulación: El servidor no detectó la variable de entorno STRIPE_SECRET_KEY. El flujo de pago se simulará con alta fidelidad para su verificación inmediata.' },
  cardHolder: { pt: 'Nome do Titular do Cartão', en: 'Cardholder Name', es: 'Nombre del Titular de la Tarjeta' },
  cardNumber: { pt: 'Número do Cartão de Crédito', en: 'Credit Card Number', es: 'Número de Tarjeta de Crédito' },
  cardExpiry: { pt: 'Data de Vencimento (MM/AA)', en: 'Expiry Date (MM/YY)', es: 'Fecha de Vencimiento (MM/AA)' },
  cardCvc: { pt: 'CVC / Código de Segurança', en: 'CVC / Security Code', es: 'CVC / Código de Seguridad' },
  simulatingPayment: { pt: 'Comunicando com a Stripe Gateway API... Processando...', en: 'Contacting Stripe Gateway API... Processing safe transaction...', es: 'Comunicándose con la Stripe Gateway API... Procesando transacción segura...' },
  simulatedPaySuccessBtn: { pt: 'Confirmar Pagamento Simulado (Sucesso)', en: 'Confirm Simulated Payment (Success)', es: 'Confirmar Pago Simulado (Éxito)' },
  simulatedPayCancelBtn: { pt: 'Cancelar Checkout', en: 'Cancel Checkout', es: 'Cancelar Pago' },
  detectedLocaleIs: { pt: 'Idioma Detectado:', en: 'Detected Language:', es: 'Idioma Detectado:' },
  activeLicense: { pt: 'Licença Ativa com Stripe', en: 'Active License with Stripe', es: 'Licencia Activa com Stripe' },
  supabaseInstructionCopy: { pt: 'Copie e execute o SQL acima no SQL Editor do seu console Supabase para criar a estrutura:', en: 'Copy and run the SQL above in the SQL Editor of your Supabase console to create the table structure:', es: 'Copie y ejecute el SQL anterior en el Editor SQL de su consola Supabase para criar la estrutura:' }
};

export const formatCurrency = (value: number, lang: Language): string => {
  if (lang === 'pt') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } else if (lang === 'es') {
    return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  } else {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
};

export interface LanguageThemeContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  t: (key: keyof typeof translations | string, fallback?: string) => string;
}

export const LanguageThemeContext = createContext<LanguageThemeContextProps | undefined>(undefined);

export const useLanguageTheme = () => {
  const context = useContext(LanguageThemeContext);
  if (!context) {
    throw new Error('useLanguageTheme must be used within a LanguageThemeProvider');
  }
  return context;
};
