import React, { useState } from 'react';
import { Zap, Search, ArrowRight, CheckCircle2, Split, Hash, AlertCircle } from 'lucide-react';
import { analyzeWord } from '../services/api';
import { SingleWordAnalysis } from '../types';

export const SymSpellDeepDive: React.FC = () => {
  const [word, setWord] = useState('speling');
  const [distance, setDistance] = useState(2);
  const [analysis, setAnalysis] = useState<SingleWordAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInspect = async (targetWord = word) => {
    if (!targetWord.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeWord(targetWord.trim(), distance);
      setAnalysis(data);
    } catch (e: any) {
      setError(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="deep-dive" className="w-full max-w-5xl mx-auto mb-20 scroll-mt-20">
      
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/60 border border-purple-700/50 text-purple-300 mb-3">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>Interactive SymSpell Inspector</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Symmetric Delete & Edit Distance
        </h2>
        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base">
          Observe firsthand how SymSpell avoids millions of candidate permutations by generating only character deletions at lookup time.
        </p>
      </div>

      <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-slate-700/80 shadow-2xl bg-slate-900/60">
        
        {/* Word Input and Preset Triggers */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInspect()}
              placeholder="Enter a single misspelled word (e.g. speling, recieve, beutiful)"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleInspect()}
              disabled={loading || !word.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Analyzing...' : 'Inspect Deletions'}</span>
            </button>
          </div>
        </div>

        {/* Quick words */}
        <div className="flex items-center gap-2 mb-8 text-xs text-slate-400 overflow-x-auto pb-1">
          <span className="font-semibold text-slate-300">Try Word:</span>
          {['speling', 'beutiful', 'recieve', 'tomorow', 'definately'].map((w) => (
            <button
              key={w}
              onClick={() => {
                setWord(w);
                handleInspect(w);
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors font-mono cursor-pointer whitespace-nowrap"
            >
              {w}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Edit distance concept banner */}
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-300">
          <div>
            <span className="font-bold text-purple-300 block mb-1">
              What is Damerau-Levenshtein Edit Distance?
            </span>
            <span>
              The minimum number of character operations (<strong>insertion</strong>, <strong>deletion</strong>, <strong>substitution</strong>, or <strong>transposition</strong> of two adjacent characters) required to transform one word into another.
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 font-mono text-[11px] text-cyan-400 border border-slate-800 whitespace-nowrap">
            Max Edit Distance: 2
          </div>
        </div>

        {/* Visual inspection grid */}
        {analysis ? (
          <div className="space-y-6">
            
            {/* Step Visual Transformation: Input -> Deletes -> Candidates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Box 1: Query Word */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 uppercase font-semibold mb-2">
                  1. Query Term
                </div>
                <div className="text-2xl font-mono font-bold text-rose-300 mb-1">
                  "{analysis.word}"
                </div>
                <div className="text-xs text-slate-400">
                  Length: {analysis.word.length} chars
                </div>
                <div className="mt-2 text-[11px] font-mono">
                  {analysis.is_correct ? (
                    <span className="text-emerald-400">Word is in dictionary</span>
                  ) : (
                    <span className="text-amber-400">Spelling anomaly detected</span>
                  )}
                </div>
              </div>

              {/* Box 2: Symmetric Deletes Set */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[11px] text-purple-400 uppercase font-semibold mb-2 flex items-center justify-center gap-1">
                  <Split className="w-3.5 h-3.5" />
                  <span>2. Symmetric Deletes</span>
                </div>
                <div className="text-2xl font-mono font-bold text-purple-300 mb-1">
                  {analysis.symspell_deletes.length}+ Keys
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  Generated at query time in O(1)
                </div>
                <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto p-1 bg-slate-900 rounded border border-slate-800/80 text-[10px] font-mono text-slate-300">
                  {analysis.symspell_deletes.map((d, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-200 border border-purple-800/40">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Box 3: Best Candidate Match */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[11px] text-emerald-400 uppercase font-semibold mb-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>3. Best Match</span>
                </div>
                <div className="text-2xl font-mono font-bold text-emerald-300 mb-1">
                  "{analysis.best_candidate}"
                </div>
                <div className="text-xs text-slate-400">
                  {analysis.symspell_candidates.length > 0 && (
                    <span>
                      Edit Distance: {analysis.symspell_candidates[0].distance} • Frequency: {analysis.symspell_candidates[0].count.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-slate-400 font-mono">
                  Intersection matched in dictionary
                </div>
              </div>

            </div>

            {/* Candidates Comparison Table for this single word */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                SymSpell Candidate Set (Ranked by Damerau-Levenshtein & Frequency)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Rank</th>
                      <th className="py-2.5 px-4">Candidate</th>
                      <th className="py-2.5 px-4">Edit Distance</th>
                      <th className="py-2.5 px-4">Corpus Frequency</th>
                      <th className="py-2.5 px-4">Normalized Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                    {analysis.symspell_candidates.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-4 font-mono text-slate-400">#{idx + 1}</td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-emerald-300">
                          {c.term}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-purple-300">
                          {c.distance} {c.distance === 1 ? '(1 op)' : '(2 ops)'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-300">
                          {c.count.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-cyan-300 font-semibold">
                          {(c.score * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
              <strong>Technical Insight:</strong> {analysis.algorithm_comparison_note}
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">
            Click "Inspect Deletions" or choose one of the sample words above to view SymSpell's internal deletion intersection.
          </div>
        )}

      </div>

    </section>
  );
};
