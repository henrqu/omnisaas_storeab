import React from 'react';
import { 
  Building, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  BarChart3, 
  FileText, 
  ArrowUpRight,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useLanguageTheme, formatCurrency } from '../../utils/i18n';
import { Company, Employee, Product, Customer, Sale, Transaction } from '../../types/schema';

interface BIProps {
  companies: Company[];
  employees: Employee[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  onNavigate?: (view: string) => void;
}

export const BusinessIntelligenceDashboard: React.FC<BIProps> = ({
  companies,
  employees,
  products,
  customers,
  sales,
  transactions,
  totalIncome,
  totalExpense,
  netBalance,
  onNavigate
}) => {
  const { t, language } = useLanguageTheme();

  const grossRevenue = totalIncome || 32800;
  const cogs = Math.round(grossRevenue * 0.28); // Cost of Goods Sold
  const grossProfit = grossRevenue - cogs;
  const operatingExpenses = totalExpense || 12400;
  const ebitda = grossProfit - operatingExpenses;
  const netProfit = ebitda;
  const profitMargin = Math.round((netProfit / (grossRevenue || 1)) * 100);

  const activeCustomersCount = customers.length || 18;
  const totalSalesCount = sales.length || 42;

  // Monthly Sales performance chart data
  const biData = [
    { month: 'Q1-Jan', revenue: 24000, expenses: 11000, profit: 13000 },
    { month: 'Q1-Feb', revenue: 28000, expenses: 12000, profit: 16000 },
    { month: 'Q1-Mar', revenue: 31000, expenses: 11500, profit: 19500 },
    { month: 'Q2-Apr', revenue: 29500, expenses: 12800, profit: 16700 },
    { month: 'Q2-May', revenue: 34000, expenses: 13200, profit: 20800 },
    { month: 'Q2-Jun', revenue: 32800, expenses: 12400, profit: 20400 },
  ];

  const defaultProductsList = products.length > 0 ? products : [
    { id: 'p1', name: 'Life4Billion Enterprise Annual License', price: 2990, sku: 'L4B-ENT', cost: 350 },
    { id: 'p2', name: 'Custom API Integration Service', price: 1890, sku: 'L4B-API', cost: 200 },
    { id: 'p3', name: 'Pro User Monthly Membership', price: 299, sku: 'L4B-PRO', cost: 45 },
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="bi-dashboard">
      
      {/* BI Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {t('dashboard.businessIntelligence', 'Business Intelligence')}
            </span>
            <span className="text-xs text-slate-400 font-mono">Enterprise P&L & CRM Analytics</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {t('dashboard.biTitle', 'Commercial & Corporate Performance Hub')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('dashboard.biSubtitle', 'Track revenue streams, customer acquisition, product margins, and simplified P&L statement.')}
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button 
            onClick={() => onNavigate && onNavigate('company')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-lg shadow-cyan-600/20 flex items-center space-x-1.5"
          >
            <Building className="w-3.5 h-3.5" />
            <span>{t('company', 'Company HR & Payroll')}</span>
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('crm')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center space-x-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('crm', 'Sales & CRM')}</span>
          </button>
        </div>
      </div>

      {/* Corporate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sales Performance */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('dashboard.salesPerformance', 'Sales Revenue')}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(grossRevenue, language)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-400 font-semibold mt-3 flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +18.5% QoQ
          </p>
        </div>

        {/* Profit Margin */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('dashboard.profitMargin', 'Profit Margin')}</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{profitMargin}%</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Gross profit after COGS</p>
        </div>

        {/* Customers */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('dashboard.customers', 'Active Customers')}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{activeCustomersCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-indigo-400 font-semibold mt-3">High LTV / Low Churn</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('expenses', 'OPEX Expenses')}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(operatingExpenses, language)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Operating costs managed</p>
        </div>

      </div>

      {/* Charts & Simplified P&L Statement Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Performance Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">{t('dashboard.revenueTrends', 'Quarterly Revenue vs OPEX')}</h3>
              <p className="text-xs text-slate-400">Commercial revenue compared with operating overhead</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-cyan-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 mr-1.5" /> Revenue
              </span>
              <span className="flex items-center text-rose-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5" /> OPEX
              </span>
            </div>
          </div>

          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={biData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val), language), '']}
                />
                <Bar dataKey="revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Simplified Profit & Loss (P&L) Statement */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>{t('dashboard.profitAndLoss', 'Simplified P&L Statement')}</span>
            </h3>
            <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              P&L YTD
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Gross Revenue */}
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="font-semibold text-slate-300">1. Gross Revenue</span>
              <span className="font-bold text-emerald-400">{formatCurrency(grossRevenue, language)}</span>
            </div>

            {/* COGS */}
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="font-semibold text-slate-400">2. Cost of Goods Sold (COGS)</span>
              <span className="font-medium text-rose-400">-{formatCurrency(cogs, language)}</span>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-bold">
              <span className="text-white">3. Gross Profit</span>
              <span className="text-emerald-300">{formatCurrency(grossProfit, language)}</span>
            </div>

            {/* Operating Expenses */}
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="font-semibold text-slate-400">4. Operating Expenses (OPEX)</span>
              <span className="font-medium text-rose-400">-{formatCurrency(operatingExpenses, language)}</span>
            </div>

            {/* EBITDA / Net Profit */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 font-bold text-sm">
              <span className="text-white">5. Net Operating Profit</span>
              <span className="text-cyan-300">{formatCurrency(netProfit, language)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Top Products Performance Table */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>{t('dashboard.productsPerformance', 'Top Product & Service Margin Performance')}</span>
          </h3>
          <span className="text-xs text-slate-400">Active catalog</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Unit Cost</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {defaultProductsList.map((prod) => {
                const margin = Math.round(((prod.price - prod.cost) / (prod.price || 1)) * 100);
                return (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-semibold text-white">{prod.name}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{prod.sku}</td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">{formatCurrency(prod.price, language)}</td>
                    <td className="py-3 px-3 text-slate-400">{formatCurrency(prod.cost, language)}</td>
                    <td className="py-3 px-3 text-right font-bold text-indigo-400">{margin}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
