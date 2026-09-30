import React from 'react';
import {
  BarChart3,
  Clock,
  Zap,
  Cpu,
  Layers,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { CorrectionStatistics } from '../types';

interface StatisticsPanelProps {
  stats: CorrectionStatistics | null;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mb-16">
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Empirical NLP Statistics & Performance</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real measured metrics collected during model execution (no artificial simulations)
          </p>
        </div>
      </div>

      {/* Grid of Key Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        
        {/* Card 1: Words Analyzed */}
        <div className="rounded-xl glass-panel p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Words Analyzed</span>
            <FileCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mb-1">
            {stats.total_words}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.total_characters} characters processed
          </div>
        </div>

        {/* Card 2: Errors Detected */}
        <div className="rounded-xl glass-panel p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Errors Detected</span>
            <CheckCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-300 mb-1">
            {stats.total_corrections_made}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.words_corrected_percentage}% of words required fix
          </div>
        </div>

        {/* Card 3: Inter-Algorithm Consensus */}
        <div className="rounded-xl glass-panel p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Model Agreement</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300 mb-1">
            {stats.agreement_percentage}%
          </div>
          <div className="text-[11px] text-slate-400">
            TextBlob & SymSpell consensus
          </div>
        </div>

        {/* Card 4: Execution Speedup */}
        <div className="rounded-xl glass-panel p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>SymSpell Latency</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-300 mb-1">
            {stats.symspell_time_ms} <span className="text-xs font-normal">ms</span>
          </div>
          <div className="text-[11px] text-slate-400">
            vs TextBlob {stats.textblob_time_ms} ms
          </div>
        </div>

      </div>

      {/* Speed & Execution Comparison Bar */}
      <div className="rounded-xl glass-panel p-4 border border-slate-800/80 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-3">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Execution Latency Profile (Wall-clock Time)</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Measured via high-resolution <code className="text-cyan-300">time.perf_counter()</code>
          </div>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {/* SymSpell bar */}
          <div className="flex items-center gap-3">
            <span className="w-24 text-purple-300 font-sans font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" /> SymSpell:
            </span>
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      12,
                      (stats.symspell_time_ms /
                        Math.max(stats.textblob_time_ms + stats.symspell_time_ms, 0.01)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
            <span className="text-purple-300 w-16 text-right font-semibold">
              {stats.symspell_time_ms} ms
            </span>
          </div>

          {/* TextBlob bar */}
          <div className="flex items-center gap-3">
            <span className="w-24 text-blue-300 font-sans font-medium flex items-center gap-1">
              <Cpu className="w-3 h-3 text-blue-400" /> TextBlob:
            </span>
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      12,
                      (stats.textblob_time_ms /
                        Math.max(stats.textblob_time_ms + stats.symspell_time_ms, 0.01)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
            <span className="text-blue-300 w-16 text-right font-semibold">
              {stats.textblob_time_ms} ms
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-cyan-400" />
          <span>
            SymSpell leverages pre-indexed symmetric delete tables, eliminating candidate search loops at query time.
          </span>
        </div>
      </div>

    </div>
  );
};
