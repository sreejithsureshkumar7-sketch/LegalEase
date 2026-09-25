import React, { useState, useEffect, useRef } from 'react';
import { LegalEaseLogo } from './components/LegalEaseLogo';
import { PresetSelector } from './components/PresetSelector';
import { DocumentForm, FormData } from './components/DocumentForm';
import { DocumentViewer } from './components/DocumentViewer';
import { DocumentIntelligence } from './components/DocumentIntelligence';
import { PRESETS, DocumentPreset } from './data/presets';
import { History, FileText, Trash2, ArrowUpRight, Scale, Info, Sparkles } from 'lucide-react';

interface HistoryItem {
  id: string;
  timestamp: number;
  documentType: string;
  parties: string;
  text: string;
  dates: string;
}

export default function App() {
  // Initial form values preset to PDF showcase example
  const [formData, setFormData] = useState<FormData>({
    document_type: PRESETS[0].document_type,
    parties: PRESETS[0].parties,
    terms: PRESETS[0].terms,
    dates: PRESETS[0].dates,
    jurisdiction: PRESETS[0].jurisdiction,
    tone: 'Formal, legally rigorous and standard',
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESETS[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const [originalDoc, setOriginalDoc] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const viewerRef = useRef<HTMLDivElement | null>(null);

  // Load saved history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('legalease_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read history', e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (text: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      documentType: formData.document_type,
      parties: formData.parties,
      text,
      dates: formData.dates,
    };
    const updated = [newItem, ...history.slice(0, 9)];
    setHistory(updated);
    try {
      localStorage.setItem('legalease_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save history', e);
    }
  };

  const handleSelectPreset = (preset: DocumentPreset) => {
    setSelectedPresetId(preset.id);
    setFormData((prev) => ({
      ...prev,
      document_type: preset.document_type,
      parties: preset.parties,
      terms: preset.terms,
      dates: preset.dates,
      jurisdiction: preset.jurisdiction,
    }));
  };

  const handleFormChange = (newData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    setSelectedPresetId('');
  };

  const handleGenerateDocument = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // POST to backend (/generate as defined in PDF Activity 2.2 and 3.2)
      const res = await fetch('/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          document_type: formData.document_type,
          parties: formData.parties,
          terms: formData.terms,
          dates: formData.dates,
          jurisdiction: formData.jurisdiction,
          tone: formData.tone,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to generate document`);
      }

      const data = await res.json();
      const docContent = data.document;

      setGeneratedDoc(docContent);
      setOriginalDoc(docContent);
      saveToHistory(docContent);

      // Scroll smoothly to the generated preview
      setTimeout(() => {
        viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Generation failure:', err);
      setErrorMessage(err?.message || 'Error occurred while contacting the generation server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineWithAi = async (instruction: string) => {
    if (!generatedDoc) return;
    setIsRefining(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDocument: generatedDoc,
          instruction,
        }),
      });

      if (!res.ok) {
        throw new Error(`Refine error: HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.document) {
        setGeneratedDoc(data.document);
        saveToHistory(data.document);
      }
    } catch (err: any) {
      console.error('Refine failed:', err);
      setErrorMessage(err?.message || 'Refinement service encountered an issue.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleApplyClauseSuggestion = (clauseText: string) => {
    if (!generatedDoc) return;
    const insertionPoint = generatedDoc.lastIndexOf('IN WITNESS WHEREOF');
    let updated = '';
    if (insertionPoint !== -1) {
      updated =
        generatedDoc.slice(0, insertionPoint) +
        '\n' +
        clauseText +
        '\n\n' +
        generatedDoc.slice(insertionPoint);
    } else {
      updated = generatedDoc + '\n' + clauseText;
    }
    setGeneratedDoc(updated);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('legalease_history');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-900/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation / Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LegalEaseLogo size="sm" showSubtitle={false} />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>History ({history.length})</span>
            </button>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Ready
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 space-y-8">
        {/* Centered Brand Banner (matching PDF layout step 1 & 2) */}
        <section className="text-center pt-2 pb-4">
          <LegalEaseLogo size="lg" showSubtitle={true} />
          <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            AI-powered legal drafting platform. Generate binding contracts, NDAs, and lease agreements tailored to your exact parties, dates, and semicolon-separated terms.
          </p>
        </section>

        {/* History Drawer / Modal */}
        {showHistory && (
          <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-400" />
                Draft History &amp; Recent Documents
              </h3>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No previous documents saved yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{item.documentType}</span>
                      <p className="text-[11px] text-slate-400 truncate max-w-md">{item.parties}</p>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.dates}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratedDoc(item.text);
                        setOriginalDoc(item.text);
                        setShowHistory(false);
                        viewerRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 text-xs flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>Load</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Scenario Preset Selector */}
        <PresetSelector
          onSelect={handleSelectPreset}
          selectedId={selectedPresetId}
        />

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-lg text-xs text-rose-200 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white text-xs underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Document Generation Input Card */}
        <section className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Contract Specifications
            </h3>
          </div>

          <DocumentForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleGenerateDocument}
            isLoading={isLoading}
          />
        </section>

        {/* Generated Document Output Section */}
        <div ref={viewerRef}>
          {generatedDoc && (
            <div className="space-y-6 pt-4 animate-fade-in">
              <DocumentViewer
                documentText={generatedDoc}
                documentType={formData.document_type}
                parties={formData.parties}
                terms={formData.terms}
                dates={formData.dates}
                onUpdateText={setGeneratedDoc}
                onResetToOriginal={() => originalDoc && setGeneratedDoc(originalDoc)}
                originalText={originalDoc || undefined}
                onRefineWithAi={handleRefineWithAi}
                isRefining={isRefining}
              />

              <DocumentIntelligence
                documentText={generatedDoc}
                onApplyClauseSuggestion={handleApplyClauseSuggestion}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/60 py-8 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="font-medium text-slate-300">
            LegalEase Inc. • AI-Powered Legal Document Generator
          </p>
          <p className="text-[11px]">
            Empowering entrepreneurs, freelancers, landlords, and professionals with accessible, structured, and customized legal contracts.
          </p>
          <p className="text-[10px] text-slate-400">
            Disclaimer: AI-generated documents are for informational and drafting assistance purposes. Consult a licensed attorney for state-specific regulatory compliance.
          </p>
        </div>
      </footer>
    </div>
  );
}
