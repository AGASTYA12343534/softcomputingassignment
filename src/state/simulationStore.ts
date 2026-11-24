import { create } from 'zustand';
import {
  DEFAULT_ENGINE_CONFIG,
  type AndOperator,
  type DefuzzMethod,
  type EngineConfig,
  type ImplicationOperator,
  type OrOperator,
} from '@/engine';

export type WalkthroughStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface SimulationState {
  temperature: number;
  humidity: number;
  config: EngineConfig;
  walkthroughStage: WalkthroughStage;
  isPlaying: boolean;
  playbackSpeed: 0.75 | 1 | 1.5 | 2;

  setTemperature: (t: number) => void;
  setHumidity: (h: number) => void;
  setInputs: (t: number, h: number) => void;
  setAndOperator: (op: AndOperator) => void;
  setOrOperator: (op: OrOperator) => void;
  setImplication: (op: ImplicationOperator) => void;
  setResolution: (res: number) => void;
  setDefuzzMethod: (method: DefuzzMethod) => void;
  resetControllerDefaults: () => void;

  setWalkthroughStage: (stage: WalkthroughStage) => void;
  nextStage: () => void;
  prevStage: () => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: 0.75 | 1 | 1.5 | 2) => void;
  resetWalkthrough: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  temperature: 24,
  humidity: 45,
  config: { ...DEFAULT_ENGINE_CONFIG },
  walkthroughStage: 1,
  isPlaying: false,
  playbackSpeed: 1,

  setTemperature: (temperature) => set({ temperature }),
  setHumidity: (humidity) => set({ humidity }),
  setInputs: (temperature, humidity) => set({ temperature, humidity }),

  setAndOperator: (andOperator) =>
    set((s) => ({ config: { ...s.config, andOperator } })),
  setOrOperator: (orOperator) =>
    set((s) => ({ config: { ...s.config, orOperator } })),
  setImplication: (implication) =>
    set((s) => ({ config: { ...s.config, implication } })),
  setResolution: (resolution) =>
    set((s) => ({ config: { ...s.config, resolution } })),
  setDefuzzMethod: (defuzzMethod) =>
    set((s) => ({ config: { ...s.config, defuzzMethod } })),

  resetControllerDefaults: () =>
    set({
      temperature: 24,
      humidity: 45,
      config: { ...DEFAULT_ENGINE_CONFIG },
    }),

  setWalkthroughStage: (walkthroughStage) => set({ walkthroughStage }),
  nextStage: () =>
    set((s) => {
      if (s.walkthroughStage >= 7) {
        return { walkthroughStage: 7, isPlaying: false };
      }
      return { walkthroughStage: (s.walkthroughStage + 1) as WalkthroughStage };
    }),
  prevStage: () =>
    set((s) => ({
      walkthroughStage: (s.walkthroughStage > 1 ? s.walkthroughStage - 1 : 1) as WalkthroughStage,
    })),
  togglePlay: () =>
    set((s) => ({
      isPlaying: s.walkthroughStage === 7 && !s.isPlaying ? true : !s.isPlaying,
      walkthroughStage: s.walkthroughStage === 7 && !s.isPlaying ? 1 : s.walkthroughStage,
    })),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  resetWalkthrough: () => set({ walkthroughStage: 1, isPlaying: false }),
}));

