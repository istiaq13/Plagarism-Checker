'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Layers, Cpu, ArrowRight, Check } from 'lucide-react';
import { PlagiarismReport, SentenceMatch, MatchCategory } from '@/lib/types/plagiarism';

interface InteractiveComparatorProps {
  report: PlagiarismReport;
}

export const InteractiveComparator: React.FC<InteractiveComparatorProps> = ({ report }) => {
  const [selectedMatch, setSelectedMatch] = useState<SentenceMatch | null>(
    report.matchesAtoB.find(m => m.category === 'EXACT' || m.category === 'PARAPHRASED') || report.matchesAtoB[0] || null
  );

  const [filterCategory, setFilterCategory] = useState<MatchCategory | 'ALL'>('ALL');
  
  const targetSentencesRef = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (selectedMatch && targetSentencesRef.current[selectedMatch.targetIndex]) {
      targetSentencesRef.current[selectedMatch.targetIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedMatch]);

  const getHighlightClass = (match: SentenceMatch | undefined, isSelected: boolean) => {
    if (!match) return 'sentence-highlight-low';
    const base = isSelected ? 'active ' : '';
    switch (match.category) {
      case 'EXACT':
        return base + 'sentence-highlight-exact cursor-pointer';
      case 'PARAPHRASED':
        return base + 'sentence-highlight-paraphrase cursor-pointer';
      case 'MODERATE':
        return base + 'sentence-highlight-moderate cursor-pointer';
      default:
        return 'sentence-highlight-low';
    }
  };

  return (
    <div className="w-full space-y-5">
      
      {/* Legend and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
        
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-600 font-medium mr-1">Filter Matches:</span>
          
          <button
            onClick={() => setFilterCategory(filterCategory === 'EXACT' ? 'ALL' : 'EXACT')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border transition ${
              filterCategory === 'EXACT' ? 'bg-rose-100 border-rose-400 text-rose-800' : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Exact ({report.similarityDistribution.exactCount})</span>
          </button>

          <button
            onClick={() => setFilterCategory(filterCategory === 'PARAPHRASED' ? 'ALL' : 'PARAPHRASED')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border transition ${
              filterCategory === 'PARAPHRASED' ? 'bg-teal-200 border-teal-500 text-teal-900' : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span>Paraphrased ({report.similarityDistribution.paraphrasedCount})</span>
          </button>

          <button
            onClick={() => setFilterCategory(filterCategory === 'MODERATE' ? 'ALL' : 'MODERATE')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border transition ${
              filterCategory === 'MODERATE' ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Moderate ({report.similarityDistribution.moderateCount})</span>
          </button>

          {filterCategory !== 'ALL' && (
            <button
              onClick={() => setFilterCategory('ALL')}
              className="text-[11px] text-teal-700 underline hover:text-teal-800 ml-1"
            >
              Reset
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500">
          Click any highlighted sentence in Document A to view alignment.
        </div>
      </div>

      {/* Side-by-Side Comparison Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Document A Synchronized Viewer */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200">
                A
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{report.titleA}</h3>
                <span className="text-xs text-slate-400">{report.sentencesA.length} sentences</span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-h-[380px] overflow-y-auto pr-1 space-y-1.5 text-sm leading-relaxed text-slate-800">
            {report.sentencesA.map((sentence, idx) => {
              const match = report.matchesAtoB.find(m => m.sourceIndex === idx);
              const isSelected = selectedMatch?.sourceIndex === idx;
              const isDimmed = filterCategory !== 'ALL' && match?.category !== filterCategory;

              return (
                <div
                  key={`docA_sent_${idx}`}
                  onClick={() => match && setSelectedMatch(match)}
                  className={`p-1.5 rounded transition ${
                    isDimmed ? 'opacity-25' : 'opacity-100'
                  } ${
                    isSelected ? 'ring-1 ring-teal-500 bg-teal-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400 mr-1.5 select-none">
                    [{idx + 1}]
                  </span>
                  <span className={getHighlightClass(match, isSelected)}>
                    {sentence}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Document B Synchronized Viewer */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200">
                B
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{report.titleB}</h3>
                <span className="text-xs text-slate-400">{report.sentencesB.length} sentences</span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-h-[380px] overflow-y-auto pr-1 space-y-1.5 text-sm leading-relaxed text-slate-800">
            {report.sentencesB.map((sentence, idx) => {
              const isTargetActive = selectedMatch?.targetIndex === idx;

              return (
                <div
                  key={`docB_sent_${idx}`}
                  ref={(el) => { targetSentencesRef.current[idx] = el; }}
                  className={`p-1.5 rounded transition ${
                    isTargetActive
                      ? 'sentence-highlight-target-active'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400 mr-1.5 select-none">
                    [{idx + 1}]
                  </span>
                  <span>{sentence}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Selected Match NLP Detail Card */}
      {selectedMatch && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                Sentence Match Details
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                selectedMatch.category === 'EXACT'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : selectedMatch.category === 'PARAPHRASED'
                  ? 'bg-teal-100 text-teal-800 border border-teal-200'
                  : selectedMatch.category === 'MODERATE'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {selectedMatch.category} Match
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono text-slate-500">
              <span>Doc A #[{selectedMatch.sourceIndex + 1}]</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span>Doc B #[{selectedMatch.targetIndex + 1}]</span>
            </div>
          </div>

          {/* Side-by-side text preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Document A</span>
              <p className="text-slate-900 leading-relaxed font-sans">{selectedMatch.sourceText}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Document B</span>
              <p className="text-slate-900 leading-relaxed font-sans">{selectedMatch.targetText}</p>
            </div>
          </div>

          {/* Scores Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">TF-IDF Overlap</div>
                <div className="text-xs text-slate-700">N-gram Overlap</div>
              </div>
              <span className="text-sm font-bold text-rose-700 font-mono">
                {(selectedMatch.tfidfScore * 100).toFixed(1)}%
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Sentence-BERT</div>
                <div className="text-xs text-slate-700">Semantic Cosine</div>
              </div>
              <span className="text-sm font-bold text-teal-700 font-mono">
                {(selectedMatch.semanticScore * 100).toFixed(1)}%
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Hybrid Score</div>
                <div className="text-xs text-slate-700">Combined Metric</div>
              </div>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {(selectedMatch.hybridScore * 100).toFixed(1)}%
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
