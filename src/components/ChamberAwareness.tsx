import React from 'react';

export const ChamberAwareness: React.FC = () => {
  const cards = [
    {
      index: '01',
      text: 'I took an AI/ML internship on an on-device AI project running on a Raspberry Pi 5, moving from web development into real-world machine learning.',
    },
    {
      index: '02',
      text: 'I built CodeGuard, a full static code analysis SaaS, from scratch, with secure JWT authentication, a Spring Boot backend, and a live vulnerability dashboard.',
    },
    {
      index: '03',
      text: 'I am an engineering student applying for a growth role, and I built this entire portfolio by voice instead of by typing, because I would rather prove what I can do than list it.',
    },
  ];

  return (
    <section
      id="awareness"
      className="relative min-h-screen py-24 px-6 sm:px-12 flex flex-col justify-between z-10"
    >
      {/* Top Row: Stage Indicator on Left */}
      <div className="max-w-6xl mx-auto w-full flex items-start justify-between">
        <div className="text-left">
          <div className="font-heading font-extrabold text-4xl sm:text-5xl text-amber-500 tracking-tight leading-none mb-1">
            01
          </div>
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            THE FIRST SIGNAL
          </div>
        </div>
      </div>

      {/* Center: Giant Centered Title & 3 Sharp Cards */}
      <div className="max-w-5xl mx-auto w-full my-auto text-center">
        {/* Giant Centered Headline matching Screenshot 2 */}
        <h2 className="font-heading font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] tracking-tighter text-white mb-16 leading-[0.92]">
          <span className="block">Chances I</span>
          <span className="block">took</span>
        </h2>

        {/* 3 Sharp Framed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {cards.map((card) => (
            <div
              key={card.index}
              className="rounded-none p-7 bg-[#0b0c0f]/80 backdrop-blur-md border border-amber-500/25 hover:border-amber-500/60 transition-all duration-300 flex flex-col justify-start"
            >
              <span className="font-mono font-bold text-xs text-amber-500 mb-4 block">
                {card.index}
              </span>
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Chamber Indicator on Right matching Screenshot 2 */}
      <div className="max-w-6xl mx-auto w-full flex justify-end">
        <div className="text-right font-mono">
          <div className="text-[10px] tracking-widest text-slate-400 uppercase">
            CHAMBER
          </div>
          <div className="font-bold text-lg text-amber-500 leading-tight">
            01
          </div>
        </div>
      </div>
    </section>
  );
};
