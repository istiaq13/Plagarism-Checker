'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { PlagiarismReport } from '@/lib/types/plagiarism';
import { BarChart3, LineChart as LineIcon, FileText } from 'lucide-react';

interface AnalyticsChartsProps {
  report: PlagiarismReport;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ report }) => {
  // Distribution Data
  const distributionData = [
    {
      name: 'Exact Copy',
      count: report.similarityDistribution.exactCount,
      fill: '#e11d48'
    },
    {
      name: 'Paraphrased',
      count: report.similarityDistribution.paraphrasedCount,
      fill: '#0d9488'
    },
    {
      name: 'Moderate',
      count: report.similarityDistribution.moderateCount,
      fill: '#d97706'
    },
    {
      name: 'Original',
      count: report.similarityDistribution.lowCount,
      fill: '#64748b'
    }
  ];

  // Progression Data
  const progressionData = report.matchesAtoB.map((m, idx) => ({
    sentence: `S${idx + 1}`,
    tfidf: Math.round(m.tfidfScore * 100),
    semantic: Math.round(m.semanticScore * 100),
    hybrid: Math.round(m.hybridScore * 100)
  }));

  return (
    <div className="w-full space-y-5">
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Sentence Similarity Progression Line Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <LineIcon className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-semibold text-slate-800">
                Sentence Similarity Progression
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Progression across Doc A</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="sentence" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                />
                <Line
                  type="monotone"
                  dataKey="semantic"
                  name="Sentence-BERT (%)"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="tfidf"
                  name="TF-IDF (%)"
                  stroke="#e11d48"
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="hybrid"
                  name="Hybrid (%)"
                  stroke="#0f172a"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-semibold text-slate-800">
                Match Category Breakdown
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Total: {report.sentencesA.length} sentences</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Document Linguistic Statistics */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
          <FileText className="w-4 h-4 text-teal-700" />
          <h3 className="text-sm font-semibold text-slate-800">
            Document Linguistic Summary
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Doc A Words</span>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{report.statsA.wordCount}</p>
            <span className="text-[11px] text-slate-400">{report.statsA.uniqueWords} unique words</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Doc B Words</span>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{report.statsB.wordCount}</p>
            <span className="text-[11px] text-slate-400">{report.statsB.uniqueWords} unique words</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Doc A Sentences</span>
            <p className="text-lg font-bold text-teal-700 mt-0.5">{report.statsA.sentenceCount}</p>
            <span className="text-[11px] text-slate-400">Segmented</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Doc B Sentences</span>
            <p className="text-lg font-bold text-teal-700 mt-0.5">{report.statsB.sentenceCount}</p>
            <span className="text-[11px] text-slate-400">Segmented</span>
          </div>
        </div>
      </div>

    </div>
  );
};
