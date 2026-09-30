import React, { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  BookOpen,
  Scale,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlgorithmsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'both' | 'textblob' | 'symspell'>('both');

  const comparisonRows = [
    {
      feature: 'Correction Approach',
      textblob: 'Bayesian probability model (Peter Norvig)',
      symspell: 'Symmetric Delete algorithm (Wolf Garbe)'
    },
    {
      feature: 'Candidate Generation',
      textblob: 'Dynamic combinatorial expansion (ins, del, sub, trans) at runtime',
      symspell: 'Only deletes generated; matches precomputed deletion keys'
    },
    {
      feature: 'Query Complexity',
      textblob: 'O(k · nᵏ) combinatorial growth with term length',
      symspell: 'O(1) average hash table lookup time'
    },
    {
      feature: 'Edit Distance Metric',
      textblob: 'Levenshtein distance (ins, del, sub, trans)',
      symspell: 'Damerau-Levenshtein (transposition counts as 1 operation)'
    },
    {
      feature: 'Dictionary Usage',
      textblob: 'Corpus frequency list (~2.5 MB text vocabulary)',
      symspell: 'Pre-indexed delete table (82,765 unigrams + 242,342 bigrams)'
    },
    {
      feature: 'Memory Footprint',
      textblob: 'Low (~2–5 MB RAM)',
      symspell: 'Moderate (~15–30 MB RAM for delete index)'
    },
    {
      feature: 'Typical Use Cases',
      textblob: 'Educational NLP, batch corpus correction, offline text scripts',
      symspell: 'High-throughput search autocomplete, typing assistants, SaaS'
    },
    {
      feature: 'Primary Strength',
      textblob: 'Minimal initial memory requirement; simple Bayesian math',
      symspell: 'Up to 1,000× faster query response; sub-millisecond execution'
    },
    {
      feature: 'Key Limitation',
      textblob: 'Computationally slow for long words and edit distance 2',
      symspell: 'Requires memory allocation for pre-computed delete tables'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-300">
      
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/60 border border-purple-700/50 text-purple-300 mb-3">
          <Scale className="w-3.5 h-3.5" />
          <span>Algorithmic Comparison & Benchmarks</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          TextBlob vs SymSpell
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Examine the theoretical principles, space-time complexities, and engineering trade-offs between Peter Norvig’s classical probability model and Wolf Garbe’s high-throughput Symmetric Delete approach.
        </p>

        {/* View Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 mt-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer min-h-[40px] ${
              activeTab === 'both' ? 'bg-slate-800 text-white font-semibold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Side-by-Side Overview
          </button>
          <button
            onClick={() => setActiveTab('textblob')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
              activeTab === 'textblob' ? 'bg-blue-950 text-blue-300 font-semibold border border-blue-700 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>TextBlob Focus</span>
          </button>
          <button
            onClick={() => setActiveTab('symspell')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
              activeTab === 'symspell' ? 'bg-purple-950 text-purple-300 font-semibold border border-purple-700 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>SymSpell Focus</span>
          </button>
        </div>
      </div>

      {/* ALGORITHM CARDS (Stacked on mobile, Side-by-Side on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        
        {/* TEXTBLOB CARD */}
        {(activeTab === 'both' || activeTab === 'textblob') && (
          <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">TextBlob</h2>
                  <p className="text-xs text-slate-400">Peter Norvig Bayesian Model</p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                O(k·nᵏ)
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div>
                <strong className="text-white block mb-1">What It Is:</strong>
                TextBlob is an established Python NLP library implementing Peter Norvig’s probability-driven spelling corrector derived from Bayes’ Rule:
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 text-center">
                argmax P(c | w) ∝ P(w | c) · P(c)
              </div>

              <div>
                <strong className="text-white block mb-1">How It Works:</strong>
                For any misspelled word <code>w</code>, it dynamically creates all candidate words <code>c</code> at edit distance 1 and 2 by deleting letters, transposing adjacent letters, replacing letters, and inserting letters. It then scores each candidate by unigram frequency in the corpus.
              </div>

              {/* Example */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Example: </span>
                <span className="text-rose-300 font-bold">"markat"</span>
                <span className="text-slate-400"> → evaluates permutations → </span>
                <span className="text-emerald-300 font-bold">"market"</span>
                <span className="text-slate-400"> (prob=0.85)</span>
              </div>

              {/* Strengths */}
              <div>
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5 text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  <li>Simple, mathematically transparent probabilistic foundation.</li>
                  <li>Lightweight memory footprint (~2.5 MB unigram vocabulary).</li>
                  <li>Effective for standard grammatical mistakes at distance 1.</li>
                </ul>
              </div>

              {/* Limitations */}
              <div>
                <span className="font-semibold text-amber-400 flex items-center gap-1.5 text-xs mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Limitations:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  <li>Combinatorial search space grows rapidly ($O(k \cdot n^k)$).</li>
                  <li>Edit distance 2 requires evaluating over 100,000 permutations at runtime.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SYMSPELL CARD */}
        {(activeTab === 'both' || activeTab === 'symspell') && (
          <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">SymSpell</h2>
                  <p className="text-xs text-slate-400">Symmetric Delete Lookup Engine</p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                O(1)
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div>
                <strong className="text-white block mb-1">What It Is:</strong>
                SymSpell is a high-performance spelling correction algorithm engineered by Wolf Garbe that circumvents combinatorial explosion by generating <em>only deletions</em>:
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300 text-center">
                Deletes(Query, d) ∩ Deletes(Dictionary, d) ≠ ∅
              </div>

              <div>
                <strong className="text-white block mb-1">How It Works:</strong>
                At startup, it pre-indexes deletion variations for all dictionary words. At query time, it only generates deletions for the input term and looks them up in hash tables in constant $O(1)$ time, eliminating the 26-letter alphabet loop completely.
              </div>

              {/* Example */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Example: </span>
                <span className="text-rose-300 font-bold">"speling"</span>
                <span className="text-slate-400"> → delete keys match </span>
                <span className="text-purple-300 font-bold">"peling"</span>
                <span className="text-slate-400"> → </span>
                <span className="text-emerald-300 font-bold">"spelling"</span>
                <span className="text-slate-400"> (&lt; 0.5 ms)</span>
              </div>

              {/* Strengths */}
              <div>
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5 text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  <li>Up to 1,000× faster candidate lookup than Peter Norvig’s model.</li>
                  <li>Native integration of Damerau-Levenshtein transposition distance.</li>
                  <li>Contextual bigram rescoring for colloquial typo disambiguation.</li>
                </ul>
              </div>

              {/* Limitations */}
              <div>
                <span className="font-semibold text-amber-400 flex items-center gap-1.5 text-xs mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Limitations:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  <li>Requires memory allocation (~15–30 MB) to store indexed delete tables.</li>
                  <li>Startup dictionary loading must be managed as a singleton.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* COMPARISON MATRIX (Desktop Table + Mobile Responsive Cards) */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800 shadow-2xl mb-12">
        <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Detailed Comparison Matrix</span>
        </h2>

        {/* MOBILE VIEW (< 768px): Responsive Cards */}
        <div className="md:hidden space-y-3">
          {comparisonRows.map((row, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-white border-b border-slate-800 pb-1.5 text-xs">
                {row.feature}
              </div>
              <div className="space-y-1.5 pt-1">
                <div>
                  <span className="text-blue-300 font-semibold block text-[11px]">TextBlob:</span>
                  <span className="text-slate-300">{row.textblob}</span>
                </div>
                <div>
                  <span className="text-purple-300 font-semibold block text-[11px]">SymSpell:</span>
                  <span className="text-slate-300">{row.symspell}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW (>= 768px): Clean Table */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-1/4">Feature</th>
                <th className="py-3 px-4 text-blue-300 w-3/8">TextBlob (Norvig Bayes)</th>
                <th className="py-3 px-4 text-purple-300 w-3/8">SymSpell (Symmetric Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 text-slate-300">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-semibold text-slate-200">{row.feature}</td>
                  <td className="py-3 px-4 text-slate-300">{row.textblob}</td>
                  <td className="py-3 px-4 text-slate-300">{row.symspell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Bottom CTA to try in Corrector */}
      <div className="text-center py-4">
        <Link
          to="/corrector"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg transition-all min-h-[44px]"
        >
          <span>Compare Both in the Corrector</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
