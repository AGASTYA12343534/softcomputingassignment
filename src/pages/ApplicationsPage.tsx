import { useEffect, useState } from 'react';
import { APPLICATION_CASES, type ApplicationCase } from '@/content/applications';
import { runInference } from '@/engine';
import { Badge, Callout, Card, Slider } from '@/components/ui';

function ApplicationDiagram({ appId }: { appId: string }) {
  return (
    <svg
      viewBox="0 0 260 64"
      className="w-full max-w-xs h-auto"
      role="img"
      aria-label={`Control loop diagram for ${appId}`}
    >
      <rect x="4" y="14" width="66" height="36" rx="3" fill="#F3EEE3" stroke="#B8AF9C" />
      <text x="37" y="35" textAnchor="middle" fontSize="10" fill="#14213D" fontWeight="600">
        Sensors
      </text>
      <line x1="70" y1="32" x2="94" y2="32" stroke="#2A7F82" strokeWidth="1.8" />
      <rect x="94" y="14" width="72" height="36" rx="3" fill="#2A7F82" />
      <text x="130" y="35" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="600">
        Fuzzy Engine
      </text>
      <line x1="166" y1="32" x2="190" y2="32" stroke="#D9772B" strokeWidth="1.8" />
      <rect x="190" y="14" width="66" height="36" rx="3" fill="#FFFFFF" stroke="#D9772B" strokeWidth="1.5" />
      <text x="223" y="35" textAnchor="middle" fontSize="10" fill="#14213D" fontWeight="600">
        Actuator
      </text>
    </svg>
  );
}

function ApplicationCard({ app }: { app: ApplicationCase }) {
  const [inputs, setInputs] = useState<Record<string, number>>(app.defaultInputs);
  const trace = runInference(app.system, inputs, {}, { computeAnalytic: false });
  const outRes = trace.defuzzification.selectedResult;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">{app.title}</h2>
          <p className="mt-1 text-sm text-ink-secondary">{app.problem}</p>
        </div>
        <ApplicationDiagram appId={app.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 text-xs">
        <div className="space-y-2">
          <div>
            <span className="font-semibold text-ink">Why crisp rules struggle: </span>
            <span className="text-ink-secondary">{app.whyCrispStruggles}</span>
          </div>
          <div>
            <span className="font-semibold text-teal">Fuzzy benefit: </span>
            <span className="text-ink-secondary">{app.benefit}</span>
          </div>
          <div className="pt-1">
            <span className="font-semibold text-ink block mb-1">Sample Rules:</span>
            <ul className="space-y-1 font-mono text-[11px] text-ink-secondary">
              {app.system.rules.slice(0, 4).map((r) => (
                <li key={r.id}>
                  {r.id}: {r.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded border border-border bg-subtle p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Live Mini-Controller
            </span>
            <Badge tone="teal">
              {app.system.output.name}:{' '}
              {outRes.ok ? `${outRes.value.toFixed(1)} ${app.system.output.unit}` : '—'}
            </Badge>
          </div>
          {app.system.inputs.map((v) => (
            <Slider
              key={v.id}
              label={v.name}
              value={inputs[v.id] ?? v.min}
              min={v.min}
              max={v.max}
              step={(v.max - v.min) <= 10 ? 0.2 : 1}
              unit={v.unit}
              onChange={(val) => setInputs((p) => ({ ...p, [v.id]: val }))}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function ApplicationsPage() {
  useEffect(() => {
    document.title = 'Real-World Applications — FuzzyLab';
  }, []);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <p className="font-mono text-xs uppercase tracking-wider text-teal">
          Engineering Case Studies
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-ink">
          Real-World Fuzzy Control Applications
        </h1>
        <p className="mt-2 max-w-prose text-sm text-ink-secondary">
          Explore six domains where fuzzy logic excels. Every interactive mini-controller below
          runs live through FuzzyLab’s Mamdani inference engine.
        </p>
      </header>

      <Callout kind="definition" title="Educational Scope Note">
        These interactive mini-models are simplified teaching systems designed to illustrate how
        linguistic rules map inputs to outputs; real industrial controllers include safety
        interlocks, filtering, and hardware-specific tuning.
      </Callout>

      <div className="space-y-5">
        {APPLICATION_CASES.map((app) => (
          <ApplicationCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}

