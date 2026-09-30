import React, { useState } from 'react';
import {
  GraduationCap,
  HelpCircle,
  ChevronDown,
  BookOpen,
  Sparkles,
  Zap,
  CheckCircle2,
  FileCode2
} from 'lucide-react';

export const VivaGuide: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: 'Why compare both TextBlob and SymSpell in one project?',
      a: 'Comparing both demonstrates two fundamentally contrasting paradigms in NLP. TextBlob represents the classic Peter Norvig Bayesian generator, which computes candidates on-the-fly via character permutations. SymSpell represents modern production search engine architecture, using pre-computed Symmetric Deletes for sub-millisecond hash table lookups. Demonstrating both proves depth of understanding across algorithmic trade-offs.'
    },
    {
      q: 'Why does SymSpell only generate deletions and not insertions or replacements?',
      a: 'Wolf Garbe realized that any edit operation (insertion, substitution, transposition) between two terms can be reformulated symmetrically through deletions! For instance, inserting a letter into word A to match word B is mathematically identical to deleting that letter from word B to match word A. By only generating deletions, the candidate generation alphabet size (26 English letters) is eliminated from the runtime equation.'
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
    <section id="viva-guide" className="w-full max-w-5xl mx-auto mb-20 scroll-mt-20">
      
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/60 border border-purple-700/50 text-purple-300 mb-3">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>College Defense & Technical Interview Companion</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Viva Presentation & Academic Guide
        </h2>
        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base">
          Key architectural rationales, theoretical justifications, and model comparison answers ready for professor inquiries and viva voce.
        </p>
      </div>

      {/* Two Highlight Cards: Why Two Algorithms & Why SymSpell */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        <div className="rounded-2xl glass-panel p-6 border border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Why Two Algorithms?</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            In academic evaluations, showing a single black-box algorithm offers limited insight. Demonstrating both <strong>TextBlob (probabilistic Bayes)</strong> and <strong>SymSpell (algorithmic indexing)</strong> reveals how computational complexity, memory structures, and search heuristics directly impact NLP efficiency.
          </p>
        </div>

        <div className="rounded-2xl glass-panel p-6 border border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Why SymSpell?</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Standard Levenshtein searches scale exponentially with word length. SymSpell eliminates this bottleneck through its <strong>Symmetric Delete algorithm</strong>, allowing instant <code>O(1)</code> candidate retrieval regardless of vocabulary size, making it the industry standard for search autocomplete.
          </p>
        </div>

      </div>

      {/* Accordion Questions */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800 bg-slate-900/40">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span>Frequently Asked Viva & Interview Questions</span>
        </h3>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800/80 bg-slate-950/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80">
                    <p className="pt-2">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};
