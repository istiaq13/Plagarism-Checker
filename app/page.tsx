'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { InputSection } from '@/components/InputSection';
import { ScoreCard } from '@/components/ScoreCard';
import { InteractiveComparator } from '@/components/InteractiveComparator';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { ReportHistory } from '@/components/ReportHistory';
import { PlagiarismReport } from '@/lib/types/plagiarism';
import { SAMPLE_DATASETS, SamplePair } from '@/lib/data/sample-data';
import { ShieldCheck, RotateCcw, Printer, CheckCircle } from 'lucide-react';

export default function Home() {
  // Document Input State
  const [docA, setDocA] = useState({
    name: SAMPLE_DATASETS[0].docA.name,
    text: SAMPLE_DATASETS[0].docA.text,
    isUploading: false
  });

  const [docB, setDocB] = useState({
    name: SAMPLE_DATASETS[0].docB.name,
    text: SAMPLE_DATASETS[0].docB.text,
    isUploading: false
  });

  const [report, setReport] = useState<PlagiarismReport | null>(null);
  const [sessionHistory, setSessionHistory] = useState<PlagiarismReport[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load session history from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('veritas_session_reports');
      if (saved) {
        setSessionHistory(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  const handleSelectSample = (sample: SamplePair) => {
    setDocA({
      name: sample.docA.name,
      text: sample.docA.text,
      isUploading: false
    });
    setDocB({
      name: sample.docB.name,
      text: sample.docB.text,
      isUploading: false
    });
    setReport(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!docA.text.trim() || !docB.text.trim()) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docA: { name: docA.name || 'Document A', text: docA.text },
          docB: { name: docB.name || 'Document B', text: docB.text }
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to complete analysis');
      }

      const reportData: PlagiarismReport = await res.json();
      setReport(reportData);

      // Save to active session history in-memory / browser storage
      const updatedHistory = [reportData, ...sessionHistory.filter(h => h.id !== reportData.id)].slice(0, 20);
      setSessionHistory(updatedHistory);
      try {
        localStorage.setItem('veritas_session_reports', JSON.stringify(updatedHistory));
      } catch (_) {}

      // Scroll smoothly down to results
      setTimeout(() => {
        const resultSection = document.getElementById('results-section');
        resultSection?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred during plagiarism scan.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearHistory = () => {
    setSessionHistory([]);
    try {
      localStorage.removeItem('veritas_session_reports');
    } catch (_) {}
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-16">
      {/* Navigation */}
      <Navbar
        onSelectSample={handleSelectSample}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 space-y-8">
        
        {/* Header Section */}
        <section className="text-center space-y-2.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>Dual NLP Engine: TF-IDF (Textual) + Sentence-BERT (Semantic)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Plagiarism & Similarity Detector
          </h1>

          <p className="text-slate-600 text-sm leading-relaxed">
            Compare two documents to detect exact phrasing and semantic paraphrasing in real-time.
          </p>
        </section>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* Input & File Upload Section */}
        <section className="space-y-4">
          <InputSection
            docA={docA}
            setDocA={setDocA}
            docB={docB}
            setDocB={setDocB}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </section>

        {/* Results Dashboard Section */}
        {report && (
          <section id="results-section" className="space-y-6 pt-6 border-t border-slate-200 animate-in fade-in duration-300">
            
            {/* Results Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <h2 className="text-base font-bold text-slate-900">Audit Results</h2>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200 transition shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={() => {
                    setReport(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-teal-50 hover:bg-teal-100 text-xs font-medium text-teal-800 border border-teal-200 transition shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Comparison</span>
                </button>
              </div>
            </div>

            {/* Scorecard Overview */}
            <ScoreCard report={report} />

            {/* Side-by-Side Interactive Document Comparator */}
            <InteractiveComparator report={report} />

            {/* Analytics & Progression Charts */}
            <AnalyticsCharts report={report} />

          </section>
        )}

      </div>

      {/* Session History Modal / Drawer */}
      <ReportHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        reports={sessionHistory}
        onSelectReport={(selected) => {
          setReport(selected);
          setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onClearHistory={handleClearHistory}
      />
    </main>
  );
}
