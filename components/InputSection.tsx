'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, ArrowRightLeft, Trash2, FileText, Search } from 'lucide-react';

interface DocumentInputState {
  name: string;
  text: string;
  fileName?: string;
  isUploading: boolean;
}

interface InputSectionProps {
  docA: DocumentInputState;
  setDocA: React.Dispatch<React.SetStateAction<DocumentInputState>>;
  docB: DocumentInputState;
  setDocB: React.Dispatch<React.SetStateAction<DocumentInputState>>;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  docA,
  setDocA,
  docB,
  setDocB,
  onAnalyze,
  isAnalyzing
}) => {
  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const [activeTabA, setActiveTabA] = useState<'text' | 'file'>('text');
  const [activeTabB, setActiveTabB] = useState<'text' | 'file'>('text');
  const [dragOverA, setDragOverA] = useState(false);
  const [dragOverB, setDragOverB] = useState(false);

  const handleFileUpload = async (
    file: File,
    targetSetter: React.Dispatch<React.SetStateAction<DocumentInputState>>
  ) => {
    targetSetter(prev => ({ ...prev, isUploading: true, fileName: file.name }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to extract text');
      }

      const data = await res.json();
      targetSetter(prev => ({
        ...prev,
        name: file.name,
        fileName: file.name,
        text: data.text,
        isUploading: false
      }));
    } catch (err: any) {
      alert(`File extraction error: ${err.message}`);
      targetSetter(prev => ({ ...prev, isUploading: false }));
    }
  };

  const handleSwap = () => {
    const tempA = { ...docA };
    setDocA({ ...docB });
    setDocB(tempA);
  };

  const handleClear = () => {
    setDocA({ name: 'Document A', text: '', isUploading: false });
    setDocB({ name: 'Document B', text: '', isUploading: false });
  };

  const getWordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  const getCharCount = (text: string) => text.length;

  const canAnalyze = docA.text.trim().length > 10 && docB.text.trim().length > 10 && !isAnalyzing;

  return (
    <div className="w-full space-y-5">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span>Upload PDF/DOCX/TXT or paste text into both panels to compare similarity.</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSwap}
            disabled={isAnalyzing}
            title="Swap Document A and Document B"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>
          <button
            onClick={handleClear}
            disabled={isAnalyzing}
            title="Clear all text"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-xs font-medium text-slate-500 hover:text-rose-600 border border-slate-200 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Dual Document Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Document A Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200">
                A
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {docA.fileName || docA.name || 'Document A (Input)'}
                </h3>
                <span className="text-[11px] text-slate-400">Target text to be checked</span>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-xs">
              <button
                onClick={() => setActiveTabA('text')}
                className={`px-2.5 py-1 rounded transition ${activeTabA === 'text' ? 'bg-white text-slate-900 font-medium shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Text
              </button>
              <button
                onClick={() => setActiveTabA('file')}
                className={`px-2.5 py-1 rounded transition ${activeTabA === 'file' ? 'bg-white text-slate-900 font-medium shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                File Upload
              </button>
            </div>
          </div>

          {/* Body A */}
          {activeTabA === 'text' ? (
            <div className="flex-1 flex flex-col space-y-2">
              <textarea
                id="doc-a-textarea"
                value={docA.text}
                onChange={(e) => setDocA(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Paste text, essay, or document here..."
                rows={9}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition resize-y font-sans leading-relaxed"
              />
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverA(true); }}
              onDragLeave={() => setDragOverA(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverA(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], setDocA);
              }}
              onClick={() => fileInputRefA.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                dragOverA ? 'border-teal-500 bg-teal-50/50' : 'border-slate-300 hover:border-teal-500 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRefA}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0], setDocA);
                }}
              />
              <UploadCloud className="w-8 h-8 text-teal-600 mb-2" />
              <p className="text-sm font-medium text-slate-700">
                {docA.isUploading ? 'Extracting text...' : 'Click or Drag & Drop PDF, DOCX, or TXT'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports PDF, Word, and Plain Text</p>
            </div>
          )}

          {/* Doc A Stats Footer */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono">
            <span>Words: <strong className="text-slate-800">{getWordCount(docA.text)}</strong></span>
            <span>Characters: <strong className="text-slate-800">{getCharCount(docA.text)}</strong></span>
          </div>
        </div>

        {/* Document B Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200">
                B
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {docB.fileName || docB.name || 'Document B (Source)'}
                </h3>
                <span className="text-[11px] text-slate-400">Reference text or source literature</span>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-xs">
              <button
                onClick={() => setActiveTabB('text')}
                className={`px-2.5 py-1 rounded transition ${activeTabB === 'text' ? 'bg-white text-slate-900 font-medium shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Text
              </button>
              <button
                onClick={() => setActiveTabB('file')}
                className={`px-2.5 py-1 rounded transition ${activeTabB === 'file' ? 'bg-white text-slate-900 font-medium shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                File Upload
              </button>
            </div>
          </div>

          {/* Body B */}
          {activeTabB === 'text' ? (
            <div className="flex-1 flex flex-col space-y-2">
              <textarea
                id="doc-b-textarea"
                value={docB.text}
                onChange={(e) => setDocB(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Paste reference text or source material here..."
                rows={9}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition resize-y font-sans leading-relaxed"
              />
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverB(true); }}
              onDragLeave={() => setDragOverB(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverB(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], setDocB);
              }}
              onClick={() => fileInputRefB.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                dragOverB ? 'border-teal-500 bg-teal-50/50' : 'border-slate-300 hover:border-teal-500 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRefB}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0], setDocB);
                }}
              />
              <UploadCloud className="w-8 h-8 text-teal-600 mb-2" />
              <p className="text-sm font-medium text-slate-700">
                {docB.isUploading ? 'Extracting text...' : 'Click or Drag & Drop PDF, DOCX, or TXT'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports PDF, Word, and Plain Text</p>
            </div>
          )}

          {/* Doc B Stats Footer */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono">
            <span>Words: <strong className="text-slate-800">{getWordCount(docB.text)}</strong></span>
            <span>Characters: <strong className="text-slate-800">{getCharCount(docB.text)}</strong></span>
          </div>
        </div>

      </div>

      {/* Main Analyze CTA */}
      <div className="flex flex-col items-center justify-center pt-1">
        <button
          id="run-analysis-btn"
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className={`px-8 py-3 rounded-lg font-medium text-sm flex items-center space-x-2 transition shadow-sm ${
            canAnalyze
              ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer active:scale-[0.99]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Analyzing text similarity...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Run Plagiarism Scan</span>
            </>
          )}
        </button>
        {!canAnalyze && !isAnalyzing && (
          <p className="text-xs text-slate-400 mt-2">
            Enter or upload text in both Document A and Document B to run comparison.
          </p>
        )}
      </div>

    </div>
  );
};
