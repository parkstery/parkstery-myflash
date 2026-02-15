
import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Preset } from '../types';

interface PresetListProps {
  presets: Preset[];
  activeValue: number;
  onApply: (p: Preset) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

const PresetList: React.FC<PresetListProps> = ({ presets, activeValue, onApply, onAdd, onDelete }) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
      <button 
        onClick={onAdd}
        className="flex-shrink-0 w-16 h-16 rounded-2xl border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 active:scale-90 transition-all"
      >
        <PlusCircle size={24} />
      </button>

      {presets.map((preset) => (
        <div key={preset.id} className="relative group">
          <button
            onClick={() => onApply(preset)}
            className={`flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-90 ${
              activeValue === preset.value 
                ? 'bg-white text-black' 
                : 'bg-zinc-800 text-white border border-white/5'
            }`}
          >
            <span className="text-xs font-bold">{preset.value}%</span>
            <span className="text-[8px] uppercase tracking-tighter opacity-70 truncate w-12 text-center">{preset.label}</span>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(preset.id); }}
            className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={10} className="text-white" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default PresetList;
