import React, { useState } from 'react';
import { TermsInput } from './TermsInput';
import { Sparkles, SlidersHorizontal, ChevronDown, ChevronUp, FileText, Users, Calendar, Shield } from 'lucide-react';

export interface FormData {
  document_type: string;
  parties: string;
  terms: string;
  dates: string;
  jurisdiction: string;
  tone: string;
}

interface DocumentFormProps {
  formData: FormData;
  onChange: (newData: Partial<FormData>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const COMMON_DOC_TYPES = [
  'Freelance Work Contract',
  'Non-Disclosure Agreement (NDA)',
  'Startup Employment Contract',
  'Residential Lease Agreement',
  'Independent Consulting Agreement',
  'Partnership Agreement',
  'Software License Agreement',
  'General Business Agreement',
];

export const DocumentForm: React.FC<DocumentFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. Document Type */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Document Type <span className="text-slate-500 font-normal lowercase">(Ex. Agreement, Contract, NDA)</span>
          </label>
        </div>
        <div className="relative">
          <input
            type="text"
            list="doc-types-list"
            value={formData.document_type}
            onChange={(e) => onChange({ document_type: e.target.value })}
            placeholder="Freelance Work Contract"
            required
            className="w-full px-3.5 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-lg border border-slate-700/80 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 outline-none transition-all text-sm font-medium"
          />
          <datalist id="doc-types-list">
            {COMMON_DOC_TYPES.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>
      </div>

      {/* 2. Parties Involved */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Parties Involved
          </label>
          <span className="text-[11px] text-slate-400">e.g. Jane Doe (Service Provider), TechNova Inc. (Client)</span>
        </div>
        <textarea
          rows={2}
          value={formData.parties}
          onChange={(e) => onChange({ parties: e.target.value })}
          placeholder="Jane Doe (Service Provider), TechNova Inc. (Client)"
          required
          className="w-full px-3.5 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-lg border border-slate-700/80 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 outline-none transition-all text-sm leading-relaxed"
        />
      </div>

      {/* 3. Terms & Conditions (Use semicolons for bullet points) */}
      <TermsInput
        value={formData.terms}
        onChange={(val) => onChange({ terms: val })}
        disabled={isLoading}
      />

      {/* 4. Effective Date */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Effective Date
          </label>
          <span className="text-[11px] text-slate-400">e.g. April 15, 2025</span>
        </div>
        <input
          type="text"
          value={formData.dates}
          onChange={(e) => onChange({ dates: e.target.value })}
          placeholder="April 15, 2025"
          required
          className="w-full px-3.5 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-lg border border-slate-700/80 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 outline-none transition-all text-sm"
        />
      </div>

      {/* Advanced Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors py-1"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Advanced Jurisdiction &amp; Legal Tone</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="mt-2.5 p-3.5 bg-slate-900/70 border border-slate-800 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Governing Jurisdiction
              </label>
              <input
                type="text"
                value={formData.jurisdiction}
                onChange={(e) => onChange({ jurisdiction: e.target.value })}
                placeholder="State of California, USA"
                className="w-full px-3 py-1.5 bg-slate-950 text-slate-100 rounded border border-slate-700 text-xs focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Drafting Tone
              </label>
              <select
                value={formData.tone}
                onChange={(e) => onChange({ tone: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 text-slate-100 rounded border border-slate-700 text-xs focus:border-amber-400 outline-none"
              >
                <option value="Formal, legally rigorous and standard">Formal Standard Legalese</option>
                <option value="Protective of Service Provider / Contractor">Favor Service Provider / Contractor</option>
                <option value="Protective of Client / Company">Favor Client / Company</option>
                <option value="Clear Plain-Language Legal Standard">Plain English (Accessible)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Generate Document Button (matching PDF page 18-19) */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || !formData.document_type.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Drafting Comprehensive Legal Agreement...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Document</span>
            </>
          )}
        </button>

        <p className="mt-2 text-center text-xs text-slate-400">
          💡 Click &quot;Generate Document&quot; to start AI drafting with customized clauses
        </p>
      </div>
    </form>
  );
};
