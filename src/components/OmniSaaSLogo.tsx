import React from 'react';
import logoPng from '../assets/images/logo.png';

interface OmniSaaSLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function OmniSaaSLogo({ className = '', size = 'md' }: OmniSaaSLogoProps) {
  const logoHeights = {
    sm: 'h-12 max-h-12',
    md: 'h-16 max-h-16',
    lg: 'h-24 max-h-24',
    xl: 'h-36 max-h-36'
  };

  const primarySrc = logoPng || '/logo.png';
  const fallbackSrc = '/assets/images/logo.png';

  return (
    <div className={`inline-flex items-center justify-center select-none relative ${className}`} id="life4billion-logo-container">
      <img 
        src={primarySrc} 
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.onerror = null;
          target.src = fallbackSrc;
        }}
        alt="Life4Billion" 
        referrerPolicy="no-referrer"
        className={`${logoHeights[size]} w-auto object-contain transition-transform duration-200 shrink-0`}
      />
    </div>
  );
}

