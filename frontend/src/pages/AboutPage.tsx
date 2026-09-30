import React, { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  Code2,
  Server,
  Cpu,
  Database,
  Network,
  GraduationCap,
  ChevronDown,
  BookOpen,
  Sparkles,
  Zap,
  CheckCircle2,
  Layers,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const [openVivaIdx, setOpenVivaIdx] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: 'Why compare both TextBlob and SymSpell in this project?',
      a: 'Comparing both demonstrates two fundamentally contrasting paradigms in NLP. TextBlob represents the classical Peter Norvig Bayesian generator, which dynamically computes candidate strings at runtime. SymSpell represents modern production search engine architecture, using pre-computed Symmetric Deletes for sub-millisecond O(1) hash table lookups. Demonstrating both illustrates deep understanding of algorithmic trade-offs.'
    },
    {
      q: 'Why does SymSpell only generate deletions and not insertions or replacements?',
      a: 'Wolf Garbe proved that any edit operation (insertion, substitution, transposition) between two terms can be reformulated symmetrically through deletions. Inserting a letter into word A to match word B is mathematically identical to deleting that letter from word B to match word A. By only generating deletions, the candidate generation alphabet size (26 English letters) is eliminated from the runtime equation.'
    },
    {
      q: 'Why is max edit distance configured to 2 instead of 3 or 4?',
      a: 'Empirical research in computational linguistics demonstrates that >95% of all human spelling errors fall within an edit distance of 1 or 2. Expanding to edit distance 3 causes combinatorial explosion, higher false-positive rates, and risks altering intended vocabulary into unrelated words.'
    },
    {
      q: 'How does the application preserve original casing and punctuation?',
      a: 'The system uses an offset-aware lexical regex tokenizer that records the exact character indices (start, end) of every word, whitespace segment, and punctuation mark. During final orthographic reconstruction, a casing transfer function inspects whether the original token was UPPERCASE, Titlecase, or lowercase, and applies the same capitalization pattern to the chosen candidate.'
    },
    {
      q: 'How are ties and disagreements resolved between TextBlob and SymSpell?',
      a: 'The backend comparison engine executes candidate cross-intersection. When models diverge, it checks whether a candidate appears in both candidate pools. Furthermore, it incorporates bigram contextual lookups (e.g. "going to" vs unigram "join") to select the linguistically appropriate word with high confidence.'
    },
    {
      q: 'What is the space-time trade-off between the two approaches?',
      a: 'TextBlob optimizes for minimal RAM (~2–5 MB) at the expense of higher CPU runtime during combinatorial candidate expansion. SymSpell trades ~15–30 MB of memory for pre-indexed delete tables, gaining 1,000× faster query response times suitable for real-time keystroke processing.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-300">
      
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 mb-3">
          <Code2 className="w-3.5 h-3.5" />
          <span>Technical Architecture & Defense</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          About SpellSense & Architecture
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Comprehensive project objective, system design, technology stack, and academic defense guide for college presentations and technical interviews.
        </p>
      </div>

      {/* SECTION 1: PROJECT OBJECTIVE & WHY SPELLING CORRECTION MATTERS */}
      <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800 shadow-xl mb-10 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Project Objective & Linguistic Importance</span>
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
          <p>
            <strong>SpellSense</strong> was developed as an advanced NLP full-stack engineering project. In modern computing, spelling correction is not merely cosmetic—it is the foundational preprocessing layer for search query understanding, speech-to-text post-processing, automated essay scoring, and conversational AI agents.
          </p>
          <p>
            Traditional academic projects often rely on static dummy demonstrations or simple Levenshtein loops that crash on large sentences. SpellSense implements genuine algorithmic NLP with a production-ready asynchronous Python backend and real-time empirical benchmarking.
          </p>
        </div>
      </div>

      {/* SECTION 2: END-TO-END ARCHITECTURE DIAGRAM */}
      <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800 shadow-xl mb-10">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>System Architecture & Data Flow</span>
            </h2>
            <p className="text-xs text-slate-400">
              Clean separation of client presentation and backend NLP engines
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
            REST API
          </span>
        </div>

        {/* Visual Flowchart Nodes */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-xs font-mono mb-8">
          
          <div className="w-full lg:w-1/5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <Code2 className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
            <div className="font-bold text-white text-sm">React 19 + TS</div>
            <div className="text-[11px] text-slate-400">Vite + Tailwind v4</div>
            <div className="text-[10px] text-cyan-400 mt-2 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              Frontend Client
            </div>
          </div>

          <div className="hidden lg:block text-slate-500 font-bold">→</div>
          <div className="lg:hidden text-slate-500 font-bold">↓</div>

          <div className="w-full lg:w-1/5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <Server className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <div className="font-bold text-white text-sm">FastAPI Server</div>
            <div className="text-[11px] text-slate-400">Python 3.12 + Pydantic</div>
            <div className="text-[10px] text-emerald-400 mt-2 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
              API Controller
            </div>
          </div>

          <div className="hidden lg:block text-slate-500 font-bold">→</div>
          <div className="lg:hidden text-slate-500 font-bold">↓</div>

          <div className="w-full lg:w-1/4 p-4 rounded-xl bg-slate-950 border border-purple-500/40 text-center ring-1 ring-purple-500/20">
            <Cpu className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
            <div className="font-bold text-white text-sm">Dual NLP Engines</div>
            <div className="text-[11px] text-purple-300">SymSpell & TextBlob</div>
            <div className="text-[10px] text-purple-300 mt-2 px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800">
              Norvig & SymDelete
            </div>
          </div>

          <div className="hidden lg:block text-slate-500 font-bold">→</div>
          <div className="lg:hidden text-slate-500 font-bold">↓</div>

          <div className="w-full lg:w-1/5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <Database className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
            <div className="font-bold text-white text-sm">Comparison Engine</div>
            <div className="text-[11px] text-slate-400">Consensus & Casing</div>
            <div className="text-[10px] text-blue-400 mt-2 px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800">
              Harmonized Output
            </div>
          </div>

        </div>

        {/* Technology Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="font-bold text-cyan-300 mb-1">Frontend</div>
            <p className="text-slate-400">React 19, TypeScript, React Router v7, Tailwind CSS v4, Lucide React icons.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="font-bold text-emerald-300 mb-1">Backend Server</div>
            <p className="text-slate-400">Python 3.12, FastAPI, Uvicorn ASGI, Pydantic v2 validation, CORS middleware.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="font-bold text-purple-300 mb-1">NLP Engines</div>
            <p className="text-slate-400">SymSpell (Symmetric Delete), TextBlob (Peter Norvig Bayes model), NLTK corpus.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="font-bold text-blue-300 mb-1">Dictionaries</div>
            <p className="text-slate-400">82,765 English unigram frequency lexicon + 242,342 bigram pairs.</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: VIVA & TECHNICAL INTERVIEW DEFENSE */}
      <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800 shadow-xl mb-12">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">
            Academic Viva & Interview Defense Guide
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Defend design decisions, algorithmic trade-offs, and empirical findings during presentations.
        </p>

        {/* 2 Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-cyan-300 text-sm mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why Two Algorithms?</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Demonstrating both <strong>TextBlob (probabilistic Bayes)</strong> and <strong>SymSpell (algorithmic indexing)</strong> reveals how computational complexity, memory structures, and search heuristics directly impact NLP efficiency in production.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-purple-300 text-sm mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Why SymSpell?</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standard Levenshtein searches scale exponentially with word length. SymSpell eliminates this bottleneck through its <strong>Symmetric Delete algorithm</strong>, allowing instant <code>O(1)</code> candidate retrieval regardless of vocabulary size.
            </p>
          </div>
        </div>

        {/* Questions Accordion */}
        <div className="space-y-2.5">
          {vivaQuestions.map((item, idx) => {
            const isOpen = openVivaIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden"
              >
                <button
                  onClick={() => setOpenVivaIdx(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-900/60 cursor-pointer min-h-[44px]"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80">
                    <p className="pt-1.5">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center py-4">
        <Link
          to="/corrector"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg transition-all min-h-[44px]"
        >
          <span>Launch AI Spelling Corrector</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
