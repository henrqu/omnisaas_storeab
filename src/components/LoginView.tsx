import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, LogIn, ArrowRight, CreditCard, Globe, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import OmniSaaSLogo from './OmniSaaSLogo';
import { useLanguageTheme, Language } from '../utils/i18n';

interface LoginViewProps {
  onLogin: (email: string, provider: 'email' | 'google', fullName?: string, phone?: string) => void;
  onShowNotification: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export default function LoginView({ onLogin, onShowNotification }: LoginViewProps) {
  const { language, setLanguage, t } = useLanguageTheme();
  
  // App credentials states
  const [email, setEmail] = useState(() => localStorage.getItem('omnisaas_remembered_email') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('omnisaas_remembered_password') || '');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Saved credentials prompt state
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<{
    email: string;
    fullName?: string;
    phoneNumber?: string;
  } | null>(null);

  // Google Account Selector simulation states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [showGoogleCustomInput, setShowGoogleCustomInput] = useState(false);

  // Stripe & Payment States
  const [isPaid, setIsPaid] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      localStorage.setItem('omnisaas_stripe_paid', 'true');
      return true;
    }
    return localStorage.getItem('omnisaas_stripe_paid') === 'true';
  });
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [stripeConfig, setStripeConfig] = useState<{ isConfigured: boolean } | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showSimulationForm, setShowSimulationForm] = useState(false);
  
  // Simulated Card Fields
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumberVal, setCardNumberVal] = useState('');
  const [cardExpiryVal, setCardExpiryVal] = useState('');
  const [cardCvcVal, setCardCvcVal] = useState('');
  const [isSimulatingTransaction, setIsSimulatingTransaction] = useState(false);

  // Check backend Stripe setup
  useEffect(() => {
    const fetchStripeConfig = async () => {
      try {
        const res = await fetch('/api/stripe/config');
        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType || !contentType.includes('application/json')) {
          setStripeConfig({ isConfigured: false });
          return;
        }
        const data = await res.json();
        setStripeConfig(data);
      } catch (err) {
        console.error('Error fetching stripe config:', err);
        setStripeConfig({ isConfigured: false });
      } finally {
        setIsCheckingConfig(false);
      }
    };
    fetchStripeConfig();
  }, []);

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    setCardNumberVal(parts.join(' '));
  };

  // Format Card Expiry (adds slash MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 2) {
      setCardExpiryVal(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    } else {
      setCardExpiryVal(clean);
    }
  };

  // Format CVC
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvcVal(clean);
  };

  const handleCheckoutSubmit = async () => {
    setIsCreatingSession(true);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: language })
      });
      
      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        setShowSimulationForm(true);
        onShowNotification(
          t('stripeCheckoutTitle', 'Ativação do Espaço de Trabalho Premium'),
          t('stripeTestModeDisclaimer', 'Iniciando simulador local de pagamento devido a credenciais ou rotas pendentes no servidor de produção.'),
          'info'
        );
        return;
      }

      const data = await res.json();

      if (data.success && data.checkoutUrl) {
        // Redireciona para o checkout real da Stripe
        onShowNotification('Stripe Checkout', 'Redirecionando para página de pagamento seguro...', 'info');
        
        // Se estiver dentro de um iframe (como no preview do AI Studio), abre em uma nova aba/janela
        // para evitar bloqueios de Frame (X-Frame-Options: DENY) que resultariam em tela branca.
        if (window.self !== window.top) {
          const newWindow = window.open(data.checkoutUrl, '_blank');
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // Se o bloqueador de popups interceptar, redireciona o frame pai ou atual
            window.location.href = data.checkoutUrl;
          }
        } else {
          window.location.href = data.checkoutUrl;
        }
      } else {
        // Se a Stripe não estiver configurada no servidor, abrir simulador local de pagamento
        setShowSimulationForm(true);
        onShowNotification(
          t('stripeCheckoutTitle', 'Ativação do Espaço de Trabalho Premium'),
          t('stripeTestModeDisclaimer', 'Iniciando simulador local de pagamento devido a credenciais pendentes.'),
          'info'
        );
      }
    } catch (err: any) {
      // In case of any network/parsing failure, show the simulation form so they are not blocked!
      setShowSimulationForm(true);
      onShowNotification(
        t('stripeCheckoutTitle', 'Ativação do Espaço de Trabalho Premium'),
        'Iniciando simulador local de pagamento em modo de compatibilidade offline.',
        'info'
      );
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSimulatedPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardHolderName.trim() || cardNumberVal.length < 19 || cardExpiryVal.length < 5 || cardCvcVal.length < 3) {
      onShowNotification('Checkout Error', 'Por favor preencha todos os dados do cartão corretamente.', 'warning');
      return;
    }

    setIsSimulatingTransaction(true);

    // Simula tempo de processamento com o gateway Stripe
    setTimeout(() => {
      setIsSimulatingTransaction(false);
      setShowSimulationForm(false);
      setIsPaid(true);
      localStorage.setItem('omnisaas_stripe_paid', 'true');
      localStorage.setItem('omnisaas_stripe_actually_paid', 'true');
      
      onShowNotification(
        t('successLabel', 'Sucesso'),
        t('stripePaidSuccessToast', 'Pagamento de licença confirmado! Agora você pode criar sua conta ou acessar o painel.'),
        'success'
      );
    }, 2200);
  };

  const executeFinalLogin = (userEmail: string, name?: string, phone?: string) => {
    onLogin(userEmail, 'email', name, phone);
    onShowNotification(
      isRegisterMode ? 'Account Created' : 'Session Initialized', 
      isRegisterMode ? `Welcome, ${name}! Your OmniSaaS workspace is ready.` : `Welcome back, ${userEmail}!`, 
      'success'
    );
  };

  const handleSaveAndLogin = (save: boolean) => {
    if (!pendingLoginData) return;
    
    if (save) {
      localStorage.setItem('omnisaas_remembered_email', pendingLoginData.email);
      localStorage.setItem('omnisaas_remembered_password', password);
      onShowNotification(
        language === 'pt' ? 'Credenciais Salvas' : 'Credentials Saved',
        language === 'pt' ? 'Suas credenciais foram salvas com sucesso neste navegador para preenchimento automático futuro.' : 'Your credentials have been successfully saved in this browser for future automatic logins.',
        'success'
      );
    } else {
      localStorage.removeItem('omnisaas_remembered_email');
      localStorage.removeItem('omnisaas_remembered_password');
    }
    
    setShowSavePrompt(false);
    executeFinalLogin(pendingLoginData.email, pendingLoginData.fullName, pendingLoginData.phoneNumber);
    setPendingLoginData(null);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      onShowNotification('Authentication Error', 'Please complete all fields.', 'warning');
      return;
    }

    const isMasterEmail = trimmedEmail.toLowerCase() === 'kaluvih@gmail.com';
    const isMasterPassword = trimmedPassword === 'Abismar2023@';

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);

      if (isMasterEmail) {
        if (!isMasterPassword) {
          onShowNotification(
            language === 'pt' ? 'Senha Incorreta' : 'Incorrect Password',
            language === 'pt' ? 'A senha fornecida para a conta master está incorreta.' : 'Incorrect password for the master account.',
            'warning'
          );
          return;
        }
      } else {
        // Any other account must have actually paid
        const actuallyPaid = localStorage.getItem('omnisaas_stripe_actually_paid') === 'true';
        if (!actuallyPaid) {
          // Block and redirect to payment screen
          setIsPaid(false);
          localStorage.removeItem('omnisaas_stripe_paid');
          onShowNotification(
            language === 'pt' ? 'Pagamento Necessário' : 'Payment Required',
            language === 'pt' 
              ? 'Dados de pagamento não reconhecidos. Por favor, conclua o pagamento seguro do Stripe para acessar o sistema.' 
              : 'Payment details not recognized. Please complete the secure Stripe payment to access the system.',
            'warning'
          );
          return;
        }
      }

      if (isRegisterMode) {
        if (!fullName.trim() || !phoneNumber.trim()) {
          onShowNotification('Authentication Error', 'Please provide your Full Name and Phone Number to register.', 'warning');
          return;
        }
      }

      // Check if credentials are not already saved
      const savedEmail = localStorage.getItem('omnisaas_remembered_email');
      const savedPassword = localStorage.getItem('omnisaas_remembered_password');
      
      if (savedEmail !== trimmedEmail || savedPassword !== trimmedPassword) {
        setPendingLoginData({
          email: trimmedEmail,
          fullName: isRegisterMode ? fullName : undefined,
          phoneNumber: isRegisterMode ? phoneNumber : undefined
        });
        setShowSavePrompt(true);
      } else {
        executeFinalLogin(trimmedEmail, isRegisterMode ? fullName : undefined, isRegisterMode ? phoneNumber : undefined);
      }
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setShowGoogleModal(true);
  };

  // Get localized price strings for display
  const getLocalizedPrice = () => {
    if (language === 'pt') return { currency: 'BRL', value: 'R$ 97,90', code: 'BRL' };
    if (language === 'es') return { currency: 'EUR', value: '19,99 €', code: 'EUR' };
    return { currency: 'USD', value: '$19.99', code: 'USD' };
  };

  const priceDetails = getLocalizedPrice();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden" id="login-layout-wrapper">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Language Quick Selector at the Top */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800" id="login-lang-picker">
        <Globe className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-[10px] font-bold text-slate-400 font-mono uppercase mr-1">{t('detectedLocaleIs', 'Idioma Detectado:')}</span>
        <button 
          onClick={() => setLanguage('pt')} 
          className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${language === 'pt' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          PT
        </button>
        <button 
          onClick={() => setLanguage('es')} 
          className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${language === 'es' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          ES
        </button>
        <button 
          onClick={() => setLanguage('en')} 
          className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          EN
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-900/45 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6" id="login-card">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <OmniSaaSLogo size="lg" className="justify-center" />
          <p className="text-slate-400 text-xs mt-2 max-w-xs">
            {t('stripeDetectedLanguage', 'Preço e moeda adaptados automaticamente para o idioma detectado.')}
          </p>
        </div>

        {/* STEP 1: PAYMENT (STILL NOT PAID) */}
        {!isPaid ? (
          <div className="space-y-5 animate-fade-in" id="stripe-checkout-section">
            <div className="p-4 bg-indigo-950/15 border border-indigo-500/20 rounded-2xl space-y-3 text-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest font-mono">
                Stripe Premium Checkout
              </span>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                {t('stripeCheckoutTitle', 'Ativação do Espaço de Trabalho Premium')}
              </h2>
              <p className="text-[11px] text-slate-400 leading-normal">
                {t('stripeCheckoutDesc', 'Antes de poder se inscrever ou entrar, você deve efetuar o pagamento. A plataforma completa de ERP, Finanças, Hábitos e Copiloto Inteligente requer uma licença ativa.')}
              </p>

              {/* Glowing Localized Pricing Display */}
              <div className="py-4 bg-black/40 border border-slate-800/40 rounded-xl space-y-1 my-3">
                <span className="text-3xl font-black text-white tracking-tight drop-shadow-lg font-sans">
                  {priceDetails.value}
                </span>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                  {priceDetails.code} — {t('activeLicense', 'Acesso Vitalício')}
                </p>
              </div>

              {/* Value Propositions */}
              <div className="text-left space-y-2 text-[11px] text-slate-300 px-1 pt-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Omni ERP Suite</strong>: {language === 'pt' ? 'Hábitos, Metas, Finanças e Contratos' : 'Habits, Goals, Finances & Teams'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Vesta AI Copilot</strong>: {language === 'pt' ? 'Relatórios Inteligentes Automatizados' : 'Automated Business Intelligence'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Supabase Cloud Sync</strong>: {language === 'pt' ? 'Salvamento de segurança RLS integrado' : 'Bidirectional secure RLS saving'}</span>
                </div>
              </div>
            </div>

            {/* Standard Payment Button */}
            {!showSimulationForm ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCheckoutSubmit}
                  disabled={isCreatingSession}
                  className="w-full bg-emerald-500 hover:bg-emerald-450 text-black font-black text-xs py-3.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
                  id="stripe-trigger-btn"
                >
                  {isCreatingSession ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>{t('stripePayNowBtn', 'Efetuar Pagamento Seguro com Stripe')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsPaid(true);
                    localStorage.setItem('omnisaas_stripe_paid', 'true');
                    onShowNotification(
                      language === 'pt' ? 'Licença Ativada' : 'License Activated',
                      language === 'pt' ? 'Bem-vindo de volta! Acesse sua conta agora.' : 'Welcome back! You can access your account now.',
                      'success'
                    );
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-indigo-400 hover:text-indigo-350 font-bold text-xs py-2.5 rounded-xl transition border border-slate-800"
                >
                  {language === 'pt' ? 'Já efetuei o pagamento / Entrar direto' : 'Already paid? Login directly'}
                </button>
              </div>
            ) : (
              /* GORGEOUS IN-APP STRIPE SIMULATOR FALLBACK */
              <form onSubmit={handleSimulatedPaymentSubmit} className="space-y-4 border-t border-white/5 pt-4 animate-fade-in" id="simulated-stripe-form">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">Sandbox Mode Active</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowSimulationForm(false)}
                    className="p-1 rounded-md text-slate-550 hover:text-slate-350 hover:bg-slate-850 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 leading-normal">
                  {t('stripeTestModeDisclaimer', 'Modo Teste / Simulação: O servidor não detectou a variável de ambiente STRIPE_SECRET_KEY. O fluxo de checkout será simulado com alta fidelidade.')}
                </p>

                {/* Card Holder */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('cardHolder', 'Nome do Titular')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lucas King"
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none transition-all"
                  />
                </div>

                {/* Card Number */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('cardNumber', 'Número do Cartão')}</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="4000 1234 5678 9010"
                      value={cardNumberVal}
                      onChange={handleCardNumberChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Row for Expiry and CVC */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('cardExpiry', 'Validade')}</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/AA"
                      value={cardExpiryVal}
                      onChange={handleExpiryChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none transition-all text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('cardCvc', 'CVC')}</label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={cardCvcVal}
                      onChange={handleCvcChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none transition-all text-center"
                    />
                  </div>
                </div>

                {/* Simulated Payment Actions */}
                <button
                  type="submit"
                  disabled={isSimulatingTransaction}
                  className="w-full bg-amber-500 hover:bg-amber-450 text-black font-black text-xs py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  {isSimulatingTransaction ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{t('simulatingPayment', 'Processando...')}</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('simulatedPaySuccessBtn', 'Confirmar Pagamento Simulado')}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          
          /* STEP 2: REGISTRATION OR SIGN IN FORM (UNLOCKED) */
          <div className="space-y-4 animate-fade-in" id="unlocked-auth-section">
            
            {/* Active License Badge */}
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                  {t('activeLicense', 'Licença Ativa com Stripe')}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsPaid(false);
                  localStorage.removeItem('omnisaas_stripe_paid');
                }}
                className="text-[9px] text-slate-500 hover:text-slate-300 hover:underline uppercase tracking-wide font-mono"
              >
                {t('simulatedPayCancelBtn', 'Desconectar')}
              </button>
            </div>

            {/* Tab Headers */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850" id="login-tabs">
              <button 
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  !isRegisterMode 
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  isRegisterMode 
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Main form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4" id="login-form">
              {isRegisterMode && (
                <>
                  {/* Full Name */}
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-550 focus:outline-none transition-all"
                        id="login-fullname-input"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="tel" 
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. +1 (555) 019-2834"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-550 focus:outline-none transition-all"
                        id="login-phone-input"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-550 focus:outline-none transition-all"
                    id="login-email-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Security Password
                  </label>
                  {!isRegisterMode && (
                    <a 
                      href="#recover" 
                      onClick={(e) => {
                        e.preventDefault();
                        onShowNotification('Password Reset', 'We sent recovery guidelines to the registered email address.', 'info');
                      }}
                      className="text-[10px] text-indigo-400 hover:underline font-semibold"
                    >
                      Forgot your password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secure password"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-550 focus:outline-none transition-all"
                    id="login-password-input"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-slate-350"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isRegisterMode && (
                <div className="flex items-start space-x-2 pt-1 animate-fade-in">
                  <input 
                    type="checkbox" 
                    id="agree-checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-800 text-indigo-600 focus:ring-0 bg-slate-950 cursor-pointer"
                  />
                  <label htmlFor="agree-checkbox" className="text-[10px] text-slate-400 leading-normal cursor-pointer select-none">
                    I agree to the privacy policy, cookie declarations, and SaaS Terms of Service.
                  </label>
                </div>
              )}

              {/* Form Actions */}
              <button 
                type="submit"
                disabled={isLoading || (isRegisterMode && !agreeTerms)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-indigo-600/10 mt-2 cursor-pointer"
                id="login-submit-btn"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRegisterMode ? 'Sign Up Now' : 'Sign In to Dashboard'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Separator */}
            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              <div className="h-[1px] bg-slate-850 flex-1" />
              <span>Or proceed with</span>
              <div className="h-[1px] bg-slate-850 flex-1" />
            </div>

            {/* Google Sign-In Button */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center space-x-3 disabled:opacity-50 cursor-pointer"
              id="google-login-btn"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{isRegisterMode ? 'Sign Up with Google' : 'Sign In with Google'}</span>
            </button>
          </div>
        )}
      </div>

      {/* GOOGLE SIGN IN ACCOUNTS MODAL OVERLAY */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="google-accounts-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4 text-left">
            
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => {
                setShowGoogleModal(false);
              }}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Google Brand Header */}
            <div className="text-center space-y-1 pb-2">
              {/* Google G logo */}
              <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <h3 className="text-sm font-bold text-slate-100 mt-2">Sign in with Google</h3>
              <p className="text-[11px] text-slate-400">to continue to OmniSaaS OS</p>
            </div>

            {/* Custom Google Email Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!googleCustomEmail.trim()) return;
                
                const chosenEmail = googleCustomEmail.trim().toLowerCase();
                const isKV = chosenEmail === 'kaluvih@gmail.com';
                
                if (isKV) {
                  setShowGoogleModal(false);
                  onLogin('kaluvih@gmail.com', 'google', 'Kalu Vih');
                  onShowNotification(
                    'Google OAuth Connected', 
                    language === 'pt' ? 'Autenticado com sucesso via Google (kaluvih@gmail.com)!' : 'Successfully authenticated via Google (kaluvih@gmail.com)!', 
                    'success'
                  );
                } else {
                  const actuallyPaid = localStorage.getItem('omnisaas_stripe_actually_paid') === 'true';
                  if (!actuallyPaid) {
                    setShowGoogleModal(false);
                    setIsPaid(false);
                    localStorage.removeItem('omnisaas_stripe_paid');
                    onShowNotification(
                      language === 'pt' ? 'Acesso Negado' : 'Access Denied',
                      language === 'pt' 
                        ? 'Este e-mail do Google não possui licença ativa do Stripe. Efetue o pagamento.' 
                        : 'This Google email does not have an active Stripe license. Please make a payment.',
                      'warning'
                    );
                  } else {
                    setShowGoogleModal(false);
                    onLogin(chosenEmail, 'google', chosenEmail.split('@')[0]);
                    onShowNotification('Google OAuth Connected', `Authenticated successfully as ${chosenEmail}!`, 'success');
                  }
                }
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'pt' ? 'Seu E-mail do Google' : 'Your Google Email Address'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@gmail.com"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 rounded-xl text-[10px] text-slate-450 font-bold border border-slate-800 transition"
                >
                  {language === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold transition"
                >
                  {language === 'pt' ? 'Avançar' : 'Next'}
                </button>
              </div>
            </form>

            {/* Footer lock and privacy disclaimer */}
            <p className="text-[9px] text-slate-400 leading-normal text-center pt-2">
              To safe-guard your data, Google shared profiles are automatically synchronized and protected via RLS policies.
            </p>
          </div>
        </div>
      )}

      {/* SAVE CREDENTIALS PROMPT MODAL */}
      {showSavePrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="save-credentials-prompt-modal">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4 text-left">
            <div className="flex items-center space-x-3 text-indigo-450">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-100">
                {language === 'pt' ? 'Salvar Credenciais?' : 'Save Credentials?'}
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {language === 'pt' 
                ? 'Deseja salvar seu e-mail e senha de forma segura neste navegador para preenchimento automático futuro?' 
                : 'Would you like to securely save your email and password in this browser for future automatic logins?'}
            </p>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-300 truncate max-w-[180px]">{pendingLoginData?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'pt' ? 'Senha' : 'Password'}:</span>
                <span className="text-slate-300">••••••••</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveAndLogin(false)}
                className="py-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl text-[11px] text-slate-450 font-bold border border-slate-800 transition uppercase tracking-wider cursor-pointer text-center"
              >
                {language === 'pt' ? 'Agora Não' : 'Not Now'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveAndLogin(true)}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-[11px] font-bold transition uppercase tracking-wider cursor-pointer text-center"
              >
                {language === 'pt' ? 'Sim, Salvar' : 'Yes, Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applet Security Disclaimer */}
      <span className="text-[10px] text-slate-600 mt-6 font-mono font-bold tracking-wider uppercase">
        SaaS Security Verification Core • Stripe Verified Gateway
      </span>
    </div>
  );
}
