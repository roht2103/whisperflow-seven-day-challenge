import React from 'react';
import { ChamberId } from '../types/funnel';

interface FunnelProgressHUDProps {
  activeChamber: ChamberId | 'hero';
  onNavigate: (id: string) => void;
}

export const FunnelProgressHUD: React.FC<FunnelProgressHUDProps> = ({
  activeChamber,
  onNavigate,
}) => {
  const stages: Array<{
    id: ChamberId;
    num: string;
    colorClass: string;
  }> = [
    { id: 'awareness', num: '01', colorClass: 'text-amber-400 bg-amber-400 shadow-[0_0_10px_#f59e0b]' },
    { id: 'interest', num: '02', colorClass: 'text-teal-400 bg-teal-400 shadow-[0_0_10px_#14b8a6]' },
    { id: 'consideration', num: '03', colorClass: 'text-coral-400 bg-[#f87171] shadow-[0_0_10px_#f87171]' },
    { id: 'hire', num: '04', colorClass: 'text-amber-400 bg-amber-400 shadow-[0_0_10px_#f59e0b]' },
  ];

  return (
    <aside
      aria-label="Chamber Progress Rail"
      className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-end gap-5 text-xs font-mono pointer-events-auto"
    >
      {stages.map((st) => {
        const isActive =
          activeChamber === st.id || (activeChamber === 'hero' && st.id === 'awareness');

        return (
          <button
            key={st.id}
            onClick={() => onNavigate(st.id)}
            className="group flex items-center gap-2.5 focus:outline-none cursor-pointer transition-all"
            title={`Jump to Chamber ${st.num}`}
          >
            <span
              className={`text-[11px] font-mono tracking-widest transition-colors ${
                isActive ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-300'
              }`}
            >
              {st.num}
            </span>

            {/* Glowing Dot */}
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                isActive ? st.colorClass : 'bg-slate-400 group-hover:bg-slate-300'
              }`}
            />
          </button>
        );
      })}
    </aside>
  );
};
