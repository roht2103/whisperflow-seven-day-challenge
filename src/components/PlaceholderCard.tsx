import React, { useState } from 'react';
import { Copy, Check, Sparkles, HelpCircle } from 'lucide-react';

interface PlaceholderCardProps {
  title: string;
  category: string;
  helperText: string;
  suggestedFields?: string[];
  accentColor?: 'cyan' | 'amber';
  icon?: React.ReactNode;
}

export const PlaceholderCard: React.FC<PlaceholderCardProps> = ({
  title,
  category,
  helperText,
  suggestedFields = [],
  accentColor = 'amber',
  icon,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyTag = () => {
    navigator.clipboard.writeText(`[PLACEHOLDER: ${title}]`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCyan = accentColor === 'cyan';

  return (
    <div
      className={`relative rounded-xl border border-dashed transition-all duration-300 p-6 bg-[#0c0e15]/92 backdrop-blur-xl shadow-xl ${
        isCyan
          ? 'border-cyan-500/35 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]'
          : 'border-amber-500/35 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]'
      } group`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${
              isCyan ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            {icon || <Sparkles className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block">
              {category}
            </span>
            <h4 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors">
              {title}
            </h4>
          </div>
        </div>

        <button
          onClick={handleCopyTag}
          title="Copy placeholder reference tag"
          className="text-xs font-mono text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/10 transition-colors flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Tag</span>
            </>
          )}
        </button>
      </div>

      {/* Helper Explanation */}
      <p className="text-sm text-slate-300/80 leading-relaxed mb-4 font-normal">
        {helperText}
      </p>

      {/* Suggested Fields or Prompts */}
      {suggestedFields.length > 0 && (
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span className="font-mono uppercase tracking-wider text-[10px]">
              Recommended data to slot in:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedFields.map((field, idx) => (
              <span
                key={idx}
                className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                  isCyan
                    ? 'border-cyan-500/20 bg-cyan-500/5 text-cyan-300'
                    : 'border-amber-500/20 bg-amber-500/5 text-amber-300'
                }`}
              >
                + {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty State visual indicator */}
      <div className="mt-4 flex items-center justify-between py-2 px-3 rounded-lg bg-black/40 border border-white/5 text-xs font-mono text-slate-400">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Status: Awaiting Rohit's Content</span>
        </span>
        <span className="text-slate-500 text-[11px]">[READY TO POPULATE]</span>
      </div>
    </div>
  );
};

