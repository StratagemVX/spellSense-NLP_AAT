import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Zap,
  Cpu
} from 'lucide-react';
import { CorrectionResponse, CorrectionItem } from '../types';

interface CorrectionResultsProps {
  result: CorrectionResponse | null;
  onInspectWord: (word: string) => void;
}

export const CorrectionResults: React.FC<CorrectionResultsProps> = ({
  result,
  onInspectWord,
}) => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'symspell' | 'textblob'>('recommended');
  const [copied, setCopied] = useState(false);
  const [expandedWordId, setExpandedWordId] = useState<number | null>(null);

  if (!result) return null;

  const mistakes = result.corrections.filter((c) => c.is_mistake);
  const hasMistakes = mistakes.length > 0;

  const currentText =
    activeTab === 'recommended'
      ? result.recommended_result
      : activeTab === 'symspell'
      ? result.symspell_result
      : result.textblob_result;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="results" className="w-full max-w-5xl mx-auto mb-16 scroll-mt-20">
      
      {/* Result Container */}
      <div className="rounded-2xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Results Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Correction Analysis
              </h2>
              <p className="text-xs text-slate-400">
                {hasMistakes
                  ? `Identified ${mistakes.length} spelling anomal${mistakes.length === 1 ? 'y' : 'ies'}`
                  : 'Text verified against English lexicon'}
              </p>
            </div>
          </div>

          {/* Engine Result View Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recommended'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recommended</span>
            </button>
            <button
              onClick={() => setActiveTab('symspell')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'symspell'
                  ? 'bg-purple-950/40 text-purple-300 border border-purple-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>SymSpell</span>
            </button>
            <button
              onClick={() => setActiveTab('textblob')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'textblob'
                  ? 'bg-blue-950/40 text-blue-300 border border-blue-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>TextBlob</span>
            </button>
          </div>
        </div>

        {/* Before / After Comparison Visual Panels */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#090d18]/60 border-b border-slate-800/80">
          
          {/* Original Text Panel with highlighted errors */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              <span className="flex items-center gap-1.5 text-rose-400/90">
                <AlertCircle className="w-3.5 h-3.5" />
                Original Text
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {result.original_text.length} chars
              </span>
            </div>
            
            <p className="text-sm sm:text-base leading-relaxed text-slate-300 font-sans">
              {result.corrections.map((item) => {
                if (!item.is_mistake) {
                  return <span key={item.id}>{item.original} </span>;
                }
                return (
                  <span
                    key={item.id}
                    title={`Click to inspect candidate generation for "${item.original}"`}
                    onClick={() => onInspectWord(item.original)}
                    className="inline-block bg-rose-950/60 text-rose-200 border-b-2 border-rose-500 px-1 py-0.5 rounded mr-1 cursor-pointer hover:bg-rose-900/80 transition-colors"
                  >
                    {item.original}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Corrected Text Panel with highlighted improvements */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 relative group">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              <span className="flex items-center gap-1.5 text-emerald-400/90">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Corrected Output ({activeTab})
              </span>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-[11px] font-mono cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-sans">
              {result.corrections.map((item) => {
                const wordToShow =
                  activeTab === 'recommended'
                    ? item.recommended
                    : activeTab === 'symspell'
                    ? item.symspell_correction
                    : item.textblob_correction;

                if (!item.is_mistake) {
                  return <span key={item.id}>{wordToShow} </span>;
                }

                return (
                  <span
                    key={item.id}
                    title={`${item.original} -> ${wordToShow} (${item.chosen_algorithm})`}
                    onClick={() => onInspectWord(item.original)}
                    className="inline-block bg-emerald-950/60 text-emerald-200 border-b-2 border-emerald-500 font-medium px-1 py-0.5 rounded mr-1 cursor-pointer hover:bg-emerald-900/80 transition-colors"
                  >
                    {wordToShow}
                  </span>
                );
              })}
            </p>
          </div>

        </div>

        {/* Word-by-Word Correction Table */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Word-by-Word Correction Table
              </h3>
              <p className="text-xs text-slate-400">
                Detailed linguistic decisions, candidate confidence, and algorithmic agreement
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60">
              {mistakes.length} corrections made
            </span>
          </div>

          {!hasMistakes ? (
            <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-200">
                No spelling errors detected!
              </p>
              <p className="text-xs text-slate-400 mt-1">
                All words verified with 0 edit distance in both the Norvig and SymSpell dictionaries.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Original</th>
                    <th className="py-3 px-4">Recommended</th>
                    <th className="py-3 px-4">SymSpell</th>
                    <th className="py-3 px-4">TextBlob</th>
                    <th className="py-3 px-4">Algorithm</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                  {mistakes.map((c) => {
                    const isExpanded = expandedWordId === c.id;
                    const confBadgeClass =
                      c.confidence_level === 'High'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        : c.confidence_level === 'Medium'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                        : 'bg-slate-800 text-slate-300 border-slate-700';

                    return (
                      <React.Fragment key={c.id}>
                        <tr className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-rose-300">
                            {c.original}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-emerald-300">
                            {c.recommended}
                          </td>
                          <td className="py-3 px-4 font-mono text-purple-300">
                            {c.symspell_correction}
                            <span className="text-[10px] text-slate-400 ml-1">
                              (d={c.symspell_distance})
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-blue-300">
                            {c.textblob_correction}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {c.chosen_algorithm}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${confBadgeClass}`}
                            >
                              {c.confidence_level}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() =>
                                setExpandedWordId(isExpanded ? null : c.id)
                              }
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer text-[11px] inline-flex items-center gap-1 font-mono"
                            >
                              <span>Candidates</span>
                              <ChevronDown
                                className={`w-3 h-3 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          </td>
                        </tr>

                        {/* Collapsible Candidate Inspection Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-900/90 border-y border-slate-800">
                            <td colSpan={7} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                
                                {/* SymSpell Candidate breakdown */}
                                <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-900/40">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-purple-300 flex items-center gap-1">
                                      <Zap className="w-3.5 h-3.5" />
                                      SymSpell Candidates (Edit Distance ≤ 2)
                                    </span>
                                    <button
                                      onClick={() => onInspectWord(c.original)}
                                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <span>Deep Dive</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="space-y-1">
                                    {c.symspell_candidates.length > 0 ? (
                                      c.symspell_candidates.map((cand, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center justify-between font-mono py-0.5 text-slate-300"
                                        >
                                          <span>{idx + 1}. {cand.term}</span>
                                          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                                            <span>dist={cand.distance}</span>
                                            <span className="text-purple-400 font-semibold">
                                              conf={Math.round(cand.score * 100)}%
                                            </span>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-slate-400">No alternate candidates found</span>
                                    )}
                                  </div>
                                </div>

                                {/* TextBlob Candidate breakdown */}
                                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/40">
                                  <div className="font-semibold text-blue-300 flex items-center gap-1 mb-2">
                                    <Cpu className="w-3.5 h-3.5" />
                                    TextBlob Candidates (Norvig Model Probabilities)
                                  </div>
                                  <div className="space-y-1">
                                    {c.textblob_candidates.length > 0 ? (
                                      c.textblob_candidates.map((cand, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center justify-between font-mono py-0.5 text-slate-300"
                                        >
                                          <span>{idx + 1}. {cand.term}</span>
                                          <span className="text-blue-400 font-semibold text-[11px]">
                                            prob={Math.round(cand.score * 100)}%
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-slate-400">No alternate candidates found</span>
                                    )}
                                  </div>
                                </div>

                              </div>

                              {/* Linguistic rationale note */}
                              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                <span>{c.explanation}</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
