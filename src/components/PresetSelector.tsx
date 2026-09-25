import React from 'react';
import { PRESETS, DocumentPreset } from '../data/presets';
import { BookOpen, Sparkles } from 'lucide-react';

interface PresetSelectorProps {
  onSelect: (preset: DocumentPreset) => void;
  selectedId?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelect, selectedId }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Scenarios &amp; Templates</span>
        </div>
        <span className="text-[11px] text-slate-400">PDF Showcase Presets</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {PRESETS.slice(0, 4).map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className={`text-left p-2.5 rounded-lg border transition-all relative overflow-hidden group ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                  : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                  {preset.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/80 text-amber-300 font-medium whitespace-nowrap">
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
