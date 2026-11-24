import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { evaluateMF, runInference, type DefuzzMethod, type ImplicationOperator, type OrOperator } from '@/engine';
import { useLabStore } from '@/state/labStore';
import {
  Badge,
  Button,
  Card,
  SegmentedControl,
  Slider,
  Tabs,
} from '@/components/ui';
import { AggregationChart, FanGauge, MembershipChart } from '@/components/charts';
import { MFPlayground } from '@/components/playground/MFPlayground';
import { RuleBuilder } from '@/components/playground/RuleBuilder';
import { WhatIfSimulator } from '@/components/playground/WhatIfSimulator';
import { MistakeExplorer } from '@/components/playground/MistakeExplorer';
import { ChallengeMode } from '@/components/playground/ChallengeMode';

export default function LabPage() {
  const {
    system,
    config,
    temperature,
    humidity,
    activeMistakeId,
    savedExperiments,
    setInputs,
    updateSetMF,
    addRule,
    deleteRule,
    setConfig,
    applyMistake,
    restoreSystem,
    resetVariablesOnly,
    resetRulesOnly,
    saveExperiment,
    loadExperiment,
    deleteExperiment,
    importExperimentJson,
  } = useLabStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedEditVar, setSelectedEditVar] = useState('temperature');
  const [selectedEditSet, setSelectedEditSet] = useState('warm');
  const [saveName, setSaveName] = useState('');
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Experiment Lab — FuzzyLab';
  }, []);

  const trace = useMemo(
    () => runInference(system, { temperature, humidity }, config),
    [system, temperature, humidity, config]
  );

  // Check universe coverage warnings
  const coverageWarnings = useMemo(() => {
    const warnings: string[] = [];
    for (const v of system.inputs) {
      const steps = 40;
      let uncoveredCount = 0;
      for (let i = 0; i <= steps; i++) {
        const x = v.min + ((v.max - v.min) * i) / steps;
        const sum = v.sets.reduce((acc, s) => acc + evaluateMF(x, s.mf).value, 0);
        if (sum <= 1e-6) uncoveredCount++;
      }
      if (uncoveredCount > 0) {
        warnings.push(
          `${v.name} has ${uncoveredCount} uncovered sample region(s) where all membership degrees are 0. Inputs in those regions may produce zero active rules.`
        );
      }
    }
    if (system.rules.length === 0) {
      warnings.push('Rule base is empty; no output can be inferred.');
    }
    return warnings;
  }, [system]);

  const editVarObj =
    system.output.id === selectedEditVar
      ? system.output
      : system.inputs.find((v) => v.id === selectedEditVar) ?? system.inputs[0];
  const editSetObj =
    editVarObj.sets.find((s) => s.id === selectedEditSet) ?? editVarObj.sets[0];

  const handleExportJson = () => {
    const payload = JSON.stringify(
      { temperature, humidity, system, config, exportedAt: new Date().toISOString() },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fuzzylab-experiment.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedRes = trace.defuzzification.selectedResult;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-orange">
            Experiment Mode
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-ink">
            Fuzzy Logic Experiment Lab
          </h1>
          <p className="mt-1 max-w-prose text-sm text-ink-secondary">
            Modify membership shapes, edit rules, switch operators and sampling resolution, test
            what-if scenarios, or explore deliberate design mistakes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={resetVariablesOnly}>
            Reset Sets
          </Button>
          <Button size="sm" variant="secondary" onClick={resetRulesOnly}>
            Reset Rules
          </Button>
          <Button size="sm" variant="primary" onClick={restoreSystem}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All to Defaults
          </Button>
        </div>
      </header>

      {/* Coverage / Property Warnings */}
      {coverageWarnings.length > 0 && (
        <div
          role="alert"
          className="rounded border border-warning/50 bg-warning/10 p-3 text-xs text-ink space-y-1"
        >
          <div className="flex items-center gap-1.5 font-semibold text-warning">
            <AlertTriangle className="h-4 w-4" />
            <span>System Property Warning</span>
          </div>
          {coverageWarnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      {/* Dark Experiment Control Deck */}
      <section
        aria-label="Experiment controls"
        className="rounded border border-border-strong bg-lab p-5 text-white space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-3">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-orange">
              Beginner Controls
            </span>
            <h2 className="font-serif text-lg font-semibold text-white">
              Inputs & Primary Operators
            </h2>
          </div>
          <div className="font-mono text-sm">
            Output:{' '}
            <strong className="text-xl text-orange">
              {selectedRes.ok ? `${selectedRes.value.toFixed(2)}%` : 'No active rule'}
            </strong>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Slider
            dark
            label="Temperature"
            value={temperature}
            min={0}
            max={40}
            step={0.5}
            unit="°C"
            onChange={(t) => setInputs(t, humidity)}
          />
          <Slider
            dark
            label="Humidity"
            value={humidity}
            min={0}
            max={100}
            step={1}
            unit="%"
            onChange={(h) => setInputs(temperature, h)}
          />
          <div className="space-y-2">
            <div className="text-sm font-medium text-white">AND Operator</div>
            <SegmentedControl
              ariaLabel="Lab AND Operator"
              size="sm"
              value={config.andOperator}
              onChange={(andOperator) => setConfig({ andOperator })}
              options={[
                { value: 'min', label: 'Minimum' },
                { value: 'product', label: 'Product' },
              ]}
            />
          </div>
        </div>

        {/* Collapsible Advanced Group */}
        <div className="border-t border-white/15 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/90 hover:text-white"
          >
            {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span>Advanced Controls</span>
            <Badge tone="orange">Advanced</Badge>
          </button>

          {showAdvanced && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div>
                <div className="mb-1.5 text-white/75">OR Operator</div>
                <SegmentedControl<OrOperator>
                  ariaLabel="OR Operator"
                  size="sm"
                  value={config.orOperator}
                  onChange={(orOperator) => setConfig({ orOperator })}
                  options={[
                    { value: 'max', label: 'Max' },
                    { value: 'probSum', label: 'Prob. Sum' },
                  ]}
                />
              </div>

              <div>
                <div className="mb-1.5 text-white/75">Implication</div>
                <SegmentedControl<ImplicationOperator>
                  ariaLabel="Implication Operator"
                  size="sm"
                  value={config.implication}
                  onChange={(implication) => setConfig({ implication })}
                  options={[
                    { value: 'min', label: 'Clip (min)' },
                    { value: 'product', label: 'Scale (prod)' },
                  ]}
                />
              </div>

              <div>
                <div className="mb-1.5 text-white/75">Defuzzification</div>
                <SegmentedControl<DefuzzMethod>
                  ariaLabel="Lab Defuzzification"
                  size="sm"
                  value={config.defuzzMethod}
                  onChange={(defuzzMethod) => setConfig({ defuzzMethod })}
                  options={[
                    { value: 'centroid', label: 'Centroid' },
                    { value: 'bisector', label: 'Bisector' },
                    { value: 'mom', label: 'MoM' },
                  ]}
                />
              </div>

              <div>
                <label htmlFor="res-select" className="mb-1.5 block text-white/75">
                  Sampling Resolution (Δy)
                </label>
                <select
                  id="res-select"
                  value={config.resolution}
                  onChange={(e) => setConfig({ resolution: Number(e.target.value) })}
                  className="w-full rounded border border-white/25 bg-white/10 px-2.5 py-1.5 font-mono text-xs text-white"
                >
                  <option value={1} className="text-ink">1.0 (101 pts, default)</option>
                  <option value={0.5} className="text-ink">0.5 (201 pts)</option>
                  <option value={0.25} className="text-ink">0.25 (401 pts)</option>
                  <option value={0.1} className="text-ink">0.1 (1001 pts)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Lab Workspace Tabs */}
      <Tabs
        defaultTabId="overview"
        items={[
          {
            id: 'overview',
            label: 'Live System & Output',
            content: (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <MembershipChart
                      variable={system.inputs[0]}
                      currentValue={temperature}
                      title="Temperature Sets"
                    />
                  </Card>
                  <Card>
                    <MembershipChart
                      variable={system.inputs[1]}
                      currentValue={humidity}
                      title="Humidity Sets"
                    />
                  </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-12">
                  <Card className="lg:col-span-8">
                    <AggregationChart
                      outputVar={system.output}
                      samples={trace.aggregatedSamples}
                      markers={
                        selectedRes.ok
                          ? [
                              {
                                label: config.defuzzMethod.toUpperCase(),
                                value: selectedRes.value,
                                color: '#D9772B',
                              },
                            ]
                          : []
                      }
                      title="Aggregated Output Envelope"
                    />
                  </Card>
                  <Card className="lg:col-span-4 space-y-4">
                    <FanGauge speedPercent={selectedRes.ok ? selectedRes.value : null} />
                    <p className="text-xs leading-relaxed text-ink-secondary">
                      {trace.explanation}
                    </p>
                  </Card>
                </div>
              </div>
            ),
          },
          {
            id: 'playground',
            label: 'MF Playground',
            content: (
              <div className="space-y-4">
                <Card subtle className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-semibold text-ink">Target Set to Edit:</span>
                  <select
                    aria-label="Select variable to edit"
                    value={editVarObj.id}
                    onChange={(e) => {
                      const nextVarId = e.target.value;
                      setSelectedEditVar(nextVarId);
                      const v =
                        nextVarId === system.output.id
                          ? system.output
                          : system.inputs.find((x) => x.id === nextVarId);
                      if (v && v.sets[0]) setSelectedEditSet(v.sets[0].id);
                    }}
                    className="rounded border border-border-strong bg-surface px-2.5 py-1.5 text-ink"
                  >
                    {system.inputs.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.unit})
                      </option>
                    ))}
                    <option value={system.output.id}>
                      {system.output.name} ({system.output.unit})
                    </option>
                  </select>

                  <select
                    aria-label="Select fuzzy set to edit"
                    value={editSetObj.id}
                    onChange={(e) => setSelectedEditSet(e.target.value)}
                    className="rounded border border-border-strong bg-surface px-2.5 py-1.5 text-ink"
                  >
                    {editVarObj.sets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Card>

                <MFPlayground
                  key={`${editVarObj.id}-${editSetObj.id}`}
                  min={editVarObj.min}
                  max={editVarObj.max}
                  unit={editVarObj.unit}
                  initialMF={editSetObj.mf}
                  title={`Editing ${editVarObj.name} -> ${editSetObj.name}`}
                  onMFChange={(mf) => updateSetMF(editVarObj.id, editSetObj.id, mf)}
                />
              </div>
            ),
          },
          {
            id: 'rules',
            label: 'Rule Builder',
            content: (
              <RuleBuilder
                system={system}
                inputs={{ temperature, humidity }}
                onAddRule={addRule}
                onDeleteRule={deleteRule}
              />
            ),
          },
          {
            id: 'whatif',
            label: 'What-If Simulator',
            content: (
              <WhatIfSimulator
                system={system}
                config={config}
                currentTemp={temperature}
                currentHumidity={humidity}
              />
            ),
          },
          {
            id: 'mistakes',
            label: 'Mistake Explorer',
            content: (
              <MistakeExplorer
                activeMistakeId={activeMistakeId}
                currentSystem={system}
                currentConfig={config}
                temperature={temperature}
                humidity={humidity}
                onApplyMistake={(id, sys, cfg, t, h) => {
                  applyMistake(id, sys, cfg);
                  setInputs(t, h);
                }}
                onRestore={restoreSystem}
              />
            ),
          },
          {
            id: 'challenges',
            label: 'Challenge Mode',
            content: (
              <ChallengeMode
                system={system}
                config={config}
                temperature={temperature}
                humidity={humidity}
              />
            ),
          },
          {
            id: 'presets',
            label: 'Save / Export / Import',
            content: (
              <div className="grid gap-5 md:grid-cols-2">
                <Card className="space-y-3">
                  <h3 className="font-serif text-base font-semibold text-ink">
                    Save & Load Experiments (Browser Storage)
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Experiment name..."
                      aria-label="Experiment name"
                      className="flex-1 rounded border border-border-strong bg-surface px-3 py-1.5 text-sm text-ink"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        saveExperiment(saveName);
                        setSaveName('');
                      }}
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save
                    </Button>
                  </div>

                  {savedExperiments.length === 0 ? (
                    <p className="text-xs text-ink-secondary">
                      No saved experiments yet. Save your current setup above.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {savedExperiments.map((exp) => (
                        <div
                          key={exp.id}
                          className="flex items-center justify-between rounded border border-border bg-subtle px-3 py-2 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-ink">{exp.name}</div>
                            <div className="text-[11px] text-ink-secondary">
                              {exp.temperature}°C, {exp.humidity}% · {exp.system.rules.length} rules
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => loadExperiment(exp.id)}
                            >
                              Load
                            </Button>
                            <button
                              type="button"
                              onClick={() => deleteExperiment(exp.id)}
                              aria-label={`Delete ${exp.name}`}
                              className="rounded p-1.5 text-ink-secondary hover:bg-error/10 hover:text-error"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="space-y-3">
                  <h3 className="font-serif text-base font-semibold text-ink">
                    Export / Import JSON
                  </h3>
                  <Button size="sm" variant="secondary" onClick={handleExportJson}>
                    <Download className="h-3.5 w-3.5" />
                    Download Experiment JSON
                  </Button>
                  <div className="border-t border-border pt-3 space-y-2">
                    <label htmlFor="import-json" className="block text-xs font-medium text-ink">
                      Paste Experiment JSON to Import
                    </label>
                    <textarea
                      id="import-json"
                      rows={4}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      className="w-full rounded border border-border-strong bg-surface p-2 font-mono text-xs text-ink"
                      placeholder='{"temperature": 24, "humidity": 45, "system": ...}'
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        const res = importExperimentJson(importText);
                        setImportStatus(
                          res.ok ? 'Experiment imported successfully.' : res.error ?? 'Import failed.'
                        );
                      }}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Import JSON
                    </Button>
                    {importStatus && (
                      <p className="text-xs text-ink-secondary">{importStatus}</p>
                    )}
                  </div>
                </Card>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

