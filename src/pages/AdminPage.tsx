import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Mail,
  Building,
  Clock,
  BarChart3,
  ExternalLink,
  Trash2,
} from 'lucide-react';

interface Submission {
  id: number;
  name: string;
  email: string;
  company: string;
  message: string;
  created_at: string;
}

export const AdminPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch submissions.');
      }
      setSubmissions(data.submissions || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this submission from database?')) return;
    try {
      const res = await fetch(`/api/submissions?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete submission');
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting submission');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear ALL submissions? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/submissions?all=true`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clear all submissions');
      setSubmissions([]);
    } catch (err: any) {
      alert(err.message || 'Error clearing submissions');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#060709] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200 py-8 px-6 sm:px-12">
      {/* Minimal Top Header matching Portfolio Aesthetic */}
      <header className="max-w-6xl mx-auto flex items-center justify-between border-b border-white/10 pb-6 mb-10 text-xs font-mono">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="font-heading font-extrabold text-xl text-white hover:text-amber-400 transition-colors tracking-tight focus:outline-none"
          >
            RT.
          </a>
          <span className="text-white/20">|</span>
          <span className="text-[11px] tracking-widest text-slate-400 uppercase hidden sm:inline">
            ADMIN CONSOLE / SUBMISSIONS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/results"
            className="rounded-none px-3 py-1.5 bg-[#090b0e] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[11px] transition-colors flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>A/B RESULTS</span>
          </a>

          <button
            onClick={fetchSubmissions}
            disabled={isLoading}
            className="rounded-none px-3 py-1.5 bg-[#090b0e] border border-white/15 hover:border-white/40 text-slate-300 text-[11px] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>REFRESH</span>
          </button>

          <a
            href="/"
            className="rounded-none px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO FUNNEL</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {/* Section Heading & Metric Bar */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase block mb-1">
              CHAMBER 04 CONVERSIONS
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Recruiter Inquiries
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {/* {submissions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="rounded-none px-3 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-red-400 text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Wipe all submissions"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>CLEAR ALL</span>
              </button>
            )} */}
            <div className="rounded-none px-4 py-2 bg-[#090b0e] border border-amber-500/30 text-amber-400">
              TOTAL: <strong className="text-white ml-1">{submissions.length}</strong>
            </div>
            <div className="rounded-none px-3 py-2 bg-[#090b0e] border border-white/10 text-slate-400">
              SORT: <span className="text-slate-200 ml-1">NEWEST FIRST</span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-none p-4 bg-red-950/30 border border-red-500/40 text-red-300 text-xs font-mono mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && submissions.length === 0 && (
          <div className="rounded-none p-16 bg-[#090b0e] border border-white/10 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-3" />
            <p className="text-xs font-mono text-slate-400">Loading submissions from SQLite...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && submissions.length === 0 && !error && (
          <div className="rounded-none p-16 bg-[#090b0e] border border-white/10 text-center">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block mb-2">
              ZERO INQUIRIES
            </span>
            <h3 className="font-heading font-bold text-xl text-white mb-2">
              No Submissions Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              When a recruiter or growth lead completes the contact form in Chamber 04 (Hire), their note is instantly persisted to SQLite and displayed here.
            </p>
            <a
              href="/#hire"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Test Contact Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Submissions List */}
        {submissions.length > 0 && (
          <div className="space-y-4">
            {submissions.map((sub, idx) => (
              <div
                key={sub.id}
                className="rounded-none p-6 sm:p-7 bg-[#090b0e] border border-amber-500/25 hover:border-amber-500/60 transition-all duration-300"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 mb-4 border-b border-white/10">
                  <div className="flex items-start gap-4">
                    <span className="font-mono font-bold text-xs text-amber-500 px-2 py-1 bg-amber-500/10 border border-amber-500/30">
                      0{submissions.length - idx}
                    </span>
                    <div>
                      <h3 className="font-heading font-extrabold text-xl text-white">
                        {sub.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-400">
                        <Building className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-amber-300 font-semibold">{sub.company}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(sub.created_at)}</span>
                      </div>
                      {/* <button
                        onClick={() => handleDelete(sub.id)}
                        className="rounded-none px-2 py-0.5 bg-red-950/20 hover:bg-red-950/50 border border-red-500/25 hover:border-red-500/60 text-red-400 text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                        title="Delete submission"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>DELETE</span>
                      </button> */}
                    </div>
                    <a
                      href={`mailto:${sub.email}`}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 text-xs font-mono"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{sub.email}</span>
                    </a>
                  </div>
                </div>

                {/* Message Body */}
                <div className="rounded-none p-4 bg-[#050608] border border-white/5">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1.5">
                    MESSAGE:
                  </span>
                  <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                    {sub.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
