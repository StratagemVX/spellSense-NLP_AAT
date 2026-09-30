import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  customTitle?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customTitle }) => {
  const location = useLocation();

  if (location.pathname === '/') {
    return null;
  }

  const pathMap: Record<string, string> = {
    '/corrector': 'Spelling Corrector',
    '/how-it-works': 'How It Works',
    '/algorithms': 'Algorithms (TextBlob vs SymSpell)',
    '/examples': 'Interactive Examples',
    '/about': 'About & Architecture',
  };

  const currentLabel = customTitle || pathMap[location.pathname] || location.pathname.replace('/', '');

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors py-1 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>
        <li className="text-slate-600" aria-hidden="true">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>
        <li className="text-cyan-400 font-semibold truncate max-w-[200px] sm:max-w-none">
          {currentLabel}
        </li>
      </ol>
    </nav>
  );
};
