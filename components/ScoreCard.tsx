'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, Shield, AlertTriangle, Info, Layers, Cpu } from 'lucide-react';
import { PlagiarismReport, RiskLevel } from '@/lib/types/plagiarism';

interface ScoreCardProps {
  report: PlagiarismReport;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ report }) => {
  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return {
          label: 'Critical Risk',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
          color: '#e11d48'
        };
      case 'HIGH':
        return {
          label: 'High Risk',
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
          color: '#ea580c'
        };
      case 'MODERATE':
        return {
          label: 'Moderate Similarity',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Shield className="w-4 h-4 text-amber-600" />,
          color: '#d97706'
        };
      case 'LOW':
      default:
        return {
          label: 'Low / Original',
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          icon: <ShieldCheck className="w-4 h-4 text-teal-600" />,
          color: '#0d9488'
        };
    }
  };

  const riskInfo = getRiskBadge(report.riskLevel);

  // SVG circular gauge calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.overallScore / 100) * circumference;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">Plagiarism Audit Results</h2>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded border flex items-center space-x-1.5 ${riskInfo.bg}`}>
              {riskInfo.icon}
              <span>{riskInfo.label}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compared {report.sentencesA.length} sentences in <strong className="text-slate-700">{report.titleA}</strong> against <strong className="text-slate-700">{report.titleB}</strong>
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          <span>Report: {report.id}</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        
        {/* Overall Circular Score */}
        <div className="flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              {/* Track */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={riskInfo.color}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {report.overallScore}%
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Overall Index
              </span>
            </div>
          </div>
        </div>

        {/* Dual NLP Breakdown (TF-IDF vs SBERT) */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Exact / Textual Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-rose-100 text-rose-700">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Exact / Textual</h4>
                  <p className="text-[10px] text-slate-500">TF-IDF N-grams</p>
                </div>
              </div>
              <span className="text-lg font-bold text-rose-700">{report.exactScore}%</span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${report.exactScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Word-for-word string overlap and phrase co-occurrence.
            </p>
          </div>

          {/* Semantic / Paraphrased Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-teal-100 text-teal-800">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Semantic Similarity</h4>
                  <p className="text-[10px] text-slate-500">Sentence-BERT (all-MiniLM-L6-v2)</p>
                </div>
              </div>
              <span className="text-lg font-bold text-teal-700">{report.semanticScore}%</span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-600 h-1.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${report.semanticScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Dense vector distance detecting synonyms and paraphrasing.
            </p>
          </div>

        </div>

      </div>

      {/* Natural Language Summary Insight Box */}
      <div className="bg-teal-50/60 border border-teal-200 rounded-lg p-3.5 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h5 className="text-[11px] font-semibold text-teal-900 uppercase tracking-wider">
            Analysis Summary
          </h5>
          <p className="text-xs text-slate-700 leading-relaxed">
            {report.summaryInsight}
          </p>
        </div>
      </div>

    </div>
  );
};
