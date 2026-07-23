import React from 'react';
import logoPng from '../assets/images/logo.png';
import faviconPng from '../assets/images/favicon.png';

interface OmniSaaSLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function OmniSaaSLogo({ className = '', showText = true, size = 'md' }: OmniSaaSLogoProps) {
  const logoHeights = {
    sm: 'h-8 max-h-8',
    md: 'h-11 max-h-11',
    lg: 'h-16 max-h-16',
    xl: 'h-24 max-h-24'
  };

  const primarySrc = showText ? logoPng : faviconPng;
  const fallbackSrc = showText ? '/assets/images/logo.png' : '/assets/images/favicon.png';

  return (
    <div className={`inline-flex items-center justify-center select-none relative ${className}`} id="life4billion-logo-container">
      <img 
        src={primarySrc} 
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = fallbackSrc;
        }}
        alt="Life4Billion" 
        referrerPolicy="no-referrer"
        className={`${logoHeights[size]} w-auto object-contain transition-transform duration-200`}
      />
    </div>
  );
}
