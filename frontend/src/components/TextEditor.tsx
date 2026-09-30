import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  Copy,
  ClipboardPaste,
  Sliders,
  Check,
  Zap,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';
import { PresetExample } from '../types';

interface TextEditorProps {
  text: string;
  onChange: (newText: string) => void;
  algorithm: 'compare' | 'textblob' | 'symspell';
  onAlgorithmChange: (algo: 'compare' | 'textblob' | 'symspell') => void;
  onCorrect: () => void;
  isLoading: boolean;
  loadingStep: string;
  examples: PresetExample[];
  onSelectExample: (exampleText: string) => void;
  errorCountEstimate?: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChange,
  algorithm,
  onAlgorithmChange,
  onCorrect,
  isLoading,
  loadingStep,
  examples,
  onSelectExample,
  errorCountEstimate = 0,
}) => {
  const [copied, setCopied] = useState(false);

  // Live word and char count
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange('');
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChange(clipText);
      }
    } catch {
      // In case clipboard permission is denied
    }
  };

  return (
    <div id="workspace" className="w-full max-w-5xl mx-auto mb-12">
      {/* Editor Outer Frame */}
      <div className="rounded-2xl glass-panel border border-slate-700/70 shadow-2xl overflow-hidden">
        
        {/* Editor Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Spelling Correction Workspace</span>
          </div>

          {/* Quick presets pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap">Examples:</span>
            {examples.slice(0, 3).map((ex) => (
              <button
                key={ex.id}
                onClick={() => onSelectExample(ex.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer whitespace-nowrap"
              >
                {ex.title}
              </button>
            ))}
          </div>

          {/* Utility buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePaste}
              title="Paste from clipboard"
              className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors cursor-pointer"
            >
              <ClipboardPaste className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              title="Copy input text"
              className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClear}
              title="Clear editor"
              className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-rose-400 border border-slate-700/50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Textarea Area */}
        <div className="relative p-4 sm:p-6 bg-[#090d18]/70">
          <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type or paste sentences containing spelling mistakes here... (e.g., 'I hav a beutiful day and I am goin to the markat.')"
            rows={5}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 font-sans text-base sm:text-lg focus:outline-none resize-y min-h-[140px] leading-relaxed selection:bg-cyan-500/30"
          />

          {/* Floating live metrics footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span>Words: <strong className="text-slate-200">{wordCount}</strong></span>
              <span>Characters: <strong className="text-slate-200">{charCount}</strong></span>
              {errorCountEstimate > 0 && (
                <span className="text-rose-400">
                  Potential Anomalies: <strong>{errorCountEstimate}</strong>
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-400">
              Max 5,000 characters
            </div>
          </div>
        </div>

        {/* Control and Algorithm Selector Bar */}
        <div className="px-5 py-4 bg-slate-900/90 border-t border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Algorithm Mode Radio Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Engine:
            </span>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onAlgorithmChange('compare')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  algorithm === 'compare'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compare Both</span>
              </button>

              <button
                type="button"
                onClick={() => onAlgorithmChange('symspell')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  algorithm === 'symspell'
                    ? 'bg-purple-950/40 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>SymSpell</span>
              </button>

              <button
                type="button"
                onClick={() => onAlgorithmChange('textblob')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  algorithm === 'textblob'
                    ? 'bg-blue-950/40 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>TextBlob</span>
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={onCorrect}
              disabled={isLoading || !text.trim()}
              className={`w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                isLoading || !text.trim()
                  ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-950/50 hover:shadow-cyan-500/30 hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-mono text-xs">{loadingStep || 'Analyzing text...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Correct Text</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
