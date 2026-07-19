/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  Package, 
  Heart, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  Search
} from 'lucide-react';
import { LocalDatabase } from '../utils/db';
import { Transaction, Goal, Habit, Inventory, Employee, Product } from '../types/schema';
import { useLanguageTheme, formatCurrency } from '../utils/i18n';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onShowNotification: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export default function DashboardView({ onNavigate, onShowNotification }: DashboardViewProps) {
  const { t, language } = useLanguageTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false);

  useEffect(() => {
    // Initialize & Load local db
    LocalDatabase.init();
    setTransactions(LocalDatabase.getTransactions());
    setGoals(LocalDatabase.getGoals());
    setHabits(LocalDatabase.getHabits());
    setInventory(LocalDatabase.getInventory());
    setEmployees(LocalDatabase.getEmployees());
    setProducts(LocalDatabase.getProducts());
  }, []);

  // Compute Metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const activeEmployeesCount = employees.filter(e => e.status === 'active').length;

  const lowStockItems = inventory.filter(inv => {
    const prod = products.find(p => p.id === inv.product_id);
    if (!prod) return false;
    return inv.quantity <= inv.reorder_point;
  });

  const habitsCompletedToday = habits.filter(h => {
    const today = new Date().toISOString().split('T')[0];
    return h.last_completed === today;
  }).length;

  const handleToggleHabit = (id: string) => {
    const updated = LocalDatabase.toggleHabit(id);
    setHabits(updated);
    const target = updated.find(h => h.id === id);
    if (target?.last_completed) {
      onShowNotification(
        language === 'en' ? 'Habit Completed!' : language === 'es' ? '¡Hábito Completado!' : 'Hábito Concluído!', 
        language === 'en' ? `Habit "${target.name}" completed today! Streak: ${target.streak} days.` : language === 'es' ? `¡Hábito "${target.name}" completado hoy! Racha: ${target.streak} días.` : `Hábito "${target.name}" completado hoje! Streak: ${target.streak} dias.`, 
        'success'
      );
    } else {
      onShowNotification(
        language === 'en' ? 'Habit Reset' : language === 'es' ? 'Hábito Restablecido' : 'Hábito Desfeito', 
        language === 'en' ? `Today's record for "${target?.name}" was removed.` : language === 'es' ? `El registro de hoy para "${target?.name}" fue eliminado.` : `Registro de hoje para "${target?.name}" foi removido.`, 
        'info'
      );
    }
  };

  // Filter items based on searchQuery
  const filteredTransactions = transactions.filter(tr => 
    (tr.description || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (tr.category || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const filteredGoals = goals.filter(g => 
    (g.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (g.unit && (g.unit || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
  );

  const filteredHabits = habits.filter(h => 
    (h.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const filteredEmployees = employees.filter(e => 
    (e.full_name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (e.role || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (e.department || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (p.sku || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const expenseRatio = totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden" id="dashboard-welcome">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="max-w-xl">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-4 h-4" />
            <span>{t('operationalSystem', 'Sistema Totalmente Operacional')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {t('welcome', 'Bem-vindo de volta')}, Lucas King!
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            {t('welcomeMessage', 'Seu OmniSaaS unificado está sincronizado.')} {t('today', 'Hoje')}: <span className="text-emerald-400 font-semibold">{habitsCompletedToday} {t('habitsCompletedToday', 'de hábitos concluídos')}</span>.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button 
              onClick={() => onNavigate('crm')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1 shadow-lg shadow-indigo-950/40 cursor-pointer"
              id="dashboard-btn-sale"
            >
              <span>{t('registerSale', 'Registrar Venda')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onNavigate('ai')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer"
              id="dashboard-btn-ai"
            >
              <span>{t('consultAi', 'Consultar IA')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative" id="dashboard-search-container">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-indigo-400/80" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchSubmitted(false);
          }}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => {
            // Delay to allow clicking items in dropdown
            setTimeout(() => setIsSearchFocused(false), 250);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsSearchSubmitted(true);
              setIsSearchFocused(false);
            }
          }}
          placeholder={t('searchPlaceholder', 'Pesquisar transações, hábitos ou metas...')}
          className="w-full bg-slate-900/40 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-10 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all shadow-sm"
          id="dashboard-search-input"
        />
        {searchQuery && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setIsSearchSubmitted(false);
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-white font-semibold"
          >
            Clear
          </button>
        )}

        {/* Autocomplete suggestions dropdown */}
        {isSearchFocused && searchQuery.trim().length > 0 && !isSearchSubmitted && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto divide-y divide-slate-800/60 backdrop-blur-md">
            {/* Transactions Section */}
            {filteredTransactions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  💰 {t('recentTransactions', 'Transações')}
                </div>
                {filteredTransactions.slice(0, 3).map(tr => (
                  <button
                    key={tr.id}
                    onClick={() => {
                      setSearchQuery(tr.description);
                      setIsSearchSubmitted(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    <span className="truncate font-medium">{tr.description}</span>
                    <span className="text-[10px] bg-slate-800/60 px-2 py-0.5 rounded text-slate-400 uppercase font-semibold">
                      {tr.category}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Goals Section */}
            {filteredGoals.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  🎯 {t('activeGoals', 'Metas')}
                </div>
                {filteredGoals.slice(0, 3).map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSearchQuery(g.name);
                      setIsSearchSubmitted(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    <span className="truncate font-medium">{g.name}</span>
                    <span className="text-[10px] text-indigo-400 font-semibold">
                      {g.current_value} / {g.target_value} {g.unit}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Habits Section */}
            {filteredHabits.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  🔥 {t('habitCheckoff', 'Hábitos')}
                </div>
                {filteredHabits.slice(0, 3).map(h => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setSearchQuery(h.name);
                      setIsSearchSubmitted(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    <span className="truncate font-medium">{h.name}</span>
                    <span className="text-[10px] text-orange-400 font-semibold">
                      Streak: {h.streak}d
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Employees Section */}
            {filteredEmployees.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  👥 {t('erpEmployees', 'Colaboradores')}
                </div>
                {filteredEmployees.slice(0, 3).map(e => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setSearchQuery(e.full_name);
                      setIsSearchSubmitted(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    <span className="truncate font-medium">{e.full_name}</span>
                    <span className="text-[10px] bg-slate-800/60 px-2 py-0.5 rounded text-cyan-400 font-semibold">
                      {e.role}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Products Section */}
            {filteredProducts.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  📦 {t('products', 'Produtos')}
                </div>
                {filteredProducts.slice(0, 3).map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSearchQuery(p.name);
                      setIsSearchSubmitted(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    <span className="truncate font-medium">{p.name}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {p.sku}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {filteredTransactions.length === 0 &&
             filteredGoals.length === 0 &&
             filteredHabits.length === 0 &&
             filteredEmployees.length === 0 &&
             filteredProducts.length === 0 && (
               <div className="p-4 text-center text-xs text-slate-500">
                 {t('noSuggestions', 'Nenhuma sugestão rápida encontrada.')}
               </div>
            )}
          </div>
        )}
      </div>

      {/* If Search is Submitted, render Search Results Panel; otherwise, the regular Dashboard metrics & grids */}
      {isSearchSubmitted && searchQuery.trim().length > 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in" id="search-results-panel">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center">
                <Search className="w-5 h-5 text-indigo-400 mr-2" />
                {t('searchResultsTitle', 'Resultados de Pesquisa')}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t('foundResultsFor', 'Encontramos correspondências para')} <span className="text-indigo-400 font-semibold">"{searchQuery}"</span>
              </p>
            </div>
            <button 
              onClick={() => {
                setSearchQuery('');
                setIsSearchSubmitted(false);
              }}
              className="self-start sm:self-auto bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-750 transition cursor-pointer"
            >
              {t('backToDashboard', 'Voltar ao Dashboard')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Match Transactions */}
            <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>💰 {t('recentTransactions', 'Transações')}</span>
                <span className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded">{filteredTransactions.length}</span>
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredTransactions.map(tr => (
                  <div key={tr.id} className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-lg border border-white/5 hover:border-indigo-500/10 transition">
                    <div>
                      <p className="text-xs font-medium text-slate-200">{tr.description}</p>
                      <p className="text-[10px] text-slate-500">{tr.date} • {tr.category}</p>
                    </div>
                    <span className={`text-xs font-bold ${tr.type === 'income' ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {tr.type === 'income' ? '+' : '-'} {formatCurrency(tr.amount, language)}
                    </span>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <p className="text-xs text-slate-500 py-2 text-center italic">{t('noResults', 'Nenhuma transação correspondente.')}</p>
                )}
              </div>
            </div>

            {/* Match Goals */}
            <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>🎯 {t('activeGoals', 'Metas')}</span>
                <span className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded">{filteredGoals.length}</span>
              </h3>
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {filteredGoals.map(g => {
                  const progress = Math.min(100, (g.current_value / g.target_value) * 100);
                  return (
                    <div key={g.id} className="bg-slate-900/30 p-2.5 rounded-lg border border-white/5 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-200">{g.name}</span>
                        <span className="text-slate-400">{g.current_value} / {g.target_value} {g.unit}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {filteredGoals.length === 0 && (
                  <p className="text-xs text-slate-500 py-2 text-center italic">{t('noResults', 'Nenhuma meta correspondente.')}</p>
                )}
              </div>
            </div>

            {/* Match Habits */}
            <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>🔥 {t('habitCheckoff', 'Hábitos')}</span>
                <span className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded">{filteredHabits.length}</span>
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredHabits.map(h => {
                  const today = new Date().toISOString().split('T')[0];
                  const isCompleted = h.last_completed === today;
                  return (
                    <div key={h.id} className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-lg border border-white/5">
                      <div className="flex items-center space-x-2 truncate">
                        <button 
                          onClick={() => handleToggleHabit(h.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                            isCompleted ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700 text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 fill-current" />
                        </button>
                        <span className={`text-xs truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                          {h.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-orange-400 font-bold bg-orange-950/20 border border-orange-500/10 px-2 py-0.5 rounded-full flex items-center">
                        <Flame className="w-3 h-3 mr-0.5" /> {h.streak}d
                      </span>
                    </div>
                  );
                })}
                {filteredHabits.length === 0 && (
                  <p className="text-xs text-slate-500 py-2 text-center italic">{t('noResults', 'Nenhum hábito correspondente.')}</p>
                )}
              </div>
            </div>

            {/* Match Other Entities (ERP / Products) */}
            <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>💼 {t('erpProductsStaff', 'ERP: Produtos & Equipe')}</span>
                <span className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded">
                  {filteredEmployees.length + filteredProducts.length}
                </span>
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredEmployees.map(e => (
                  <div key={e.id} className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-lg border border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{e.full_name}</p>
                      <p className="text-[10px] text-slate-500">{e.role} • {e.department}</p>
                    </div>
                    <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800/30 px-2 py-0.5 rounded">Colaborador</span>
                  </div>
                ))}
                {filteredProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-lg border border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{p.name}</p>
                      <p className="text-[10px] text-slate-500">SKU: {p.sku} • {formatCurrency(p.price, language)}</p>
                    </div>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/30 px-2 py-0.5 rounded">Produto</span>
                  </div>
                ))}
                {filteredEmployees.length === 0 && filteredProducts.length === 0 && (
                  <p className="text-xs text-slate-500 py-2 text-center italic">{t('noResults', 'Nenhum registro de ERP correspondente.')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Grid de Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-metrics-grid">
        {/* Card Saldo Líquido */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/30 transition shadow-sm" id="metric-balance">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-medium">{t('monthlyNetBalance', 'Saldo Líquido Mensal')}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                {formatCurrency(netBalance, language)}
              </h3>
            </div>
            <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-3 text-xs">
            <span className={`font-semibold flex items-center ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netBalance >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {(((totalIncome - totalExpense) / (totalIncome || 1)) * 100).toFixed(1)}%
            </span>
            <span className="text-slate-500">{t('netMargin', 'margem líquida')}</span>
          </div>
        </div>

        {/* Card Faturamento Bruto */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/30 transition shadow-sm" id="metric-income">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-medium">{t('grossRevenue', 'Receita Bruta (Entradas)')}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                {formatCurrency(totalIncome, language)}
              </h3>
            </div>
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-3 text-xs">
            <span className="text-emerald-400 font-semibold">+{formatCurrency(totalIncome * 0.1, language)}</span>
            <span className="text-slate-500">{t('thisWeekEst', 'esta semana (est.)')}</span>
          </div>
        </div>

        {/* Card Colaboradores Ativos */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/30 transition shadow-sm" id="metric-employees">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-medium">{t('erpEmployees', 'Colaboradores ERP')}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                {activeEmployeesCount} {t('activeEmployees', 'Ativos')}
              </h3>
            </div>
            <div className="bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-3 text-xs">
            <span className="text-slate-400 font-semibold">100%</span>
            <span className="text-slate-500">{t('retentionRate', 'taxa de retenção')}</span>
          </div>
        </div>

        {/* Card Hábitos & Estilo de Vida */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-orange-500/30 transition shadow-sm" id="metric-habits">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-medium">{t('habitFidelity', 'Fidelidade aos Hábitos')}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                {habitsCompletedToday} / {habits.length} {t('today', 'Hoje')}
              </h3>
            </div>
            <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20 text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-3 text-xs">
            <span className="text-orange-400 font-semibold flex items-center">
              <Flame className="w-3.5 h-3.5 mr-0.5 fill-orange-400" />
              {t('bestStreak', 'Melhor streak')}: 12 {language === 'en' ? 'days' : language === 'es' ? 'días' : 'dias'}
            </span>
            <span className="text-slate-500">streak atual</span>
          </div>
        </div>
      </div>

      {/* Grid de Seções Operacionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-details-grid">
        
        {/* Lado Esquerdo: Finanças e Estoque (2 colunas) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico de Finanças Simplificado */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5" id="dashboard-finance-chart">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white tracking-tight">{t('monthlyBalanceComp', 'Balanço do Mês (Comparativo)')}</h2>
              <span className="text-slate-400 text-xs">{t('competencePeriod', 'Competência Julho 2026')}</span>
            </div>
            <div className="space-y-4">
              {/* Barra de Entradas */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{t('monetaryInflow', 'Receitas Monetárias (Entradas)')}</span>
                  <span className="text-emerald-400 font-semibold">{formatCurrency(totalIncome, language)}</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${totalIncome > 0 ? (totalIncome / (totalIncome + totalExpense || 1)) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              {/* Barra de Saídas */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{t('monetaryOutflow', 'Despesas & Custos (Saídas)')}</span>
                  <span className="text-rose-400 font-semibold">{formatCurrency(totalExpense, language)}</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense || 1)) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Detalhe de Caixa */}
              <div className="pt-3 border-t border-slate-800/60 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  {t('expenseRatioText', 'Sua despesa representa {ratio}% da entrada líquida.').replace('{ratio}', expenseRatio)}
                </span>
                <button 
                  onClick={() => onNavigate('finance')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-0.5 hover:underline cursor-pointer"
                  id="dashboard-btn-to-finance"
                >
                  <span>{t('cashFlowBtn', 'Fluxo de Caixa')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Últimos Lançamentos Financeiros */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5" id="dashboard-recent-transactions">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white tracking-tight">{t('recentTransactions', 'Transações Recentes')}</h2>
              <button 
                onClick={() => onNavigate('finance')}
                className="text-slate-400 hover:text-slate-300 text-xs font-semibold hover:underline cursor-pointer"
              >
                {t('viewAll', 'Ver todas')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs">
                    <th className="pb-2 font-medium">{t('tableDesc', 'Descrição')}</th>
                    <th className="pb-2 font-medium">{t('tableCat', 'Categoria')}</th>
                    <th className="pb-2 font-medium">{t('tableDate', 'Data')}</th>
                    <th className="pb-2 font-medium text-right">{t('tableValue', 'Valor')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm">
                  {filteredTransactions.slice(0, 4).map((tr) => (
                    <tr key={tr.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 font-medium text-slate-200 max-w-[180px] truncate">{tr.description}</td>
                      <td className="py-2.5">
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {tr.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-slate-400">{tr.date}</td>
                      <td className={`py-2.5 text-right font-semibold ${tr.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {tr.type === 'income' ? '+' : '-'} {formatCurrency(tr.amount, language)}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-xs text-slate-500">
                        {t('noTransactions', 'Nenhum lançamento financeiro registrado.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lado Direito: Alertas e Metas e Hábitos */}
        <div className="space-y-6">
          {/* Card Alertas do Estoque */}
          {lowStockItems.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-5" id="dashboard-stock-alerts">
              <div className="flex items-center space-x-2 text-amber-400 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-sm font-bold tracking-tight text-white">{t('lowStockAlert', 'Alerta de Estoque Baixo')}</h2>
              </div>
              <div className="space-y-3">
                {lowStockItems.slice(0, 3).map(inv => {
                  const prod = products.find(p => p.id === inv.product_id);
                  return (
                    <div key={inv.id} className="flex justify-between items-center text-xs bg-amber-950/30 border border-amber-900/30 p-2 rounded-xl">
                      <div className="truncate max-w-[150px]">
                        <p className="font-semibold text-slate-200 truncate">{prod?.name}</p>
                        <p className="text-[10px] text-slate-400">SKU: {prod?.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-bold">{inv.quantity} un</span>
                        <span className="text-[10px] text-slate-500 block">mín: {inv.reorder_point}</span>
                      </div>
                    </div>
                  );
                })}
                <button 
                  onClick={() => onNavigate('crm')}
                  className="w-full mt-1 bg-amber-950/50 hover:bg-amber-900/50 border border-amber-800/40 text-amber-300 hover:text-white text-[11px] font-semibold py-1.5 rounded-lg transition text-center block cursor-pointer"
                  id="dashboard-btn-to-inventory"
                >
                  {t('restockBtn', 'Abastecer ou Ver Produtos')}
                </button>
              </div>
            </div>
          )}

          {/* Seção Objetivos / Metas */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5" id="dashboard-active-goals">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white tracking-tight">{t('activeGoals', 'Metas Ativas')}</h2>
              <button 
                onClick={() => onNavigate('habits')}
                className="text-slate-400 hover:text-slate-300 text-xs font-semibold hover:underline cursor-pointer"
              >
                {t('manageBtn', 'Gerenciar')}
              </button>
            </div>
            <div className="space-y-4">
              {filteredGoals.slice(0, 3).map((g) => {
                const progress = Math.min(100, (g.current_value / g.target_value) * 100);
                return (
                  <div key={g.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300 truncate max-w-[140px]">{g.name}</span>
                      <span className="text-slate-400">{g.current_value} / {g.target_value} <span className="text-[10px]">{g.unit}</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {filteredGoals.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">{t('noGoals', 'Nenhuma meta ativa cadastrada.')}</p>
              )}
            </div>
          </div>

          {/* Rápido Hábito Checkoff */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5" id="dashboard-quick-habits">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-white tracking-tight">{t('habitCheckoff', 'Checkoff de Hábitos')}</h2>
              <button 
                onClick={() => onNavigate('habits')}
                className="text-slate-400 hover:text-slate-300 text-xs font-semibold hover:underline cursor-pointer"
              >
                {t('configureBtn', 'Configurar')}
              </button>
            </div>
            <div className="space-y-2">
              {filteredHabits.slice(0, 4).map((h) => {
                const today = new Date().toISOString().split('T')[0];
                const isCompleted = h.last_completed === today;
                return (
                  <div 
                    key={h.id} 
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-800/20 border border-slate-800/40 hover:border-slate-800 transition"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <button 
                        onClick={() => handleToggleHabit(h.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                          isCompleted 
                            ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-950/20' 
                            : 'border-slate-700 hover:border-slate-600 text-transparent'
                        }`}
                        id={`dash-habit-check-${h.id}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <span className={`text-xs truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                        {h.name}
                      </span>
                    </div>
                    <div className="flex items-center text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded-full">
                      <Flame className={`w-3 h-3 mr-0.5 ${h.streak > 0 ? 'text-orange-400 fill-orange-500' : 'text-slate-500'}`} />
                      <span>{h.streak}d</span>
                    </div>
                  </div>
                );
              })}
              {filteredHabits.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">{t('noHabits', 'Nenhum hábito cadastrado para hoje.')}</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
      </>
      )}
    </div>
  );
}
