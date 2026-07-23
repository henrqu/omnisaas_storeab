import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Sliders 
} from 'lucide-react';
import { LocalDatabase } from '../utils/db';
import { Transaction, Goal, Habit, Inventory, Employee, Product, DashboardType, Debt, EmergencyFund, FinancialCard, Customer, Sale, Company } from '../types/schema';
import { useLanguageTheme } from '../utils/i18n';
import { ExecutiveOverviewDashboard } from './dashboards/ExecutiveOverviewDashboard';
import { FinancialHealthDashboard } from './dashboards/FinancialHealthDashboard';
import { BusinessIntelligenceDashboard } from './dashboards/BusinessIntelligenceDashboard';
import { MinimalDashboard } from './dashboards/MinimalDashboard';
import { AiSmartDashboard } from './dashboards/AiSmartDashboard';
import { DashboardOnboardingModal } from './dashboards/DashboardOnboardingModal';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onShowNotification: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export default function DashboardView({ onNavigate, onShowNotification }: DashboardViewProps) {
  const { t } = useLanguageTheme();
  const [dashboardType, setDashboardType] = useState<DashboardType>(() => LocalDatabase.getDashboardType());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund>(() => LocalDatabase.getEmergencyFund());
  const [cards, setCards] = useState<FinancialCard[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    LocalDatabase.init();
    setTransactions(LocalDatabase.getTransactions());
    setGoals(LocalDatabase.getGoals());
    setHabits(LocalDatabase.getHabits());
    setInventory(LocalDatabase.getInventory());
    setEmployees(LocalDatabase.getEmployees());
    setProducts(LocalDatabase.getProducts());
    setDebts(LocalDatabase.getDebts());
    setCards(LocalDatabase.getCards());
    setCustomers(LocalDatabase.getCustomers());
    setSales(LocalDatabase.getSales());
    setCompanies(LocalDatabase.getCompanies());
    setEmergencyFund(LocalDatabase.getEmergencyFund());
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handleSelectDashboard = (type: DashboardType) => {
    setDashboardType(type);
    LocalDatabase.setDashboardType(type);
    onShowNotification(
      'Dashboard Preference Saved',
      `Switched to ${type.replace('_', ' ').toUpperCase()} dashboard view.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Dashboard Type Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl shadow-md">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">Active View:</span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {dashboardType === 'executive' && 'Executive Overview'}
            {dashboardType === 'financial_health' && 'Financial Health'}
            {dashboardType === 'bi' && 'Business Intelligence'}
            {dashboardType === 'minimal' && 'Minimal'}
            {dashboardType === 'ai_smart' && 'AI Smart'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/20 flex items-center space-x-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t('dashboard.switchExperience', 'Switch Experience')}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Active Dashboard View */}
      {dashboardType === 'executive' && (
        <ExecutiveOverviewDashboard 
          transactions={transactions}
          goals={goals}
          debts={debts}
          netBalance={netBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          onNavigate={onNavigate}
        />
      )}

      {dashboardType === 'financial_health' && (
        <FinancialHealthDashboard 
          transactions={transactions}
          debts={debts}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netBalance={netBalance}
          onNavigate={onNavigate}
        />
      )}

      {dashboardType === 'bi' && (
        <BusinessIntelligenceDashboard 
          companies={companies}
          employees={employees}
          products={products}
          customers={customers}
          sales={sales}
          transactions={transactions}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netBalance={netBalance}
          onNavigate={onNavigate}
        />
      )}

      {dashboardType === 'minimal' && (
        <MinimalDashboard 
          netBalance={netBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          goals={goals}
          transactions={transactions}
          onNavigate={onNavigate}
        />
      )}

      {dashboardType === 'ai_smart' && (
        <AiSmartDashboard 
          transactions={transactions}
          goals={goals}
          debts={debts}
          emergencyFund={emergencyFund}
          cards={cards}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netBalance={netBalance}
          onNavigate={onNavigate}
          onShowNotification={onShowNotification}
        />
      )}

      {/* Onboarding / Experience Modal */}
      <DashboardOnboardingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectDashboard={handleSelectDashboard}
        currentType={dashboardType}
      />

    </div>
  );
}
