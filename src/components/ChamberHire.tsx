import React, { useState } from 'react';
import { trackContactReached } from '../utils/analytics';

interface ChamberHireProps {
  visitorId: string;
}

export const ChamberHire: React.FC<ChamberHireProps> = ({ visitorId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !company.trim() || !message.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    trackContactReached(visitorId);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          message: message.trim(),
          visitorId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit form.');
      }

      setIsSubmitted(true);
      setName('');
      setEmail('');
      setCompany('');
      setMessage('');
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="hire"
      className="relative min-h-screen py-10 sm:py-16 px-6 sm:px-12 flex flex-col justify-between z-10"
    >
      {/* Top Row: Stage Indicator on Left */}
      <div className="max-w-6xl mx-auto w-full flex items-start justify-between mb-4 sm:mb-6">
        <div className="text-left">
          <div className="font-heading font-extrabold text-4xl sm:text-5xl text-amber-500 tracking-tight leading-none mb-1">
            04
          </div>
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            THE CLOSE
          </div>
        </div>
      </div>

      {/* Center: Title & Sharp Contact Form */}
      <div className="max-w-xl mx-auto w-full my-auto text-center flex flex-col items-center">
        {/* Centered Headline */}
        <h2 className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl tracking-tighter text-white mb-2 leading-[0.92]">
          <span className="block">Get in</span>
          <span className="block text-amber-500">touch.</span>
        </h2>

        <p className="text-xs sm:text-sm font-mono text-slate-400 mb-6 sm:mb-8">
          Ready to deploy on day one. Send a message.
        </p>

        {/* Sharp Minimal Form Container */}
        <div className="w-full rounded-none p-6 sm:p-8 bg-[#090a0d]/90 backdrop-blur-md border border-amber-500/30 text-left shadow-2xl">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="text-xs font-mono text-red-400 p-2.5 bg-red-950/30 border border-red-500/30">
                  {errorMessage}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">
                  NAME
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-none bg-[#050608] border border-white/10 focus:border-amber-500 text-white px-3 py-2 text-xs outline-none transition-colors"
                />
              </div>

              {/* Email & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">
                    WORK EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@company.com"
                    className="w-full rounded-none bg-[#050608] border border-white/10 focus:border-amber-500 text-white px-3 py-2 text-xs outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">
                    COMPANY
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="w-full rounded-none bg-[#050608] border border-white/10 focus:border-amber-500 text-white px-3 py-2 text-xs outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">
                  MESSAGE
                </label>
                <textarea
                  required
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Role details or a quick note..."
                  className="w-full rounded-none bg-[#050608] border border-white/10 focus:border-amber-500 text-white px-3 py-2 text-xs outline-none transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-none py-3 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 mt-1"
              >
                {isSubmitting ? 'SENDING...' : 'SEND MESSAGE →'}
              </button>
            </form>
          ) : (
            <div className="py-6 text-center">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase block mb-2">
                MESSAGE DELIVERED
              </span>
              <h3 className="font-heading font-extrabold text-xl text-white mb-2">
                Thank you for reaching out.
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Rohit will review your note and respond via email.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-[11px] font-mono text-amber-500 hover:underline"
              >
                Send another message →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Chamber Indicator on Right */}
      <div className="max-w-6xl mx-auto w-full flex justify-end mt-4 sm:mt-6">
        <div className="text-right font-mono">
          <div className="text-[10px] tracking-widest text-slate-400 uppercase">
            CHAMBER
          </div>
          <div className="font-bold text-lg text-amber-500 leading-tight">
            04
          </div>
        </div>
      </div>
    </section>
  );
};
