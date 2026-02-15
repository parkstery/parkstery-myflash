
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { registerPlugin, Capacitor } from '@capacitor/core';
import Header from './components/Header';
import FlashSlider from './components/FlashSlider';
import ActionButtons from './components/ActionButtons';
import PresetList from './components/PresetList';
import StatusBar from './components/StatusBar';
import { Mode, Preset } from './types';

// 네이티브 플래시 플러그인 인터페이스 정의
interface FlashPlugin {
  toggle(options: { state: boolean }): Promise<void>;
  setBrightness(options: { level: number }): Promise<void>;
}

const Flash = registerPlugin<FlashPlugin>('Flash');

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

  const sosIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 네이티브 하드웨어 제어 함수
  const updateHardwareFlash = useCallback(async (state: boolean, level: number) => {
    if (Capacitor.isNativePlatform()) {
      try {
        if (state) {
          // 밝기 설정 후 켜기 (Android Camera2 API 레벨 매핑: 0-100 -> 기기별 max)
          await Flash.setBrightness({ level });
          await Flash.toggle({ state: true });
        } else {
          await Flash.toggle({ state: false });
        }
      } catch (e) {
        console.error("Native Flash Control Error", e);
      }
    } else {
      console.warn("Flash brightness control is only available on native Android devices.");
    }
  }, []);

  // 상태 변경 시 하드웨어 동기화
  useEffect(() => {
    if (mode !== Mode.SOS) {
      updateHardwareFlash(isOn, brightness);
    }
  }, [isOn, brightness, mode, updateHardwareFlash]);

  // SOS 모드 로직 (네이티브 연동)
  useEffect(() => {
    if (mode === Mode.SOS && isOn) {
      let currentFlashState = true;
      sosIntervalRef.current = setInterval(() => {
        currentFlashState = !currentFlashState;
        if (Capacitor.isNativePlatform()) {
          Flash.toggle({ state: currentFlashState });
        }
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
    setMode(prev => prev === newMode ? Mode.STANDARD : newMode);
  };

  const addPreset = () => {
    const label = prompt("Preset Name:", `Level ${brightness}%`);
    if (label) {
      setPresets([...presets, { id: Date.now().toString(), label, value: brightness }]);
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
              <h3 className="text-zinc-400 text-sm mb-2">Device Status</h3>
              <div className="flex justify-between items-center">
                <span>Native Bridge</span>
                <span className={Capacitor.isNativePlatform() ? "text-green-500" : "text-yellow-500"}>
                  {Capacitor.isNativePlatform() ? "Connected" : "Web Preview"}
                </span>
              </div>
            </section>
            <p className="text-zinc-500 text-xs text-center pt-8">Smart Flash Control v1.1.0 (Native Hybrid)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
