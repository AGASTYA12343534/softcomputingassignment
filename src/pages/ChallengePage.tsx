import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLabStore } from '@/state/labStore';
import { Button, Card, Slider } from '@/components/ui';
import { ChallengeMode } from '@/components/playground/ChallengeMode';

export default function ChallengePage() {
  const { system, config, temperature, humidity, setInputs, restoreSystem } = useLabStore();

  useEffect(() => {
    document.title = 'Challenge Mode — FuzzyLab';
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-orange">
            Applied Problem Solving
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-ink">Challenge Mode</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Test your intuition by hitting live engine targets. Need to edit rules? Open the{' '}
            <Link to="/lab" className="text-teal underline">
              Experiment Lab
            </Link>
            .
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={restoreSystem}>
          Reset System
        </Button>
      </header>

      <Card className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="Temperature"
          value={temperature}
          min={0}
          max={40}
          step={0.5}
          unit="°C"
          onChange={(t) => setInputs(t, humidity)}
        />
        <Slider
          label="Humidity"
          value={humidity}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(h) => setInputs(temperature, h)}
        />
      </Card>

      <ChallengeMode
        system={system}
        config={config}
        temperature={temperature}
        humidity={humidity}
      />
    </div>
  );
}

