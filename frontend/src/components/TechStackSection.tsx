import React from 'react';
import { Cpu, Server, Code2, Database, Network, ArrowDown, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const TechStackSection: React.FC = () => {
  return (
    <section id="technology" className="w-full max-w-5xl mx-auto mb-20 scroll-mt-20">
      
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 mb-3">
          <Code2 className="w-3.5 h-3.5" />
          <span>System Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Engineered for Accuracy & Speed
        </h2>
        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base">
          A modular, production-ready full-stack architecture cleanly separating client visualization from high-performance Python NLP services.
        </p>
      </div>

      {/* Interactive System Flow Diagram */}
      <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800 bg-slate-900/60 mb-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <span>End-to-End Data & Model Flow</span>
        </h3>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-xs font-mono">
          
          {/* Node 1: React Client */}
          <div className="w-full lg:w-1/5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <Code2 className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <div className="font-bold text-white text-sm">React 19 + TS</div>
            <div className="text-[11px] text-slate-400 mt-1">Vite + Tailwind CSS</div>
            <div className="text-[10px] text-cyan-400 mt-2 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              Client UI Layer
            </div>
          </div>

          <div className="hidden lg:block text-slate-500 font-bold">→</div>
          <div className="lg:hidden text-slate-500 font-bold">↓</div>

          {/* Node 2: FastAPI Gateway */}
          <div className="w-full lg:w-1/5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <Server className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <div className="font-bold text-white text-sm">FastAPI REST</div>
            <div className="text-[11px] text-slate-400 mt-1">Uvicorn + Pydantic v2</div>
            <div className="text-[10px] text-emerald-400 mt-2 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
              API Controller
            </div>
          </div>

          <div className="hidden lg:block text-slate-500 font-bold">→</div>
          <div className="lg:hidden text-slate-500 font-bold">↓</div>

          {/* Node 3: NLP Core */}
          <div className="w-full lg:w-1/4 p-4 rounded-xl bg-slate-950 border border-purple-500/40 text-center ring-1 ring-purple-500/20">
            <Cpu className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <div className="font-bold text-white text-sm">Dual NLP Engines</div>
            <div className="text-[11px] text-purple-300 mt-1">SymSpell + TextBlob</div>
            <div className="text-[10px] text-purple-300 mt-2 px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
              Norvig & SymDelete
            </div>
          </div>

          <div className="hidden lg:block text-slate-500 font-bold">→</div>
          <div className="lg:hidden text-slate-500 font-bold">↓</div>

          {/* Node 4: Comparison & Reconstitution */}
          <div className="w-full lg:w-1/5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <Database className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="font-bold text-white text-sm">Comparison Engine</div>
            <div className="text-[11px] text-slate-400 mt-1">Consensus & Casing</div>
            <div className="text-[10px] text-blue-400 mt-2 px-2 py-0.5 rounded bg-blue-950 border border-blue-800">
              Harmonized Output
            </div>
          </div>

        </div>
      </div>

      {/* Tech Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
          <div className="font-bold text-cyan-300 text-sm mb-1">Frontend</div>
          <p className="text-slate-400 leading-relaxed">
            React 19, TypeScript, Tailwind CSS v4, Lucide React icons, and modern responsive glassmorphism.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
          <div className="font-bold text-emerald-300 text-sm mb-1">Backend Server</div>
          <p className="text-slate-400 leading-relaxed">
            Python 3.12, FastAPI asynchronous framework, Pydantic type validation, and CORS middleware.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
          <div className="font-bold text-purple-300 text-sm mb-1">NLP Technologies</div>
          <p className="text-slate-400 leading-relaxed">
            SymSpell (Symmetric Delete), TextBlob (Peter Norvig Bayes model), NLTK corpus frequencies.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
          <div className="font-bold text-blue-300 text-sm mb-1">Protocols & Lexicon</div>
          <p className="text-slate-400 leading-relaxed">
            JSON REST API, 82,765 English unigram dictionary, 243,342 bigram contextual frequency tables.
          </p>
        </div>

      </div>

    </section>
  );
};
