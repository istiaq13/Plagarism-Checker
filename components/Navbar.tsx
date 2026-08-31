'use client';

import React from 'react';
import { ShieldCheck, History, Sparkles, Cpu, Layers } from 'lucide-react';
import { SAMPLE_DATASETS, SamplePair } from '@/lib/data/sample-data';

interface NavbarProps {
  onSelectSample: (sample: SamplePair) => void;
  onOpenHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectSample, onOpenHistory }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                Veritas NLP
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Plagiarism Detector
              </span>
            </div>
          </div>
        </div>

        {/* Tech Badges & Actions */}
        <div className="flex items-center space-x-3">
          
          {/* Models Tag */}
          <div className="hidden md:flex items-center space-x-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-600">
            <span>TF-IDF + SBERT</span>
          </div>

          {/* Sample Selector Dropdown */}
          <div className="relative">
            <button
              id="load-sample-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Sample Cases</span>
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white border border-slate-200 shadow-lg p-2 z-50">
                  <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Preloaded Test Cases
                  </div>
                  {SAMPLE_DATASETS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        onSelectSample(sample);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-md hover:bg-teal-50/60 transition flex flex-col space-y-0.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-800 group-hover:text-teal-700">
                          {sample.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          sample.category === 'Paraphrased' 
                            ? 'bg-teal-100 text-teal-800' 
                            : sample.category === 'Exact Copy'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sample.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {sample.description}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Past History Button */}
          <button
            id="view-history-btn"
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition"
          >
            <History className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Session Scans</span>
          </button>
        </div>

      </div>
    </header>
  );
};
