import React from 'react';

interface OmniSaaSLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function OmniSaaSLogo({ className = '', showText = true, size = 'md' }: OmniSaaSLogoProps) {
  // Define dimensions based on size
  const sizes = {
    sm: { iconWidth: 32, iconHeight: 24, fontSize: 'text-lg', subtitleSize: 'text-[8px]' },
    md: { iconWidth: 44, iconHeight: 34, fontSize: 'text-2xl', subtitleSize: 'text-[10px]' },
    lg: { iconWidth: 64, iconHeight: 50, fontSize: 'text-3xl', subtitleSize: 'text-xs' },
    xl: { iconWidth: 96, iconHeight: 74, fontSize: 'text-5xl', subtitleSize: 'text-sm' }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`} id="omnisaas-logo-container">
      {/* Cloud & Lifebuoy Emblem */}
      <svg 
        width={currentSize.iconWidth} 
        height={currentSize.iconHeight} 
        viewBox="0 0 100 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer Cloud Contour */}
        <path 
          d="M74 38.5C74 32.7 69.3 28 63.5 28C62.8 28 62.1 28.1 61.5 28.2C58.1 19.3 49.5 13 39.5 13C26.5 13 16 23.5 16 36.5C16 37.3 16.1 38.1 16.2 38.9C7.2 40.5 0.5 48.4 0.5 58C0.5 68.8 9.2 77.5 20 77.5H74C83.7 77.5 91.5 69.7 91.5 60C91.5 50.8 84.4 43.2 74 38.5Z" 
          stroke="#1E73BE" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="transparent"
        />
        {/* Central Steering Wheel / Lifebuoy / Circle with spokes */}
        <circle 
          cx="45" 
          cy="52" 
          r="17" 
          stroke="#1E73BE" 
          strokeWidth="6" 
          className="fill-slate-950 [.light-theme_&]:fill-white transition-colors duration-200"
        />
        {/* Hub Spokes Details */}
        <circle cx="45" cy="52" r="6" fill="#1E73BE" />
        
        {/* Connection Spokes Nodes */}
        <line x1="45" y1="35" x2="45" y2="46" stroke="#1E73BE" strokeWidth="4" strokeLinecap="round" />
        <line x1="45" y1="58" x2="45" y2="69" stroke="#1E73BE" strokeWidth="4" strokeLinecap="round" />
        <line x1="28" y1="52" x2="39" y2="52" stroke="#1E73BE" strokeWidth="4" strokeLinecap="round" />
        <line x1="51" y1="52" x2="62" y2="52" stroke="#1E73BE" strokeWidth="4" strokeLinecap="round" />

        {/* Outer Node Pins */}
        <circle cx="45" cy="35" r="3" className="fill-white [.light-theme_&]:fill-slate-950 transition-colors duration-200" />
        <circle cx="45" cy="69" r="3" className="fill-white [.light-theme_&]:fill-slate-950 transition-colors duration-200" />
        <circle cx="28" cy="52" r="3" className="fill-white [.light-theme_&]:fill-slate-950 transition-colors duration-200" />
        <circle cx="62" cy="52" r="3" className="fill-white [.light-theme_&]:fill-slate-950 transition-colors duration-200" />
      </svg>

      {/* Stylized Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline">
            <span className={`${currentSize.fontSize} font-extrabold text-slate-100 [.light-theme_&]:text-slate-900 tracking-tight transition-colors duration-200`}>
              omni
            </span>
            <span className={`${currentSize.fontSize} font-bold text-[#1E73BE] tracking-tight`}>
              SaaS
            </span>
          </div>
          <span className={`${currentSize.subtitleSize} text-slate-400 [.light-theme_&]:text-slate-500 font-medium tracking-wide mt-1 block font-sans transition-colors duration-200`}>
            Life & Business. One System
          </span>
        </div>
      )}
    </div>
  );
}
