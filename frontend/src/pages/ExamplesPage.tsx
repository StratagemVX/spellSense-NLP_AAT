import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Briefcase,
  Keyboard,
  AlignLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ExamplesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const exampleItems = [
    {
      id: 'typo-1',
      category: 'Common Typos',
      icon: Keyboard,
      title: 'Transposition & Omission',
      before: 'We recieved the mesage from the managr and will chek the speling immidiately.',
      after: 'We received the message from the manager and will check the spelling immediately.',
      notes: 'Fixes classic "ie/ei" transpositions and missing vowels in common suffixes.'
    },
    {
      id: 'typo-2',
      category: 'Common Typos',
      icon: Keyboard,
      title: 'Colloquial & Everyday Speech',
      before: 'I hav a beutiful day and I am goin to the markat.',
      after: 'I have a beautiful day and I am going to the market.',
      notes: 'Demonstrates contextual bigram ranking ("am going") over unigram ambiguity ("am join").'
    },
    {
      id: 'student-1',
      category: 'Student Writing',
      icon: GraduationCap,
      title: 'Scientific Laboratory Report',
      before: 'The experyment showed signifikant diferences between the two grouops in the labratory.',
      after: 'The experiment showed significant differences between the two groups in the laboratory.',
      notes: 'Accurately corrects complex Latinate scientific terminology at edit distance 1 and 2.'
    },
    {
      id: 'student-2',
      category: 'Student Writing',
      icon: GraduationCap,
      title: 'Essay Draft Thesis',
      before: 'The developement of technolgy has had a prophound influnce on modren sosiety.',
      after: 'The development of technology has had a profound influence on modern society.',
      notes: 'Corrects phonetic spellings ("prophound" -> "profound", "sosiety" -> "society").'
    },
    {
      id: 'prof-1',
      category: 'Professional Writing',
      icon: Briefcase,
      title: 'Client Email & Scheduling',
      before: 'Please find attache the updated scheduel for our tomorow meetting with the client.',
      after: 'Please find attached the updated schedule for our tomorrow meeting with the client.',
      notes: 'Preserves professional business tone and corrects typical typing omissions.'
    },
    {
      id: 'prof-2',
      category: 'Professional Writing',
      icon: Briefcase,
      title: 'Executive Financial Summary',
      before: 'We must ensure compliance with all regultory guidlines and maintan strict accurasy.',
      after: 'We must ensure compliance with all regulatory guidelines and maintain strict accuracy.',
      notes: 'Corrects corporate compliance lexicon with high confidence ratings.'
    },
    {
      id: 'short-1',
      category: 'Short Sentences',
      icon: AlignLeft,
      title: 'Quick Affirmation',
      before: 'Definately see you tomorow morning.',
      after: 'Definitely see you tomorrow morning.',
      notes: 'Demonstrates classic commonly misspelled terms with 100% agreement.'
    },
    {
      id: 'short-2',
      category: 'Short Sentences',
      icon: AlignLeft,
      title: 'Status Update',
      before: 'The packge has been succesfuly deliverd.',
      after: 'The package has been successfully delivered.',
      notes: 'Corrects multi-character suffix omissions and double-consonant typos.'
    },
    {
      id: 'para-1',
      category: 'Paragraphs',
      icon: BookOpen,
      title: 'Extended Paragraph on NLP',
      before: 'Artifishal inteligence and natrual language procesing have made remarkable progres in recent years. Modren spelling corection tools utilize advansed algorithmic aproaches like SymSpell to achive sub-milisecond lookup speeds while preserving context.',
      after: 'Artificial intelligence and natural language processing have made remarkable progress in recent years. Modern spelling correction tools utilize advanced algorithmic approaches like SymSpell to achieve sub-millisecond lookup speeds while preserving context.',
      notes: 'Multi-sentence batch correction evaluating speed and accuracy across a dense 38-word paragraph.'
    }
  ];

  const categories = ['all', 'Common Typos', 'Student Writing', 'Professional Writing', 'Short Sentences', 'Paragraphs'];

  const filteredExamples =
    selectedCategory === 'all'
      ? exampleItems
      : exampleItems.filter((e) => e.category === selectedCategory);

  const handleTryExample = (textToTry: string) => {
    // Navigate to /corrector with the text in search params
    navigate(`/corrector?text=${encodeURIComponent(textToTry)}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-300">
      
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/60 border border-blue-700/50 text-blue-300 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curated NLP Benchmark Library</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Interactive Example Gallery
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Explore realistic benchmark sentences categorized by linguistic domain. Click "Try This Example" to instantly load and test any scenario in the live workspace.
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer min-h-[38px] ${
                selectedCategory === cat
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold shadow'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Scenarios' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        {filteredExamples.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="rounded-2xl glass-panel p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                    <Icon className="w-3 h-3 text-cyan-400" />
                    <span>{item.category}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">Benchmark #{item.id}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-3">
                  {item.title}
                </h3>

                {/* Before Box */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-2.5">
                  <div className="text-[10px] font-mono text-rose-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Before (Input Text):</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    "{item.before}"
                  </p>
                </div>

                {/* After Box */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 mb-3">
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>After (Corrected Output):</span>
                  </div>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed font-medium">
                    "{item.after}"
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal mb-4">
                  <strong>NLP Note:</strong> {item.notes}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleTryExample(item.before)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500 transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>Try This Example in Corrector</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
