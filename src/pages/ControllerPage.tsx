import { useEffect } from 'react';
import { Tabs } from '@/components/ui';
import { ControllerWorkspace } from '@/components/controller/ControllerWorkspace';
import { WalkthroughPlayer } from '@/components/simulation/WalkthroughPlayer';

export default function ControllerPage() {
  useEffect(() => {
    document.title = 'Interactive Controller — FuzzyLab';
  }, []);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <p className="font-mono text-xs uppercase tracking-wider text-teal">
          Mamdani Inference System
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-ink">
          Room Fan Fuzzy Logic Controller
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-secondary">
          Adjust Temperature and Humidity or load a scenario preset to watch every stage of
          Mamdani fuzzy inference update in real time. Switch to the Step-by-Step Walkthrough tab
          to step through the seven algorithmic stages one by one.
        </p>
      </header>

      <Tabs
        defaultTabId="live"
        items={[
          {
            id: 'live',
            label: 'Live Controller Pipeline',
            content: <ControllerWorkspace />,
          },
          {
            id: 'walkthrough',
            label: 'Step-by-Step Walkthrough (7 Stages)',
            content: <WalkthroughPlayer />,
          },
        ]}
      />
    </div>
  );
}

