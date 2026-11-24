import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FlaskConical, Sliders } from 'lucide-react';
import { evaluateMF, TEMPERATURE_VAR } from '@/engine';
import { MODULE_META } from '@/content/moduleMeta';
import { Button, Card, Slider } from '@/components/ui';

export default function HomePage() {
  const [temp, setTemp] = useState(21.5);
  const warmMu = evaluateMF(temp, TEMPERATURE_VAR.sets[1].mf).value;
  const boolWarm = temp >= 22;

  useEffect(() => {
    document.title = 'FuzzyLab — Interactive Fuzzy Logic Learning Platform';
  }, []);

  return (
    <div className="space-y-12">
      {/* Editorial Hero + Above-the-Fold Miniature */}
      <section className="grid gap-8 border-b border-border pb-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7 space-y-4">
          <p className="font-mono text-xs uppercase tracking-wider text-teal">
            Interactive Engineering Textbook
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Fuzzy Logic, from first principles to a working controller.
          </h1>
          <p className="max-w-prose text-base leading-relaxed text-ink-secondary">
            Learn how machines reason with human-like concepts such as &ldquo;warm&rdquo; and
            &ldquo;humid,&rdquo; inspect every formula step by step, and operate a live Mamdani
            fuzzy inference engine.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/learn/module-1">
              <Button variant="primary" size="lg">
                Begin Module 1
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/start">
              <Button variant="secondary" size="lg">
                Orientation & 60s Demo
              </Button>
            </Link>
            <Link to="/controller">
              <Button variant="ghost" size="lg">
                Open Live Controller
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Miniature: Is it warm? */}
        <Card className="lg:col-span-5 space-y-4">
          <div className="border-b border-border pb-2.5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
              Live Miniature
            </div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              &ldquo;Is 21.5 °C warm?&rdquo;
            </h2>
          </div>

          <Slider
            label="Room Temperature"
            value={temp}
            min={0}
            max={40}
            step={0.5}
            unit="°C"
            onChange={setTemp}
          />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded border border-border bg-subtle p-3">
              <div className="font-semibold text-ink-secondary">Boolean (≥ 22 °C)</div>
              <div className="mt-1 font-mono text-xl font-bold text-ink">
                {boolWarm ? '1 · TRUE' : '0 · FALSE'}
              </div>
              <p className="mt-1 text-[11px] text-ink-secondary">Hard cutoff cliff</p>
            </div>
            <div className="rounded border border-teal/40 bg-surface p-3">
              <div className="font-semibold text-teal">Fuzzy (Warm)</div>
              <div className="mt-1 font-mono text-xl font-bold text-teal">
                μ = {warmMu.toFixed(2)}
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-xs bg-subtle overflow-hidden">
                <div className="h-full bg-teal" style={{ width: `${warmMu * 100}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Three Ways to Use FuzzyLab */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-ink">Three Ways to Use FuzzyLab</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <BookOpen className="h-5 w-5 text-teal" aria-hidden="true" />
              <h3 className="font-serif text-lg font-semibold text-ink">1. Learn (Modules 1–9)</h3>
              <p className="text-sm leading-relaxed text-ink-secondary">
                Structured lessons from zero prerequisites through fuzzification, rule bases,
                aggregation, and defuzzification with knowledge checks.
              </p>
            </div>
            <Link to="/learn/module-1" className="text-sm font-medium text-teal hover:underline">
              Start curriculum →
            </Link>
          </Card>

          <Card className="flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <Sliders className="h-5 w-5 text-teal" aria-hidden="true" />
              <h3 className="font-serif text-lg font-semibold text-ink">2. Live Controller</h3>
              <p className="text-sm leading-relaxed text-ink-secondary">
                Operate the 9-rule Room Fan Controller, inspect every intermediate calculation in
                the Algorithm Trace, and step through the 7-stage walkthrough.
              </p>
            </div>
            <Link to="/controller" className="text-sm font-medium text-teal hover:underline">
              Open controller →
            </Link>
          </Card>

          <Card className="flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <FlaskConical className="h-5 w-5 text-orange" aria-hidden="true" />
              <h3 className="font-serif text-lg font-semibold text-ink">3. Experiment Lab</h3>
              <p className="text-sm leading-relaxed text-ink-secondary">
                Drag membership function vertices, build custom rules, test what-if deltas,
                diagnose deliberate mistakes, and solve challenges.
              </p>
            </div>
            <Link to="/lab" className="text-sm font-medium text-teal hover:underline">
              Enter lab →
            </Link>
          </Card>
        </div>
      </section>

      {/* Curriculum Table of Contents */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-2xl font-bold text-ink">Curriculum Contents</h2>
          <span className="font-mono text-xs text-ink-secondary">
            9 modules · ~87 minutes total
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULE_META.map((m) => (
            <Link
              key={m.id}
              to={`/learn/${m.id}`}
              className="group rounded border border-border bg-surface p-4 transition-colors hover:border-teal"
            >
              <div className="flex items-center justify-between font-mono text-xs text-ink-secondary">
                <span>MODULE {m.number}</span>
                <span>{m.estimatedMinutes} min</span>
              </div>
              <h3 className="mt-1 font-serif text-base font-semibold text-ink group-hover:text-teal">
                {m.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

