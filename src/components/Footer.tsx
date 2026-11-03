import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-white/5 py-12 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-4">
      <div>
        ROHIT THORAT / PRODUCT LAUNCH FUNNEL
      </div>

      <div className="flex items-center gap-6 text-[11px]">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="hover:text-white transition-colors uppercase"
        >
          TOP ↑
        </button>
      </div>
    </footer>
  );
};
