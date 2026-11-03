import React, { useState } from 'react';

interface MuseumMistake {
  id: string;
  label: string; // e.g. "MISTAKE 01"
  title: string;
  whatWentWrong: string;
  whatItCostMe: string;
  whatIChanged: string;
}

interface ChamberInterestProps {
  activeIndex?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onModalChange?: (isOpen: boolean) => void;
}

export const ChamberInterest: React.FC<ChamberInterestProps> = ({
  activeIndex: propActiveIndex,
  onPrev,
  onNext,
  onModalChange,
}) => {
  const [localActiveIndex, setLocalActiveIndex] = useState(0);
  const activeIndex = propActiveIndex !== undefined ? propActiveIndex : localActiveIndex;

  const [isExamining, setIsExamining] = useState(false);

  const mistakes: MuseumMistake[] = [
    {
      id: '01',
      label: 'MISTAKE 01',
      title: 'the chat app',
      whatWentWrong:
        'in my 2024 chat project I added features like sentiment feedback and scheduled messages because they were exciting to build, without asking whether anyone needed them.',
      whatItCostMe: 'time spent on features with no proof of demand.',
      whatIChanged:
        'I now define who a feature is for and what problem it solves before I write any code.',
    },
    {
      id: '02',
      label: 'MISTAKE 02',
      title: 'building without a plan for users',
      whatWentWrong:
        'I built four products but never planned how anyone would find them.',
      whatItCostMe: 'good work that nobody could see.',
      whatIChanged:
        'I now think about distribution at the start of a project, and it is the reason I am applying to a growth role.',
    },
    {
      id: '03',
      label: 'MISTAKE 03',
      title: 'shortcuts on the hard parts',
      whatWentWrong:
        'on projects with authentication and third-party APIs, such as the YouTube dashboard, I treated login and API limits as details to sort out later.',
      whatItCostMe: 'rework once the real constraints showed up.',
      whatIChanged:
        'I now handle the riskiest parts, like auth and external services, first.',
    },
  ];

  const handleOpenExamining = () => {
    setIsExamining(true);
    onModalChange?.(true);
  };

  const handleCloseExamining = () => {
    setIsExamining(false);
    onModalChange?.(false);
  };

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else {
      setLocalActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      setLocalActiveIndex((prev) => (prev < mistakes.length - 1 ? prev + 1 : prev));
    }
  };

  const current = mistakes[activeIndex] || mistakes[0];

  return (
    <section
      id="interest"
      className="relative min-h-screen h-screen py-12 sm:py-20 px-6 sm:px-12 flex flex-col justify-between z-10 select-none overflow-hidden"
    >
      {/* Top Center Eyebrow matching Screenshot 3 */}
      <div className="max-w-6xl mx-auto w-full flex items-start justify-between">
        <div className="text-left">
          <div className="font-heading font-extrabold text-4xl sm:text-5xl text-teal-400 tracking-tight leading-none mb-1">
            02
          </div>
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            THE PULL
          </div>
        </div>

        <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase hidden sm:block">
          INTEREST / A MISTAKE MUSEUM
        </div>

        <div className="w-12 hidden sm:block" />
      </div>

      {/* Center: Title & Museum Frame */}
      <div className="max-w-4xl mx-auto w-full my-auto text-center flex flex-col items-center">
        {/* Headline: Mistake (white) / Museum (teal) */}
        <h2 className="font-heading font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] tracking-tighter text-white mb-2 leading-[0.92]">
          <span className="block text-white">Mistake</span>
          <span className="block text-teal-400">Museum</span>
        </h2>

        {/* Minimal Subhead with Scroll Guidance */}
        <p className="text-xs sm:text-sm font-mono text-slate-400 mb-8 sm:mb-10">
          Scroll through the room. Look closely.
        </p>

        {/* Framed Artwork Display with Spotlight Cone matching Screenshot 3 */}
        <div className="relative flex flex-col items-center mb-6">
          {/* Spotlight Label & Cone */}
          <div className="relative mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-teal-400 transition-all duration-300">
              {current.label}
            </span>
            <div className="w-24 h-6 mx-auto bg-gradient-to-b from-teal-500/25 to-transparent blur-sm" />
          </div>

          {/* Golden Framed Artwork (Sharp corners!) */}
          <button
            onClick={handleOpenExamining}
            className="group relative rounded-none p-2 sm:p-2.5 bg-[#0b0c0f] border-2 border-amber-600/70 hover:border-amber-500 transition-all duration-500 cursor-pointer shadow-[0_0_35px_rgba(0,0,0,0.85)] focus:outline-none"
          >
            {/* Inner display box with subtle teal border and keyframe transition */}
            <div
              key={current.id}
              className="w-[300px] sm:w-[480px] h-[155px] sm:h-[185px] rounded-none bg-[#07090b] border border-teal-500/30 group-hover:border-teal-500/60 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center animate-fade-in"
            >
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mb-2.5 transition-all duration-300">
                {current.title}
              </h3>
              <span className="text-[10px] font-mono tracking-widest text-teal-400 group-hover:text-teal-300 uppercase transition-colors">
                CLICK TO EXAMINE
              </span>
            </div>
          </button>
        </div>

        {/* Gallery Navigation Controls: ← 01 / 03 → (clickable & reflects scroll) */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mb-8 sm:mb-10">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full border border-teal-500/30 hover:border-teal-400 flex items-center justify-center text-teal-400 hover:text-white transition-colors cursor-pointer"
            title="Previous exhibit (scroll up)"
          >
            ←
          </button>
          <span className="tracking-wider">
            0{activeIndex + 1} / 0{mistakes.length}
          </span>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full border border-teal-500/30 hover:border-teal-400 flex items-center justify-center text-teal-400 hover:text-white transition-colors cursor-pointer"
            title="Next exhibit (scroll down)"
          >
            →
          </button>
        </div>

        {/* Bottom Center Line matching Screenshot 3 */}
        <p className="text-xs sm:text-sm text-slate-300 font-light max-w-xl text-center">
          Every mistake here taught me to start from the user, not from the code.
        </p>
      </div>

      {/* Bottom Row: Chamber Indicator on Right matching Screenshot 3 */}
      <div className="max-w-6xl mx-auto w-full flex justify-end">
        <div className="text-right font-mono">
          <div className="text-[10px] tracking-widest text-slate-400 uppercase">
            CHAMBER
          </div>
          <div className="font-bold text-lg text-teal-400 leading-tight">
            02
          </div>
        </div>
      </div>

      {/* ================= EXACT DETAIL MODAL MATCHING SCREENSHOT 4 ================= */}
      {isExamining && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={handleCloseExamining}
        >
          {/* Top Center Tag & Top Right Close matching Screenshot 4 */}
          <div className="fixed top-8 left-1/2 -translate-x-1/2 text-[11px] font-mono tracking-widest text-slate-400 uppercase hidden sm:block">
            INTEREST / A MISTAKE MUSEUM
          </div>

          <button
            onClick={handleCloseExamining}
            className="fixed top-8 right-8 text-slate-400 hover:text-white text-lg font-mono cursor-pointer"
            title="Close"
          >
            ✕
          </button>

          {/* Sharp-Edged Modal Box matching Screenshot 4 */}
          <div
            className="relative w-full max-w-xl rounded-none bg-[#090b0e] border border-teal-500/40 p-8 sm:p-10 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 pb-5 border-b border-white/10">
              <span className="text-[10px] font-mono tracking-widest text-teal-400 uppercase block mb-1">
                {current.label}
              </span>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                {current.title}
              </h3>
            </div>

            {/* Part 1: What went wrong */}
            <div className="mb-6 pb-5 border-b border-white/10">
              <span className="text-[10px] font-mono tracking-widest text-teal-400 uppercase block mb-2 font-semibold">
                WHAT WENT WRONG
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {current.whatWentWrong}
              </p>
            </div>

            {/* Part 2: What it cost me */}
            <div className="mb-6 pb-5 border-b border-white/10">
              <span className="text-[10px] font-mono tracking-widest text-teal-400 uppercase block mb-2 font-semibold">
                WHAT IT COST ME
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {current.whatItCostMe}
              </p>
            </div>

            {/* Part 3: What I changed afterwards */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-teal-400 uppercase block mb-2 font-semibold">
                WHAT I CHANGED AFTERWARDS
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {current.whatIChanged}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
