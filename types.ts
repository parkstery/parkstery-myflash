
export interface Preset {
  id: string;
  label: string;
  value: number;
}

export enum Mode {
  STANDARD = 'standard',
  SOS = 'sos',
  AUTO = 'auto',
  NIGHT = 'night'
}

export interface AppState {
  brightness: number;
  isOn: boolean;
  mode: Mode;
  presets: Preset[];
  batteryLevel: number;
  temperature: number;
}
