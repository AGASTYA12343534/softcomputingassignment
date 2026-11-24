import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, GraduationCap, PlayCircle } from 'lucide-react';
import { ROOM_FAN_SYSTEM, runInference } from '@/engine';
import { useProgressStore } from '@/state/progressStore';
import { Button, Card, Slider } from '@/components/ui';
import { FanGauge } from '@/components/charts';

export default function StartPage() {
  const { lastVisitedRoute, completedModules } = useProgressStore();
  const [temp, setTemp] = useState(28);
  const [hum, setHum] = useState(65);

  useEffect(() => {
    document.title = 'Start Learning — FuzzyLab';
  }, []);

  const trace = runInference(ROOM_FAN_SYSTEM, { temperature: temp, humidity: hum }, {}, { computeAnalytic: false });
  const fanOut = trace.defuzzification.selectedResult.ok
    ? trace.defuzzification.selectedResult.value
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="border-b border-border pb-5">
        <p className="font-mono text-xs uppercase tracking-wider text-teal">Orientation</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-ink">
          Start Learning Fuzzy Logic
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-secondary">
          Everything you need to know before beginning Module 1—prerequisites, how the two modes
          work, and a 60-second live preview of a fuzzy controller.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to={lastVisitedRoute || '/learn/module-1'}>
            <Button variant="primary">
              {completedModules.length > 0 ? 'Continue Where You Left Off' : 'Begin Module 1'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/learn/module-1">
            <Button variant="secondary">Jump to Module 1</Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-1.5">
          <GraduationCap className="h-5 w-5 text-teal" aria-hidden="true" />
          <h2 className="font-serif text-base font-semibold text-ink">Prerequisites</h2>
          <p className="text-xs leading-relaxed text-ink-secondary">
            Only high-school algebra (reading line equations and percentages). Zero prior AI or
            control-theory background required.
          </p>
        </Card>
        <Card className="space-y-1.5">
          <Clock className="h-5 w-5 text-teal" aria-hidden="true" />
          <h2 className="font-serif text-base font-semibold text-ink">Time Estimate</h2>
          <p className="text-xs leading-relaxed text-ink-secondary">
            About 85 minutes across 9 bite-sized modules, plus optional lab challenges and a
            20-question Final Assessment.
          </p>
        </Card>
        <Card className="space-y-1.5">
          <PlayCircle className="h-5 w-5 text-orange" aria-hidden="true" />
          <h2 className="font-serif text-base font-semibold text-ink">Learn vs. Lab Modes</h2>
          <p className="text-xs leading-relaxed text-ink-secondary">
            <strong>Learn</strong> mode guides you with structured lessons and checks.{' '}
            <strong>Lab</strong> mode unlocks set editing, rule authoring, and resolution controls.
          </p>
        </Card>
      </div>

      {/* Fuzzy in 60 Seconds */}
      <Card className="space-y-4">
        <div className="border-b border-border pb-3">
          <span className="font-mono text-xs uppercase tracking-wider text-teal">
            Interactive Preview
          </span>
          <h2 className="font-serif text-xl font-semibold text-ink">Fuzzy Logic in 60 Seconds</h2>
          <p className="mt-1 text-xs text-ink-secondary">
            Move the sliders below. Notice how the fan speed responds smoothly without sudden jumps
            as rules blend together.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <Slider
              label="Temperature"
              value={temp}
              min={0}
              max={40}
              step={0.5}
              unit="°C"
              onChange={setTemp}
            />
            <Slider
              label="Humidity"
              value={hum}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={setHum}
            />
          </div>
          <div className="rounded border border-border bg-subtle p-4 space-y-3">
            <FanGauge speedPercent={fanOut} />
            <p className="text-xs leading-relaxed text-ink-secondary">{trace.explanation}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

