import React, { useState } from 'react';

interface Project {
  index: string;
  name: string;
  timeline: string;
  badge: string;
  description: string;
  techStack: string[];
}

interface ChamberConsiderationProps {
  onModalChange?: (isOpen: boolean) => void;
}

export const ChamberConsideration: React.FC<ChamberConsiderationProps> = ({
  onModalChange,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleOpenProject = (p: Project) => {
    setSelectedProject(p);
    onModalChange?.(true);
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
    onModalChange?.(false);
  };

  const projects: Project[] = [
    {
      index: '01',
      name: 'SpaceFit AI',
      timeline: 'February to March 2026',
      badge: 'FEATURED',
      description:
        'An AI-powered office floor plan test-fit engine that generates optimized workspace layouts from room dimensions. It fits desks, meeting rooms, and zones into any floor plan, has an interactive floor plan visualizer with real-time rendering, and gives instant capacity and utilization insights.',
      techStack: ['React', 'Claude API', 'Python', 'TypeScript'],
    },
    {
      index: '02',
      name: 'CodeGuard',
      timeline: 'April 2026',
      badge: 'FEATURED',
      description:
        'A full-stack platform for static code analysis. It has secure authentication with Spring Security and JWT, a real-time code quality dashboard styled with Tailwind CSS, and a REST API with PostgreSQL storage.',
      techStack: ['React', 'Spring Boot', 'PostgreSQL', 'Tailwind CSS', 'Java'],
    },
    {
      index: '03',
      name: 'YouTube Companion Dashboard',
      timeline: '2025',
      badge: 'FEATURED',
      description:
        'A YouTube management platform with video editing, comment moderation, and OAuth authentication. It uses the YouTube Data API v3 and Clerk authentication with activity tracking.',
      techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'YouTube API', 'Clerk'],
    },
    {
      index: '04',
      name: 'Positive and Scheduled Chat Experience System',
      timeline: '2024',
      badge: 'FEATURED',
      description:
        'A chat app with real-time sentiment analysis that gives feedback on message tone, plus scheduled messaging with planned delivery.',
      techStack: ['React.js', 'JavaScript', 'sentiment analysis', 'WebSocket'],
    },
  ];

  return (
    <section
      id="consideration"
      className="relative min-h-screen py-8 sm:py-12 px-6 sm:px-12 flex flex-col justify-between z-10"
    >
      {/* Top Row: Stage Indicator on Left matching Screenshot 5 */}
      <div className="max-w-6xl mx-auto w-full flex items-start justify-between mb-2">
        <div className="text-left">
          <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[#f87171] tracking-tight leading-none mb-1">
            03
          </div>
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            THE TURN
          </div>
        </div>
      </div>

      {/* Center: Title & 2x2 Grid matching Screenshot 5 */}
      <div className="max-w-4xl mx-auto w-full my-auto text-center flex flex-col items-center">
        {/* Centered Headline: What I built */}
        <h2 className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tighter text-white mb-5 sm:mb-7 leading-[0.92]">
          <span className="block">What I</span>
          <span className="block">built</span>
        </h2>

        {/* 2x2 Sharp Grid matching Screenshot 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full text-left mb-5 sm:mb-7">
          {projects.map((p) => (
            <div
              key={p.index}
              onClick={() => handleOpenProject(p)}
              className="group cursor-pointer rounded-none p-4 sm:p-5 bg-[#0d090a]/85 backdrop-blur-md border border-[#f87171]/25 hover:border-[#f87171]/60 transition-all duration-300 flex flex-col justify-between min-h-[140px] sm:min-h-[155px]"
            >
              <div>
                {/* Top Row: Index + Timeline */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono font-bold text-xs text-[#f87171]">
                    {p.index}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {p.timeline}
                  </span>
                </div>

                {/* Project Title */}
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white group-hover:text-[#f87171] transition-colors mb-0.5">
                  {p.name}
                </h3>

                {/* Badge: FEATURED */}
                <div className="text-[9px] font-mono text-slate-400 tracking-wider mb-3">
                  {p.badge}
                </div>
              </div>

              {/* Tech Stack Tags matching Screenshot 5 */}
              <div className="flex flex-wrap gap-1 mt-auto">
                {p.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Center Line matching Screenshot 5 */}
        <p className="text-xs sm:text-[13px] text-slate-300 font-light max-w-2xl text-center leading-relaxed">
          I have built four products from scratch. The part I have not solved yet is getting people to find and use them. Growth is where building meets people, and that is the skill I want to learn by doing.
        </p>
      </div>

      {/* Bottom Row: Chamber Indicator on Right matching Screenshot 5 */}
      <div className="max-w-6xl mx-auto w-full flex justify-end mt-2">
        <div className="text-right font-mono">
          <div className="text-[10px] tracking-widest text-slate-400 uppercase">
            CHAMBER
          </div>
          <div className="font-bold text-lg text-[#f87171] leading-tight">
            03
          </div>
        </div>
      </div>

      {/* Optional Sharp Detail Modal on Click */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={handleCloseProject}
        >
          <div
            className="relative w-full max-w-lg rounded-none bg-[#090b0e] border border-[#f87171]/40 p-8 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseProject}
              className="absolute top-6 right-6 text-slate-400 hover:text-white text-lg font-mono cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-[#f87171] mb-2">
              <span>{selectedProject.index}</span>
              <span>•</span>
              <span>{selectedProject.timeline}</span>
            </div>

            <h3 className="font-heading font-extrabold text-2xl text-white mb-4">
              {selectedProject.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
              {selectedProject.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {selectedProject.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
