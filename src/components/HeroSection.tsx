import React from 'react';
import { ABVariant } from '../utils/analytics';

interface HeroSectionProps {
  heroLine: string;
  variant: ABVariant;
  onEnterFunnel: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  heroLine,
  variant,
  onEnterFunnel,
}) => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between px-6 sm:px-16 pt-32 pb-16 z-10"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto">
        {/* Left Column: Hero Content */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left">
          {/* Eyebrow Tag: ● A PORTFOLIO, IN MOTION */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400">
              A PORTFOLIO, IN MOTION
            </span>
          </div>

          {/* Main Headline (Exact text requested from Screenshot 1) */}
          <h1 className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.96] tracking-tighter text-white mb-8">
            <span className="block text-white">Turn attention</span>
            <span className="block text-amber-500">into action.</span>
          </h1>

          {/* Arranged Proposition Text (A/B Test Variant) & Subtitle */}
          <div className="mb-10 max-w-lg">
            <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed mb-3">
              "{heroLine}"
            </p>
            <div className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
              <p>A product launch funnel for a growth-minded engineer.</p>
              <p className="text-slate-500">Scroll to enter.</p>
            </div>
          </div>

          {/* CTA Link: —— BEGIN THE JOURNEY ↓ */}
          <div className="flex items-center gap-3">
            <button
              onClick={onEnterFunnel}
              className="group flex items-center gap-3 text-xs font-mono tracking-wider text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              <span className="w-8 h-[1px] bg-slate-500 group-hover:bg-amber-400 group-hover:w-12 transition-all duration-300" />
              <span className="font-semibold uppercase">BEGIN THE JOURNEY</span>
              <span className="text-amber-400 group-hover:translate-y-1 transition-transform">↓</span>
            </button>
          </div>
        </div>

        {/* Right Column: Kept open for the 3D Funnel Animation */}
        <div className="hidden lg:block lg:col-span-5 pointer-events-none" />
      </div>

      {/* Bottom Left Accent Line */}
      <div className="w-[2px] h-6 bg-amber-500/80 ml-2 hidden sm:block" />
    </section>
  );
};
