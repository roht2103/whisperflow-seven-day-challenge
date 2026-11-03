import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Inbox,
  TrendingUp,
} from 'lucide-react';
import { HERO_VARIANTS, ABVariant } from '../utils/analytics';

interface VariantMetrics {
  variant: ABVariant;
  totalVisitors: number;
  avgScrollDepth: number;
  funnelDropoff: {
    awareness: number;
    interest: number;
    consideration: number;
    hire: number;
  };
  reachedContact: number;
  submittedCount: number;
  conversionRate: string;
  contactReachedRate: string;
}

export const ResultsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, VariantMetrics> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<'turso' | 'ephemeral' | null>(null);

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics/results');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch analytics results.');
      }
      setMetrics(data.results || null);
      setStorageMode(data.storageMode || (data.storage === 'turso' ? 'turso' : 'ephemeral'));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load results.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const variantA: VariantMetrics = metrics?.A || {
    variant: 'A',
    totalVisitors: 0,
    avgScrollDepth: 0,
    funnelDropoff: { awareness: 0, interest: 0, consideration: 0, hire: 0 },
    reachedContact: 0,
    submittedCount: 0,
    conversionRate: '0.0',
    contactReachedRate: '0.0',
  };

  const variantB: VariantMetrics = metrics?.B || {
    variant: 'B',
    totalVisitors: 0,
    avgScrollDepth: 0,
    funnelDropoff: { awareness: 0, interest: 0, consideration: 0, hire: 0 },
    reachedContact: 0,
    submittedCount: 0,
    conversionRate: '0.0',
    contactReachedRate: '0.0',
  };

  const totalVisitorsBoth = variantA.totalVisitors + variantB.totalVisitors;
  const totalSubmissionsBoth = variantA.submittedCount + variantB.submittedCount;

  return (
    <div className="min-h-screen bg-[#060709] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200 py-8 px-6 sm:px-12">
      {/* Minimal Top Header matching Portfolio Aesthetic */}
      <header className="max-w-6xl mx-auto flex items-center justify-between border-b border-white/10 pb-6 mb-10 text-xs font-mono">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="font-heading font-extrabold text-xl text-white hover:text-cyan-400 transition-colors tracking-tight focus:outline-none"
          >
            RT.
          </a>
          <span className="text-white/20">|</span>
          <span className="text-[11px] tracking-widest text-slate-400 uppercase hidden sm:inline">
            GROWTH TELEMETRY // REAL A/B TEST
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="rounded-none px-3 py-1.5 bg-[#090b0e] border border-amber-500/30 hover:border-amber-400 text-amber-300 text-[11px] transition-colors flex items-center gap-1.5"
          >
            <Inbox className="w-3.5 h-3.5 text-amber-400" />
            <span>SUBMISSIONS</span>
          </a>

          <button
            onClick={fetchResults}
            disabled={isLoading}
            className="rounded-none px-3 py-1.5 bg-[#090b0e] border border-white/15 hover:border-white/40 text-slate-300 text-[11px] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>REFRESH</span>
          </button>

          <a
            href="/"
            className="rounded-none px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO FUNNEL</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase block mb-1">
              HERO EXPERIMENT PERFORMANCE
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              A/B Telemetry Results
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="rounded-none px-4 py-2 bg-[#090b0e] border border-cyan-500/30 text-cyan-400">
              VISITORS: <strong className="text-white ml-1">{totalVisitorsBoth}</strong>
            </div>
            <div className="rounded-none px-4 py-2 bg-[#090b0e] border border-amber-500/30 text-amber-400">
              CONVERSIONS: <strong className="text-white ml-1">{totalSubmissionsBoth}</strong>
            </div>
          </div>
        </div>

        {/* Real Data Integrity & Engine Status Banner */}
        <div className="rounded-none p-4 bg-[#090b0e] border border-white/10 mb-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2 h-2 rounded-full ${
                storageMode === 'turso'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
              }`}
            />
            <span className="text-slate-300">
              {storageMode === 'turso'
                ? 'TURSO CLOUD SQLITE ACTIVE: Genuine telemetry persisting across all visitor sessions & incognito tabs.'
                : 'LOCAL / EPHEMERAL MODE: Telemetry recorded locally. On Vercel, connect Turso cloud SQLite to persist across lambdas.'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            ENGINE: {storageMode === 'turso' ? 'TURSO (PERSISTENT)' : 'LOCAL SQLITE'}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-none p-4 bg-red-950/30 border border-red-500/40 text-red-300 text-xs font-mono mb-6">
            {error}
          </div>
        )}

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* ================= VARIANT A ================= */}
          <div className="rounded-none p-6 sm:p-8 bg-[#090b0e] border border-cyan-500/30 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-cyan-400 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30">
                    A
                  </span>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 block">
                      HERO VARIANT A
                    </span>
                    <h3 className="font-heading font-extrabold text-xl text-white">
                      The Discovery Proposition
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-cyan-400 border border-cyan-500/25 px-2 py-0.5">
                  50% TRAFFIC
                </span>
              </div>

              {/* Exact Hero Copy */}
              <div className="rounded-none p-4 bg-[#050608] border border-white/5 mb-6">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  HERO LINE DISPLAYED:
                </span>
                <p className="font-heading font-semibold text-base text-cyan-200 leading-snug">
                  "{HERO_VARIANTS.A}"
                </p>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-none p-3.5 bg-[#050608] border border-white/10 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">VISITORS</span>
                  <span className="text-2xl font-mono font-extrabold text-white">
                    {variantA.totalVisitors}
                  </span>
                </div>
                <div className="rounded-none p-3.5 bg-[#050608] border border-cyan-500/25 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">AVG DEPTH</span>
                  <span className="text-2xl font-mono font-extrabold text-cyan-400">
                    {variantA.avgScrollDepth}%
                  </span>
                </div>
                <div className="rounded-none p-3.5 bg-[#050608] border border-emerald-500/25 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">CONVERSION</span>
                  <span className="text-2xl font-mono font-extrabold text-emerald-400">
                    {variantA.conversionRate}%
                  </span>
                </div>
              </div>

              {/* Funnel Progression Breakdown */}
              <div className="space-y-3 mb-6">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                  CHAMBER PROGRESSION REACH:
                </span>

                <div className="space-y-2.5 text-xs font-mono">
                  {/* Chamber 1 */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                      <span>01 Chances I took</span>
                      <span className="text-slate-400">{variantA.funnelDropoff.awareness}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-none overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-500"
                        style={{
                          width: `${
                            variantA.totalVisitors > 0
                              ? (variantA.funnelDropoff.awareness / variantA.totalVisitors) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Chamber 2 */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                      <span>02 Mistake Museum</span>
                      <span className="text-slate-400">{variantA.funnelDropoff.interest}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-none overflow-hidden">
                      <div
                        className="h-full bg-teal-400 transition-all duration-500"
                        style={{
                          width: `${
                            variantA.totalVisitors > 0
                              ? (variantA.funnelDropoff.interest / variantA.totalVisitors) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Chamber 3 */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                      <span>03 What I built</span>
                      <span className="text-slate-400">{variantA.funnelDropoff.consideration}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-none overflow-hidden">
                      <div
                        className="h-full bg-[#f87171] transition-all duration-500"
                        style={{
                          width: `${
                            variantA.totalVisitors > 0
                              ? (variantA.funnelDropoff.consideration / variantA.totalVisitors) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Chamber 4 */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                      <span>04 Hire Form</span>
                      <span className="text-slate-400">{variantA.funnelDropoff.hire}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-none overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-500"
                        style={{
                          width: `${
                            variantA.totalVisitors > 0
                              ? (variantA.funnelDropoff.hire / variantA.totalVisitors) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom summary */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Reached Contact: <strong className="text-white">{variantA.reachedContact}</strong></span>
              <span className="text-emerald-400">Submitted: <strong className="text-white">{variantA.submittedCount}</strong></span>
            </div>
          </div>

          {/* ================= VARIANT B ================= */}
          <div className="rounded-none p-6 sm:p-8 bg-[#090b0e] border border-amber-500/30 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-amber-500 px-2 py-1 bg-amber-500/10 border border-amber-500/30">
                    B
                  </span>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 block">
                      HERO VARIANT B
                    </span>
                    <h3 className="font-heading font-extrabold text-xl text-white">
                      The Credential Proposition
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-amber-400 border border-amber-500/25 px-2 py-0.5">
                  50% TRAFFIC
                </span>
              </div>

              {/* Exact Hero Copy */}
              <div className="rounded-none p-4 bg-[#050608] border border-white/5 mb-6">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  HERO LINE DISPLAYED:
                </span>
                <p className="font-heading font-semibold text-base text-amber-200 leading-snug">
                  "{HERO_VARIANTS.B}"
                </p>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-none p-3.5 bg-[#050608] border border-white/10 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">VISITORS</span>
                  <span className="text-2xl font-mono font-extrabold text-white">
                    {variantB.totalVisitors}
                  </span>
                </div>
                <div className="rounded-none p-3.5 bg-[#050608] border border-amber-500/25 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">AVG DEPTH</span>
                  <span className="text-2xl font-mono font-extrabold text-amber-400">
                    {variantB.avgScrollDepth}%
                  </span>
                </div>
                <div className="rounded-none p-3.5 bg-[#050608] border border-emerald-500/25 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">CONVERSION</span>
                  <span className="text-2xl font-mono font-extrabold text-emerald-400">
                    {variantB.conversionRate}%
                  </span>
                </div>
              </div>

              {/* Funnel Progression Breakdown */}
              <div className="space-y-3 mb-6">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                  CHAMBER PROGRESSION REACH:
                </span>

                <div className="space-y-2.5 text-xs font-mono">
                  {/* Chamber 1 */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                      <span>01 Chances I took</span>
                      <span className="text-slate-400">{variantB.funnelDropoff.awareness}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-none overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-500"
                        style={{
                          width: `${
                            variantB.totalVisitors > 0
                              ? (variantB.funnelDropoff.awareness / variantB.totalVisitors) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Chamber 2 */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                      <span>02 Mistake Museum</span>
                      <span className="text-slate-400">{variantB.funnelDropoff.interest}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-none overflow-hidden">
                      <div
                        className="h-full bg-teal-400 transition-all duration-500"
                        style={{
                          width: `${
                            variantB.totalVisitors > 0
                              ? (variantB.funnelDropoff.interest / variantB.totalVisitors) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Chamber 3 */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                      <span>03 What I built</span>
                      <span className="text-slate-400">{variantB.funnelDropoff.consideration}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-none overflow-hidden">
                      <div
                        className="h-full bg-[#f87171] transition-all duration-500"
                        style={{
                          width: `${
                            variantB.totalVisitors > 0
                              ? (variantB.funnelDropoff.consideration / variantB.totalVisitors) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Chamber 4 */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                      <span>04 Hire Form</span>
                      <span className="text-slate-400">{variantB.funnelDropoff.hire}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-none overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-500"
                        style={{
                          width: `${
                            variantB.totalVisitors > 0
                              ? (variantB.funnelDropoff.hire / variantB.totalVisitors) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom summary */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Reached Contact: <strong className="text-white">{variantB.reachedContact}</strong></span>
              <span className="text-emerald-400">Submitted: <strong className="text-white">{variantB.submittedCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Statistical Summary Box */}
        <div className="rounded-none p-6 bg-[#090b0e] border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2 mb-2 text-white font-bold">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>GROWTH FUNNEL VERDICT:</span>
          </div>
          <p className="text-slate-400 leading-relaxed font-light">
            {totalVisitorsBoth === 0 ? (
              'Awaiting visitor traffic to establish statistical significance between Variant A (Discovery) and Variant B (Credentials).'
            ) : parseFloat(variantA.conversionRate) > parseFloat(variantB.conversionRate) ? (
              `Variant A is leading with a ${variantA.conversionRate}% form conversion rate vs ${variantB.conversionRate}% for Variant B.`
            ) : parseFloat(variantB.conversionRate) > parseFloat(variantA.conversionRate) ? (
              `Variant B is leading with a ${variantB.conversionRate}% form conversion rate vs ${variantA.conversionRate}% for Variant A.`
            ) : (
              `Both variants are performing identically at ${variantA.conversionRate}% conversion with ${totalVisitorsBoth} total tracked visitors.`
            )}
          </p>
        </div>
      </main>
    </div>
  );
};
