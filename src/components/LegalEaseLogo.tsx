import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const LegalEaseLogo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className="flex flex-col items-center justify-center text-center select-none">
      <div className="flex items-center gap-2.5">
        {/* SVG Scales of Justice Icon */}
        <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-amber-500/20 via-blue-600/10 to-indigo-500/20 border border-amber-500/30 shadow-inner">
          <svg
            className={`${iconSizes[size]} text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Center Pillar */}
            <path d="M12 3v18" />
            <path d="M8 21h8" />
            <circle cx="12" cy="3" r="1.5" fill="currentColor" />
            
            {/* Crossbeam */}
            <path d="M4 7h16" />
            
            {/* Left Pan */}
            <path d="M4 7l-2 5h8l-2-5" />
            <path d="M2 12c0 2 2 3.5 4 3.5s4-1.5 4-3.5" />
            
            {/* Right Pan */}
            <path d="M20 7l-2 5h8l-2-5" />
            <path d="M14 12c0 2 2 3.5 4 3.5s4-1.5 4-3.5" />
          </svg>
        </div>

        <div className="text-left">
          <span className={`font-serif font-bold tracking-tight bg-gradient-to-r from-slate-100 via-amber-100 to-amber-300 bg-clip-text text-transparent ${textSizes[size]}`}>
            LegalEase
          </span>
          <span className="ml-1.5 text-xs uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            AI Core
          </span>
        </div>
      </div>

      {showSubtitle && (
        <h2 className="mt-2 text-sm sm:text-base font-medium tracking-wide text-slate-400">
          AI Legal Document Generator
        </h2>
      )}
    </div>
  );
};
