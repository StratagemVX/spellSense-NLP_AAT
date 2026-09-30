import React from 'react';
import { Sparkles, ArrowRight, BookOpen, GraduationCap, Briefcase, Keyboard, AlignLeft } from 'lucide-react';
import { PresetExample } from '../types';

interface ExampleSectionProps {
  examples: PresetExample[];
  onSelectExample: (text: string) => void;
}

export const ExampleSection: React.FC<ExampleSectionProps> = ({
  examples,
  onSelectExample,
}) => {
  const getIcon = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'everyday':
        return Sparkles;
      case 'academic':
        return GraduationCap;
      case 'business':
        return Briefcase;
      case 'keyboard typos':
        return Keyboard;
      default:
        return AlignLeft;
    }
  };

  return (
    <section id="examples" className="w-full max-w-5xl mx-auto mb-20 scroll-mt-20">
      
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/60 border border-blue-700/50 text-blue-300 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Interactive Demonstrations</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Try an Example Scenario
        </h2>
        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base">
          Select any curated test case below to populate the workspace and verify real-time correction in under 10 seconds.
        </p>
      </div>

      {/* Grid of Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examples.map((ex) => {
          const Icon = getIcon(ex.badge);

          return (
            <div
              key={ex.id}
              onClick={() => onSelectExample(ex.text)}
              className="rounded-2xl glass-panel p-5 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all cursor-pointer flex flex-col justify-between group shadow-lg hover:shadow-cyan-950/30"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                    <Icon className="w-3 h-3 text-cyan-400" />
                    <span>{ex.badge}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors">
                  {ex.title}
                </h3>

                <p className="text-xs text-slate-400 font-sans line-clamp-3 leading-relaxed mb-4">
                  "{ex.text}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 group-hover:text-cyan-400 transition-colors">
                <span>Load into Corrector</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
