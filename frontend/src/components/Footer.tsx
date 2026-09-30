import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink, Code2, BookOpen, Zap, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#060912] pt-12 pb-8 text-xs text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="sm:col-span-2">
            <Link
              to="/"
              onClick={handleScrollTop}
              className="inline-flex items-center gap-2.5 mb-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                SpellSense
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                NLP Intelligence
              </span>
            </Link>

            <p className="text-slate-400 max-w-sm text-xs leading-relaxed mb-4">
              A modern, production-grade NLP web application comparing <strong>TextBlob</strong> (Peter Norvig's Bayesian probability model) and <strong>SymSpell</strong> (Wolf Garbe's Symmetric Delete algorithm) with real-time empirical benchmarking.
            </p>

            <p className="text-[11px] text-slate-400 font-mono">
              Tagline: <span className="text-cyan-300">Understand. Correct. Write Better.</span>
            </p>
          </div>

          {/* Product Pages */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Application Pages
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  onClick={handleScrollTop}
                  className="hover:text-cyan-400 transition-colors py-1 inline-block"
                >
                  Home Overview
                </Link>
              </li>
              <li>
                <Link
                  to="/corrector"
                  onClick={handleScrollTop}
                  className="hover:text-cyan-400 transition-colors py-1 inline-block"
                >
                  AI Spelling Corrector
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  onClick={handleScrollTop}
                  className="hover:text-cyan-400 transition-colors py-1 inline-block"
                >
                  NLP Pipeline Flow
                </Link>
              </li>
              <li>
                <Link
                  to="/algorithms"
                  onClick={handleScrollTop}
                  className="hover:text-cyan-400 transition-colors py-1 inline-block"
                >
                  TextBlob vs SymSpell
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Architecture */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Resources & Technical
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/examples"
                  onClick={handleScrollTop}
                  className="hover:text-cyan-400 transition-colors py-1 inline-block"
                >
                  Interactive Examples
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={handleScrollTop}
                  className="hover:text-cyan-400 transition-colors py-1 inline-block"
                >
                  About & Architecture
                </Link>
              </li>
              <li>
                <a
                  href="http://127.0.0.1:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 py-1"
                >
                  <span>FastAPI OpenAPI Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="http://127.0.0.1:8000/redoc"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 py-1"
                >
                  <span>ReDoc Specification</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} SpellSense NLP System. Engineered with Python FastAPI, SymSpell, and React 19.</p>
          <div className="flex items-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Academic & Portfolio Grade</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
