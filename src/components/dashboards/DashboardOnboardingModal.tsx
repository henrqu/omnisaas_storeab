import React, { useState } from 'react';
import { 
  Briefcase, 
  Heart, 
  BarChart3, 
  MinusCircle, 
  Sparkles, 
  CheckCircle2, 
  X,
  LayoutDashboard
} from 'lucide-react';
import { useLanguageTheme } from '../../utils/i18n';
import { DashboardType } from '../../types/schema';
import { LocalDatabase } from '../../utils/db';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDashboard: (type: DashboardType) => void;
  currentType?: DashboardType;
}

export const DashboardOnboardingModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSelectDashboard,
  currentType = 'executive'
}) => {
  const { t } = useLanguageTheme();
  const [selected, setSelected] = useState<DashboardType>(currentType);

  if (!isOpen) return null;

  const dashboardOptions: {
    id: DashboardType;
    titleKey: string;
    titleDefault: string;
    desc: string;
    purpose: string;
    icon: React.ReactNode;
    color: string;
    badge: string;
  }[] = [
    {
      id: 'executive',
      titleKey: 'dashboard.executiveOverview',
      titleDefault: 'Executive Overview Dashboard',
      purpose: 'For business owners, executives, and managers.',
      desc: 'Includes Revenue, Net Profit, Cash Flow, Growth Rate, Net Worth, Financial Goals, and Important Alerts.',
      icon: <Briefcase className="w-5 h-5" />,
      color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400',
      badge: 'Executive SaaS'
    },
    {
      id: 'financial_health',
      titleKey: 'dashboard.financialHealth',
      titleDefault: 'Financial Health Dashboard',
      purpose: 'For personal finance users seeking balance.',
      desc: 'Includes Income, Expenses, Savings Rate, Debt Overview, Investments, Spending Categories, and Health Score (0-100).',
      icon: <Heart className="w-5 h-5" />,
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
      badge: 'Personal Health'
    },
    {
      id: 'bi',
      titleKey: 'dashboard.businessIntelligence',
      titleDefault: 'Business Intelligence Dashboard',
      purpose: 'For companies, freelancers, and entrepreneurs.',
      desc: 'Includes Sales Performance, Revenue Trends, Profit Margin, Expenses, Customers, Products, and Simplified P&L Statement.',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
      badge: 'Corporate Analytics'
    },
    {
      id: 'minimal',
      titleKey: 'dashboard.minimal',
      titleDefault: 'Minimal Dashboard',
      purpose: 'For beginners who want simplicity.',
      desc: 'Includes Current Balance, Income, Expenses, Goals, and Upcoming Payments in an ultra-clean layout.',
      icon: <MinusCircle className="w-5 h-5" />,
      color: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
      badge: 'Clutter-Free'
    },
    {
      id: 'ai_smart',
      titleKey: 'dashboard.aiSmart',
      titleDefault: 'AI Smart Dashboard',
      purpose: 'An intelligent financial assistant & coach.',
      desc: 'Includes AI-generated insights, spending analysis, financial recommendations, predictions, warnings, and opportunities.',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
      badge: 'Autonomous AI'
    }
  ];

  const handleSave = () => {
    LocalDatabase.setDashboardType(selected);
    onSelectDashboard(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Life4Billion Preferences</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {t('dashboard.selectExperience', 'Select Your Dashboard Experience')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('dashboard.changePreference', 'You can change your dashboard visualization preferences anytime in Settings.')}
          </p>
        </div>

        {/* 5 Options Grid */}
        <div className="space-y-3">
          {dashboardOptions.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <div 
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start space-x-4 ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' 
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className={`p-3 rounded-xl border shrink-0 ${opt.color}`}>
                  {opt.icon}
                </div>

                <div className="flex-1 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">
                      {t(opt.titleKey, opt.titleDefault)}
                    </h3>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-indigo-300/90 font-medium">{opt.purpose}</p>
                  <p className="text-slate-400">{opt.desc}</p>
                </div>

                <div className="shrink-0 pt-1">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Dashboard Experience</span>
          </button>
        </div>

      </div>
    </div>
  );
};
