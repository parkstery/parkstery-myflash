
import React from 'react';
import { Power, AlertTriangle, Moon, Zap } from 'lucide-react';
import { Mode } from '../types';

interface ActionButtonsProps {
  mode: Mode;
  isOn: boolean;
  onTogglePower: () => void;
  onToggleMode: (mode: Mode) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  mode, 
  isOn, 
  onTogglePower, 
  onToggleMode 
}) => {
  return (
    <>
      <button 
        onClick={() => onToggleMode(Mode.SOS)}
        className={`flex flex-col items-center gap-2 p-2 transition-all ${mode === Mode.SOS ? 'text-red-500' : 'text-zinc-500'}`}
      >
        <div className={`p-4 rounded-2xl transition-all ${mode === Mode.SOS ? 'bg-red-500/20' : 'bg-zinc-800'}`}>
          <AlertTriangle size={20} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-tighter">SOS</span>
      </button>

      <button 
        onClick={onTogglePower}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xl ${
          isOn 
            ? 'bg-white text-black shadow-white/20' 
            : 'bg-zinc-800 text-zinc-400'
        }`}
      >
        <Power size={36} strokeWidth={2.5} />
        {isOn && <div className="absolute inset-0 rounded-full animate-ping bg-white/10" />}
      </button>

      <button 
        onClick={() => onToggleMode(Mode.NIGHT)}
        className={`flex flex-col items-center gap-2 p-2 transition-all ${mode === Mode.NIGHT ? 'text-orange-500' : 'text-zinc-500'}`}
      >
        <div className={`p-4 rounded-2xl transition-all ${mode === Mode.NIGHT ? 'bg-orange-500/20' : 'bg-zinc-800'}`}>
          <Moon size={20} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-tighter">Night</span>
      </button>
    </>
  );
};

export default ActionButtons;
