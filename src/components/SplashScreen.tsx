import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import OmniSaaSLogo from './OmniSaaSLogo';
import { useLanguageTheme } from '../utils/i18n';

interface SplashScreenProps {
  onComplete: () => void;
  key?: string;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { theme, t } = useLanguageTheme();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fill the progress bar smoothly over exactly 2.7 seconds (2700ms)
    // so it reaches 100% just before the 3.0 second (3000ms) fadeout starts
    const duration = 2700;
    const intervalTime = 15;
    const steps = duration / intervalTime;
    const stepIncrement = 100 / steps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + stepIncrement, 100);
      });
    }, intervalTime);

    // Call onComplete after exactly 3.0 seconds (3000ms)
    const timeout = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
      onClick={onComplete}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 cursor-pointer ${
        isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#fafafa] text-slate-900'
      }`}
      id="omnisaas-splash-screen"
      title={t('clickToSkip', 'Clique para pular')}
    >
      {/* Background ambient glowing spheres */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: isDark ? 0.4 : 0.2, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${
            isDark 
              ? 'bg-gradient-to-tr from-[#1E73BE]/20 to-purple-500/10' 
              : 'bg-gradient-to-tr from-[#1E73BE]/10 to-indigo-500/5'
          }`}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6">
        {/* Animated Logo Container with tech glow ring */}
        <div className="relative mb-10 flex items-center justify-center">
          {/* Subtle technological pulsing glow ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.15, 1], 
              opacity: isDark ? [0.15, 0.35, 0.15] : [0.08, 0.2, 0.08] 
            }}
            transition={{ 
              duration: 2.2, 
              ease: 'easeInOut',
              repeat: Infinity 
            }}
            className="absolute w-44 h-44 rounded-full border border-[#1E73BE]/30 blur-sm pointer-events-none"
          />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.25, 1], opacity: isDark ? [0.05, 0.15, 0.05] : [0.03, 0.1, 0.03] }}
            transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity }}
            className="absolute w-64 h-64 rounded-full bg-[#1E73BE] blur-2xl pointer-events-none"
          />

          {/* Premium Logo element */}
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <OmniSaaSLogo size="lg" />
          </motion.div>
        </div>

        {/* Brand Welcome Text */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {t('welcomeToOmni', 'Bem-vindo ao OMNISAAS')}
        </motion.h1>

        {/* Subtext description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
          className={`text-sm leading-relaxed max-w-xs sm:max-w-sm mb-8 font-medium ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {t('splashSubtext', 'O sistema inteligente para gerir o seu negócio e produtividade.')}
        </motion.p>

        {/* Discrete premium loading indicator */}
        <div className="w-48 h-[3px] rounded-full overflow-hidden relative bg-slate-200 dark:bg-slate-800/80">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
          />
        </div>
        
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-2 font-mono"
        >
          {t('loadingEngine', 'Iniciando Sistema...')}
        </motion.span>

        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.0, duration: 0.4 }}
          className="text-[10px] text-slate-450 dark:text-slate-500 mt-6 underline cursor-pointer hover:opacity-100 transition-opacity"
        >
          {t('clickToSkipHint', 'Clique em qualquer lugar para pular ➔')}
        </motion.span>
      </div>
    </motion.div>
  );
}
