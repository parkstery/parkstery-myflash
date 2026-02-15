
import React from 'react';
import { Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="flex justify-between items-center px-8 pt-8 pb-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-black rounded-sm transform rotate-45"></div>
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white/90">Smart Flash</h1>
      </div>
      <button 
        onClick={onOpenSettings}
        className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"
      >
        <Settings className="text-zinc-400" size={24} />
      </button>
    </header>
  );
};

export default Header;
