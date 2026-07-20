/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Coins, 
  Flame, 
  Heart, 
  Users, 
  Building, 
  ShoppingCart, 
  Sparkles, 
  User, 
  Bell, 
  Menu, 
  X, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  ChevronRight,
  Info
} from 'lucide-react';
import { LocalDatabase } from './utils/db';
import { Notification, Profile } from './types/schema';
import { LanguageThemeContext, translations, Language, Theme, formatCurrency, Currency, normalizeLanguage, detectDefaultCurrency } from './utils/i18n';
import { Globe, Palette, Settings, Download, Printer, Edit, BookOpen, Database, Cloud, RefreshCw, AlertTriangle, Check, Copy, Sun, Moon } from 'lucide-react';

// Import our modular child views
import DashboardView from './components/DashboardView';
import FinanceView from './components/FinanceView';
import HabitsGoalsView from './components/HabitsGoalsView';
import HealthMealsView from './components/HealthMealsView';
import FamilyView from './components/FamilyView';
import CompanyPayrollView from './components/CompanyPayrollView';
import CrmSalesView from './components/CrmSalesView';
import AiCopilotView from './components/AiCopilotView';
import SubscriptionProfileView from './components/SubscriptionProfileView';
import ProductivityView from './components/ProductivityView';
import NetWorthView from './components/NetWorthView';
import CalculatorsView from './components/CalculatorsView';
import LearningHubView from './components/LearningHubView';
import LoginView from './components/LoginView';
import OmniSaaSLogo from './components/OmniSaaSLogo';
import SplashScreen from './components/SplashScreen';
import { Briefcase, Calculator } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

export default function App() {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('omnisaas_language');
    if (saved) return normalizeLanguage(saved);
    return normalizeLanguage(navigator.language);
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('omnisaas_currency');
    if (saved) return saved as Currency;
    return detectDefaultCurrency();
  });

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('omnisaas_currency', curr);
  };

  const setLanguage = (lang: Language) => {
    const normalized = normalizeLanguage(lang);
    setLanguageState(normalized);
    localStorage.setItem('omnisaas_language', normalized);
    // Auto align currency to the selected language if no currency was explicitly saved yet
    if (!localStorage.getItem('omnisaas_currency')) {
      const defaultCurr = normalized === 'pt-BR' ? 'BRL' : normalized === 'es' ? 'EUR' : 'USD';
      setCurrency(defaultCurr);
    }
  };
  const [theme, setTheme] = useState<Theme>('dark');
  const [isLeftProfileOpen, setIsLeftProfileOpen] = useState<boolean>(false);
  const [isRightProfileOpen, setIsRightProfileOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('omnisaas_logged_in') === 'true';
  });

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('omnisaas_splash_shown') !== 'true';
    } catch (e) {
      return true;
    }
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('omnisaas_splash_shown', 'true');
    } catch (e) {
      // Ignore
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const loggedInEmail = localStorage.getItem('omnisaas_logged_in_email') || profile?.email || '';
  const isOwner = loggedInEmail.trim().toLowerCase() === 'lacasaking.agency@gmail.com';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [currentTime, setCurrentTime] = useState<string>('');

  // Supabase states
  const [supabaseStatus, setSupabaseStatus] = useState<{
    success: boolean;
    configured: boolean;
    connected: boolean;
    tablesExist: boolean;
    message: string;
    sql?: string;
    url?: string;
  } | null>(null);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(() => {
    return localStorage.getItem('omnisaas_supabase_url') || '';
  });
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState<string>(() => {
    return localStorage.getItem('omnisaas_supabase_anon_key') || '';
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [showSupabaseSql, setShowSupabaseSql] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const getSupabaseHeaders = () => {
    const url = localStorage.getItem('omnisaas_supabase_url') || '';
    const key = localStorage.getItem('omnisaas_supabase_anon_key') || '';
    const headers: Record<string, string> = {};
    if (url) headers['x-supabase-url'] = url;
    if (key) headers['x-supabase-anon-key'] = key;
    return headers;
  };

  const [isCheckingSupabase, setIsCheckingSupabase] = useState<boolean>(false);

  // Accent color state with dynamic synchronization
  const [accent, setAccentState] = useState<string>(() => {
    return localStorage.getItem('omnisaas_accent') || 'blue';
  });

  const setAccent = (color: string) => {
    setAccentState(color);
    localStorage.setItem('omnisaas_accent', color);
    document.documentElement.setAttribute('data-accent', color);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
  }, [accent]);

  const handleSaveSupabaseCredentials = async () => {
    const trimmedUrl = supabaseUrlInput.trim();
    const trimmedKey = supabaseAnonKeyInput.trim();
    localStorage.setItem('omnisaas_supabase_url', trimmedUrl);
    localStorage.setItem('omnisaas_supabase_anon_key', trimmedKey);
    
    handleShowNotification(
      language.startsWith('pt') ? 'Salvando Credenciais' : 'Saving Credentials',
      language.startsWith('pt') ? 'Testando conexão com o Supabase...' : 'Testing connection to Supabase...',
      'info'
    );
    
    await fetchSupabaseStatus();
  };

  const fetchSupabaseStatus = async () => {
    setIsCheckingSupabase(true);
    try {
      const res = await fetch('/api/supabase/status', {
        headers: getSupabaseHeaders()
      });
      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        setSupabaseStatus({
          success: false,
          configured: true,
          connected: false,
          tablesExist: false,
          message: language.startsWith('pt') 
            ? 'Servidor de APIs retornou um erro ou formato inválido.' 
            : 'API server returned an error or invalid format.'
        });
        return;
      }
      const data = await res.json();
      setSupabaseStatus(data);
      
      if (data.connected) {
        handleShowNotification(
          language.startsWith('pt') ? 'Supabase Conectado' : 'Supabase Connected',
          data.message,
          'success'
        );
      } else if (data.configured) {
        handleShowNotification(
          language.startsWith('pt') ? 'Falha na Conexão' : 'Connection Failed',
          data.message,
          'warning'
        );
      }
    } catch (err: any) {
      console.error('Error fetching Supabase status:', err);
      setSupabaseStatus({
        success: false,
        configured: true,
        connected: false,
        tablesExist: false,
        message: err.message || String(err)
      });
      handleShowNotification(
        language.startsWith('pt') ? 'Erro de Conexão' : 'Connection Error',
        err.message || String(err),
        'warning'
      );
    } finally {
      setIsCheckingSupabase(false);
    }
  };

  useEffect(() => {
    if (isSettingsOpen) {
      fetchSupabaseStatus();
    }
  }, [isSettingsOpen]);

  const handleSupabasePush = async () => {
    setIsSyncing(true);
    try {
      // Gather all local storage keys to synchronize
      const keys = [
        'profile', 'subscription', 'habits', 'goals', 'health_records',
        'pregnancy_records', 'meals', 'family_members', 'transactions',
        'budgets', 'companies', 'employees', 'payroll', 'products',
        'inventory', 'customers', 'sales', 'reports', 'ai_history',
        'notifications'
      ];
      
      const payload: Record<string, any> = {};
      for (const key of keys) {
        const stored = localStorage.getItem(`omnisaas_${key}`);
        if (stored) {
          payload[key] = JSON.parse(stored);
        }
      }

      const response = await fetch('/api/supabase/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getSupabaseHeaders()
        },
        body: JSON.stringify({ data: payload })
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('O servidor de APIs não respondeu com dados JSON válidos. Certifique-se de que as rotas backend estão ativas no seu deploy.');
      }

      const resData = await response.json();
      if (resData.success) {
        handleShowNotification(
          t('successLabel', 'Sucesso'),
          t('supabaseSyncSuccess', 'Dados sincronizados com o Supabase!'),
          'success'
        );
        fetchSupabaseStatus();
      } else {
        handleShowNotification(
          'Erro de Sincronização',
          resData.error || 'Erro desconhecido ao enviar dados.',
          'warning'
        );
        if (resData.needsInitialization) {
          setSupabaseStatus(prev => prev ? { ...prev, tablesExist: false, sql: resData.sql } : null);
        }
      }
    } catch (err: any) {
      handleShowNotification(
        'Erro de Rede',
        err.message || 'Não foi possível conectar ao servidor.',
        'warning'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSupabasePull = async () => {
    setIsPulling(true);
    try {
      const response = await fetch('/api/supabase/pull', {
        headers: getSupabaseHeaders()
      });
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('O servidor de APIs não respondeu com dados JSON válidos. Certifique-se de que as rotas backend estão ativas no seu deploy.');
      }
      const resData = await response.json();
      if (resData.success && resData.data) {
        // Save back to localStorage
        for (const [key, val] of Object.entries(resData.data)) {
          localStorage.setItem(`omnisaas_${key}`, JSON.stringify(val));
        }
        // Force refresh state for standard items
        setProfile(LocalDatabase.getProfile());
        setNotifications(LocalDatabase.getNotifications());
        
        handleShowNotification(
          t('successLabel', 'Sucesso'),
          t('supabasePullSuccess', 'Estado restaurado com sucesso!'),
          'success'
        );
        
        // Force component views updating
        const prevView = activeView;
        setActiveView('dashboard');
        setTimeout(() => setActiveView(prevView), 10);
        
        fetchSupabaseStatus();
      } else {
        handleShowNotification(
          'Erro no Download',
          resData.error || 'Nenhum dado encontrado no servidor.',
          'warning'
        );
      }
    } catch (err: any) {
      handleShowNotification(
        'Erro de Rede',
        err.message || 'Não foi possível conectar ao servidor.',
        'warning'
      );
    } finally {
      setIsPulling(false);
    }
  };

  useEffect(() => {
    // Check for direct URL paths like /admin or /learning-hub on mount
    const initialPath = window.location.pathname.replace('/', '');
    if (initialPath === 'admin') {
      setActiveView('admin');
    } else if (initialPath === 'learning-hub') {
      setActiveView('learning-hub');
    }

    // Initialize standard state values
    setProfile(LocalDatabase.getProfile());
    setNotifications(LocalDatabase.getNotifications());

    // Check for Stripe redirect query params
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const paymentLang = params.get('lang');
    if (paymentStatus === 'success') {
      localStorage.setItem('omnisaas_stripe_paid', 'true');
      localStorage.setItem('omnisaas_stripe_actually_paid', 'true');
      if (paymentLang) {
        setLanguage(paymentLang as Language);
      }
      setTimeout(() => {
        handleShowNotification(
          t('successLabel', 'Sucesso'),
          t('stripePaidSuccessToast', 'Pagamento de licença verificado com sucesso pelo Stripe! Crie sua conta.'),
          'success'
        );
      }, 500);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancel') {
      setTimeout(() => {
        handleShowNotification(
          'Checkout Cancelado',
          'A ativação do seu espaço de trabalho pelo Stripe foi cancelada.',
          'info'
        );
      }, 500);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Start a real-time clock update (UTC / Local)
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Shared notification dispatcher
  const handleShowNotification = (title: string, message: string, type: 'success' | 'warning' | 'info') => {
    // 1. Add notification to central DB log (persists)
    const newNotif = LocalDatabase.addNotification(title, message, type);
    setNotifications(LocalDatabase.getNotifications());

    // 2. Spawn a transient visual Toast alert (slides out after 4 seconds)
    const toastId = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id: toastId, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4500);
  };

  const handleMarkNotifRead = (id: string) => {
    const updated = LocalDatabase.markNotificationRead(id);
    setNotifications(updated);
  };

  const handleMarkAllNotifsRead = () => {
    const updated = LocalDatabase.markAllNotificationsRead();
    setNotifications(updated);
    handleShowNotification(t('successLabel', 'Sucesso'), t('allNotifsRead', 'Todas as notificações foram lidas.'), 'info');
  };

  const handleClearNotifHistory = () => {
    const updated = LocalDatabase.clearAllNotifications();
    setNotifications(updated);
    handleShowNotification(t('alertsCleared', 'Central Limpa'), t('alertsReset', 'Histórico de alertas foi redefinido.'), 'info');
  };

  const t = (key: string, fallback?: string): string => {
    const normLang = language.toLowerCase().startsWith('pt') ? 'pt' : language.toLowerCase().startsWith('es') ? 'es' : 'en';
    const entry = translations[key];
    if (!entry) return fallback || key;
    return entry[normLang] || fallback || key;
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('light-theme', next === 'light');
      return next;
    });
  };

  // Nav Items definition for visual sidebars
  const navItems = [
    { id: 'dashboard', label: t('dashboard', 'Painel Executivo'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'finance', label: t('finance', 'Finanças & Orçamentos'), icon: <Coins className="w-4 h-4" /> },
    { id: 'net-worth', label: t('netWorth', 'Net Worth'), icon: <Briefcase className="w-4 h-4 text-indigo-400" /> },
    { id: 'calculators', label: t('calculators', 'Calculadoras 📊'), icon: <Calculator className="w-4 h-4 text-emerald-450" /> },
    { id: 'productivity', label: t('productivity', 'Estudos & Pomodoro'), icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
    { id: 'habits', label: t('habits', 'Hábitos & Metas'), icon: <Flame className="w-4 h-4" /> },
    { id: 'health', label: t('health', 'Sinais Vitais & Dieta'), icon: <Heart className="w-4 h-4" /> },
    { id: 'family', label: t('family', 'Gestão Familiar'), icon: <Users className="w-4 h-4" /> },
    { id: 'company', label: t('company', 'Empresa & Folha CLT'), icon: <Building className="w-4 h-4" /> },
    { id: 'crm', label: t('crm', 'Vendas & CRM'), icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'ai', label: t('ai', 'Copiloto Vesta AI'), icon: <Sparkles className="w-4 h-4 text-emerald-400" /> },
    { id: 'learning-hub', label: t('learningHub', 'Learning Hub 📚'), icon: <BookOpen className="w-4 h-4 text-amber-400" /> },
    { id: 'profile', label: t('profile', 'Assinatura & Perfil'), icon: <User className="w-4 h-4" /> },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveView} onShowNotification={handleShowNotification} />;
      case 'finance':
        return <FinanceView onShowNotification={handleShowNotification} />;
      case 'net-worth':
        return <NetWorthView onShowNotification={handleShowNotification} />;
      case 'calculators':
        return <CalculatorsView onShowNotification={handleShowNotification} />;
      case 'productivity':
        return <ProductivityView onShowNotification={handleShowNotification} />;
      case 'habits':
        return <HabitsGoalsView onShowNotification={handleShowNotification} />;
      case 'health':
        return <HealthMealsView onShowNotification={handleShowNotification} />;
      case 'family':
        return <FamilyView onShowNotification={handleShowNotification} />;
      case 'company':
        return <CompanyPayrollView onShowNotification={handleShowNotification} />;
      case 'crm':
        return <CrmSalesView onShowNotification={handleShowNotification} />;
      case 'ai':
        return <AiCopilotView onShowNotification={handleShowNotification} />;
      case 'learning-hub':
        return <LearningHubView onShowNotification={handleShowNotification} />;
      case 'admin':
        return <LearningHubView onShowNotification={handleShowNotification} isAdminView={true} />;
      case 'profile':
        return <SubscriptionProfileView onShowNotification={handleShowNotification} />;
      default:
        return <DashboardView onNavigate={setActiveView} onShowNotification={handleShowNotification} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isLoggedIn) {
    return (
      <LanguageThemeContext.Provider value={{ language, setLanguage, currency, setCurrency, theme, setTheme, toggleTheme, t }}>
        <AnimatePresence mode="wait">
          {showSplash && (
            <SplashScreen key="splash" onComplete={handleSplashComplete} />
          )}
        </AnimatePresence>
        <LoginView 
          onLogin={(email, provider, fullName, phone) => {
            setIsLoggedIn(true);
            localStorage.setItem('omnisaas_logged_in', 'true');
            localStorage.setItem('omnisaas_logged_in_email', email.trim().toLowerCase());
            // update profile locally
            const currentProfile = LocalDatabase.getProfile();
            const isAdmin = email.trim().toLowerCase() === 'kaluvih@gmail.com';
            LocalDatabase.updateProfile({
              username: email.split('@')[0],
              full_name: fullName || currentProfile.full_name || (isAdmin ? 'Kalu Vih' : 'Lucas King'),
              phone: phone || currentProfile.phone || '',
              role: isAdmin ? 'admin' : 'owner'
            });
            setProfile(LocalDatabase.getProfile());
          }} 
          onShowNotification={handleShowNotification} 
        />
        {/* TOAST NOTIFICATION STACK POPUP */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full px-4 md:px-0" id="toasts-popup-stack-login">
          {toasts.map((t) => (
            <div 
              key={t.id} 
              className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start space-x-3 transition-all duration-300 transform translate-y-0 animate-fade-in bg-[#111112] ${
                t.type === 'success' ? 'border-emerald-900/80 text-emerald-300' : 
                t.type === 'warning' ? 'border-amber-900/80 text-amber-300' : 
                'border-slate-850 text-slate-200'
              }`}
            >
              <div className="flex-1 text-xs">
                <p className="font-bold text-white">{t.title}</p>
                <p className="text-slate-450 mt-1 leading-normal">{t.message}</p>
              </div>
            </div>
          ))}
        </div>
      </LanguageThemeContext.Provider>
    );
  }

  return (
    <LanguageThemeContext.Provider value={{ language, setLanguage, currency, setCurrency, theme, setTheme, toggleTheme, t }}>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>
      <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col md:flex-row font-sans" id="omnisaas-root-layout">
        
        {/* SIDEBAR ESQUERDA (Desktop Navigation) */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0" id="desktop-sidebar">
          {/* Brand Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div 
              onClick={() => setActiveView('dashboard')} 
              className="cursor-pointer hover:opacity-80 transition"
              title={t('dashboard', 'Painel Executivo')}
            >
              <OmniSaaSLogo size="sm" />
            </div>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
              v2.4
            </span>
          </div>

          {/* Navigation List */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" id="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  const targetPath = item.id === 'dashboard' ? '/' : `/${item.id}`;
                  if (window.location.pathname !== targetPath) {
                    window.history.pushState({}, '', targetPath);
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                  activeView === item.id 
                    ? 'bg-white/5 text-white border border-white/5' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                id={`nav-link-${item.id}`}
              >
                <div className="flex items-center space-x-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {activeView === item.id && <ChevronRight className="w-3.5 h-3.5 stroke-[3.5] text-emerald-400" />}
              </button>
            ))}
          </nav>

          {/* Footer info (RLS verified status) */}
          <div className="p-4 border-t border-white/5 bg-slate-950 space-y-3 relative">
            
            {/* Left Profile dropdown menu popup */}
            {isLeftProfileOpen && (
              <div className="absolute bottom-16 left-4 right-4 bg-slate-900 border border-white/10 rounded-xl p-2 shadow-2xl z-40 space-y-1 text-xs">
                <button 
                  onClick={() => {
                    setActiveView('profile');
                    setIsLeftProfileOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-white/5 rounded-lg text-slate-200 hover:text-white"
                >
                  <Edit className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('editProfile', 'Editar Perfil')}</span>
                </button>
                <button 
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsLeftProfileOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-white/5 rounded-lg text-slate-200 hover:text-white"
                >
                  <Settings className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('settings', 'Definições')}</span>
                </button>
                <div className="border-t border-white/5 my-1" />
                <button 
                  onClick={() => {
                    setIsLeftProfileOpen(false);
                    setIsLoggedIn(false);
                    localStorage.setItem('omnisaas_logged_in', 'false');
                    localStorage.removeItem('omnisaas_logged_in_email');
                    handleShowNotification(t('logout', 'Fazer Logout'), t('logoutSuccess', 'Logout realizado com sucesso.'), 'info');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-rose-500/10 text-rose-400 rounded-lg"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t('logout', 'Fazer Logout')}</span>
                </button>
              </div>
            )}

            <div 
              onClick={() => setIsLeftProfileOpen(!isLeftProfileOpen)}
              className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-center space-x-2 cursor-pointer hover:bg-emerald-500/10 transition"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs text-white font-medium shrink-0">
                {profile?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'JD'}
              </div>
              <div className="truncate flex-1">
                <span className="text-xs block font-medium text-white truncate">{profile?.full_name || t('defaultUser', 'Usuário Omni')}</span>
                <span className="text-[10px] text-emerald-400/85 uppercase tracking-wider font-semibold block mt-0.5">{t('proPlan', 'Plano Pro')}</span>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-500" />
            </div>
            
            <div className="flex items-center justify-center space-x-1 text-[9px] text-slate-500">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>{t('secureSandbox', 'Banco Sandbox Seguro')}</span>
            </div>
          </div>
        </aside>

        {/* MOBILE HEADER (Navigation) */}
        <header className="md:hidden bg-slate-900 border-b border-white/5 px-4 py-3 flex justify-between items-center sticky top-0 z-40" id="mobile-header">
          <div 
            onClick={() => {
              setActiveView('dashboard');
              setIsMobileMenuOpen(false);
            }} 
            className="cursor-pointer hover:opacity-80 transition"
            title={t('dashboard', 'Painel Executivo')}
          >
            <OmniSaaSLogo size="sm" />
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5 border border-white/5"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>

            {/* Notifications Bell */}
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg relative bg-white/5 border border-white/5"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />}
            </button>

            {/* Burger Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5 border border-white/5"
              id="mobile-menu-toggle-btn"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* MOBILE MENU DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[53px] max-h-[calc(100vh-53px)] overflow-y-auto bg-slate-900/95 backdrop-blur border-b border-slate-800 z-30 flex flex-col p-4 space-y-1 shadow-2xl" id="mobile-menu-dropdown">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold ${
                  activeView === item.id ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{ minHeight: '44px' }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-white/10 my-2 pt-2" />
            
            {/* Mobile Profile & Quick Settings Panel */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-3">
              {/* User Avatar & Name */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center space-x-2.5">
                  <img 
                    src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30"
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{profile?.full_name || 'Usuário'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{profile?.email || 'user@omnisaas.com'}</p>
                  </div>
                </div>
                
                {/* Theme Switcher Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/15 text-slate-400 hover:text-white transition flex items-center justify-center"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                  title="Alterar Tema"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  )}
                </button>
              </div>

              {/* Language Selector for Mobile */}
              <div className="space-y-1.5">
                <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  <span>{t('languageLabel', 'Idioma')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'pt-BR', name: 'Português', sub: 'BR' },
                    { code: 'en-US', name: 'English', sub: 'US' },
                    { code: 'es', name: 'Español', sub: 'ES' }
                  ].map(langOption => {
                    const isSelected = language === langOption.code || (langOption.code === 'pt-BR' && language === 'pt') || (langOption.code === 'en-US' && language === 'en');
                    return (
                      <button
                        key={langOption.code}
                        onClick={() => {
                          const code = langOption.code as Language;
                          setLanguage(code);
                          const alignedCurrency = code.startsWith('pt') ? 'BRL' : code.startsWith('es') ? 'EUR' : 'USD';
                          setCurrency(alignedCurrency as Currency);
                        }}
                        className={`py-2 rounded-lg text-xs font-bold border transition flex flex-col items-center justify-center ${
                          isSelected 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-extrabold' 
                            : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-300'
                        }`}
                        style={{ minHeight: '44px' }}
                      >
                        <span className="text-[10px]">{langOption.name}</span>
                        <span className="text-[8px] opacity-60 font-mono mt-0.5">{langOption.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile & Logout Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setActiveView('profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5 rounded-lg text-xs font-semibold"
                  style={{ minHeight: '44px' }}
                >
                  <User className="w-4 h-4 text-emerald-450" />
                  <span>{t('profile', 'Perfil')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLoggedIn(false);
                    localStorage.setItem('omnisaas_logged_in', 'false');
                    localStorage.removeItem('omnisaas_logged_in_email');
                    handleShowNotification(t('logout', 'Fazer Logout'), t('logoutSuccess', 'Logout realizado com sucesso.'), 'info');
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/15 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold"
                  style={{ minHeight: '44px' }}
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>{t('logout', 'Sair')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL (Main Working Workspace) */}
        <main className="flex-1 flex flex-col overflow-x-hidden min-h-0 bg-slate-950" id="main-content-flow">
          
          {/* TOP BAR / UTILITIES HEADER (Desktop only) */}
          <header className="hidden md:flex h-16 justify-between items-center px-8 bg-slate-950 border-b border-slate-800 sticky top-0 z-20 backdrop-blur" id="desktop-topbar">
            <div className="flex items-center space-x-1.5 text-slate-550 text-xs">
              <span>{t('workspaceView', 'Visão de Workspace')}</span>
              <ChevronRight className="w-3 h-3 text-slate-700" />
              <span className="text-white font-medium capitalize bg-white/5 border border-white/5 px-2.5 py-0.5 rounded">
                {navItems.find(i => i.id === activeView)?.label || 'Workspace'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              
              {/* Quick Language, Currency & Theme Switcher (User Intent: "coloque esta parte no topo, do saas, ao lado da hora") */}
              <div className="flex items-center space-x-2.5 bg-slate-900 border border-white/5 px-2.5 py-1 rounded-lg">
                {/* Language Switcher */}
                <div className="flex items-center space-x-1 border-r border-white/10 pr-2.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  {[
                    { code: 'pt-BR', sub: 'BR' },
                    { code: 'en-US', sub: 'US' },
                    { code: 'es', sub: 'ES' }
                  ].map(langOption => {
                    const isSelected = language === langOption.code || (langOption.code === 'pt-BR' && language === 'pt') || (langOption.code === 'en-US' && language === 'en');
                    return (
                      <button
                        key={langOption.code}
                        onClick={() => {
                          const code = langOption.code as Language;
                          setLanguage(code);
                          // Auto-align currency as requested by the user: BR with BRL, US with USD, ES with EUR
                          const alignedCurrency = code.startsWith('pt') ? 'BRL' : code.startsWith('es') ? 'EUR' : 'USD';
                          setCurrency(alignedCurrency as Currency);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                          isSelected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {langOption.sub}
                      </button>
                    );
                  })}
                </div>

                {/* Currency Switcher */}
                <div className="flex items-center space-x-1 border-r border-white/10 pr-2.5">
                  <Coins className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  {[
                    { code: 'BRL', sub: 'BR' },
                    { code: 'USD', sub: 'US' },
                    { code: 'EUR', sub: 'ES' }
                  ].map(currencyOption => {
                    const isSelected = currency === currencyOption.code;
                    return (
                      <button
                        key={currencyOption.code}
                        onClick={() => setCurrency(currencyOption.code as Currency)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                          isSelected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {currencyOption.code}
                      </button>
                    );
                  })}
                </div>

                {/* Theme Switcher */}
                <button
                  onClick={toggleTheme}
                  className="p-1 rounded text-slate-400 hover:text-white transition flex items-center justify-center"
                  title="Alterar Tema"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </button>
              </div>

              {/* Live Clock clock */}
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentTime} UTC</span>
              </div>

              {/* Notification Bell */}
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 bg-slate-900 transition relative"
                id="topbar-bell-btn"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </button>

              {/* Micro Profile Icon wrapper */}
              <div className="relative">
                <div 
                  onClick={() => setIsRightProfileOpen(!isRightProfileOpen)}
                  className="flex items-center space-x-2.5 pl-2 border-l border-white/5 cursor-pointer hover:opacity-80 transition"
                >
                  <img 
                    src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'} 
                    alt="Avatar" 
                    className="w-7 h-7 rounded-lg object-cover border border-emerald-500/30"
                  />
                  <span className="text-xs font-bold text-slate-350">{profile?.full_name || 'Usuário'}</span>
                </div>

                {/* Right Profile Dropdown Menu */}
                {isRightProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl p-2 shadow-2xl z-50 space-y-1 text-xs">
                    <button 
                      onClick={() => {
                        setActiveView('profile');
                        setIsRightProfileOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-white/5 rounded-lg text-slate-200 hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('editProfile', 'Editar Perfil')}</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsRightProfileOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-white/5 rounded-lg text-slate-200 hover:text-white"
                    >
                      <Settings className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('settings', 'Definições')}</span>
                    </button>
                    <div className="border-t border-white/5 my-1" />
                    <button 
                      onClick={() => {
                        setIsRightProfileOpen(false);
                        setIsLoggedIn(false);
                        localStorage.setItem('omnisaas_logged_in', 'false');
                        localStorage.removeItem('omnisaas_logged_in_email');
                        handleShowNotification(t('logout', 'Fazer Logout'), t('logoutSuccess', 'Logout realizado com sucesso.'), 'info');
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-rose-500/10 text-rose-400 rounded-lg"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>{t('logout', 'Fazer Logout')}</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* CONTAINER DINÂMICO DE VIEWS COM SUPORTE A SWIPE GESTURES */}
          <motion.div 
            className="flex-1 p-4 md:p-8 overflow-x-hidden" 
            id="active-workspace-wrapper" 
            key={`${activeView}-${language}`}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            style={{ touchAction: 'pan-y' }}
            onDragEnd={(event, info) => {
              // Only trigger slide transition if horizontal swipe is substantial
              const swipeThreshold = 100;
              if (info.offset.x < -swipeThreshold) {
                // Swiped Left -> next tab
                const currentIndex = navItems.findIndex(item => item.id === activeView);
                if (currentIndex !== -1) {
                  const nextIndex = (currentIndex + 1) % navItems.length;
                  const nextItem = navItems[nextIndex];
                  setActiveView(nextItem.id);
                  const targetPath = nextItem.id === 'dashboard' ? '/' : `/${nextItem.id}`;
                  if (window.location.pathname !== targetPath) {
                    window.history.pushState({}, '', targetPath);
                  }
                  handleShowNotification(
                    language.startsWith('pt') ? 'Navegação Omni' : 'Omni Navigation',
                    language.startsWith('pt') ? `Acessando: ${nextItem.label}` : `Accessing: ${nextItem.label}`,
                    'info'
                  );
                }
              } else if (info.offset.x > swipeThreshold) {
                // Swiped Right -> previous tab
                const currentIndex = navItems.findIndex(item => item.id === activeView);
                if (currentIndex !== -1) {
                  const prevIndex = (currentIndex - 1 + navItems.length) % navItems.length;
                  const prevItem = navItems[prevIndex];
                  setActiveView(prevItem.id);
                  const targetPath = prevItem.id === 'dashboard' ? '/' : `/${prevItem.id}`;
                  if (window.location.pathname !== targetPath) {
                    window.history.pushState({}, '', targetPath);
                  }
                  handleShowNotification(
                    language.startsWith('pt') ? 'Navegação Omni' : 'Omni Navigation',
                    language.startsWith('pt') ? `Acessando: ${prevItem.label}` : `Accessing: ${prevItem.label}`,
                    'info'
                  );
                }
              }
            }}
          >
            {renderActiveView()}
          </motion.div>

        </main>

        {/* SETTINGS MODAL (Theme and Language Configuration) */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-950 shrink-0">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">{t('settings', 'Definições / Configurações')}</h3>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                  style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Supabase Sync Controller */}
                {isOwner && (
                  <div className="space-y-3 pb-6 border-b border-white/5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        <Database className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                        {t('supabaseSyncTitle', 'Nuvem Supabase Cloud')}
                      </label>
                      <p className="text-[11px] text-slate-500">
                        {t('supabaseSyncDesc', 'Sincronize todo o estado do OmniSaaS (Hábitos, Finanças, Metas e Colaboradores) de forma bidirecional com o seu banco de dados Supabase.')}
                      </p>

                      {/* Dynamic Credentials Inputs */}
                      <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          {language.startsWith('pt') ? 'Configurar Credenciais do Banco' : 'Configure Database Credentials'}
                        </p>
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Supabase Project URL (https://your-project.supabase.co)"
                            value={supabaseUrlInput}
                            onChange={(e) => setSupabaseUrlInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <input
                            type="password"
                            placeholder="Supabase Anon/Public Key"
                            value={supabaseAnonKeyInput}
                            onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveSupabaseCredentials}
                          disabled={isCheckingSupabase}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition flex items-center justify-center space-x-1.5"
                        >
                          {isCheckingSupabase ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>{language.startsWith('pt') ? 'Testando Conexão...' : 'Testing Connection...'}</span>
                            </>
                          ) : (
                            <span>{language.startsWith('pt') ? 'Salvar & Testar Conexão' : 'Save & Test Connection'}</span>
                          )}
                        </button>
                      </div>

                    {/* Status Indicator */}
                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                        {isCheckingSupabase ? (
                          <span className="inline-flex items-center text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold animate-pulse">
                            <RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin" />
                            {language.startsWith('pt') ? 'Testando...' : 'Testing...'}
                          </span>
                        ) : supabaseStatus === null ? (
                          <span className="inline-flex items-center text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold animate-pulse">
                            <RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin" />
                            {t('supabaseStatusInitializing', 'Inicializando...')}
                          </span>
                        ) : supabaseStatus.connected ? (
                          supabaseStatus.tablesExist ? (
                            <span className="inline-flex items-center text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                              <Cloud className="w-2.5 h-2.5 mr-1 text-emerald-400" />
                              {t('supabaseStatusConnected', 'Conectado com Sucesso')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                              <AlertTriangle className="w-2.5 h-2.5 mr-1 text-amber-400" />
                              {t('supabaseStatusPendingInit', 'Esquema Pendente')}
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                            <X className="w-2.5 h-2.5 mr-1 text-rose-400" />
                            {language.startsWith('pt') ? 'Não Conectado' : 'Not Connected'}
                          </span>
                        )}
                      </div>

                      {supabaseStatus && supabaseStatus.url && (
                        <div className="text-[9.5px] text-slate-500 font-mono truncate">
                          URL: <span className="text-slate-400">{supabaseStatus.url}</span>
                        </div>
                      )}

                      {/* Detailed message if failed */}
                      {supabaseStatus && !supabaseStatus.connected && supabaseStatus.message && (
                        <div className="text-[10px] bg-rose-950/20 text-rose-400 p-2.5 rounded-lg border border-rose-500/15 leading-relaxed font-mono whitespace-pre-wrap break-all">
                          {supabaseStatus.message}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1.5">
                        <button
                          onClick={handleSupabasePush}
                          disabled={isSyncing || isPulling || !supabaseStatus?.connected}
                          className="py-2 px-3 bg-emerald-500 hover:bg-emerald-450 disabled:opacity-35 disabled:hover:bg-emerald-500 text-black font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1.5 transition"
                        >
                          <Cloud className="w-3.5 h-3.5" />
                          <span>{isSyncing ? 'Syncing...' : t('supabaseSyncNowBtn', 'Enviar Dados (Push)')}</span>
                        </button>
                        
                        <button
                          onClick={handleSupabasePull}
                          disabled={isSyncing || isPulling || !supabaseStatus?.connected || !supabaseStatus?.tablesExist}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-750 disabled:opacity-35 disabled:hover:bg-slate-800 text-white border border-white/5 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1.5 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isPulling ? 'Pulling...' : t('supabasePullNowBtn', 'Baixar Dados (Pull)')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Schema initialization notice */}
                    {supabaseStatus && supabaseStatus.connected && !supabaseStatus.tablesExist && (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                        <p className="text-[10px] text-amber-500/95 leading-normal">
                          {t('supabaseInitRequired', 'Atenção: A tabela "omnisaas_store" não foi encontrada. Clique abaixo para ver o comando SQL de inicialização.')}
                        </p>
                        
                        <button
                          onClick={() => setShowSupabaseSql(!showSupabaseSql)}
                          className="text-[10px] font-bold text-amber-400 hover:underline flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{t('supabaseInitShowSql', 'Exibir SQL de Setup')}</span>
                        </button>

                        {showSupabaseSql && supabaseStatus.sql && (
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[9px] text-slate-400">
                              {t('supabaseInstructionCopy', 'Copie e execute o SQL acima no SQL Editor do seu console Supabase para criar a estrutura:')}
                            </p>
                            <div className="relative">
                              <pre className="p-2 bg-black/50 text-[9px] font-mono text-slate-300 rounded border border-white/5 overflow-x-auto whitespace-pre leading-relaxed select-all">
                                {supabaseStatus.sql}
                              </pre>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(supabaseStatus.sql || '');
                                  setIsCopied(true);
                                  setTimeout(() => setIsCopied(false), 2000);
                                }}
                                className="absolute right-1.5 top-1.5 p-1.5 bg-slate-900 hover:bg-slate-850 rounded text-slate-400 hover:text-white border border-white/5 transition"
                                title="Copiar SQL"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Accent Color Customization Section */}
                <div className="space-y-3 pt-4 border-t border-white/5" id="settings-accent-color-section">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    <Palette className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                    {language.startsWith('pt') ? 'Cor de Destaque' : language.startsWith('es') ? 'Color de Acento' : 'Accent Color'}
                  </label>
                  <p className="text-[11px] text-slate-500">
                    {language.startsWith('pt') 
                      ? 'Selecione uma cor para personalizar todos os botões, links, ícones e destaques do SaaS.' 
                      : language.startsWith('es')
                      ? 'Seleccione un color para personalizar todos los botones, enlaces, iconos y detalles del SaaS.'
                      : 'Select an accent color to personalize all buttons, links, icons, and indicators in the SaaS.'}
                  </p>
                  <div className="flex items-center gap-2 pt-1" id="accent-color-selector">
                    {[
                      { id: 'blue', label: language.startsWith('pt') ? 'Azul' : language.startsWith('es') ? 'Azul' : 'Blue', color: 'bg-blue-500' },
                      { id: 'emerald', label: language.startsWith('pt') ? 'Verde' : language.startsWith('es') ? 'Esmeralda' : 'Emerald', color: 'bg-emerald-500' },
                      { id: 'rose', label: language.startsWith('pt') ? 'Rosa' : language.startsWith('es') ? 'Rosa' : 'Rose', color: 'bg-rose-500' },
                      { id: 'purple', label: language.startsWith('pt') ? 'Roxo' : language.startsWith('es') ? 'Púrpura' : 'Purple', color: 'bg-purple-500' },
                      { id: 'orange', label: language.startsWith('pt') ? 'Laranja' : language.startsWith('es') ? 'Naranja' : 'Orange', color: 'bg-orange-500' }
                    ].map((c) => {
                      const isActive = accent === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setAccent(c.id)}
                          title={c.label}
                          type="button"
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                            isActive 
                              ? 'ring-2 ring-white/45 scale-110 border-white text-white' 
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-lg ${c.color} flex items-center justify-center shadow-lg relative`}>
                            {isActive && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>


              <div className="p-4 bg-[#0D0D0E] border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-black text-xs font-bold rounded-lg transition"
                >
                  {t('doneBtn', 'OK / Concluído')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS PANEL SIDEBAR (Right Drawer) */}
        {isNotificationsOpen && (
          <div className="fixed inset-y-0 right-0 w-80 bg-slate-900/98 border-l border-slate-800 z-50 shadow-2xl flex flex-col justify-between" id="notifications-drawer">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">{t('alertsCenter', 'Central de Alertas')}</h3>
              </div>
              <button 
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
                id="close-notifications-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" id="notifications-scroll-area">
              <div className="flex justify-between items-center mb-2">
                <button 
                  onClick={handleMarkAllNotifsRead}
                  className="text-[10px] font-bold text-emerald-400 hover:underline"
                >
                  {t('markAllRead', 'Marcar tudo como lido')}
                </button>
                <button 
                  onClick={handleClearNotifHistory}
                  className="text-[10px] font-bold text-rose-400 hover:underline"
                >
                  {t('clearHistory', 'Limpar histórico')}
                </button>
              </div>

              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleMarkNotifRead(n.id)}
                  className={`p-3.5 rounded-xl border text-xs transition cursor-pointer relative ${
                    n.read 
                      ? 'bg-slate-950/20 border-slate-900/80 text-slate-400' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-750'
                  }`}
                >
                  {!n.read && (
                    <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  )}
                  
                  <p className="font-bold pr-4">{n.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[9px] text-slate-500 mt-2 block font-medium">{n.created_at || n.date}</span>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-12 text-slate-550 space-y-1">
                  <Info className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                  <p className="text-xs font-semibold">{t('everythingQuiet', 'Tudo calmo por aqui')}</p>
                  <p className="text-[10px] text-slate-500">{t('noAlertsRegistered', 'Nenhum alerta cadastrado na central de auditoria.')}</p>
                </div>
              )}
            </div>

            {/* Footer warning */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 leading-normal">
              <p>{t('alertsFooterWarning', 'Alertas são gerados dinamicamente no OmniSaaS a cada transação, pagamento do Stripe ou check-off de hábitos.')}</p>
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION STACK POPUP (Tactile Feedback Engine) */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full px-4 md:px-0" id="toasts-popup-stack">
          {toasts.map((t) => (
            <div 
              key={t.id} 
              className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start space-x-3 transition-all duration-300 transform translate-y-0 animate-fade-in ${
                t.type === 'success' ? 'bg-[#111112] border-emerald-900/80 text-emerald-300' : 
                t.type === 'warning' ? 'bg-[#111112] border-amber-900/80 text-amber-300' : 
                'bg-[#111112] border-slate-850 text-slate-200'
              }`}
            >
              <div className="flex-1 text-xs">
                <p className="font-bold text-white">{t.title}</p>
                <p className="text-slate-450 mt-1 leading-normal">{t.message}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </LanguageThemeContext.Provider>
  );
}
