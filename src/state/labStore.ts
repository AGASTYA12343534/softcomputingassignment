import { create } from 'zustand';
import {
  DEFAULT_ENGINE_CONFIG,
  ROOM_FAN_SYSTEM,
  type EngineConfig,
  type FuzzyRule,
  type FuzzySystem,
  type MembershipFunctionSpec,
} from '@/engine';

export interface SavedExperiment {
  id: string;
  name: string;
  savedAt: string;
  temperature: number;
  humidity: number;
  system: FuzzySystem;
  config: EngineConfig;
}

export interface LabState {
  system: FuzzySystem;
  config: EngineConfig;
  temperature: number;
  humidity: number;
  activeMistakeId: string | null;
  savedExperiments: SavedExperiment[];

  setInputs: (temperature: number, humidity: number) => void;
  updateSetMF: (variableId: string, setId: string, mf: MembershipFunctionSpec) => void;
  addRule: (rule: FuzzyRule) => void;
  updateRule: (ruleId: string, rule: FuzzyRule) => void;
  deleteRule: (ruleId: string) => void;
  setRules: (rules: FuzzyRule[]) => void;
  setConfig: (partial: Partial<EngineConfig>) => void;
  applyMistake: (mistakeId: string, mutatedSystem: FuzzySystem, configOverride?: Partial<EngineConfig>) => void;
  restoreSystem: () => void;
  resetVariablesOnly: () => void;
  resetRulesOnly: () => void;
  saveExperiment: (name: string) => void;
  loadExperiment: (id: string) => void;
  deleteExperiment: (id: string) => void;
  importExperimentJson: (json: string) => { ok: boolean; error?: string };
}

const LAB_STORAGE_KEY = 'fuzzylab_experiments_v1';

function cloneSystem(sys: FuzzySystem): FuzzySystem {
  return JSON.parse(JSON.stringify(sys)) as FuzzySystem;
}

function loadSavedExperiments(): SavedExperiment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LAB_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedExperiment[]) : [];
  } catch {
    return [];
  }
}

function persistSavedExperiments(list: SavedExperiment[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

export const useLabStore = create<LabState>((set, get) => ({
  system: cloneSystem(ROOM_FAN_SYSTEM),
  config: { ...DEFAULT_ENGINE_CONFIG },
  temperature: 24,
  humidity: 45,
  activeMistakeId: null,
  savedExperiments: loadSavedExperiments(),

  setInputs: (temperature, humidity) => set({ temperature, humidity }),

  updateSetMF: (variableId, setId, mf) =>
    set((s) => {
      const next = cloneSystem(s.system);
      const targetVar =
        next.output.id === variableId
          ? next.output
          : next.inputs.find((v) => v.id === variableId);
      if (targetVar) {
        const targetSet = targetVar.sets.find((st) => st.id === setId);
        if (targetSet) targetSet.mf = mf;
      }
      return { system: next, activeMistakeId: null };
    }),

  addRule: (rule) =>
    set((s) => ({
      system: { ...s.system, rules: [...s.system.rules, rule] },
      activeMistakeId: null,
    })),

  updateRule: (ruleId, rule) =>
    set((s) => ({
      system: {
        ...s.system,
        rules: s.system.rules.map((r) => (r.id === ruleId ? rule : r)),
      },
      activeMistakeId: null,
    })),

  deleteRule: (ruleId) =>
    set((s) => ({
      system: {
        ...s.system,
        rules: s.system.rules.filter((r) => r.id !== ruleId),
      },
      activeMistakeId: null,
    })),

  setRules: (rules) =>
    set((s) => ({
      system: { ...s.system, rules },
      activeMistakeId: null,
    })),

  setConfig: (partial) =>
    set((s) => ({ config: { ...s.config, ...partial } })),

  applyMistake: (mistakeId, mutatedSystem, configOverride) =>
    set((s) => ({
      system: cloneSystem(mutatedSystem),
      config: { ...DEFAULT_ENGINE_CONFIG, ...s.config, ...configOverride },
      activeMistakeId: mistakeId,
    })),

  restoreSystem: () =>
    set({
      system: cloneSystem(ROOM_FAN_SYSTEM),
      config: { ...DEFAULT_ENGINE_CONFIG },
      activeMistakeId: null,
    }),

  resetVariablesOnly: () =>
    set((s) => {
      const fresh = cloneSystem(ROOM_FAN_SYSTEM);
      return {
        system: { ...s.system, inputs: fresh.inputs, output: fresh.output },
        activeMistakeId: null,
      };
    }),

  resetRulesOnly: () =>
    set((s) => {
      const fresh = cloneSystem(ROOM_FAN_SYSTEM);
      return {
        system: { ...s.system, rules: fresh.rules },
        activeMistakeId: null,
      };
    }),

  saveExperiment: (name) => {
    const s = get();
    const item: SavedExperiment = {
      id: `exp-${Date.now()}`,
      name: name.trim() || 'Untitled Experiment',
      savedAt: new Date().toISOString(),
      temperature: s.temperature,
      humidity: s.humidity,
      system: cloneSystem(s.system),
      config: { ...s.config },
    };
    const next = [item, ...s.savedExperiments].slice(0, 15);
    persistSavedExperiments(next);
    set({ savedExperiments: next });
  },

  loadExperiment: (id) => {
    const found = get().savedExperiments.find((e) => e.id === id);
    if (!found) return;
    set({
      temperature: found.temperature,
      humidity: found.humidity,
      system: cloneSystem(found.system),
      config: { ...found.config },
      activeMistakeId: null,
    });
  },

  deleteExperiment: (id) => {
    const next = get().savedExperiments.filter((e) => e.id !== id);
    persistSavedExperiments(next);
    set({ savedExperiments: next });
  },

  importExperimentJson: (json) => {
    try {
      const parsed = JSON.parse(json) as Partial<SavedExperiment>;
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.system ||
        !Array.isArray(parsed.system.inputs) ||
        !parsed.system.output ||
        !Array.isArray(parsed.system.rules)
      ) {
        return { ok: false, error: 'JSON does not match the FuzzyLab experiment schema.' };
      }
      set({
        temperature: typeof parsed.temperature === 'number' ? parsed.temperature : 24,
        humidity: typeof parsed.humidity === 'number' ? parsed.humidity : 45,
        system: cloneSystem(parsed.system),
        config: { ...DEFAULT_ENGINE_CONFIG, ...(parsed.config ?? {}) },
        activeMistakeId: null,
      });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Invalid JSON syntax.' };
    }
  },
}));

