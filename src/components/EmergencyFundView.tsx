import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Sparkles, 
  Calculator, 
  Target, 
  DollarSign, 
  AlertTriangle,
  Bot,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLanguageTheme, formatCurrency, formatDate } from '../utils/i18n';
import { LocalDatabase } from '../utils/db';
import { EmergencyFund, Debt, FinancialCard, PaidDebtLog, Transaction } from '../types/schema';
import CardManagementView from './CardManagementView';

interface EmergencyFundViewProps {
  onShowNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const EmergencyFundView: React.FC<EmergencyFundViewProps> = ({
  onShowNotification
}) => {
  const { t, language } = useLanguageTheme();

  // State
  const [fund, setFund] = useState<EmergencyFund>(() => LocalDatabase.getEmergencyFund());
  const [debts, setDebts] = useState<Debt[]>(() => LocalDatabase.getDebts());
  const [cards, setCards] = useState<FinancialCard[]>(() => LocalDatabase.getCards());
  const [paidDebts, setPaidDebts] = useState<PaidDebtLog[]>(() => LocalDatabase.getPaidDebts());
  const [transactions, setTransactions] = useState<Transaction[]>(() => LocalDatabase.getTransactions());

  // UI Tabs
  const [activeTab, setActiveTab] = useState<'fund' | 'debts' | 'cards' | 'history' | 'coach'>('fund');
  const [debtStrategy, setDebtStrategy] = useState<'snowball' | 'avalanche'>('snowball');

  // Modals & Inputs
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  const [isEditFundModalOpen, setIsEditFundModalOpen] = useState(false);
  const [fundTargetInput, setFundTargetInput] = useState(fund.target_amount.toString());
  const [fundDeadlineInput, setFundDeadlineInput] = useState(fund.deadline);
  const [fundPurposeInput, setFundPurposeInput] = useState(fund.purpose);

  // New Debt Form
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);
  const [debtCreditor, setDebtCreditor] = useState('');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtRate, setDebtRate] = useState('');
  const [debtMin, setDebtMin] = useState('');
  const [debtDue, setDebtDue] = useState('2026-08-15');
  const [debtCategory, setDebtCategory] = useState<Debt['category']>('credit_card');

  // New Card Form
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardBank, setCardBank] = useState('');
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');
  const [cardLimit, setCardLimit] = useState('');
  const [cardBalance, setCardBalance] = useState('');
  const [cardDue, setCardDue] = useState('2026-08-20');
  const [cardRate, setCardRate] = useState('18.5');
  const [cardLast4, setCardLast4] = useState('4321');

  // Calculate user income & expenses for formula recommendation
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || 12500;
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) || 6200;
  const monthlySurplus = Math.max(0, totalIncome - totalExpenses);

  // Calculate Emergency Fund completion & monthly recommendation formula
  const fundRemaining = Math.max(0, fund.target_amount - fund.current_balance);
  const fundPct = Math.min(100, Math.round((fund.current_balance / (fund.target_amount || 1)) * 100));

  // Months to deadline calculation
  const deadlineDate = new Date(fund.deadline);
  const now = new Date();
  const monthsRemaining = Math.max(1, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const recommendedMonthlyContribution = Math.round(fundRemaining / monthsRemaining);

  // Debt Calculations
  const activeDebts = debts.filter(d => d.status === 'active');
  const totalDebtBalance = activeDebts.reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);
  const totalMinPayments = activeDebts.reduce((sum, d) => sum + d.minimum_payment, 0);

  // Debt Snowball (smallest balance first) vs Avalanche (highest interest first)
  const sortedDebts = [...activeDebts].sort((a, b) => {
    if (debtStrategy === 'snowball') {
      return (a.total_amount - a.paid_amount) - (b.total_amount - b.paid_amount);
    } else {
      return b.interest_rate - a.interest_rate;
    }
  });

  // Total Card Limit & Utilization
  const creditCards = cards.filter(c => c.type === 'credit');
  const totalCreditLimit = creditCards.reduce((acc, c) => acc + c.limit_amount, 0);
  const totalCreditBalance = creditCards.reduce((acc, c) => acc + c.current_balance, 0);
  const overallUtilizationRate = totalCreditLimit > 0 ? Math.round((totalCreditBalance / totalCreditLimit) * 100) : 0;

  // Actions
  const handleDepositFund = () => {
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) return;
    const newBal = fund.current_balance + val;
    const updated = LocalDatabase.updateEmergencyFund({ current_balance: newBal });
    setFund(updated);
    setDepositAmount('');
    setIsDepositModalOpen(false);
    if (onShowNotification) {
      onShowNotification(
        'Emergency Fund Updated',
        `Successfully added ${formatCurrency(val, language)} to your fund balance.`,
        'success'
      );
    }
  };

  const handleSaveFundTarget = () => {
    const target = parseFloat(fundTargetInput) || fund.target_amount;
    const updated = LocalDatabase.updateEmergencyFund({
      target_amount: target,
      deadline: fundDeadlineInput,
      purpose: fundPurposeInput
    });
    setFund(updated);
    setIsEditFundModalOpen(false);
    if (onShowNotification) {
      onShowNotification('Target Updated', 'Emergency fund target parameters saved.', 'success');
    }
  };

  const handleAddDebt = () => {
    if (!debtCreditor || !debtTotal) return;
    const total = parseFloat(debtTotal);
    LocalDatabase.addDebt({
      creditor: debtCreditor,
      total_amount: total,
      paid_amount: 0,
      interest_rate: parseFloat(debtRate) || 12.0,
      minimum_payment: parseFloat(debtMin) || 100,
      due_date: debtDue,
      category: debtCategory
    });
    setDebts(LocalDatabase.getDebts());
    setDebtCreditor('');
    setDebtTotal('');
    setIsAddDebtOpen(false);
    if (onShowNotification) {
      onShowNotification('Debt Registered', `Added ${debtCreditor} to Debt Center.`, 'success');
    }
  };

  const handlePayOffDebt = (debtId: string) => {
    const updated = LocalDatabase.markDebtPaid(debtId);
    setDebts(updated);
    setPaidDebts(LocalDatabase.getPaidDebts());
    if (onShowNotification) {
      onShowNotification('Congratulations! 🎉', 'You have fully paid off and eliminated this debt!', 'success');
    }
  };

  const handleToggleFreezeCard = (cardId: string) => {
    const updated = LocalDatabase.toggleCardFreeze(cardId);
    setCards(updated);
    const card = updated.find(c => c.id === cardId);
    if (onShowNotification && card) {
      onShowNotification(
        card.is_frozen ? 'Card Frozen' : 'Card Unfrozen',
        `${card.name} status is now ${card.is_frozen ? 'FROZEN' : 'ACTIVE'}.`,
        card.is_frozen ? 'warning' : 'info'
      );
    }
  };

  const handleAddCard = () => {
    if (!cardName || !cardBank || !cardLimit) return;
    const limit = parseFloat(cardLimit);
    const balance = parseFloat(cardBalance) || 0;
    LocalDatabase.addCard({
      name: cardName,
      bank: cardBank,
      type: cardType,
      limit_amount: limit,
      current_balance: balance,
      payment_due_date: cardDue,
      interest_rate: parseFloat(cardRate) || 18.0,
      is_frozen: false,
      last_4: cardLast4 || '8888',
      color: cardType === 'credit' ? 'from-indigo-600 to-blue-800' : 'from-emerald-600 to-teal-800'
    });
    setCards(LocalDatabase.getCards());
    setCardName('');
    setCardBank('');
    setCardLimit('');
    setCardBalance('');
    setIsAddCardOpen(false);
    if (onShowNotification) {
      onShowNotification('Card Added', 'New financial card added to manager.', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="emergency-fund-center-view">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Financial Protection
              </span>
              <span className="text-xs text-slate-400 font-mono">Emergency Reserve & Debt Center</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {t('emergency.fundCenter', 'Emergency Fund Center')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Protect your wealth, eliminate debt with Snowball/Avalanche strategies, and control card limits.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1.5 rounded-2xl shrink-0">
          <button 
            onClick={() => setActiveTab('fund')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'fund' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Emergency Fund
          </button>
          <button 
            onClick={() => setActiveTab('debts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'debts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Debt Center ({activeDebts.length})
          </button>
          <button 
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'cards' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cards ({cards.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paid Debts ({paidDebts.length})
          </button>
          <button 
            onClick={() => setActiveTab('coach')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 ${
              activeTab === 'coach' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-emerald-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Coach</span>
          </button>
        </div>
      </div>

      {/* 1. EMERGENCY FUND TAB */}
      {activeTab === 'fund' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Main Fund Progress Card */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  {t('emergency.currentBalance', 'Current Emergency Reserve')}
                </p>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                  {formatCurrency(fund.current_balance, language)}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Target Goal: <strong className="text-emerald-400">{formatCurrency(fund.target_amount, language)}</strong> ({fundPct}% Completed)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsDepositModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contribution</span>
                </button>
                <button 
                  onClick={() => setIsEditFundModalOpen(true)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs border border-slate-700 transition flex items-center space-x-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Adjust Target</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-700" 
                  style={{ width: `${fundPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>$0</span>
                <span>{fundPct}% Reached</span>
                <span>{formatCurrency(fund.target_amount, language)}</span>
              </div>
            </div>

            {/* Formula Calculation Recommendation Banner */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start space-x-3 text-xs">
              <Calculator className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">
                  Smart Contribution Recommendation
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Based on your income, expenses and goals, you should save{' '}
                  <strong className="text-emerald-300 font-bold">{formatCurrency(recommendedMonthlyContribution, language)} per month</strong>{' '}
                  over the next {monthsRemaining} month(s) to reach your emergency target date of {formatDate(fund.deadline)}.
                </p>
              </div>
            </div>

            {/* Purpose & Target Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Target Purpose</p>
                <p className="text-sm font-bold text-white mt-1 capitalize">
                  {fund.purpose === 'job_loss' ? 'Job Loss Protection' : fund.purpose === 'medical' ? 'Medical Emergency' : fund.purpose}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Estimated Completion Date</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">{formatDate(fund.deadline)}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Remaining to Save</p>
                <p className="text-sm font-bold text-indigo-400 mt-1">{formatCurrency(fundRemaining, language)}</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. DEBT MANAGEMENT CENTER TAB */}
      {activeTab === 'debts' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Debt Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white">{t('debt.managementCenter', 'Debt Management Center')}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Apply Debt Snowball or Debt Avalanche strategies to minimize interest paid.</p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Strategy Selector */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button 
                  onClick={() => setDebtStrategy('snowball')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    debtStrategy === 'snowball' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Smallest debts first for quick momentum"
                >
                  Snowball
                </button>
                <button 
                  onClick={() => setDebtStrategy('avalanche')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    debtStrategy === 'avalanche' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Highest interest rate first to save maximum money"
                >
                  Avalanche
                </button>
              </div>

              <button 
                onClick={() => setIsAddDebtOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Debt</span>
              </button>
            </div>
          </div>

          {/* Debt Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
              <p className="text-xs uppercase font-semibold text-slate-400">Total Active Debt</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(totalDebtBalance, language)}</h3>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
              <p className="text-xs uppercase font-semibold text-slate-400">Monthly Minimum Payments</p>
              <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(totalMinPayments, language)}</h3>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
              <p className="text-xs uppercase font-semibold text-slate-400">Estimated Debt-Free Date</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                {activeDebts.length === 0 ? 'Debt Free!' : 'Oct 2027'}
              </h3>
            </div>
          </div>

          {/* Strategy Strategy Description */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300">
            <span className="font-bold text-white">
              Active Strategy: {debtStrategy === 'snowball' ? 'Debt Snowball Method' : 'Debt Avalanche Method'}
            </span>
            <p className="mt-0.5 text-slate-400">
              {debtStrategy === 'snowball' 
                ? 'Targeting smallest balance debts first to build psychological momentum and reduce the number of creditors.'
                : 'Targeting highest annual interest rate debts first to mathematically minimize total interest expenses over time.'}
            </p>
          </div>

          {/* Debts Table */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold bg-slate-950/40">
                  <th className="py-3 px-4">Creditor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Remaining Balance</th>
                  <th className="py-3 px-4">Interest Rate</th>
                  <th className="py-3 px-4">Min. Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedDebts.map((d, index) => {
                  const rem = d.total_amount - d.paid_amount;
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-semibold text-white flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                          #{index + 1}
                        </span>
                        <span>{d.creditor}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 uppercase text-[10px]">{d.category.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 font-bold text-rose-400">{formatCurrency(rem, language)}</td>
                      <td className="py-3.5 px-4 font-semibold text-amber-400">{d.interest_rate}% APR</td>
                      <td className="py-3.5 px-4 text-slate-300">{formatCurrency(d.minimum_payment, language)}/mo</td>
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          onClick={() => handlePayOffDebt(d.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-md shadow-emerald-600/20"
                        >
                          Mark Fully Paid
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 3. CARD MANAGEMENT TAB */}
      {activeTab === 'cards' && (
        <CardManagementView onShowNotification={onShowNotification} />
      )}

      {/* 4. PAID DEBTS HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{t('debt.paidHistory', 'Financial Accomplishments & Paid Debts')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Celebrate your debt elimination milestones and interest saved over time.</p>
          </div>

          <div className="space-y-3">
            {paidDebts.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Congratulations! You eliminated your {formatCurrency(item.total_paid, language)} {item.creditor} debt.
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Completed on {formatDate(item.date_completed)}. You saved approximately <strong className="text-emerald-300">{formatCurrency(item.interest_saved, language)}</strong> in interest fees.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-center shrink-0">
                  Paid In Full
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. AI FINANCIAL COACH WIDGET TAB */}
      {activeTab === 'coach' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shrink-0">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Your Personal AI Financial Coach</h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Automated financial intelligence analyzing relationships between Budget &rarr; Expenses &rarr; Emergency Reserve &rarr; Debt Payoff &rarr; Net Worth.
                </p>
              </div>
            </div>

            <div className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold rounded-xl shrink-0">
              SaaS-Wide Context Active
            </div>
          </div>

          {/* Coach Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Daily Insight */}
            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Daily Financial Insight
              </span>
              <h4 className="font-bold text-white text-sm">Emergency Reserve Acceleration</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your dining expenses increased 35% this month. Reallocating $120 from dining out into your Emergency Reserve will accelerate your target completion by 18 days.
              </p>
            </div>

            {/* Card 2: Weekly Review */}
            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Weekly Review
              </span>
              <h4 className="font-bold text-white text-sm">Debt Payoff Milestone</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Applying the Debt Snowball strategy to your smallest card balance will eliminate card debt within 4 months, unlocking $150/mo additional cash flow.
              </p>
            </div>

            {/* Card 3: Monthly Report */}
            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Monthly Report
              </span>
              <h4 className="font-bold text-white text-sm">Overall Protection Score: 88/100</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your emergency fund is 50% completed and overall credit card utilization remains healthy at {overallUtilizationRate}%. You are on track for financial freedom.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* MODAL: ADD CONTRIBUTION */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Emergency Fund Contribution</h3>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Contribution Amount ($)</label>
              <input 
                type="number" 
                value={depositAmount} 
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="500.00" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setIsDepositModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleDepositFund} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs">Confirm Contribution</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FUND TARGET */}
      {isEditFundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Adjust Emergency Target Parameters</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Amount ($)</label>
                <input 
                  type="number" 
                  value={fundTargetInput} 
                  onChange={e => setFundTargetInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Deadline</label>
                <input 
                  type="date" 
                  value={fundDeadlineInput} 
                  onChange={e => setFundDeadlineInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Primary Purpose</label>
                <select 
                  value={fundPurposeInput} 
                  onChange={e => setFundPurposeInput(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                >
                  <option value="job_loss">Job Loss Protection</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="family">Family Security</option>
                  <option value="unexpected">Unexpected Expenses</option>
                  <option value="custom">Custom Goal</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setIsEditFundModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveFundTarget} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs">Save Target</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD DEBT */}
      {isAddDebtOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Debt Obligation</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Creditor Name</label>
                <input 
                  type="text" 
                  value={debtCreditor} 
                  onChange={e => setDebtCreditor(e.target.value)}
                  placeholder="e.g. Platinum Credit Card"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Total Amount ($)</label>
                  <input 
                    type="number" 
                    value={debtTotal} 
                    onChange={e => setDebtTotal(e.target.value)}
                    placeholder="3000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Interest Rate (% APR)</label>
                  <input 
                    type="number" 
                    value={debtRate} 
                    onChange={e => setDebtRate(e.target.value)}
                    placeholder="18.9"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Minimum Payment ($)</label>
                  <input 
                    type="number" 
                    value={debtMin} 
                    onChange={e => setDebtMin(e.target.value)}
                    placeholder="150"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={debtDue} 
                    onChange={e => setDebtDue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setIsAddDebtOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleAddDebt} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs">Add Debt</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CARD */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add New Card</h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Card Name</label>
                  <input 
                    type="text" 
                    value={cardName} 
                    onChange={e => setCardName(e.target.value)}
                    placeholder="e.g. Sapphire Preferred"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Bank / Issuer</label>
                  <input 
                    type="text" 
                    value={cardBank} 
                    onChange={e => setCardBank(e.target.value)}
                    placeholder="Chase"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Credit Limit ($)</label>
                  <input 
                    type="number" 
                    value={cardLimit} 
                    onChange={e => setCardLimit(e.target.value)}
                    placeholder="10000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Current Balance ($)</label>
                  <input 
                    type="number" 
                    value={cardBalance} 
                    onChange={e => setCardBalance(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setIsAddCardOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleAddCard} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs">Save Card</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
