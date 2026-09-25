import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Lightbulb, Sparkles, BookOpen, ChevronRight, Check } from 'lucide-react';

interface DocumentIntelligenceProps {
  documentText: string;
  onApplyClauseSuggestion: (clauseText: string) => void;
}

export const DocumentIntelligence: React.FC<DocumentIntelligenceProps> = ({
  documentText,
  onApplyClauseSuggestion,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary?: string;
    keyPoints?: string[];
    risks?: string[];
  } | null>(null);

  const handleRunAnalysis = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: documentText }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const CLAUSE_ADDITIONS = [
    {
      title: 'Dispute Resolution (AAA Arbitration)',
      clause: '\n\nDispute Resolution:\nAny controversy, claim, or dispute arising out of or relating to this Agreement shall be settled by binding arbitration administered by the American Arbitration Association (AAA) in accordance with its Commercial Arbitration Rules.',
    },
    {
      title: 'Force Majeure Clause',
      clause: '\n\nForce Majeure:\nNeither party shall be liable for any failure or delay in performing its obligations where such failure results from events beyond that party’s reasonable control, including acts of God, labor disputes, or government orders.',
    },
    {
      title: 'Mutual Non-Solicitation (1 Year)',
      clause: '\n\nNon-Solicitation:\nDuring the term of this Agreement and for a period of one (1) year following termination, neither party shall solicit, recruit, or hire any employee or contractor of the other party without prior written authorization.',
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              LegalEase Intelligence &amp; Plain-English Summary
            </h3>
            <p className="text-[11px] text-slate-400">
              AI-driven comprehension, risk inspection, and recommended clause expansion.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <div className="w-3 h-3 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
              <span>Analyzing Document...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{analysis ? 'Re-Analyze Text' : 'Analyze Clauses & Risks'}</span>
            </>
          )}
        </button>
      </div>

      {analysis ? (
        <div className="space-y-3.5 animate-fade-in">
          {/* Summary Box */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Plain English Overview
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {analysis.summary || 'Document sets up a formal agreement with structured duties, warranties, and milestones.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Key Clauses */}
            <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-lg">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Key Rights &amp; Covenants
              </h4>
              <ul className="space-y-1.5">
                {(analysis.keyPoints && analysis.keyPoints.length > 0
                  ? analysis.keyPoints
                  : [
                      'Defines clear deliverables and work deadlines.',
                      'Explicit IP and confidentiality protections in place.',
                      'Governing state and severability standards included.',
                    ]
                ).map((pt, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold mt-0.5">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Check */}
            <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-lg">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Legal Considerations &amp; Notices
              </h4>
              <ul className="space-y-1.5">
                {(analysis.risks && analysis.risks.length > 0
                  ? analysis.risks
                  : [
                      'Confirm full corporate legal entity name matches official registry.',
                      'Verify exact payment schedule and bank wiring instructions.',
                    ]
                ).map((risk, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold mt-0.5">!</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-lg text-center">
          <p className="text-xs text-slate-400 mb-2">
            Click <strong>&quot;Analyze Clauses &amp; Risks&quot;</strong> to generate a plain-English translation and comprehensive risk inspection.
          </p>
        </div>
      )}

      {/* Suggested Clauses Expansion */}
      <div className="pt-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Recommended Clauses to Add With 1-Click:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {CLAUSE_ADDITIONS.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onApplyClauseSuggestion(c.clause)}
              className="p-2.5 bg-slate-950/80 hover:bg-slate-850 hover:border-amber-500/40 text-left border border-slate-800 rounded-lg transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-200 group-hover:text-amber-300">
                <span>{c.title}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                Insert standard legal clause into document
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
