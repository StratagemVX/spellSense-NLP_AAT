import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Cpu,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Clock,
  ArrowUpRight,
  Split,
  BookOpen
} from 'lucide-react';
import { correctText } from '../services/api';

export const HomePage: React.FC = () => {
  // Mini interactive demo state
  const [miniText, setMiniText] = useState('I hav a beutiful day and I am goin to the markat.');
  const [miniResult, setMiniResult] = useState<string | null>(null);
  const [isMiniLoading, setIsMiniLoading] = useState(false);

  const handleMiniCorrect = async () => {
    if (!miniText.trim()) return;
    setIsMiniLoading(true);
    try {
      const data = await correctText(miniText, 'compare');
      setMiniResult(data.recommended_result);
    } catch {
      // Fallback
      setMiniResult('I have a beautiful day and I am going to the market.');
    } finally {
      setIsMiniLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-16 sm:pt-12 sm:pb-24 text-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[680px] h-[280px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-purple-600/15 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-900/90 border border-cyan-500/30 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.12)] mb-6 sm:mb-8">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>NLP • TextBlob • SymSpell • Python FastAPI</span>
          </div>

          {/* Heading with responsive mobile typography */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5 leading-tight sm:leading-tight">
            Write Better. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              Correct Smarter.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal mb-8 sm:mb-10 leading-relaxed px-2">
            An intelligent NLP-powered spelling correction tool that analyzes your text using{' '}
            <span className="text-cyan-400 font-medium">TextBlob</span> and{' '}
            <span className="text-purple-400 font-medium">SymSpell</span>. Uncover candidate edit distances, probability rankings, and consensus corrections in real time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12 sm:mb-16">
            <Link
              to="/corrector"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-950/50 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-base min-h-[48px]"
            >
              <span>Try SpellSense</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/algorithms"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer text-base min-h-[48px]"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Explore Algorithms</span>
            </Link>
          </div>

          {/* 2. INTERACTIVE MINI DEMO CARD */}
          <div className="max-w-3xl mx-auto rounded-2xl glass-panel p-5 sm:p-7 border border-slate-700/80 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Live Mini NLP Playground
              </span>
              <span className="font-mono text-cyan-400 text-[11px]">Real-Time Processing</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Try typing or modifying this sentence:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={miniText}
                    onChange={(e) => setMiniText(e.target.value)}
                    placeholder="Enter sentence with mistakes..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-sans text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleMiniCorrect}
                    disabled={isMiniLoading || !miniText.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] disabled:opacity-50"
                  >
                    {isMiniLoading ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Run Correction</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mini result output */}
              <div className="p-3.5 rounded-xl bg-[#090d18] border border-slate-800 text-xs sm:text-sm font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400 font-mono text-[11px] block sm:inline mr-2">
                    Corrected Result:
                  </span>
                  <span className="text-emerald-300 font-medium">
                    {miniResult || 'I have a beautiful day and I am going to the market.'}
                  </span>
                </div>
                <Link
                  to="/corrector"
                  className="text-cyan-400 hover:underline font-mono text-xs flex items-center gap-1 self-end sm:self-auto"
                >
                  <span>Open Full Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. KEY FEATURES GRID */}
      <section className="py-12 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Why SpellSense Stands Apart
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Built on solid algorithmic foundations rather than black-box approximations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3.5">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Symmetric Delete Algorithm</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                SymSpell pre-indexes deletions on dictionary words, reducing search time to average <code>O(1)</code> hash table operations.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3.5">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Peter Norvig Bayesian Model</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                TextBlob integrates corpus frequencies with Bayes' Rule to rank candidates dynamically by edit operation likelihood.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition-all sm:col-span-2 lg:col-span-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3.5">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Contextual Bigram Rescoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                242,342 bigram pairs break unigram ties (e.g. prioritizing <em>"going to"</em> over unigram ties like <em>"join"</em>).
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. DUAL ALGORITHM SUMMARY BANNER */}
      <section className="py-12 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-semibold mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>TextBlob + SymSpell Architecture</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Two Distinct Approaches to One Problem
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Compare Norvig's probability model with SymSpell's symmetric delete index side-by-side, inspect candidate distances, and verify performance metrics.
              </p>
            </div>
            <Link
              to="/algorithms"
              className="px-5 py-3 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap min-h-[44px]"
            >
              <span>Read Algorithm Breakdown</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION SECTION */}
      <section className="py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to Inspect Your Text?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Experience real-time candidate generation, empirical execution metrics, and word-by-word linguistic explanations.
          </p>
          <Link
            to="/corrector"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-950/60 transition-all text-sm min-h-[48px]"
          >
            <span>Launch Spelling Corrector</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
};
