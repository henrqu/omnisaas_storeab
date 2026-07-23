import React from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Calendar, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useLanguageTheme, formatCurrency } from '../../utils/i18n';
import { Goal, Transaction } from '../../types/schema';

interface MinimalProps {
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
  goals: Goal[];
  transactions: Transaction[];
  onNavigate?: (view: string) => void;
}

export const MinimalDashboard: React.FC<MinimalProps> = ({
  netBalance,
  totalIncome,
  totalExpense,
  goals,
  transactions,
  onNavigate
}) => {
  const { t, language } = useLanguageTheme();

  const balance = netBalance || 6250;
  const income = totalIncome || 8400;
  const expenses = totalExpense || 2150;

  const activeGoals = goals.filter(g => g.status === 'in_progress').slice(0, 2);
  const recentExps = transactions.filter(t => t.type === 'expense').slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in" id="minimal-dashboard">
      
      {/* Ultra Clean Top Header */}
      <div className="text-center space-y-1">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
          {t('dashboard.minimal', 'Minimal Dashboard')}
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight">Simple Overview</h2>
        <p className="text-xs text-slate-400">Essential numbers only. Distraction-free clarity.</p>
      </div>

      {/* Main Focus Card - Current Balance */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-3 shadow-2xl">
        <p className="text-xs uppercase font-semibold text-slate-400 tracking-widest">
          {t('dashboard.currentBalance', 'Current Balance')}
        </p>
        <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
          {formatCurrency(balance, language)}
        </h1>
        <p className="text-xs text-emerald-400 font-medium">
          {balance >= 0 ? 'Healthy cash position' : 'Negative balance attention needed'}
        </p>
      </div>

      {/* Two Column Summary: Income & Expenses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Income Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t('income', 'Money In')}</p>
            <p className="text-2xl font-bold text-white mt-0.5">{formatCurrency(income, language)}</p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 shrink-0">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t('expenses', 'Money Out')}</p>
            <p className="text-2xl font-bold text-white mt-0.5">{formatCurrency(expenses, language)}</p>
          </div>
        </div>

      </div>

      {/* Goals & Upcoming Payments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Simple Goals */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>{t('dashboard.financialGoals', 'Active Goals')}</span>
          </h3>

          {activeGoals.length === 0 ? (
            <p className="text-xs text-slate-500">No active goals set yet.</p>
          ) : (
            <div className="space-y-3">
              {activeGoals.map(g => (
                <div key={g.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-slate-300">
                    <span>{g.name}</span>
                    <span className="text-emerald-400 font-bold">
                      {Math.min(100, Math.round((g.current_value / (g.target_value || 1)) * 100))}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((g.current_value / (g.target_value || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Payments / Recent Outflows */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>{t('dashboard.upcomingPayments', 'Upcoming Payments')}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40">
              <div>
                <p className="font-semibold text-white">AWS Cloud Server</p>
                <p className="text-slate-500 text-[10px]">Due Aug 15</p>
              </div>
              <span className="font-bold text-rose-400">{formatCurrency(1450, language)}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40">
              <div>
                <p className="font-semibold text-white">Software Subscriptions</p>
                <p className="text-slate-500 text-[10px]">Due Aug 18</p>
              </div>
              <span className="font-bold text-rose-400">{formatCurrency(350, language)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
