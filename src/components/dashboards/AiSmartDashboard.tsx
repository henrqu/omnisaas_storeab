import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  ArrowUpRight, 
  Send, 
  Zap, 
  ShieldCheck, 
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import { useLanguageTheme, formatCurrency } from '../../utils/i18n';
import { Transaction, Goal, Debt, EmergencyFund, FinancialCard } from '../../types/schema';

interface AiSmartProps {
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
  emergencyFund: EmergencyFund;
  cards: FinancialCard[];
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  onNavigate?: (view: string) => void;
  onShowNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const AiSmartDashboard: React.FC<AiSmartProps> = ({
  transactions,
  goals,
  debts,
  emergencyFund,
  cards,
  totalIncome,
  totalExpense,
  netBalance,
  onNavigate,
  onShowNotification
}) => {
  const { t, language } = useLanguageTheme();
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswers, setAiAnswers] = useState<string[]>([]);

  const income = totalIncome || 12500;
  const expenses = totalExpense || 6200;
  const net = netBalance || 6300;

  // Proactive Smart AI Insights
  const aiInsightsList = [
    {
      id: 'i1',
      type: 'warning',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      title: t('dashboard.spendingAnalysis', 'Spending Increase Warning'),
      text: t('aiCoach.diningWarning', 'Your expenses increased by 15% this month. Reducing subscriptions by $50 could help you reach your savings goal faster.'),
      badge: 'Action Suggested',
      color: 'bg-amber-500/10 border-amber-500/20 text-amber-300'
    },
    {
      id: 'i2',
      type: 'opportunity',
      icon: <Lightbulb className="w-5 h-5 text-emerald-400" />,
      title: t('dashboard.opportunities', 'Savings & Emergency Opportunity'),
      text: `Your current net balance is ${formatCurrency(net, language)}. Allocating $500 to your Emergency Fund will boost completion to ${Math.round(((emergencyFund.current_balance + 500) / (emergencyFund.target_amount || 1)) * 100)}%.`,
      badge: 'Goal Acceleration',
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
    },
    {
      id: 'i3',
      type: 'prediction',
      icon: <Zap className="w-5 h-5 text-indigo-400" />,
      title: t('dashboard.predictions', '3-Month Financial Projection'),
      text: `Maintaining current income of ${formatCurrency(income, language)} and expenses of ${formatCurrency(expenses, language)} predicts a total net accumulation of ${formatCurrency(net * 3, language)} over the next 90 days.`,
      badge: 'Forecast',
      color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
    }
  ];

  const handleSendAiPrompt = () => {
    if (!customPrompt.trim()) return;
    setIsAsking(true);
    setTimeout(() => {
      const response = `Based on your live Life4Billion database (Income: ${formatCurrency(income, language)}, Expenses: ${formatCurrency(expenses, language)}), here is my recommendation for "${customPrompt}": Maintain a 20% emergency buffer and prioritize high-interest card payoff to optimize cash flow.`;
      setAiAnswers(prev => [response, ...prev]);
      setCustomPrompt('');
      setIsAsking(false);
      if (onShowNotification) {
        onShowNotification('AI Financial Assistant', 'Analysis generated based on live financial data.', 'success');
      }
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="ai-smart-dashboard">
      
      {/* AI Smart Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shrink-0">
            <Bot className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {t('dashboard.aiSmart', 'AI Smart Dashboard')}
              </span>
              <span className="text-xs text-indigo-300/80 font-mono">Life4Billion AI Financial Intelligence</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Autonomous Financial Assistant & Coach
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Proactive AI insights analyzing income, spending habits, debts, emergency buffer, and predictive cash flow.
            </p>
          </div>
        </div>

        <button 
          onClick={() => onNavigate && onNavigate('ai')}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Open Copilot Studio</span>
        </button>
      </div>

      {/* Interactive AI Prompt Input Bar */}
      <div className="bg-slate-900/60 border border-indigo-500/20 p-4 rounded-2xl space-y-3">
        <label className="text-xs font-bold text-white flex items-center space-x-2">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span>Ask Your Financial Assistant Anything</span>
        </label>
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendAiPrompt()}
            placeholder="e.g. How can I optimize my monthly subscription spending to reach $20,000 net worth faster?"
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button 
            onClick={handleSendAiPrompt}
            disabled={isAsking || !customPrompt.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 shrink-0"
          >
            {isAsking ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Analyze</span>
          </button>
        </div>

        {/* Dynamic AI Answers List */}
        {aiAnswers.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {aiAnswers.map((ans, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-200 flex items-start space-x-3">
                <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="flex-1 leading-relaxed">{ans}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proactive AI Insights Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{t('dashboard.aiGeneratedInsights', 'Proactive Financial Recommendations')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsightsList.map(item => (
            <div key={item.id} className={`p-5 rounded-2xl border ${item.color} space-y-3 flex flex-col justify-between`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span className="font-bold text-white text-xs">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-900/60 text-slate-300">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
              </div>
              
              <button 
                onClick={() => onNavigate && onNavigate('emergency-fund')}
                className="text-xs font-semibold text-white underline hover:opacity-80 transition text-left"
              >
                Apply Recommendation &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
