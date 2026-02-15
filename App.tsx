
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Settings, 
  Power, 
  Zap, 
  Sun, 
  Moon, 
  AlertTriangle, 
  Battery, 
  Thermometer,
  PlusCircle,
  X
} from 'lucide-react';
import Header from './components/Header';
import FlashSlider from './components/FlashSlider';
import ActionButtons from './components/ActionButtons';
import PresetList from './components/PresetList';
import StatusBar from './components/StatusBar';
import { Mode, Preset, AppState } from './types';

const INITIAL_PRESETS: Preset[] = [
  { id: '1', label: 'Reading', value: 20 },
  { id: '2', label: 'Night', value: 5 },
  { id: '3', label: 'Max', value: 100 },
];

const App: React.FC = () => {
  const [brightness, setBrightness] = useState(50);
  const [isOn, setIsOn] = useState(false);
  const [mode, setMode] = useState<Mode>(Mode.STANDARD);
  const [presets, setPresets] = useState<Preset[]>(INITIAL_PRESETS);
  const [battery, setBattery] = useState(85);
  const [temp, setTemp] = useState(32);
  const [showSettings, setShowSettings] = useState(false);

  // Fix: Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to avoid missing namespace error in browser environments
  const sosIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  // Hardware control simulation / implementation
  // Note: Most browsers only support 'torch' boolean. 
  // Brightness levels (PWM) are generally handled at the OS level or through native bridge.
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        const track = stream.getVideoTracks()[0];
        videoTrackRef.current = track;
      } catch (err) {
        console.warn("Camera flash not accessible in this environment or permission denied.");
      }
    };
    initCamera();
    return () => {
      videoTrackRef.current?.stop();
    };
  }, []);

  const updateHardwareFlash = useCallback(async (state: boolean) => {
    if (videoTrackRef.current) {
      const capabilities = videoTrackRef.current.getCapabilities() as any;
      if (capabilities.torch) {
        try {
          await videoTrackRef.current.applyConstraints({
            advanced: [{ torch: state }]
          } as any);
        } catch (e) {
          console.error("Failed to toggle torch", e);
        }
      }
    }
  }, []);

  // Sync Hardware with State
  useEffect(() => {
    if (mode === Mode.SOS) return; // SOS handles its own flashing
    updateHardwareFlash(isOn);
  }, [isOn, mode, updateHardwareFlash]);

  // SOS Mode Logic
  useEffect(() => {
    if (mode === Mode.SOS && isOn) {
      sosIntervalRef.current = setInterval(() => {
        setIsOn(prev => !prev);
      }, 500);
    } else {
      if (sosIntervalRef.current) {
        clearInterval(sosIntervalRef.current);
        sosIntervalRef.current = null;
      }
    }
    return () => {
      if (sosIntervalRef.current) clearInterval(sosIntervalRef.current);
    };
  }, [mode, isOn]);

  const togglePower = () => {
    setIsOn(prev => !prev);
  };

  const handleBrightnessChange = (val: number) => {
    setBrightness(val);
  };

  const applyPreset = (preset: Preset) => {
    setBrightness(preset.value);
    setIsOn(true);
    setMode(Mode.STANDARD);
  };

  const toggleMode = (newMode: Mode) => {
    if (mode === newMode) {
      setMode(Mode.STANDARD);
    } else {
      setMode(newMode);
    }
  };

  const addPreset = () => {
    const label = prompt("Preset Name:", `Level ${brightness}%`);
    if (label) {
      const newPreset: Preset = {
        id: Date.now().toString(),
        label,
        value: brightness
      };
      setPresets([...presets, newPreset]);
    }
  };

  const deletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
  };

  return (
    <div className={`relative flex flex-col h-screen w-full max-w-md mx-auto transition-colors duration-500 ${mode === Mode.NIGHT ? 'bg-red-950/20' : 'bg-[#0a0a0a]'}`}>
      
      <Header onOpenSettings={() => setShowSettings(true)} />

      <StatusBar battery={battery} temperature={temp} />

      <main className="flex-1 flex flex-col items-center justify-center px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20 overflow-hidden">
          <div 
            className="w-96 h-96 bg-white rounded-full blur-[100px] mx-auto transition-all duration-300"
            style={{ 
              opacity: isOn ? brightness / 100 : 0,
              transform: `scale(${1 + brightness / 100})`,
              backgroundColor: mode === Mode.NIGHT ? '#ff4444' : '#ffffff'
            }}
          />
        </div>

        <FlashSlider 
          value={brightness} 
          onChange={handleBrightnessChange} 
          isNightMode={mode === Mode.NIGHT}
          isOn={isOn}
        />
      </main>

      <div className="px-6 pb-12 space-y-8 z-10">
        <PresetList 
          presets={presets} 
          activeValue={brightness}
          onApply={applyPreset} 
          onAdd={addPreset}
          onDelete={deletePreset}
        />

        <div className="flex justify-around items-center bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <ActionButtons 
            mode={mode} 
            isOn={isOn} 
            onTogglePower={togglePower} 
            onToggleMode={toggleMode} 
          />
        </div>
      </div>

      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Settings</h2>
            <button onClick={() => setShowSettings(false)} className="p-2 bg-zinc-800 rounded-full">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-6">
            <section className="bg-zinc-800/50 p-4 rounded-2xl">
              <h3 className="text-zinc-400 text-sm mb-2">Power Management</h3>
              <div className="flex justify-between items-center">
                <span>Auto-off Timer</span>
                <span className="text-white font-medium">10 Min</span>
              </div>
            </section>
            <section className="bg-zinc-800/50 p-4 rounded-2xl">
              <h3 className="text-zinc-400 text-sm mb-2">Display</h3>
              <div className="flex justify-between items-center">
                <span>Haptic Feedback</span>
                <div className="w-12 h-6 bg-green-500 rounded-full relative">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </section>
            <p className="text-zinc-500 text-xs text-center pt-8">Smart Flash Control v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
