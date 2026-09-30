import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Zap, Cpu, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onStart: () => void;
  onExploreAlgorithms: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart, onExploreAlgorithms }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="relative pt-12 pb-20 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-cyan-500/30 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.12)] mb-8">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>NLP • TextBlob • SymSpell • Python FastAPI</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span className="text-slate-400">Academic & Research Grade</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Write Better. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            Correct Smarter.
          </span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 font-normal mb-10 leading-relaxed">
          An intelligent NLP-powered spelling correction tool that analyzes your text using{' '}
          <span className="text-cyan-400 font-medium">TextBlob</span> and{' '}
          <span className="text-purple-400 font-medium">SymSpell</span>. Uncover candidate edit distances, probability rankings, and consensus corrections in real time.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-950/40 hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-base hover:-translate-y-0.5"
          >
            <span>Open Spelling Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onExploreAlgorithms}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Algorithm Comparison</span>
          </button>
        </div>

        {/* Interactive Live Hero Transformation Visual */}
        <div className="max-w-3xl mx-auto rounded-2xl glass-panel p-6 sm:p-8 border border-slate-700/60 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-slate-400">nlp_pipeline_preview.py</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400/90">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Real-Time Model Execution</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            
            {/* Step 1: Input */}
            <div className={`p-4 rounded-xl border transition-all text-left ${activeStep === 0 ? 'bg-cyan-950/30 border-cyan-500/40 ring-1 ring-cyan-500/30' : 'bg-slate-900/40 border-slate-800/60'}`}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>1. Raw User Input</span>
                <span className="text-rose-400 font-mono text-[10px]">4 Errors</span>
              </div>
              <p className="font-mono text-sm text-slate-200">
                I <span className="bg-rose-950/80 text-rose-300 px-1 py-0.5 rounded border border-rose-800/50">hav</span> a{' '}
                <span className="bg-rose-950/80 text-rose-300 px-1 py-0.5 rounded border border-rose-800/50">beutiful</span> day and I am{' '}
                <span className="bg-rose-950/80 text-rose-300 px-1 py-0.5 rounded border border-rose-800/50">goin</span> to the{' '}
                <span className="bg-rose-950/80 text-rose-300 px-1 py-0.5 rounded border border-rose-800/50">markat</span>.
              </p>
            </div>

            {/* Step 2: Processing Flow */}
            <div className={`p-4 rounded-xl border transition-all text-left ${activeStep === 1 ? 'bg-purple-950/30 border-purple-500/40 ring-1 ring-purple-500/30' : 'bg-slate-900/40 border-slate-800/60'}`}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>2. Dual NLP Analysis</span>
                <span className="text-purple-400 font-mono text-[10px]">&lt; 1 ms</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span>TextBlob (Norvig)</span>
                  <span className="text-cyan-400">P(c|w) Prob</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>SymSpell (Garbe)</span>
                  <span className="text-purple-400">Sym-Delete O(1)</span>
                </div>
                <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Consensus Harmonization</span>
                </div>
              </div>
            </div>

            {/* Step 3: Corrected */}
            <div className={`p-4 rounded-xl border transition-all text-left ${activeStep === 2 ? 'bg-emerald-950/30 border-emerald-500/40 ring-1 ring-emerald-500/30' : 'bg-slate-900/40 border-slate-800/60'}`}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>3. Recommended Result</span>
                <span className="text-emerald-400 font-mono text-[10px]">100% Fixed</span>
              </div>
              <p className="font-mono text-sm text-slate-100">
                I <span className="bg-emerald-950/80 text-emerald-300 font-medium px-1 py-0.5 rounded border border-emerald-700/50">have</span> a{' '}
                <span className="bg-emerald-950/80 text-emerald-300 font-medium px-1 py-0.5 rounded border border-emerald-700/50">beautiful</span> day and I am{' '}
                <span className="bg-emerald-950/80 text-emerald-300 font-medium px-1 py-0.5 rounded border border-emerald-700/50">going</span> to the{' '}
                <span className="bg-emerald-950/80 text-emerald-300 font-medium px-1 py-0.5 rounded border border-emerald-700/50">market</span>.
              </p>
            </div>

          </div>

          {/* Quick specs pill bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Symmetric Deletes</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Damerau-Levenshtein</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Norvig Probability</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Casing Preserved</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
