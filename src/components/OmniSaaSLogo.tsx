import React, { useState } from 'react';
import { useTranslation } from '../utils/i18n';
const logoUrl = '/assets/images/logo.jpg';

interface OmniSaaSLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function OmniSaaSLogo({ className = '', showText = true, size = 'md' }: OmniSaaSLogoProps) {
  const [hasError, setHasError] = useState(false);
  // Use context to detect current theme safely
  let theme = 'dark';
  try {
    const context = useTranslation();
    theme = context?.theme || 'dark';
  } catch (e) {
    // Fallback if called outside provider
  }

  // Define responsive heights for the logo image based on size (perfectly scaled and balanced)
  const imageSizes = {
    sm: 'h-8 sm:h-9 md:h-10 max-h-full',
    md: 'h-11 sm:h-12 md:h-14 max-h-full',
    lg: 'h-16 sm:h-18 md:h-20 max-h-full',
    xl: 'h-24 sm:h-26 md:h-28 max-h-full'
  };

  const currentImageSizeClass = imageSizes[size];

  // In dark theme, we add a very soft, beautiful radial ambient glow behind the logo
  // to ensure readability, without any solid background container card.
  const glowOverlay = theme === 'dark' ? (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,rgba(99,102,241,0)_70%)] pointer-events-none blur-md scale-125 z-0" />
  ) : null;

  // If the theme is light, we can wrap the logo in a sleek dark glassmorphic badge to make it stand out beautifully 
  // on white/light backgrounds, completely preserving its original brand identity and blue/light-blue colors!
  const isLightTheme = theme === 'light';
  const themeWrapperClasses = isLightTheme
    ? 'bg-slate-950/95 border border-slate-800/80 shadow-md backdrop-blur-sm px-4 py-2.5 rounded-2xl flex items-center justify-center'
    : 'bg-transparent';

  // High-fidelity fallback SVG rendering that matches OmniSaaS theme & is 100% reliable
  const renderSvgLogo = () => {
    const iconSizes = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    };

    const textSizes = {
      sm: 'text-sm font-extrabold',
      md: 'text-lg font-black',
      lg: 'text-2xl font-black',
      xl: 'text-4xl font-black'
    };

    return (
      <div className="flex items-center space-x-2.5 z-10 select-none">
        {/* Glowing Geometric Hexagonal Core representing unified Business + Personal OS */}
        <div className={`relative ${iconSizes[size]} flex-shrink-0`}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(16,185,129,0.35)]">
            <defs>
              <linearGradient id="vectorLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" /> {/* Emerald */}
                <stop offset="50%" stopColor="#3b82f6" /> {/* Blue */}
                <stop offset="100%" stopColor="#6366f1" /> {/* Indigo */}
              </linearGradient>
            </defs>
            {/* Outer Hexagon frame */}
            <polygon 
              points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" 
              fill="none" 
              stroke="url(#vectorLogoGrad)" 
              strokeWidth="11" 
              strokeLinejoin="round"
            />
            {/* Core Orb representing central intelligence / OS */}
            <circle cx="50" cy="50" r="19" fill="url(#vectorLogoGrad)" />
            {/* Radial connectors to vertices */}
            <line x1="50" y1="5" x2="50" y2="31" stroke="url(#vectorLogoGrad)" strokeWidth="7" strokeLinecap="round" />
            <line x1="10" y1="72.5" x2="33" y2="60" stroke="url(#vectorLogoGrad)" strokeWidth="7" strokeLinecap="round" />
            <line x1="90" y1="72.5" x2="67" y2="60" stroke="url(#vectorLogoGrad)" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </div>
        {showText && (
          <span className={`${textSizes[size]} tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent font-bold`}>
            Omni<span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] font-black">SaaS</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`flex items-center justify-center select-none relative ${themeWrapperClasses} ${className}`} id="omnisaas-logo-container">
      {glowOverlay}
      {!hasError ? (
        <img
          src={logoUrl}
          alt="OmniSaaS Logo"
          className={`${currentImageSizeClass} w-auto object-contain relative z-10`}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          style={{ 
            objectFit: 'contain',
            backgroundColor: 'transparent'
          }}
        />
      ) : (
        renderSvgLogo()
      )}
    </div>
  );
}

