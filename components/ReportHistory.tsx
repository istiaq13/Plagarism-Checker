'use client';

import React from 'react';
import { X, History, Clock, FileText, ChevronRight, Trash2 } from 'lucide-react';
import { PlagiarismReport } from '@/lib/types/plagiarism';

interface ReportHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  reports: PlagiarismReport[];
  onSelectReport: (report: PlagiarismReport) => void;
  onClearHistory: () => void;
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({
  isOpen,
  onClose,
  reports,
  onSelectReport,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-md bg-white border-l border-slate-200 h-full p-5 flex flex-col space-y-4 shadow-xl z-10 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Session Scans</h2>
              <p className="text-[11px] text-slate-400">Current browser session history</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {reports.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded transition"
                title="Clear History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center space-y-1.5">
              <FileText className="w-7 h-7 text-slate-300" />
              <p className="text-xs font-medium text-slate-600">No scans in this session yet</p>
              <p className="text-[11px] text-slate-400">Run a plagiarism comparison to view history here.</p>
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => {
                  onSelectReport(rep);
                  onClose();
                }}
                className="bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 rounded-lg p-3 cursor-pointer transition flex flex-col space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    rep.riskLevel === 'CRITICAL'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : rep.riskLevel === 'HIGH'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : rep.riskLevel === 'MODERATE'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}>
                    {rep.riskLevel} ({rep.overallScore}%)
                  </span>
                  
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 group-hover:text-teal-800 transition line-clamp-1">
                  {rep.titleA} <span className="text-slate-400 font-normal">vs</span> {rep.titleB}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 font-mono">
                  <span>Exact: <strong className="text-rose-700">{rep.exactScore}%</strong></span>
                  <span>Semantic: <strong className="text-teal-700">{rep.semanticScore}%</strong></span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
