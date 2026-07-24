import React from 'react';
import { 
  Clock, 
  BarChart2, 
  Percent
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ComposedChart, 
  Line 
} from 'recharts';
import { Transaction, Goal, Debt } from '../../types/schema';
import { useTranslation, formatCurrency } from '../../utils/i18n';

interface ExecutiveOverviewProps {
  transactions?: Transaction[];
  goals?: Goal[];
  debts?: Debt[];
  netBalance?: number;
  totalIncome?: number;
  totalExpense?: number;
  onNavigate?: (view: string) => void;
}

export const ExecutiveOverviewDashboard: React.FC<ExecutiveOverviewProps> = () => {
  const { t, language, theme } = useTranslation();
  const isLight = theme === 'light';

  // Primary numbers
  const faturamentoVal = 36232405.45;
  const faturamentoAA = 35232543.23;

  const receberVal = 38232405.45;
  const receberAA = 37232543.23;

  const pagoVal = 66232405.45;
  const pagoAA = 37232543.23;

  // Cash flow periods data (1 to 21) for "Valor recebido e valor pago"
  const cashFlowPeriods = [
    { period: '1', valorPago: 18000, valorRecebido: 25000 },
    { period: '2', valorPago: 14000, valorRecebido: 42000 },
    { period: '3', valorPago: 76000, valorRecebido: 92000 },
    { period: '4', valorPago: 16000, valorRecebido: 20000 },
    { period: '5', valorPago: 31000, valorRecebido: 68000 },
    { period: '6', valorPago: 52000, valorRecebido: 66000 },
    { period: '7', valorPago: 10000, valorRecebido: 28000 },
    { period: '8', valorPago: 8000, valorRecebido: 10000 },
    { period: '9', valorPago: 38000, valorRecebido: 70000 },
    { period: '10', valorPago: 26000, valorRecebido: 48000 },
    { period: '11', valorPago: 11000, valorRecebido: 20000 },
    { period: '12', valorPago: 6000, valorRecebido: 8000 },
    { period: '13', valorPago: 16000, valorRecebido: 30000 },
    { period: '14', valorPago: 8000, valorRecebido: 12000 },
    { period: '15', valorPago: 26000, valorRecebido: 36000 },
    { period: '16', valorPago: 40000, valorRecebido: 56000 },
    { period: '17', valorPago: 14000, valorRecebido: 24000 },
    { period: '18', valorPago: 46000, valorRecebido: 72000 },
    { period: '19', valorPago: 24000, valorRecebido: 48000 },
    { period: '20', valorPago: 62000, valorRecebido: 84000 },
    { period: '21', valorPago: 16000, valorRecebido: 22000 },
  ];

  // Faturamento por cliente (Revenue by client)
  const clientRevenue = [
    { name: 'NODA SOLUÇÕES TECNOLÓGICAS', rawVal: 225445.40, pct: 100, isHighlight: true },
    { name: 'FAZENDO FAZENDINHA LTDA', rawVal: 29253.50, pct: 13, isHighlight: false },
    { name: 'FÁBRICA DE PAPELÃO', rawVal: 29079.79, pct: 12.9, isHighlight: false },
    { name: 'FÁBRICA DE ROUPAS', rawVal: 25930.20, pct: 11.5, isHighlight: false },
    { name: 'FÁBRICA DE COLCHÕES', rawVal: 19272.24, pct: 8.5, isHighlight: false },
    { name: 'CAMSAS IMPORTAÇÕES', rawVal: 15369.00, pct: 6.8, isHighlight: false },
    { name: 'FÁBRICA DE TÊNIS', rawVal: 13369.00, pct: 5.9, isHighlight: false },
    { name: 'PIRAMIDEO', rawVal: 13000.00, pct: 5.8, isHighlight: false },
  ];

  // Inadimplência e Faturamento
  const delinquencyData = [
    { month: t('monthJan', 'Janeiro'), inadimplencia: 0.20, faturamento: 0.38, inInadimplencia: 10 },
    { month: t('monthFeb', 'Fevereiro'), inadimplencia: 0.22, faturamento: 0.28, inInadimplencia: 135 },
    { month: t('monthMar', 'Março'), inadimplencia: 0.21, faturamento: 0.29, inInadimplencia: 118 },
  ];

  return (
    <div 
      className={`min-h-full p-4 md:p-6 space-y-6 font-sans rounded-3xl border shadow-2xl transition-colors duration-200 ${
        isLight 
          ? 'bg-slate-100 text-slate-900 border-slate-200' 
          : 'bg-slate-950 text-slate-100 border-emerald-900/50'
      }`} 
      id="executive-overview-dashboard"
    >
      
      {/* 1. HEADER SECTION */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-emerald-950/80'}`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <h1 className={`${isLight ? 'text-slate-900' : 'text-white'} font-extrabold text-lg md:text-2xl tracking-widest uppercase`}>
              {t('executiveTitle', 'DASHBOARD')}
            </h1>
            <h1 className="text-emerald-500 font-extrabold text-lg md:text-2xl tracking-widest uppercase">
              {t('executiveOverview', 'OVERVIEW')}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. TOP 3 EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Faturamento */}
        <div className={`border rounded-2xl p-5 shadow-xl transition group ${
          isLight ? 'bg-white border-slate-200 hover:border-emerald-500/50' : 'bg-slate-900 border-emerald-500/30 hover:border-emerald-500/60'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className={`text-sm font-semibold tracking-wide ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{t('executiveRevenue', 'Faturamento')}</span>
            <div className={`p-1.5 rounded-lg ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-950/80 text-emerald-400'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {formatCurrency(faturamentoVal, language)}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-emerald-500 mt-1.5 flex items-center space-x-1">
              <span>{t('executiveYearOverYear', 'AA')}: {formatCurrency(faturamentoAA, language)} (+9,3%)</span>
            </p>
          </div>
        </div>

        {/* Card 2: Valor a receber */}
        <div className={`border rounded-2xl p-5 shadow-xl transition group ${
          isLight ? 'bg-white border-slate-200 hover:border-emerald-500/50' : 'bg-slate-900 border-emerald-500/30 hover:border-emerald-500/60'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className={`text-sm font-semibold tracking-wide ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{t('executiveReceivables', 'Valor a receber')}</span>
            <div className={`p-1.5 rounded-lg ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-950/80 text-emerald-400'}`}>
              <BarChart2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {formatCurrency(receberVal, language)}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-emerald-500 mt-1.5 flex items-center space-x-1">
              <span>{t('executiveYearOverYear', 'AA')}: {formatCurrency(receberAA, language)} (+9,3%)</span>
            </p>
          </div>
        </div>

        {/* Card 3: Valor pago a menor */}
        <div className={`border rounded-2xl p-5 shadow-xl transition group ${
          isLight ? 'bg-white border-slate-200 hover:border-emerald-500/50' : 'bg-slate-900 border-emerald-500/30 hover:border-emerald-500/60'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className={`text-sm font-semibold tracking-wide ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{t('executivePaidShorthand', 'Valor pago a menor')}</span>
            <div className={`p-1.5 rounded-lg ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-950/80 text-emerald-400'}`}>
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {formatCurrency(pagoVal, language)}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-emerald-500 mt-1.5 flex items-center space-x-1">
              <span>{t('executiveYearOverYear', 'AA')}: {formatCurrency(pagoAA, language)} (+9,3%)</span>
            </p>
          </div>
        </div>

      </div>

      {/* 3. MIDDLE SECTION: DUAL BAR CHART - Valor recebido e valor pago */}
      <div className={`border rounded-2xl p-5 shadow-xl space-y-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-emerald-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm md:text-base font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
            {t('executiveReceivedVsPaid', 'Valor recebido e valor pago')}
          </h3>
        </div>

        <div className="h-64 md:h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowPeriods} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="1 1" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
              <XAxis dataKey="period" stroke={isLight ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={{ stroke: isLight ? '#cbd5e1' : '#334155' }} />
              <YAxis 
                stroke={isLight ? '#64748b' : '#94a3b8'} 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                ticks={[0, 100000]}
                tickFormatter={(val) => formatCurrency(val, language)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isLight ? '#ffffff' : '#0f172a', 
                  borderColor: isLight ? '#cbd5e1' : '#166534', 
                  borderRadius: '0.75rem', 
                  color: isLight ? '#0f172a' : '#ffffff', 
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(val: any) => [formatCurrency(Number(val), language), '']}
              />
              <Bar dataKey="valorRecebido" fill="#22c55e" radius={[3, 3, 0, 0]} name={t('executiveReceived', 'Valor recebido')} />
              <Bar dataKey="valorPago" fill="#15803d" radius={[3, 3, 0, 0]} name={t('executivePaid', 'Valor pago')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className={`flex items-center justify-center space-x-6 text-xs font-medium pt-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block" />
            <span>{t('executiveReceived', 'Valor recebido')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#15803d] inline-block" />
            <span>{t('executivePaid', 'Valor pago')}</span>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ROW: FATURAMENTO POR CLIENTE & INADIMPLÊNCIA E FATURAMENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Faturamento por cliente */}
        <div className={`border rounded-2xl p-5 shadow-xl space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-emerald-500/30'
        }`}>
          <h3 className={`text-sm md:text-base font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
            {t('executiveRevenueByClient', 'Faturamento por cliente')}
          </h3>

          <div className="space-y-3 pt-1">
            {clientRevenue.map((client, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold gap-3">
                <span className={`uppercase tracking-tight truncate max-w-[220px] md:max-w-[260px] ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  {client.name}
                </span>

                <div className={`flex-1 max-w-[80px] md:max-w-[120px] h-2.5 rounded-full overflow-hidden mx-2 ${
                  isLight ? 'bg-slate-200' : 'bg-slate-950'
                }`}>
                  <div 
                    className={`h-full rounded-full ${client.isHighlight ? 'bg-[#22c55e]' : 'bg-[#15803d]'}`} 
                    style={{ width: `${client.pct}%` }}
                  />
                </div>

                {client.isHighlight ? (
                  <span className="bg-[#22c55e] text-slate-950 font-extrabold px-2.5 py-1 rounded-md text-xs shadow-md">
                    {formatCurrency(client.rawVal, language)}
                  </span>
                ) : (
                  <span className={`font-bold px-1 py-0.5 text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {formatCurrency(client.rawVal, language)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Inadimplência e Faturamento */}
        <div className={`border rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-emerald-500/30'
        }`}>
          <h3 className={`text-sm md:text-base font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
            {t('executiveDelinquencyRevenue', 'Inadimplência e Faturamento')}
          </h3>

          <div className="h-60 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={delinquencyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="1 1" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
                <XAxis dataKey="month" stroke={isLight ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={{ stroke: isLight ? '#cbd5e1' : '#334155' }} />
                <YAxis 
                  yAxisId="left" 
                  stroke={isLight ? '#64748b' : '#94a3b8'} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  ticks={[0.0, 0.2, 0.4]}
                  tickFormatter={(val) => `${val.toFixed(1).replace('.', ',')} Mi`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke={isLight ? '#64748b' : '#94a3b8'} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  ticks={[0, 120, 140]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isLight ? '#ffffff' : '#0f172a', 
                    borderColor: isLight ? '#cbd5e1' : '#166534', 
                    borderRadius: '0.75rem', 
                    color: isLight ? '#0f172a' : '#ffffff', 
                    fontSize: '12px' 
                  }}
                />
                <Bar yAxisId="left" dataKey="faturamento" fill="#22c55e" radius={[3, 3, 0, 0]} name={t('executiveRevenue', 'Faturamento')} barSize={32} />
                <Bar yAxisId="left" dataKey="inadimplencia" fill="#15803d" radius={[3, 3, 0, 0]} name={t('executiveDelinquency', 'Inadimplência')} barSize={32} />
                <Line yAxisId="right" type="monotone" dataKey="inInadimplencia" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} name={t('executiveInDelinquency', 'In-Inadimplência')} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className={`flex items-center justify-center space-x-6 text-xs font-medium pt-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block" />
              <span>{t('executiveRevenue', 'Faturamento')}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#15803d] inline-block" />
              <span>{t('executiveDelinquency', 'Inadimplência')}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block" />
              <span>{t('executiveInDelinquency', 'In-Inadimplência')}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ExecutiveOverviewDashboard;
