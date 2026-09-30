import React, { useState } from 'react';
import { Cpu, Zap, CheckCircle2, AlertTriangle, Layers, BookOpen, Clock, Hash } from 'lucide-react';

export const AlgorithmExplanation: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<'both' | 'textblob' | 'symspell'>('both');

  return (
    <section id="algorithms" className="w-full max-w-5xl mx-auto mb-20 scroll-mt-20">
      
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/60 border border-purple-700/50 text-purple-300 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Algorithmic Deep Dive</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Two Algorithms. One Goal.
        </h2>
        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base">
          Explore the contrasting engineering principles behind Peter Norvig’s classical probability model in{' '}
          <strong className="text-cyan-400">TextBlob</strong> and Wolf Garbe’s high-throughput{' '}
          <strong className="text-purple-400">SymSpell</strong>.
        </p>

        {/* Filter Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 mt-6 text-xs font-medium">
          <button
            onClick={() => setSelectedAlgo('both')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedAlgo === 'both'
                ? 'bg-slate-800 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Side-by-Side Comparison
          </button>
          <button
            onClick={() => setSelectedAlgo('textblob')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedAlgo === 'textblob'
                ? 'bg-blue-950 text-blue-300 font-semibold border border-blue-600/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>TextBlob Focus</span>
          </button>
          <button
            onClick={() => setSelectedAlgo('symspell')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedAlgo === 'symspell'
                ? 'bg-purple-950 text-purple-300 font-semibold border border-purple-600/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>SymSpell Focus</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* TextBlob Card */}
        {(selectedAlgo === 'both' || selectedAlgo === 'textblob') && (
          <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">TextBlob</h3>
                    <p className="text-xs text-slate-400">Norvig Probabilistic Spellchecker</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800 text-blue-300">
                  O(k·nᵏ) Gen
                </span>
              </div>

              {/* Core Concept */}
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                Based on Peter Norvig’s classic spelling correction approach. For any misspelled input word <code>w</code>, it dynamically generates all possible strings at edit distance 1 and 2 (via letter deletions, insertions, replacements, and transpositions), and evaluates candidate probabilities using Bayes’ Rule:
              </p>

              {/* Math snippet */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-cyan-300 text-center mb-6">
                argmax P(c | w) ∝ P(w | c) · P(c)
              </div>

              {/* Strengths */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Advantages
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Simple, elegant probabilistic formulation based on corpus frequencies.</li>
                  <li>No massive precomputed deletion table required in memory at startup.</li>
                  <li>Effective for standard grammatical text with common edit distance 1 mistakes.</li>
                </ul>
              </div>

              {/* Limitations */}
              <div>
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Limitations
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Candidate generation is combinatorially expensive for longer terms.</li>
                  <li>Edit distance 2 requires evaluating ~100,000+ permutations at runtime per word.</li>
                  <li>Significantly higher query latency under batch or real-time streaming workloads.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              <strong>Best Used For:</strong> Educational prototyping, NLP text augmentation pipelines, and lightweight batch processing.
            </div>
          </div>
        )}

        {/* SymSpell Card */}
        {(selectedAlgo === 'both' || selectedAlgo === 'symspell') && (
          <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">SymSpell</h3>
                    <p className="text-xs text-slate-400">Symmetric Delete Lookup Engine</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800 text-purple-300">
                  O(1) Lookup
                </span>
              </div>

              {/* Core Concept */}
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                Engineered by Wolf Garbe using the **Symmetric Delete (SymDelete)** algorithm. Instead of generating insertions, substitutions, and transpositions, it <em>only generates deletes</em>. Edit distance operations meet symmetrically in the precomputed deletion index:
              </p>

              {/* Formula snippet */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-purple-300 text-center mb-6">
                Deletes(Query, d) ∩ Deletes(Dictionary, d) ≠ ∅
              </div>

              {/* Strengths */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Advantages
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Up to 1,000× faster</strong> than Peter Norvig’s generation algorithm.</li>
                  <li>Query lookup time is independent of dictionary vocabulary size.</li>
                  <li>Native support for compound phrases and Damerau-Levenshtein transpositions.</li>
                </ul>
              </div>

              {/* Limitations */}
              <div>
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Limitations
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Requires memory allocation (~10–30 MB) to store pre-indexed symmetric delete tables.</li>
                  <li>Startup dictionary initialization time must be managed (done once as a singleton).</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              <strong>Best Used For:</strong> Production search query auto-correct, real-time typing assistance, and high-throughput microservices.
            </div>
          </div>
        )}

      </div>

      {/* Comparative Specification Matrix */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800 overflow-hidden">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Factual Architecture Comparison Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Evaluation Dimension</th>
                <th className="py-3 px-4 text-blue-300">TextBlob (Norvig Model)</th>
                <th className="py-3 px-4 text-purple-300">SymSpell (Symmetric Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 text-slate-300">
              <tr className="hover:bg-slate-900/50">
                <td className="py-3 px-4 font-medium text-slate-200">Algorithmic Approach</td>
                <td className="py-3 px-4">Dynamic generation of all 4 edit operations (del/ins/sub/trans)</td>
                <td className="py-3 px-4 font-semibold text-purple-300">Symmetric Delete: only deletions are generated on query & dict</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="py-3 px-4 font-medium text-slate-200">Query Time Complexity</td>
                <td className="py-3 px-4 font-mono">O(k · nᵏ) combinatorial growth</td>
                <td className="py-3 px-4 font-mono text-purple-300">O(1) hash table lookup per delete</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="py-3 px-4 font-medium text-slate-200">Candidate Generation Rate</td>
                <td className="py-3 px-4">~100 candidates/sec</td>
                <td className="py-3 px-4 font-semibold text-purple-300">&gt; 100,000 words/sec</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="py-3 px-4 font-medium text-slate-200">Memory Footprint</td>
                <td className="py-3 px-4">Low (~2–5 MB unigram vocabulary)</td>
                <td className="py-3 px-4">Moderate (~15–30 MB indexed delete hash table)</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="py-3 px-4 font-medium text-slate-200">Edit Distance Metric</td>
                <td className="py-3 px-4">Levenshtein distance (ins, del, sub)</td>
                <td className="py-3 px-4">Damerau-Levenshtein (transposition counts as 1 operation)</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="py-3 px-4 font-medium text-slate-200">Bigram / Context Support</td>
                <td className="py-3 px-4">Primarily isolated word model</td>
                <td className="py-3 px-4">Native compound & bigram frequency dictionary integration</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="py-3 px-4 font-medium text-slate-200">Primary Industry Fit</td>
                <td className="py-3 px-4">Rapid NLP scripting, academic demonstrations</td>
                <td className="py-3 px-4">High-throughput search engines, IDE typing assistants, SaaS</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
};
