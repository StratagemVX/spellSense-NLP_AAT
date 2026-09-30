import React, { useState } from 'react';
import {
  FileText,
  Split,
  Search,
  Cpu,
  Layers,
  CheckCircle2,
  ChevronRight,
  ArrowDown,
  Sparkles,
  Zap
} from 'lucide-react';
import { PipelineStep } from '../types';

interface HowItWorksProps {
  pipelineTrace?: PipelineStep[];
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ pipelineTrace }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const defaultSteps = [
    {
      step_number: 1,
      name: 'Input Tokenization',
      icon: Split,
      description: 'The raw text is tokenized into word and non-word sequences while tracking exact character offsets (start, end).',
      details: 'Preserves whitespace and punctuation for lossless text reconstruction.',
      badge: 'Regex Tokenizer'
    },
    {
      step_number: 2,
      name: 'Vocabulary Verification',
      icon: Search,
      description: 'Each word is probed against the pre-loaded 82,765+ English word frequency lexicon.',
      details: 'Known words with 0 edit distance bypass candidate generation entirely, minimizing latency.',
      badge: 'O(1) Hash Map'
    },
    {
      step_number: 3,
      name: 'Candidate Generation',
      icon: Zap,
      description: 'TextBlob computes combinatorial variations; SymSpell indexes Symmetric Deletes at distance ≤ 2.',
      details: 'SymSpell only removes characters from query and vocabulary, avoiding expensive alphabet loops.',
      badge: 'Symmetric Delete'
    },
    {
      step_number: 4,
      name: 'Distance & Frequency Scoring',
      icon: Layers,
      description: 'Candidates are ranked using Damerau-Levenshtein edit distance and logarithmic unigram/bigram counts.',
      details: 'Contextual bigrams (e.g. "going to") break unigram ties for colloquial mistakes.',
      badge: 'Heuristic Ranking'
    },
    {
      step_number: 5,
      name: 'Orthographic Reconstruction',
      icon: CheckCircle2,
      description: 'The winning candidate replaces the mistake while dynamically matching original uppercase, title, or lowercase casing.',
      details: 'Resulting in clean, grammatical English with intact formatting.',
      badge: 'Casing Alignment'
    }
  ];

  const steps = defaultSteps;

  return (
    <section id="how-it-works" className="w-full max-w-5xl mx-auto mb-20 scroll-mt-20">
      
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          How the NLP Pipeline Works
        </h2>
        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base">
          From raw keystrokes to context-aware spelling correction. Click any pipeline stage to inspect its engineering mechanism.
        </p>
      </div>

      {/* Step Buttons Chain */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          const isActive = activeStepIndex === idx;

          return (
            <button
              key={st.step_number}
              onClick={() => setActiveStepIndex(idx)}
              className={`p-4 rounded-xl text-left border transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500/60 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center ${
                  isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  0{st.step_number}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              </div>
              <div className={`text-xs font-bold leading-tight mb-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                {st.name}
              </div>
              <div className="text-[10px] font-mono text-cyan-400/90 truncate">
                {st.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Detail Card */}
      <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-slate-700/80 shadow-xl bg-slate-900/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-cyan-400">
                STAGE 0{steps[activeStepIndex].step_number}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {steps[activeStepIndex].badge}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {steps[activeStepIndex].name}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Step {activeStepIndex + 1} of {steps.length}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeStepIndex === 0}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Prev
              </button>
              <button
                onClick={() => setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                disabled={activeStepIndex === steps.length - 1}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300 leading-relaxed">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              What Happens Here:
            </h4>
            <p className="mb-4">
              {steps[activeStepIndex].description}
            </p>
            <p className="text-xs text-slate-400">
              {steps[activeStepIndex].details}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090d18] border border-slate-800 font-mono text-xs">
            <div className="text-slate-400 text-[11px] mb-2 flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>Pipeline Trace Observation</span>
              <span className="text-emerald-400">Live Engine Ready</span>
            </div>

            {pipelineTrace && pipelineTrace[activeStepIndex] ? (
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400">Input: </span>
                  <span className="text-rose-300">{pipelineTrace[activeStepIndex].input_sample}</span>
                </div>
                <div>
                  <span className="text-slate-400">Output: </span>
                  <span className="text-emerald-300">{pipelineTrace[activeStepIndex].output_sample}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-slate-400">
                <div>
                  <span className="text-slate-400">Sample Query: </span>
                  <span className="text-cyan-300">"I hav a beutiful day"</span>
                </div>
                <div>
                  <span className="text-slate-400">Transformation: </span>
                  <span className="text-purple-300">Tokens extracted & mapped to character spans</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Run a correction in the workspace above to see live trace telemetry here.
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </section>
  );
};
