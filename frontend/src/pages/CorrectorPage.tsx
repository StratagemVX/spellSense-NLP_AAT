import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  Sparkles,
  Zap,
  Cpu,
  Layers,
  RotateCcw,
  Copy,
  Check,
  ClipboardPaste,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Search,
  ArrowRight,
  Clock,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { correctText, analyzeWord } from '../services/api';
import { CorrectionResponse, SingleWordAnalysis } from '../types';

export const CorrectorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialParamText = searchParams.get('text');

  type RequestStatus = 'idle' | 'processing' | 'success' | 'error';

  const [text, setText] = useState(
    initialParamText || 'I hav a beutiful day and I am goin to the markat.'
  );
  const [algorithm, setAlgorithm] = useState<'compare' | 'textblob' | 'symspell'>('compare');
  const [result, setResult] = useState<CorrectionResponse | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Result navigation tabs
  const [activeResultTab, setActiveResultTab] = useState<'text' | 'corrections' | 'stats' | 'how-symspell-decided'>('text');
  const [expandedWordId, setExpandedWordId] = useState<number | null>(null);

  // "How SymSpell Decided" state
  const [inspectWordInput, setInspectWordInput] = useState('hav');
  const [inspectAnalysis, setInspectAnalysis] = useState<SingleWordAnalysis | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);

  // Live text metrics
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Ref guards for React StrictMode and duplicate request prevention
  const isRequestingRef = useRef(false);
  const hasMountedRef = useRef(false);

  const isProcessing = status === 'processing';

  // Execute correction cleanly without artificial delay or layout flashing
  const handleCorrect = async (textToRun = text, algoToRun = algorithm) => {
    // Guard: Prevent double-click or simultaneous requests
    if (isRequestingRef.current) return;

    const trimmed = textToRun.trim();

    // 1. Validation: Empty input
    if (!trimmed) {
      setErrorMsg('Please enter some text to correct.');
      return;
    }

    // 2. Validation: Long input
    if (trimmed.length > 5000) {
      setErrorMsg('Input exceeds maximum limit of 5,000 characters. Please shorten your text.');
      return;
    }

    setErrorMsg(null);
    setStatus('processing');
    isRequestingRef.current = true;

    try {
      const data = await correctText(trimmed, algoToRun);
      
      // Update result state ONCE
      setResult(data);
      setStatus('success');

      // Populate inspect word analysis directly in-memory without extra secondary network fetch
      const firstMistake = data.corrections.find((c) => c.is_mistake);
      if (firstMistake) {
        setInspectWordInput(firstMistake.original);
        setInspectAnalysis({
          word: firstMistake.original,
          is_correct: false,
          selected_correction: firstMistake.symspell_correction,
          edit_distance: firstMistake.symspell_distance,
          candidate_generation: firstMistake.symspell_candidates.slice(0, 4).map((c) => `${c.term} (d=${c.distance})`),
          decision_steps: [
            { step_name: 'Lookup', value: firstMistake.original, description: 'Misspelled token identified' },
            { step_name: 'SymDeletes', value: `${firstMistake.symspell_candidates.length} candidates`, description: 'Generated via symmetric delete' },
            { step_name: 'Best Match', value: firstMistake.symspell_correction, description: `Edit distance ${firstMistake.symspell_distance}` },
          ],
          edit_distance_explained: `Edit distance of ${firstMistake.symspell_distance} operation(s) to reach "${firstMistake.symspell_correction}".`,
          symspell_deletes: [firstMistake.original],
          symspell_candidates: firstMistake.symspell_candidates.map((c) => ({
            term: c.term,
            distance: c.distance ?? firstMistake.symspell_distance,
            count: 1000,
            score: c.score,
          })),
          textblob_candidates: firstMistake.textblob_candidates.map((c) => ({
            term: c.term,
            score: c.score,
          })),
          best_candidate: firstMistake.symspell_correction,
          algorithm_comparison_note: firstMistake.explanation,
        });
      }
    } catch (e: any) {
      setStatus('error');

      if (e.message && (e.message.includes('Failed to fetch') || e.message.includes('unreachable') || e.message.includes('NetworkError'))) {
        setErrorMsg('Unable to connect to the NLP service. Please try again.');
      } else if (e.message) {
        setErrorMsg(e.message);
      } else {
        setErrorMsg('Unable to process the text. Please try again.');
      }
    } finally {
      isRequestingRef.current = false;
    }
  };

  // Run on mount safely under React StrictMode (runs exactly once)
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    const initialText = initialParamText || 'I hav a beutiful day and I am goin to the markat.';
    if (initialParamText) {
      setText(initialParamText);
    }
    handleCorrect(initialText, 'compare');
  }, [initialParamText]);

  // "How SymSpell Decided" inspector (called on user demand)
  const runHowSymSpellDecided = async (targetWord: string) => {
    if (!targetWord.trim() || isInspecting) return;
    setIsInspecting(true);
    try {
      const data = await analyzeWord(targetWord.trim(), 2);
      setInspectAnalysis(data);
    } catch {
      // Ignore
    } finally {
      setIsInspecting(false);
    }
  };

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const mistakes = result?.corrections.filter((c) => c.is_mistake) || [];
  const hasNoMistakes = result && mistakes.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
      
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <span>AI Spelling Corrector</span>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            Interactive Workspace
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Detect and correct spelling mistakes using TextBlob and SymSpell.
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => handleCorrect()}
            className="px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-white font-medium text-xs whitespace-nowrap cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* MAIN TEXT EDITOR WORKSPACE */}
      <div className="rounded-2xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden mb-8">
        
        {/* Editor Top Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Enter your text</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  const clip = await navigator.clipboard.readText();
                  if (clip) setText(clip);
                } catch {}
              }}
              title="Paste text"
              aria-label="Paste text from clipboard"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
            >
              <ClipboardPaste className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setText('');
                setResult(null);
                setErrorMsg(null);
              }}
              title="Clear editor"
              aria-label="Clear text editor"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 border border-slate-700/60 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Textarea Area */}
        <div className="p-4 sm:p-5 bg-[#090d18]/80">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text (e.g. 'I hav a beutiful day and I am goin to the markat.')"
            rows={4}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 font-sans text-base sm:text-lg focus:outline-none resize-y min-h-[120px] leading-relaxed selection:bg-cyan-500/30"
          />

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span>Words: <strong className="text-slate-200">{wordCount}</strong></span>
              <span>Characters: <strong className="text-slate-200">{charCount}</strong></span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">Max 5,000 characters</div>
          </div>
        </div>

        {/* Controls & Engine Selector Bar */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 space-y-3">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* CORRECTION METHOD Selector (Requirement 4) */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                CORRECTION METHOD
              </span>

              {/* 3 Clear Buttons: Compare Both, SymSpell, TextBlob */}
              <div className="flex flex-wrap sm:inline-flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAlgorithm('compare');
                    if (result && !isRequestingRef.current) handleCorrect(text, 'compare');
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 ${
                    algorithm === 'compare'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700 shadow font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Compare Both</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAlgorithm('symspell');
                    if (result && !isRequestingRef.current) handleCorrect(text, 'symspell');
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 ${
                    algorithm === 'symspell'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-700 shadow font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span>SymSpell</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAlgorithm('textblob');
                    if (result && !isRequestingRef.current) handleCorrect(text, 'textblob');
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 ${
                    algorithm === 'textblob'
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-700 shadow font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>TextBlob</span>
                </button>
              </div>

              {/* Helpful description directly below buttons (Requirement 4) */}
              <p className="text-xs text-slate-400 pl-1">
                {algorithm === 'compare' && 'Run TextBlob and SymSpell and compare their corrections.'}
                {algorithm === 'symspell' && 'Correct text using the SymSpell algorithm.'}
                {algorithm === 'textblob' && 'Correct text using the TextBlob algorithm.'}
              </p>
            </div>

            {/* Actions: [Clear] and [✦ Correct Text] */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto w-full lg:w-auto justify-end pt-2 sm:pt-0">
              <button
                onClick={() => {
                  setText('');
                  setResult(null);
                  setErrorMsg(null);
                  setStatus('idle');
                }}
                disabled={isProcessing}
                className="w-1/3 sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer min-h-[44px] flex items-center justify-center transition-colors disabled:opacity-50"
              >
                Clear
              </button>

              <button
                onClick={() => handleCorrect()}
                disabled={isProcessing}
                className={`w-2/3 sm:w-auto px-7 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] shadow-lg ${
                  isProcessing
                    ? 'bg-slate-800 text-slate-400 border border-slate-700/60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-950/50 cursor-pointer'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="text-base mr-1">⏳</span>
                    <span className="font-mono">Correcting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-cyan-200">✦</span>
                    <span>Correct Text</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Zero-shift fixed height status bar — always occupies space */}
          <div className="min-h-[28px] flex items-center justify-between text-xs font-mono border-t border-slate-800/80 pt-2.5">
            {status === 'processing' && (
              <div className="flex items-center gap-2 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                <span>Running NLP correction...</span>
              </div>
            )}
            {status === 'success' && (
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>✓ Correction Complete</span>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Unable to process the text. Please try again.</span>
              </div>
            )}
            {status === 'idle' && (
              <div className="text-slate-500 text-[11px]">
                Ready to analyze text.
              </div>
            )}
            {result && status !== 'processing' && (
              <span className="text-slate-400 text-[11px]">
                Latency: <strong className="text-slate-200">{result.processing_time_ms}ms</strong>
              </span>
            )}
          </div>

        </div>

      </div>

      {/* RESULTS DISPLAY: DYNAMIC CARDS & TABS */}
      <div className="min-h-[300px]">
        {/* Initial loading skeleton if first request has not produced result yet */}
        {!result && isProcessing && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="h-10 w-32 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
              <div className="h-10 w-44 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
              <div className="h-10 w-36 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
              <div className="h-10 w-40 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            </div>
            <div className="rounded-2xl glass-panel p-6 border border-slate-700/80 shadow-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="h-28 rounded-xl bg-slate-900/70 border border-slate-800 animate-pulse" />
                <div className="h-28 rounded-xl bg-slate-900/70 border border-slate-800 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Stable Result Container — keeps stable identity during updates */}
        {result && (
          <div className={`space-y-6 transition-opacity duration-200 ${isProcessing ? 'opacity-70' : 'opacity-100'}`}>
            
            {/* Main Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto text-xs font-medium">
                <button
                  onClick={() => setActiveResultTab('text')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap min-h-[44px] flex items-center gap-1.5 ${
                    activeResultTab === 'text'
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800 font-semibold shadow'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Corrected Text</span>
                </button>

            <button
              onClick={() => setActiveResultTab('corrections')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap min-h-[44px] flex items-center gap-1.5 ${
                activeResultTab === 'corrections'
                  ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800 font-semibold shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Detected Corrections ({mistakes.length})</span>
            </button>

            <button
              onClick={() => setActiveResultTab('stats')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap min-h-[44px] flex items-center gap-1.5 ${
                activeResultTab === 'stats'
                  ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800 font-semibold shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Statistics & Latency</span>
            </button>

            <button
              onClick={() => setActiveResultTab('how-symspell-decided')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap min-h-[44px] flex items-center gap-1.5 ${
                activeResultTab === 'how-symspell-decided'
                  ? 'bg-purple-950/70 text-purple-300 border border-purple-800 font-semibold shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>How SymSpell Decided</span>
            </button>
          </div>

          {isProcessing && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Updating...</span>
            </span>
          )}
        </div>

          {/* TAB 1: CORRECTED TEXT (Requirement 5 & 7 - DYNAMIC TO SELECTED ALGORITHM) */}
          {activeResultTab === 'text' && (
            <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-slate-700/80 shadow-xl space-y-6">
              
              {/* If no mistakes found */}
              {hasNoMistakes && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>✓ No spelling mistakes detected. All words match the English dictionary.</span>
                </div>
              )}

              {/* Dynamic layout based on algorithm selection */}
              
              {/* CASE A: COMPARE BOTH SELECTED */}
              {algorithm === 'compare' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* 1. Original Input */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-xs font-semibold text-rose-400 mb-2.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Original Input
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{result.original_text.length} chars</span>
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                        {result.corrections.map((item) => {
                          if (!item.is_mistake) return <span key={item.id}>{item.original} </span>;
                          return (
                            <span
                              key={item.id}
                              onClick={() => {
                                setInspectWordInput(item.original);
                                runHowSymSpellDecided(item.original);
                                setActiveResultTab('how-symspell-decided');
                              }}
                              title={`Click to see How SymSpell Decided for "${item.original}"`}
                              className="bg-rose-950/80 text-rose-200 border-b-2 border-rose-500 px-1 py-0.5 rounded mr-1 cursor-pointer hover:bg-rose-900 transition-colors"
                            >
                              {item.original}
                            </span>
                          );
                        })}
                      </p>
                    </div>

                    {/* 2. Recommended Correction */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 relative">
                      <div className="text-xs font-semibold text-emerald-400 mb-2.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Recommended Correction (Consensus)
                        </span>
                        <button
                          onClick={() => handleCopy(result.recommended_result, 'rec')}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedKey === 'rec' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'rec' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed text-slate-100">
                        {result.corrections.map((item) => {
                          if (!item.is_mistake) return <span key={item.id}>{item.recommended} </span>;
                          return (
                            <span
                              key={item.id}
                              className="bg-emerald-950/80 text-emerald-200 border-b-2 border-emerald-500 font-medium px-1 py-0.5 rounded mr-1"
                            >
                              {item.recommended}
                            </span>
                          );
                        })}
                      </p>
                    </div>

                  </div>

                  {/* Side-by-side TextBlob vs SymSpell output */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    
                    {/* 3. TextBlob Result */}
                    <div className="p-4 rounded-xl bg-blue-950/15 border border-blue-900/40">
                      <div className="text-xs font-semibold text-blue-300 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-blue-400" />
                          TextBlob Result (Norvig Model)
                        </span>
                        <button
                          onClick={() => handleCopy(result.textblob_result, 'tb')}
                          className="text-[11px] font-mono text-slate-400 hover:text-blue-300 cursor-pointer flex items-center gap-1"
                        >
                          {copiedKey === 'tb' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-200 font-sans">
                        {result.textblob_result}
                      </p>
                    </div>

                    {/* 4. SymSpell Result */}
                    <div className="p-4 rounded-xl bg-purple-950/15 border border-purple-900/40">
                      <div className="text-xs font-semibold text-purple-300 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-purple-400" />
                          SymSpell Result (Symmetric Delete)
                        </span>
                        <button
                          onClick={() => handleCopy(result.symspell_result, 'ss')}
                          className="text-[11px] font-mono text-slate-400 hover:text-purple-300 cursor-pointer flex items-center gap-1"
                        >
                          {copiedKey === 'ss' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-200 font-sans">
                        {result.symspell_result}
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* CASE B: SYMSPELL ONLY SELECTED (Requirement 5) */}
              {algorithm === 'symspell' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="text-xs font-semibold text-rose-400 mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Original Input
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{result.original_text.length} chars</span>
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                      {result.corrections.map((item) => {
                        if (!item.is_mistake) return <span key={item.id}>{item.original} </span>;
                        return (
                          <span
                            key={item.id}
                            className="bg-rose-950/80 text-rose-200 border-b-2 border-rose-500 px-1 py-0.5 rounded mr-1"
                          >
                            {item.original}
                          </span>
                        );
                      })}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/60 relative">
                    <div className="text-xs font-semibold text-purple-300 mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                        SymSpell Corrected Output
                      </span>
                      <button
                        onClick={() => handleCopy(result.symspell_result, 'ss_only')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'ss_only' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'ss_only' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed text-slate-100">
                      {result.corrections.map((item) => {
                        if (!item.is_mistake) return <span key={item.id}>{item.symspell_correction} </span>;
                        return (
                          <span
                            key={item.id}
                            className="bg-purple-950/80 text-purple-200 border-b-2 border-purple-500 font-medium px-1 py-0.5 rounded mr-1"
                          >
                            {item.symspell_correction}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* CASE C: TEXTBLOB ONLY SELECTED (Requirement 5) */}
              {algorithm === 'textblob' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="text-xs font-semibold text-rose-400 mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Original Input
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{result.original_text.length} chars</span>
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                      {result.corrections.map((item) => {
                        if (!item.is_mistake) return <span key={item.id}>{item.original} </span>;
                        return (
                          <span
                            key={item.id}
                            className="bg-rose-950/80 text-rose-200 border-b-2 border-rose-500 px-1 py-0.5 rounded mr-1"
                          >
                            {item.original}
                          </span>
                        );
                      })}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/60 relative">
                    <div className="text-xs font-semibold text-blue-300 mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                        TextBlob Corrected Output
                      </span>
                      <button
                        onClick={() => handleCopy(result.textblob_result, 'tb_only')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'tb_only' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'tb_only' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed text-slate-100">
                      {result.corrections.map((item) => {
                        if (!item.is_mistake) return <span key={item.id}>{item.textblob_correction} </span>;
                        return (
                          <span
                            key={item.id}
                            className="bg-blue-950/80 text-blue-200 border-b-2 border-blue-500 font-medium px-1 py-0.5 rounded mr-1"
                          >
                            {item.textblob_correction}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: DETECTED CORRECTIONS (DYNAMIC TO ALGORITHM - Requirement 6) */}
          {activeResultTab === 'corrections' && (
            <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-slate-700/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Detected Corrections</h3>
                  <p className="text-xs text-slate-400">
                    {algorithm === 'compare'
                      ? 'Detailed breakdown of decisions between TextBlob and SymSpell.'
                      : `Detailed breakdown of corrections produced by ${algorithm === 'symspell' ? 'SymSpell' : 'TextBlob'}.`}
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800">
                  {mistakes.length} corrections made
                </span>
              </div>

              {hasNoMistakes ? (
                <div className="p-6 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <span>✓ No spelling mistakes detected.</span>
                </div>
              ) : (
                <>
                  {/* MOBILE VIEW: Responsive Stacked Cards (< 768px - Requirement 12) */}
                  <div className="md:hidden space-y-3">
                    {mistakes.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-mono text-rose-300 font-bold text-sm">
                            {c.original}
                          </span>
                          <span className="text-slate-400 font-mono">→</span>
                          <span className="font-mono text-emerald-300 font-bold text-sm">
                            {algorithm === 'symspell' ? c.symspell_correction : (algorithm === 'textblob' ? c.textblob_correction : c.recommended)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          {algorithm === 'compare' && (
                            <div>
                              <span className="text-slate-400 block">Algorithm:</span>
                              <span className="text-cyan-300 font-medium">{c.chosen_algorithm}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-400 block">Confidence:</span>
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded font-bold ${
                                c.confidence_level === 'High'
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-amber-950 text-amber-300'
                              }`}
                            >
                              {c.confidence_level}
                            </span>
                          </div>
                          {(algorithm === 'compare' || algorithm === 'symspell') && (
                            <div>
                              <span className="text-slate-400 block">SymSpell:</span>
                              <span className="text-purple-300 font-mono">
                                {c.symspell_correction} (d={c.symspell_distance})
                              </span>
                            </div>
                          )}
                          {(algorithm === 'compare' || algorithm === 'textblob') && (
                            <div>
                              <span className="text-slate-400 block">TextBlob:</span>
                              <span className="text-blue-300 font-mono">{c.textblob_correction}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">{c.explanation}</span>
                          <button
                            onClick={() => {
                              setInspectWordInput(c.original);
                              runHowSymSpellDecided(c.original);
                              setActiveResultTab('how-symspell-decided');
                            }}
                            className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer"
                          >
                            Why?
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DESKTOP VIEW: Clean Table (>= 768px) */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Original</th>
                          <th className="py-3 px-4">
                            {algorithm === 'compare' ? 'Recommended' : (algorithm === 'symspell' ? 'SymSpell Output' : 'TextBlob Output')}
                          </th>
                          {algorithm === 'compare' && (
                            <>
                              <th className="py-3 px-4">SymSpell</th>
                              <th className="py-3 px-4">TextBlob</th>
                              <th className="py-3 px-4">Chosen By</th>
                            </>
                          )}
                          {algorithm === 'symspell' && <th className="py-3 px-4">Edit Distance</th>}
                          <th className="py-3 px-4">Candidate Confidence</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                        {mistakes.map((c) => {
                          const isExpanded = expandedWordId === c.id;
                          const chosenDisplay =
                            algorithm === 'symspell'
                              ? c.symspell_correction
                              : algorithm === 'textblob'
                              ? c.textblob_correction
                              : c.recommended;

                          return (
                            <React.Fragment key={c.id}>
                              <tr className="hover:bg-slate-900/50">
                                <td className="py-3 px-4 font-mono font-medium text-rose-300">
                                  {c.original}
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-emerald-300">
                                  {chosenDisplay}
                                </td>
                                {algorithm === 'compare' && (
                                  <>
                                    <td className="py-3 px-4 font-mono text-purple-300">
                                      {c.symspell_correction} (d={c.symspell_distance})
                                    </td>
                                    <td className="py-3 px-4 font-mono text-blue-300">
                                      {c.textblob_correction}
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">
                                        {c.chosen_algorithm}
                                      </span>
                                    </td>
                                  </>
                                )}
                                {algorithm === 'symspell' && (
                                  <td className="py-3 px-4 font-mono text-purple-300">
                                    {c.symspell_distance}
                                  </td>
                                )}
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                      c.confidence_level === 'High'
                                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                        : 'bg-amber-950 text-amber-300 border-amber-700'
                                    }`}
                                  >
                                    {c.confidence_level}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setExpandedWordId(isExpanded ? null : c.id)}
                                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono cursor-pointer"
                                    >
                                      {isExpanded ? 'Hide' : 'Candidates'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setInspectWordInput(c.original);
                                        runHowSymSpellDecided(c.original);
                                        setActiveResultTab('how-symspell-decided');
                                      }}
                                      className="px-2 py-1 rounded bg-purple-950/60 hover:bg-purple-900 text-purple-300 text-[11px] font-mono cursor-pointer border border-purple-800"
                                    >
                                      Inspect
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {isExpanded && (
                                <tr className="bg-slate-900/90 border-y border-slate-800">
                                  <td colSpan={algorithm === 'compare' ? 7 : 5} className="p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                                      {c.symspell_candidates.length > 0 && (
                                        <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-900/40">
                                          <div className="text-purple-300 font-bold mb-1">
                                            SymSpell Candidates:
                                          </div>
                                          {c.symspell_candidates.slice(0, 4).map((cand, idx) => (
                                            <div key={idx} className="flex justify-between py-0.5 text-slate-300">
                                              <span>{cand.term}</span>
                                              <span className="text-slate-400">d={cand.distance} | {Math.round(cand.score * 100)}%</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {c.textblob_candidates.length > 0 && (
                                        <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/40">
                                          <div className="text-blue-300 font-bold mb-1">
                                            TextBlob Candidates:
                                          </div>
                                          {c.textblob_candidates.slice(0, 4).map((cand, idx) => (
                                            <div key={idx} className="flex justify-between py-0.5 text-slate-300">
                                              <span>{cand.term}</span>
                                              <span className="text-slate-400">{Math.round(cand.score * 100)}% prob</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="mt-2 text-[11px] text-slate-400 font-sans">
                                      <strong>Decision:</strong> {c.explanation}
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
                </>
              )}
            </div>
          )}

          {/* TAB 3: STATISTICS & LATENCY (DYNAMIC TO ALGORITHM - Requirement 6 & 9) */}
          {activeResultTab === 'stats' && (
            <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-slate-700/80 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Legitimate Model Metrics</h3>
                <p className="text-xs text-slate-400">
                  Real measurements calculated during this request (no simulated accuracy)
                </p>
              </div>

              {/* 4 Legitimate Metrics (Requirement 9) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Words Analyzed</span>
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {result.statistics.total_words}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Errors Detected</span>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
                    {result.statistics.total_corrections_made}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Corrections Made</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
                    {result.statistics.total_corrections_made}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Processing Time</span>
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
                    {result.processing_time_ms} <span className="text-xs font-normal">ms</span>
                  </div>
                </div>
              </div>

              {/* Dynamic timing details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                {algorithm === 'compare' ? (
                  <>
                    <div className="flex justify-between text-slate-300">
                      <span>SymSpell Latency:</span>
                      <span className="text-purple-400 font-bold">{result.statistics.symspell_time_ms} ms</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>TextBlob Latency:</span>
                      <span className="text-blue-400 font-bold">{result.statistics.textblob_time_ms} ms</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Consensus Agreement:</span>
                      <span className="text-emerald-400 font-bold">{result.statistics.agreement_percentage}%</span>
                    </div>
                  </>
                ) : algorithm === 'symspell' ? (
                  <div className="flex justify-between text-slate-300">
                    <span>SymSpell Execution Time:</span>
                    <span className="text-purple-400 font-bold">{result.statistics.symspell_time_ms} ms</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-slate-300">
                    <span>TextBlob Execution Time:</span>
                    <span className="text-blue-400 font-bold">{result.statistics.textblob_time_ms} ms</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  Notice: All metrics reflect actual wall-clock processing measured via high-resolution timers.
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: "HOW SYMSPELL DECIDED" (Requirement 8) */}
          {activeResultTab === 'how-symspell-decided' && (
            <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-slate-700/80 shadow-xl space-y-6">
              
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>How SymSpell Decided</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual explanation of candidate generation, edit distance, and selection for beginners and viva presentations.
                </p>
              </div>

              {/* Word input trigger */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={inspectWordInput}
                  onChange={(e) => setInspectWordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runHowSymSpellDecided(inspectWordInput)}
                  placeholder="Enter any word (e.g. hav, beutiful, goin, markat)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-cyan-500 min-h-[44px]"
                />
                <button
                  onClick={() => runHowSymSpellDecided(inspectWordInput)}
                  disabled={isInspecting || !inspectWordInput.trim()}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isInspecting ? 'Explaining...' : 'Explain Word'}</span>
                </button>
              </div>

              {/* Visual Step-by-Step Decision Flow */}
              {inspectAnalysis ? (
                <div className="space-y-6">
                  
                  {/* Clean 4-Stage Decision Diagram */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    
                    {/* Stage 1: Incorrect Word */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                      <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider font-mono">
                        1. Incorrect Word
                      </div>
                      <div className="text-2xl font-bold font-mono text-rose-300">
                        {inspectAnalysis.word}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        {inspectAnalysis.is_correct ? 'Valid in dictionary' : 'Not found in vocabulary'}
                      </div>
                    </div>

                    {/* Stage 2: Candidate Generation */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                      <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider font-mono">
                        2. Candidate Generation
                      </div>
                      <div className="text-xs font-mono text-purple-300 font-semibold space-y-1">
                        {inspectAnalysis.candidate_generation.slice(0, 4).map((c, i) => (
                          <div key={i}>{c}</div>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        Matched via Symmetric Deletes
                      </div>
                    </div>

                    {/* Stage 3: Edit Distance */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                        3. Edit Distance
                      </div>
                      <div className="text-2xl font-bold font-mono text-amber-300">
                        {inspectAnalysis.edit_distance}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        {inspectAnalysis.edit_distance === 1 ? '1 letter operation' : `${inspectAnalysis.edit_distance} letter operations`}
                      </div>
                    </div>

                    {/* Stage 4: Selected Correction */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                        4. Selected Correction
                      </div>
                      <div className="text-2xl font-bold font-mono text-emerald-300">
                        {inspectAnalysis.selected_correction}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        Lowest distance & highest frequency
                      </div>
                    </div>

                  </div>

                  {/* Viva-Friendly Narrative Explanation */}
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs sm:text-sm text-slate-300 space-y-2">
                    <div className="font-bold text-purple-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-purple-400" />
                      <span>Viva Voce Explanation:</span>
                    </div>
                    <p className="leading-relaxed text-slate-300">
                      When evaluating the misspelled word <strong className="text-rose-300">"{inspectAnalysis.word}"</strong>, SymSpell generated deletion patterns and matched them against the pre-indexed English lexicon in constant <code>O(1)</code> time. It identified <strong className="text-emerald-300">"{inspectAnalysis.selected_correction}"</strong> at edit distance <strong className="text-amber-300">{inspectAnalysis.edit_distance}</strong>, ranking it highest because of its minimal edit distance and high corpus frequency.
                    </p>
                  </div>

                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs font-mono bg-slate-950/50 rounded-xl border border-slate-800">
                  Enter a misspelled word above and click "Explain Word" to see the visual 4-step decision breakdown.
                </div>
              )}

            </div>
          )}

        </div>
      )}

      </div>

    </div>
  );
};
