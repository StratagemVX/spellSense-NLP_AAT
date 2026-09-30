import React, { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  Split,
  Search,
  Zap,
  Layers,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ArrowDown,
  BookOpen,
  Code2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorksPage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState(0);

  const pipelineStages = [
    {
      id: 1,
      title: 'Input Text & Lexical Tokenization',
      shortTitle: 'Tokenization',
      icon: Split,
      badge: 'Regex & Offset Mapping',
      color: 'cyan',
      summary: 'Splits raw sentence into individual word and punctuation tokens while tracking precise character offsets.',
      exampleInput: '"I hav a beutiful day and I am goin to the markat."',
      exampleOutput: 'Tokens: [("I", 0, 1), ("hav", 2, 5), ("a", 6, 7), ("beutiful", 8, 16), ...]',
      explanation: 'Preserving exact start and end character positions ensures that whitespace, quotes, and punctuation can be reconstructed without loss. Words are parsed while retaining case sensitivity for later restoration.',
      codeSnippet: `def split_tokens_with_offsets(text: str):\n    pattern = re.compile(r"([A-Za-z0-9]+(?:'[A-Za-z0-9]+)?)|([^A-Za-z0-9\\s]+)|(\\s+)")\n    for match in pattern.finditer(text):\n        yield (match.group(0), match.start(), match.end(), is_word)`
    },
    {
      id: 2,
      title: 'Error Detection & Lexicon Verification',
      shortTitle: 'Error Detection',
      icon: Search,
      badge: 'O(1) Hash Map Lookup',
      color: 'blue',
      summary: 'Cross-checks every word token against a frequency dictionary of 82,765 verified English terms.',
      exampleInput: 'Token: "hav"',
      exampleOutput: 'Dictionary lookup: False (anomalous term detected)',
      explanation: 'If a token exists in the English dictionary, its edit distance is 0 and it bypasses computationally intensive candidate generation. If missing, it is marked as an anomaly.',
      codeSnippet: `is_known = token.lower() in sym_spell.words\nif not is_known:\n    flag_spelling_mistake(token)`
    },
    {
      id: 3,
      title: 'Candidate Generation',
      shortTitle: 'Candidate Gen',
      icon: Zap,
      badge: 'Symmetric Deletes & Permutations',
      color: 'purple',
      summary: 'Generates potential correction terms within maximum edit distance 2.',
      exampleInput: 'Term: "hav"',
      exampleOutput: 'Candidates: ["have", "has", "had", "hat", "nav", "ham"]',
      explanation: 'TextBlob computes permutations via insertions, deletions, replacements, and transpositions. SymSpell generates only deletions on the query term and matches them against pre-indexed dictionary deletions in sub-millisecond time.',
      codeSnippet: `# SymSpell Symmetric Delete lookup\nsuggestions = sym_spell.lookup(clean_word, Verbosity.ALL, max_edit_distance=2)`
    },
    {
      id: 4,
      title: 'Damerau-Levenshtein Edit Distance',
      shortTitle: 'Edit Distance',
      icon: Layers,
      badge: 'Metric Measurement',
      color: 'amber',
      summary: 'Computes the minimum number of character operations required to transform query into candidate.',
      exampleInput: '"hav" -> "have"',
      exampleOutput: 'Edit Distance = 1 (1 character insertion: +e)',
      explanation: 'Damerau-Levenshtein counts four valid operations: deletion, insertion, substitution, and transposition of two adjacent letters. Over 95% of real-world human typos have an edit distance ≤ 2.',
      codeSnippet: `distance = damerau_levenshtein(original="hav", candidate="have") # returns 1`
    },
    {
      id: 5,
      title: 'Candidate Ranking & Bigram Rescoring',
      shortTitle: 'Candidate Ranking',
      icon: Cpu,
      badge: 'Bayesian & Bigram Heuristics',
      color: 'emerald',
      summary: 'Scores candidates by unigram frequency and contextual bigram frequency to resolve ambiguities.',
      exampleInput: '"am goin" -> evaluate "am join" vs "am going"',
      exampleOutput: '"am going" bigram count = 222,849,344 vs "am join" = 0 -> "going" wins!',
      explanation: 'Raw unigram frequency alone might pick "join" over "going". Contextual bigrams evaluate the surrounding words ("am", "to") to choose the grammatically appropriate word.',
      codeSnippet: `bigram_score = sym_spell.bigrams.get(f"{prev_word} {candidate}", 0)\ntotal_metric = base_distance_score + bigram_boost`
    },
    {
      id: 6,
      title: 'Orthographic Reconstruction & Output',
      shortTitle: 'Reconstruction',
      icon: CheckCircle2,
      badge: 'Case & Span Alignment',
      color: 'cyan',
      summary: 'Reassembles the final corrected sentence while matching original title/upper/lowercase formatting.',
      exampleInput: 'Original: "HAV" -> Corrected: "have"',
      exampleOutput: 'Reconstructed: "HAVE" (preserves all-caps casing and original spaces)',
      explanation: 'The system matches the casing pattern of the original token (UPPERCASE, Titlecase, or lowercase) and replaces characters within their exact character offsets.',
      codeSnippet: `def match_casing(original: str, candidate: str):\n    if original.isupper(): return candidate.upper()\n    if original[0].isupper(): return candidate.capitalize()\n    return candidate.lower()`
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-300">
      
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Interactive Educational Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          How the NLP Pipeline Works
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          From raw keystrokes to context-aware spelling correction. Explore the complete 6-stage NLP lifecycle designed for both general users and academic viva defense.
        </p>
      </div>

      {/* Visual Pipeline Flow (Numbered Cards with Arrows) */}
      <div className="mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = selectedStage === idx;

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(idx)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer min-h-[44px] relative ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-5 h-5 rounded-md text-[11px] font-bold font-mono flex items-center justify-center ${
                    isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    0{stage.id}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                </div>
                <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {stage.shortTitle}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                  {stage.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detailed Card */}
      <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-slate-700/80 shadow-2xl mb-12">
        
        {/* Stage Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-cyan-400">
                STAGE 0{pipelineStages[selectedStage].id} OF 06
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {pipelineStages[selectedStage].badge}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {pipelineStages[selectedStage].title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedStage((prev) => Math.max(0, prev - 1))}
              disabled={selectedStage === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 disabled:opacity-30 cursor-pointer min-h-[36px]"
            >
              ← Previous
            </button>
            <button
              onClick={() => setSelectedStage((prev) => Math.min(pipelineStages.length - 1, prev + 1))}
              disabled={selectedStage === pipelineStages.length - 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 disabled:opacity-30 cursor-pointer min-h-[36px]"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Content Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Explanation & Role */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-semibold text-white uppercase text-xs tracking-wider mb-1.5">
                Overview
              </h3>
              <p>{pipelineStages[selectedStage].summary}</p>
            </div>

            <div>
              <h3 className="font-semibold text-white uppercase text-xs tracking-wider mb-1.5">
                Engineering Mechanism
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                {pipelineStages[selectedStage].explanation}
              </p>
            </div>

            {/* Example Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-slate-400 text-[11px] uppercase tracking-wider font-sans font-semibold">
                Transformation Example:
              </div>
              <div>
                <span className="text-rose-400 font-bold">Input: </span>
                <span className="text-slate-200">{pipelineStages[selectedStage].exampleInput}</span>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">Output: </span>
                <span className="text-slate-200">{pipelineStages[selectedStage].exampleOutput}</span>
              </div>
            </div>
          </div>

          {/* Python Implementation Snippet */}
          <div className="p-4 rounded-xl bg-[#090d18] border border-slate-800 font-mono text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 mb-3 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Python Backend Implementation</span>
                </span>
                <span className="text-cyan-400">production code</span>
              </div>
              <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {pipelineStages[selectedStage].codeSnippet}
              </pre>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Stage 0{selectedStage + 1} of 06</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified in FastAPI Engine</span>
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom CTA to try in Corrector */}
      <div className="text-center py-6">
        <Link
          to="/corrector"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg transition-all min-h-[44px]"
        >
          <span>Test This Pipeline in Corrector</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
