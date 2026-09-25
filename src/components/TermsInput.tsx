import React, { useState } from 'react';
import { Plus, X, ListPlus, Sparkles } from 'lucide-react';

interface TermsInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const COMMON_CLAUSE_SUGGESTIONS = [
  'Payment to be made within 30 days of invoice',
  'The provider agrees to deliver work by the agreed deadline',
  'Confidentiality must be maintained at all times',
  'Either party may terminate with 15 days notice',
  'The client retains intellectual property rights',
  'Work must be delivered by May 15, 2025',
  'Payment will be made within 7 days of invoice',
  'Disputes resolved by binding AAA arbitration in Delaware',
  'No assignment permitted without prior written consent',
];

export const TermsInput: React.FC<TermsInputProps> = ({ value, onChange, disabled }) => {
  const [newTerm, setNewTerm] = useState('');
  const [isBuilderMode, setIsBuilderMode] = useState(false);

  // Parse items by semicolon
  const items = value
    ? value
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const handleAddTerm = (termToAdd: string) => {
    const trimmed = termToAdd.trim();
    if (!trimmed) return;
    const current = value.trim();
    const updated = current ? `${current.replace(/;+$/, '')}; ${trimmed}` : trimmed;
    onChange(updated);
    setNewTerm('');
  };

  const handleRemoveIndex = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onChange(updatedItems.join('; '));
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Terms &amp; Conditions{' '}
          <span className="text-amber-400 font-normal lowercase">
            (Use semicolons for bullet points)
          </span>
        </label>
        <button
          type="button"
          onClick={() => setIsBuilderMode(!isBuilderMode)}
          className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1 transition-colors"
        >
          <ListPlus className="w-3.5 h-3.5" />
          {isBuilderMode ? 'Switch to Raw Textarea' : 'Interactive Clause Builder'}
        </button>
      </div>

      {!isBuilderMode ? (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={4}
            placeholder="Payment to be made within 30 days of invoice; The provider agrees to deliver work by the agreed deadline; Confidentiality must be maintained at all times; Either party may terminate with 15 days notice"
            className="w-full px-3.5 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-lg border border-slate-700/80 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 outline-none transition-all font-mono text-xs leading-relaxed"
          />
        </div>
      ) : (
        <div className="p-3 bg-slate-900/80 border border-slate-700/80 rounded-lg space-y-2.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTerm(newTerm);
                }
              }}
              placeholder="Type a clause (e.g. Work must be delivered by May 15, 2025)..."
              className="flex-1 px-3 py-1.5 bg-slate-950 text-slate-100 placeholder-slate-500 rounded border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddTerm(newTerm)}
              disabled={!newTerm.trim()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-medium text-xs rounded flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Clause
            </button>
          </div>

          {/* List of current clauses */}
          {items.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2 bg-slate-800/80 rounded border border-slate-700/60 text-xs text-slate-200"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400/80 font-mono font-bold">{idx + 1}.</span>
                    <span>{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveIndex(idx)}
                    className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors"
                    title="Remove clause"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-1">No clauses added yet.</p>
          )}
        </div>
      )}

      {/* Quick suggestions pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Quick Add:
        </span>
        {COMMON_CLAUSE_SUGGESTIONS.slice(0, 4).map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAddTerm(suggestion)}
            className="text-[11px] px-2 py-0.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-amber-300 rounded border border-slate-700/70 transition-all text-left truncate max-w-[210px]"
            title={suggestion}
          >
            + {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
