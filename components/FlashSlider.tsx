
import React from 'react';

interface FlashSliderProps {
  value: number;
  onChange: (val: number) => void;
  isNightMode: boolean;
  isOn: boolean;
}

const FlashSlider: React.FC<FlashSliderProps> = ({ value, onChange, isNightMode, isOn }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-12 text-center">
        <span className="text-8xl font-thin tracking-tighter tabular-nums transition-all">
          {isOn ? value : 0}
        </span>
        <span className="text-2xl font-light text-zinc-500 ml-1">%</span>
      </div>

      <div className="relative w-full h-[300px] flex justify-center items-center">
        {/* Background Track */}
        <div className="absolute w-24 h-full bg-zinc-900 rounded-full overflow-hidden shadow-inner border border-white/5">
          {/* Active Progress */}
          <div 
            className={`absolute bottom-0 w-full transition-all duration-300 ${isNightMode ? 'bg-red-500' : 'bg-white'}`}
            style={{ height: `${isOn ? value : 0}%`, opacity: isOn ? 1 : 0.3 }}
          />
        </div>

        {/* Input Overlays (Hidden visual, handles interactions) */}
        <input
          type="range"
          min="1"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute w-[300px] h-24 -rotate-90 bg-transparent appearance-none cursor-pointer z-20"
          style={{ transform: 'rotate(-90deg)' }}
        />
      </div>
      
      <p className="mt-8 text-zinc-500 text-sm font-medium uppercase tracking-widest">
        Slide to Adjust Brightness
      </p>
    </div>
  );
};

export default FlashSlider;
