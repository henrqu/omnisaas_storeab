/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  CheckCircle, 
  Crown,
  Lock,
  Cpu
} from 'lucide-react';
import { LocalDatabase } from '../utils/db';
import { Profile, Subscription } from '../types/schema';
import { useLanguageTheme, formatCurrency } from '../utils/i18n';

interface SubscriptionProfileViewProps {
  onShowNotification: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export default function SubscriptionProfileView({ onShowNotification }: SubscriptionProfileViewProps) {
  const { language, t } = useLanguageTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState('');

  // Stripe Simulation States
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<'free' | 'pro' | 'enterprise' | null>(null);

  useEffect(() => {
    setProfile(LocalDatabase.getProfile());
    setSub(LocalDatabase.getSubscription());
    
    const prof = LocalDatabase.getProfile();
    if (prof) {
      setFullName(prof.full_name);
      setAvatar(prof.avatar_url);
    }
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      onShowNotification('Erro', 'Nome completo não pode ser vazio.', 'warning');
      return;
    }

    const updated = LocalDatabase.updateProfile({
      full_name: fullName.trim(),
      avatar_url: avatar.trim()
    });

    setProfile(updated);
    onShowNotification('Configurações Salvas', 'Preferências de perfil armazenadas com sucesso.', 'success');
  };

  const handleSimulateStripeCheckout = (plan: 'free' | 'pro' | 'enterprise') => {
    const isAlreadyActive = 
      (plan === 'free' && sub?.tier_name === 'Free') ||
      (plan === 'pro' && sub?.tier_name === 'Pro Plan') ||
      (plan === 'enterprise' && sub?.tier_name === 'Enterprise');

    if (isAlreadyActive) {
      onShowNotification('Aviso', `Você já possui o plano ${plan.toUpperCase()} ativo.`, 'info');
      return;
    }

    setCheckoutPlan(plan);
    setIsCheckoutLoading(true);

    // Simulate Stripe payment gateway latency
    setTimeout(() => {
      let mappedTierName: 'Free' | 'Pro Plan' | 'Enterprise' = 'Free';
      let priceId = 'price_stripe_free';

      if (plan === 'pro') {
        mappedTierName = 'Pro Plan';
        priceId = 'price_stripe_pro';
      } else if (plan === 'enterprise') {
        mappedTierName = 'Enterprise';
        priceId = 'price_stripe_enterprise';
      }

      const updatedSub = LocalDatabase.updateSubscription({
        tier_name: mappedTierName,
        status: plan === 'free' ? 'trialing' : 'active',
        price_id: priceId
      });

      setSub(updatedSub);
      setIsCheckoutLoading(false);
      setCheckoutPlan(null);

      onShowNotification(
        'Stripe Payment Gateway ✅', 
        `Pagamento processado via Stripe. Assinatura ${plan.toUpperCase()} ativada com sucesso!`, 
        'success'
      );
    }, 1500);
  };

  // Helper to resolve monthly cost
  const getPlanMonthlyPrice = (tierName: string) => {
    if (tierName === 'Pro Plan' || tierName === 'Pro' || tierName === 'Life4Billion Pro' || tierName === 'Vesta Pro') {
      if (language.startsWith('pt')) return 59.90;
      return 11.99;
    }
    if (tierName === 'Enterprise') {
      if (language.startsWith('pt')) return 199.90;
      return 39.99;
    }
    return 0.00;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="subscription-profile-container">
      
      {/* Coluna 1: Perfil do Usuário e RLS Info */}
      <div className="space-y-6">
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6" id="profile-card">
          <div className="flex items-center space-x-3 mb-5">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">{t('userProfileSecurity', 'Segurança do Perfil de Usuário')}</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">{t('displayNameLabel', 'Nome de Exibição / Razão Social')}</label>
              <input 
                type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">{t('profilePhotoLabel', 'Foto de Perfil (Carregar da Galeria)')}</label>
              <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                {avatar && (
                  <img 
                    src={avatar} 
                    alt="Preview Avatar" 
                    className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30 shrink-0" 
                  />
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64String = reader.result as string;
                        setAvatar(base64String);
                        // Save in local storage right away or via form submit
                        LocalDatabase.updateProfile({ avatar_url: base64String });
                        onShowNotification('Avatar Carregado', 'Nova foto de perfil selecionada e armazenada localmente.', 'success');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-450 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 file:cursor-pointer cursor-pointer focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">{t('emailLabel', 'E-mail de Cadastro (Identificação)')}</label>
              <input 
                type="text" disabled value="admin@life4billion.com"
                className="w-full bg-slate-950/40 border border-slate-850/60 text-slate-500 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-not-allowed"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl transition"
            >
              {t('updateProfileBtn', 'Atualizar Perfil')}
            </button>
          </form>
        </div>

        {/* RLS Security Widget */}
        <div className="bg-slate-900/10 border border-slate-850/65 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <Shield className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">{t('rlsTitle', 'Multi-Tenant Row-Level Security')}</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {t('rlsDesc', 'Seus dados estão protegidos por RLS integrado em nosso banco de dados centralizado. Cada transação é filtrada pela cláusula SQL WHERE user_id = auth.uid() para isolamento absoluto em ambiente de produção distribuído.')}
          </p>
        </div>
      </div>

      {/* Colunas 2-3: Planos de Assinatura e Faturamento Stripe */}
      <div className="lg:col-span-2 space-y-6" id="subscription-billing">
        
        {/* Status de Assinatura Ativo */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold block">{t('currentSubscription', 'Assinatura Atual')}</span>
            <div className="flex items-center space-x-2 mt-1">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400/15" />
              <h2 className="text-lg font-bold text-white capitalize">
                {sub?.tier_name === 'Pro Plan' || (sub?.tier_name as string) === 'Pro' || (sub?.tier_name as string) === 'Life4Billion Pro' || (sub?.tier_name as string) === 'Vesta Pro' ? t('proPlan', 'Plano Pro') : sub?.tier_name || t('freeTrial', 'Avaliação Grátis')}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {sub?.status === 'active' ? t('accountActiveDesc', 'Sua conta corporativa está ativa e adimplente.') : t('accountTrialDesc', 'Sua conta corporativa está em teste comercial/trial.')}
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-right bg-slate-950/60 p-4 rounded-xl border border-slate-850 flex items-center space-x-4">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">{t('monthlyCycle', 'Ciclo mensal')}</span>
              <span className="text-emerald-400 font-bold text-lg">{formatCurrency(getPlanMonthlyPrice(sub?.tier_name || ''), language)}</span>
            </div>
            <span className="bg-emerald-950/60 text-emerald-400 text-[10px] border border-emerald-900/30 px-2.5 py-1 rounded-full uppercase font-semibold">
              {t('activeStatus', 'Ativo')}
            </span>
          </div>
        </div>

        {/* Escolha de Planos com Stripe */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">{t('saasUpgradeOptions', 'Opções de Upgrade do SaaS')}</h3>
              <p className="text-slate-500 text-xs">{t('saasUpgradeDesc', 'Mude de plano em segundos. Testado pelo simulador de checkout Stripe.')}</p>
            </div>
            <div className="flex items-center space-x-1 text-slate-400 text-xs">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('secureCheckoutSsl', 'Checkout Seguro SSL')}</span>
            </div>
          </div>

          <div className="flex justify-center" id="plans-grid">
            
            {/* Pro Plan - ONLY ONE CARD SHOWING */}
            <div className="border border-indigo-500 p-6 rounded-2xl flex flex-col justify-between transition bg-indigo-950/10 relative overflow-hidden max-w-md w-full shadow-lg shadow-indigo-500/5">
              <div className="absolute top-3 right-3 bg-indigo-900/50 text-indigo-300 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-700/50">
                {t('popularBadge', 'Popular')}
              </div>
              <div className="space-y-4">
                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider bg-indigo-950/40 border border-indigo-900 px-2 py-0.5 rounded-full">{t('professionalTier', 'Profissional')}</span>
                <div>
                  <h4 className="text-base font-bold text-white mt-1">Life4Billion Pro</h4>
                  <p className="text-slate-400 text-xs mt-1">{t('proPlanDesc', 'Ideal para autônomos, investidores e consultórios.')}</p>
                </div>
                <div className="text-white text-2xl font-black font-mono">
                  {formatCurrency(getPlanMonthlyPrice('Pro Plan'), language)} <span className="text-xs text-slate-500 font-sans font-normal">/{language.startsWith('pt') ? 'mês' : language.startsWith('es') ? 'mes' : 'month'}</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5 pt-3 border-t border-slate-900">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> {t('featureCrm', 'CRM e Folhas Ilimitadas')}</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> {t('featureAlerts', 'Alertas por E-mail')}</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> {t('featureVip', 'Suporte VIP Prioritário')}</li>
                </ul>
              </div>
              <button 
                onClick={() => handleSimulateStripeCheckout('pro')}
                disabled={isCheckoutLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl mt-6 transition disabled:opacity-50"
              >
                {isCheckoutLoading && checkoutPlan === 'pro' ? t('processingStripe', 'Processando Stripe...') : sub?.tier_name === 'Pro Plan' || (sub?.tier_name as string) === 'Pro' || (sub?.tier_name as string) === 'Life4Billion Pro' || (sub?.tier_name as string) === 'Vesta Pro' ? t('planActiveBtn', 'Plano Ativo') : t('buyProStripe', 'Comprar Pro via Stripe')}
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
