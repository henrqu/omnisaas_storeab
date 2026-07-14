import React from 'react';
import { useLanguageTheme } from '../utils/i18n';

const logoUrl = '/src/assets/images/logo.png';

interface OmniSaaSLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function OmniSaaSLogo({ className = '', showText = true, size = 'md' }: OmniSaaSLogoProps) {
  // Use context to detect current theme safely
  let theme = 'dark';
  try {
    const context = useLanguageTheme();
    theme = context?.theme || 'dark';
  } catch (e) {
    // Fallback if called outside provider
  }

  // Define responsive heights for the logo image based on size (substantially increased)
  const imageSizes = {
    sm: 'h-10 sm:h-12 md:h-14 lg:h-16 max-h-full',
    md: 'h-14 sm:h-16 md:h-20 lg:h-24 max-h-full',
    lg: 'h-24 sm:h-28 md:h-36 lg:h-44 max-h-full',
    xl: 'h-36 sm:h-40 md:h-48 lg:h-56 max-h-full'
  };

  const currentImageSizeClass = imageSizes[size];

  // In dark theme, we add a very soft, beautiful radial ambient glow behind the logo
  // to ensure readability, without any solid background container card.
  const glowOverlay = theme === 'dark' ? (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_70%)] pointer-events-none blur-md scale-125 z-0" />
  ) : null;

  return (
    <div className={`flex items-center justify-center select-none relative ${className}`} id="omnisaas-logo-container">
      {glowOverlay}
      <img
        src={logoUrl}
        alt="OmniSaaS Logo"
        className={`${currentImageSizeClass} w-auto object-contain relative z-10`}
        referrerPolicy="no-referrer"
        style={{ 
          objectFit: 'contain',
          backgroundColor: 'transparent'
        }}
      />
    </div>
  );
}

