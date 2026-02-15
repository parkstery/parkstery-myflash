
import React from 'react';
import { Battery, Thermometer } from 'lucide-react';

interface StatusBarProps {
  battery: number;
  temperature: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ battery, temperature }) => {
  const isHighTemp = temperature > 40;

  return (
    <div className="flex justify-center gap-6 px-8 py-2">
      <div className="flex items-center gap-2 bg-zinc-900/40 px-3 py-1.5 rounded-full border border-white/5">
        <Battery size={14} className={battery < 20 ? 'text-red-500' : 'text-green-500'} />
        <span className="text-xs font-medium text-zinc-400">{battery}%</span>
      </div>
      <div className="flex items-center gap-2 bg-zinc-900/40 px-3 py-1.5 rounded-full border border-white/5">
        <Thermometer size={14} className={isHighTemp ? 'text-red-500' : 'text-blue-400'} />
        <span className="text-xs font-medium text-zinc-400">{temperature}°C</span>
      </div>
    </div>
  );
};

export default StatusBar;
