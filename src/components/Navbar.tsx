import React from 'react';
import { ChamberId } from '../types/funnel';

interface NavbarProps {
  activeChamber: ChamberId | 'hero';
  onNavigate: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeChamber, onNavigate }) => {
  const chamberMap: Record<ChamberId | 'hero', string> = {
    hero: '01 / 04',
    awareness: '01 / 04',
    interest: '02 / 04',
    consideration: '03 / 04',
    hire: '04 / 04',
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 py-6 flex items-center justify-between text-xs font-mono pointer-events-auto">
      {/* Brand: RT. */}
      <button
        onClick={() => onNavigate('hero')}
        className="font-heading font-extrabold text-lg text-white hover:text-amber-400 transition-colors tracking-tight focus:outline-none cursor-pointer"
      >
        RT.
      </button>

      {/* Top Center: PRODUCT / ROHIT THORAT */}
      <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase hidden sm:block">
        PRODUCT / ROHIT THORAT
      </div>

      {/* Top Right: Chamber Index */}
      <div className="flex items-center text-xs font-mono text-slate-400">
        <span className="text-amber-400 font-semibold tracking-wider">
          {chamberMap[activeChamber]}
        </span>
      </div>
    </header>
  );
};
