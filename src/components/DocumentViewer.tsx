import React, { useState } from 'react';
import {
  Download,
  Edit3,
  Check,
  Copy,
  Printer,
  FileCode,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Eye,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  downloadAsTxt,
  downloadAsDocx,
  downloadAsPdf,
  DocumentExportData,
} from '../utils/documentExporter';

interface DocumentViewerProps {
  documentText: string;
  documentType: string;
  parties?: string;
  terms?: string;
  dates?: string;
  onUpdateText: (newText: string) => void;
  onResetToOriginal?: () => void;
  originalText?: string;
  onRefineWithAi?: (instruction: string) => void;
  isRefining?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentText,
  documentType,
  parties,
  terms,
  dates,
  onUpdateText,
  onResetToOriginal,
  originalText,
  onRefineWithAi,
  isRefining,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'terms-table'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Parse terms for terms table
  const termsList = terms
    ? terms
        .split(';')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(documentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getExportData = (): DocumentExportData => ({
    documentType: documentType || 'Legal Document',
    documentText,
    parties,
    terms,
    effectiveDate: dates,
    companyName: 'LegalEase Inc.',
  });

  const getCleanFilename = (ext: string) => {
    const base = (documentType || 'legal_document')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return `${base}.${ext}`;
  };

  const handleDownloadTxt = () => {
    downloadAsTxt(documentText, getCleanFilename('txt'));
  };

  const handleDownloadDocx = async () => {
    await downloadAsDocx(getExportData(), getCleanFilename('docx'));
  };

  const handleDownloadPdf = () => {
    downloadAsPdf(getExportData(), getCleanFilename('pdf'));
  };

  // Convert raw document text into formatted HTML blocks with legal styling
  const renderFormattedPreview = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-4" />;
      }

      // Title header
      if (trimmed.startsWith('##') || trimmed.startsWith('#')) {
        return (
          <h2
            key={idx}
            className="text-xl sm:text-2xl font-serif font-bold text-center tracking-wide text-slate-100 my-4 pb-2 border-b border-slate-700/60 uppercase"
          >
            {trimmed.replace(/^#+\s*/, '')}
          </h2>
        );
      }

      // Major legal section / headers
      if (/^(\d+\.|\bWITNESSETH\b|\bNOW, THEREFORE\b|\bBetween:\b|\bAnd:\b|\bIN WITNESS WHEREOF\b)/i.test(trimmed)) {
        return (
          <h3
            key={idx}
            className="text-sm sm:text-base font-serif font-bold text-amber-200 mt-4 mb-2 tracking-wide"
          >
            {trimmed}
          </h3>
        );
      }

      // Bullets
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^[a-z]\)/.test(trimmed)) {
        return (
          <div key={idx} className="flex items-start gap-2.5 ml-4 sm:ml-6 my-1.5 text-xs sm:text-sm text-slate-300">
            <span className="text-amber-400 font-bold">•</span>
            <span>{trimmed.replace(/^[-*]\s*/, '')}</span>
          </div>
        );
      }

      // Signature underscores / lines
      if (trimmed.startsWith('____') || trimmed.includes('Authorized Signature:') || trimmed.includes('Date:')) {
        return (
          <div key={idx} className="font-mono text-xs text-slate-400 my-1">
            {trimmed}
          </div>
        );
      }

      // Standard body paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed my-2 text-justify">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      {/* 1. Success Notification Banner (matching PDF page 20) */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-emerald-200 shadow-sm animate-fade-in">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>✅ Document Generated Successfully!</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-xs text-emerald-300 hover:text-emerald-100 p-1 rounded hover:bg-emerald-900/50 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
        {/* Left: View Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'preview'
                ? 'bg-slate-800 text-amber-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Legal Preview
          </button>
          {termsList.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('terms-table')}
              className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'terms-table'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Terms Table ({termsList.length})
            </button>
          )}
        </div>

        {/* Right: Edit & Utility Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
              isEditing
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Close Editor' : '🖊️ Click to Edit Document'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
            title="Copy Text to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Editable Area (Page 20 & 21: "Edit Document Below:", height=300) */}
      {isEditing && (
        <div className="bg-slate-900 border-2 border-amber-500/60 rounded-xl p-4 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Edit Document Below:
            </label>
            <div className="flex items-center gap-2">
              {originalText && originalText !== documentText && onResetToOriginal && (
                <button
                  type="button"
                  onClick={onResetToOriginal}
                  className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Original
                </button>
              )}
              <span className="text-[11px] text-slate-400">
                {documentText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          </div>

          <textarea
            value={documentText}
            onChange={(e) => onUpdateText(e.target.value)}
            rows={14}
            className="w-full p-4 bg-slate-950 text-slate-100 rounded-lg border border-slate-800 focus:border-amber-400/80 outline-none font-mono text-xs leading-relaxed resize-y shadow-inner"
            placeholder="Edit legal clauses, party names, dates, or specific conditions directly..."
          />

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
            <span>✨ Edits are automatically synchronized with the preview and download exports.</span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
            >
              Done Editing
            </button>
          </div>
        </div>
      )}

      {/* AI Refine Quick Bar */}
      {onRefineWithAi && (
        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Refine:</span>
          </div>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && aiPrompt.trim()) {
                e.preventDefault();
                onRefineWithAi(aiPrompt);
                setAiPrompt('');
              }
            }}
            placeholder="e.g. Add 14-day cure period for breach, or simplify into plain English..."
            disabled={isRefining}
            className="flex-1 px-3 py-1.5 bg-slate-950 text-slate-200 placeholder-slate-500 rounded border border-slate-800 text-xs focus:border-amber-400 outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (aiPrompt.trim()) {
                onRefineWithAi(aiPrompt);
                setAiPrompt('');
              }
            }}
            disabled={isRefining || !aiPrompt.trim()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded flex items-center justify-center gap-1 transition-colors"
          >
            {isRefining ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Refining...
              </>
            ) : (
              'Refine Document'
            )}
          </button>
        </div>
      )}

      {/* 3. Main Document View Area */}
      {activeTab === 'preview' ? (
        <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Legal Seal / Watermark Background */}
          <div className="absolute right-4 top-4 text-slate-800/20 select-none pointer-events-none">
            <svg className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>

          {/* Formatted Content */}
          <div className="max-w-3xl mx-auto relative z-10 font-serif">
            {renderFormattedPreview(documentText)}
          </div>
        </div>
      ) : (
        /* Terms Table Schedule A View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-serif font-bold text-slate-100">
                Schedule A: Agreed Terms &amp; Conditions Table
              </h3>
              <p className="text-xs text-slate-400">
                Structured tabular representation generated from your semicolon-separated inputs.
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              {termsList.length} Terms Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-800/80 text-amber-300 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-4 w-24">Clause #</th>
                  <th className="py-2.5 px-4">Agreed Provision &amp; Legal Condition</th>
                  <th className="py-2.5 px-4 w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {termsList.map((term, index) => (
                  <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      Term {index + 1}
                    </td>
                    <td className="py-3 px-4 leading-relaxed font-sans">{term}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Check className="w-3 h-3" /> Enforceable
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Multi-Format Download Options (matching PDF pages 20, 21, 22, 23, 24) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-amber-400" />
          Download &amp; Export Document
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Download as .TXT */}
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 hover:border-slate-600 font-medium text-xs transition-all shadow-sm group"
          >
            <FileCode className="w-4 h-4 text-slate-400 group-hover:text-amber-300 transition-colors" />
            <span>Download as .TXT</span>
          </button>

          {/* Download as .DOCX */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-blue-900/40 hover:bg-blue-800/50 text-blue-200 hover:text-blue-100 rounded-lg border border-blue-700/50 hover:border-blue-500 font-medium text-xs transition-all shadow-sm group"
          >
            <FileText className="w-4 h-4 text-blue-400 group-hover:text-blue-200 transition-colors" />
            <span>Download as .DOCX</span>
          </button>

          {/* Download as .PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-rose-900/40 hover:bg-rose-800/50 text-rose-200 hover:text-rose-100 rounded-lg border border-rose-700/50 hover:border-rose-500 font-medium text-xs transition-all shadow-sm group"
          >
            <Download className="w-4 h-4 text-rose-400 group-hover:text-rose-200 transition-colors" />
            <span>Download as .PDF</span>
          </button>
        </div>

        <p className="mt-2.5 text-center text-[11px] text-slate-400">
          📄 Both .DOCX and .PDF exports automatically format with the LegalEase header, Times New Roman typography, terms table, and professional signature blocks.
        </p>
      </div>
    </div>
  );
};
