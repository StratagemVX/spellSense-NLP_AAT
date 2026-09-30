import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { CorrectorPage } from './pages/CorrectorPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AlgorithmsPage } from './pages/AlgorithmsPage';
import { ExamplesPage } from './pages/ExamplesPage';
import { AboutPage } from './pages/AboutPage';

import { checkHealth } from './services/api';
import { HealthStatus } from './types';

// Scroll restoration component to automatically scroll top on route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const h = await checkHealth();
        setHealth(h);
      } catch (e) {
        console.warn('Backend not yet reachable on startup', e);
      }
    };
    fetchHealth();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        
        {/* Sticky Professional Navbar */}
        <Navbar health={health} />

        {/* Dynamic Route Content */}
        <main className="flex-1 w-full flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/corrector" element={<CorrectorPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/algorithms" element={<AlgorithmsPage />} />
            <Route path="/examples" element={<ExamplesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default App;
