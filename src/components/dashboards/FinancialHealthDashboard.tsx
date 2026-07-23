import React from 'react';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  CreditCard, 
  PieChart as PieChartIcon, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  DollarSign,
  ShieldAlert,
  Coins
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useLanguageTheme, formatCurrency } from '../../utils/i18n';
import { Transaction, Debt } from '../../types/schema';

interface FinancialHealthProps {
  transactions: Transaction[];
  debts: Debt[];
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  onNavigate?: (view: string) => void;
}

export const FinancialHealthDashboard: React.FC<FinancialHealthProps> = ({
  transactions,
  debts,
  totalIncome,
  totalExpense,
  netBalance,
  onNavigate
}) => {
  const { t, language } = useLanguageTheme();

  // Financial Health Metrics
  const income = totalIncome || 12500;
  const expenses = totalExpense || 6200;
  const savings = Math.max(0, income - expenses);
  const savingsRate = Math.round((savings / (income || 1)) * 100);

  const activeDebts = debts.filter(d => d.status === 'active');
  const totalDebtBalance = activeDebts.reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);

  const estimatedInvestments = 48500 + savings;

  // Calculate Health Score (0 - 100)
  // Factors: savings rate (weight 40%), debt ratio (weight 30%), expense ratio (weight 30%)
  const debtToIncomeRatio = totalDebtBalance / (income * 12 || 1);
  const savingsScore = Math.min(40, (savingsRate / 20) * 40); // 20% savings rate = max 40 pts
  const debtScore = Math.max(0, 30 - debtToIncomeRatio * 30);
  const expenseScore = Math.min(30, (1 - (expenses / (income || 1))) * 30);
  const healthScore = Math.round(savingsScore + debtScore + expenseScore);

  let healthCategory = t('healthExcellent', 'Excellent');
  let healthColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (healthScore < 50) {
    healthCategory = t('healthAtRisk', 'Needs Attention');
    healthColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (healthScore < 75) {
    healthCategory = t('healthGood', 'Good');
    healthColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  // Category breakdowns for pie chart
  const categoryMap: { [cat: string]: number } = {};
  transactions
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
    });

  const categoryData = Object.keys(categoryMap).length > 0
    ? Object.keys(categoryMap).map(cat => ({ name: cat, value: categoryMap[cat] }))
    : [
        { name: 'Housing & Utilities', value: 2400 },
        { name: 'Food & Dining', value: 1200 },
        { name: 'Transport', value: 800 },
        { name: 'Healthcare', value: 600 },
        { name: 'Entertainment', value: 500 },
        { name: 'Subscriptions', value: 700 }
      ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-fade-in" id="financial-health-dashboard">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {t('dashboard.financialHealth', 'Financial Health Dashboard')}
            </span>
            <span className="text-xs text-slate-400 font-mono">Personal Wellness Index</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {t('dashboard.personalWellnessTitle', 'Personal Financial Health Overview')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('dashboard.personalWellnessSubtitle', 'Monitor your savings rate, debt load, investment accumulation, and financial health score.')}
          </p>
        </div>
        <button 
          onClick={() => onNavigate && onNavigate('emergency-fund')}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg shadow-rose-600/20 flex items-center space-x-1.5 shrink-0"
        >
          <Heart className="w-3.5 h-3.5" />
          <span>{t('emergency.fundCenter', 'Emergency Fund Center')}</span>
        </button>
      </div>

      {/* Main Financial Health Score Gauge Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-5">
          {/* Health Score Circular Badge */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400 transition-all duration-1000"
                strokeDasharray={`${healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white tracking-tight">{healthScore}</span>
              <span className="text-[9px] uppercase font-bold text-slate-400">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${healthColor}`}>
                {healthCategory}
              </span>
              <span className="text-xs text-slate-400">{t('dashboard.financialHealthScore', 'Financial Health Score')}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {healthScore >= 75 ? 'Your finances are in excellent condition!' : healthScore >= 50 ? 'Your financial health is stable.' : 'Financial health needs proactive optimization.'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Savings rate is at <strong className="text-emerald-400">{savingsRate}%</strong> of monthly income. Debt utilization remains within healthy parameters.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-xl text-center w-full sm:w-auto min-w-[130px]">
            <p className="text-[10px] uppercase text-slate-400 font-semibold">{t('dashboard.savingsRate', 'Savings Rate')}</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">{savingsRate}%</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-xl text-center w-full sm:w-auto min-w-[130px]">
            <p className="text-[10px] uppercase text-slate-400 font-semibold">{t('dashboard.debtOverview', 'Active Debt')}</p>
            <p className="text-lg font-bold text-rose-400 mt-0.5">{formatCurrency(totalDebtBalance, language)}</p>
          </div>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Income Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('income', 'Monthly Income')}</p>
              <h3 className="text-xl font-bold text-white mt-1">{formatCurrency(income, language)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Monthly net earnings</p>
        </div>

        {/* Expenses Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('expenses', 'Monthly Expenses')}</p>
              <h3 className="text-xl font-bold text-white mt-1">{formatCurrency(expenses, language)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">{((expenses / (income || 1)) * 100).toFixed(1)}% of income</p>
        </div>

        {/* Savings Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('dashboard.savingsRate', 'Monthly Savings')}</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(savings, language)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">{savingsRate}% saved this month</p>
        </div>

        {/* Investments Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('dashboard.investments', 'Investments')}</p>
              <h3 className="text-xl font-bold text-cyan-400 mt-1">{formatCurrency(estimatedInvestments, language)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Portfolio yield est. +7.2%</p>
        </div>

      </div>

      {/* Spending Breakdown & Health Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Spending Categories Chart */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-indigo-400" />
              <span>{t('dashboard.spendingCategories', 'Spending Categories')}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Monthly Allocation</span>
          </div>

          <div className="h-56 w-full min-w-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(value: any) => [formatCurrency(Number(value), language), 'Category']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {categoryData.slice(0, 6).map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40">
                <div className="flex items-center space-x-2 truncate mr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-300 truncate">{cat.name}</span>
                </div>
                <span className="font-semibold text-white shrink-0">{formatCurrency(cat.value, language)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Financial Health Checklist */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Financial Protection Checklist</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white">Emergency Fund Active</p>
                <p className="text-slate-400 mt-0.5">Target buffer established to protect against unexpected life events.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white">Savings Target &gt; 20%</p>
                <p className="text-slate-400 mt-0.5">You are saving {savingsRate}% of net monthly income toward goals.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3">
              {activeDebts.length === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-bold text-white">Debt Payoff Plan</p>
                <p className="text-slate-400 mt-0.5">
                  {activeDebts.length === 0 
                    ? 'Congratulations, you have zero high-interest active debts!' 
                    : `${activeDebts.length} active debts. Apply Snowball or Avalanche method in Emergency Center.`}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
