import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { getModuleById, MODULES } from '@/content/modules';
import { useProgressStore } from '@/state/progressStore';
import { Badge, Button, Callout, Card, FormulaBlock } from '@/components/ui';
import { KnowledgeCheck } from '@/components/lesson/KnowledgeCheck';
import { ModuleActivityRenderer } from '@/components/lesson/ModuleActivities';

export default function LearnPage() {
  const { moduleId = 'module-1' } = useParams<{ moduleId: string }>();
  const mod = getModuleById(moduleId);
  const { completedModules, markModuleComplete, setLastVisitedRoute } = useProgressStore();
  const [hintLevel, setHintLevel] = useState(0);

  useEffect(() => {
    setHintLevel(0);
    if (mod) {
      document.title = `Module ${mod.number}: ${mod.title} — FuzzyLab`;
      setLastVisitedRoute(`/learn/${mod.id}`);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [mod, setLastVisitedRoute]);

  if (!mod) {
    return <Navigate to="/learn/module-1" replace />;
  }

  const isCompleted = completedModules.includes(mod.id);
  const prevMod = MODULES.find((m) => m.number === mod.number - 1);
  const nextMod = MODULES.find((m) => m.number === mod.number + 1);

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      {/* Breadcrumb & Header */}
      <header className="space-y-3 border-b border-border pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-secondary">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <span>Learn</span>
          <span>/</span>
          <span className="font-medium text-ink">Module {mod.number}</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge tone="teal">Module {mod.number} of 9</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-ink-secondary">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {mod.estimatedMinutes} min
            </span>
          </div>
          {isCompleted && (
            <Badge tone="success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </Badge>
          )}
        </div>

        <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl">{mod.title}</h1>
      </header>

      {/* 1. Learning Goals */}
      <section aria-labelledby="goals-heading">
        <Card subtle>
          <h2 id="goals-heading" className="font-serif text-lg font-semibold text-ink mb-2">
            Learning Goals
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-ink">
            {mod.goals.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </Card>
      </section>

      {/* 2. Beginner Definition */}
      <section aria-labelledby="def-heading" className="space-y-2">
        <h2 id="def-heading" className="font-serif text-xl font-semibold text-ink">
          Definition
        </h2>
        <Callout kind="definition">
          <p className="max-w-prose leading-relaxed">{mod.definition}</p>
        </Callout>
      </section>

      {/* 3. Intuition */}
      <section aria-labelledby="int-heading" className="space-y-2">
        <h2 id="int-heading" className="font-serif text-xl font-semibold text-ink">
          Intuition
        </h2>
        <Callout kind="intuition">
          <p className="max-w-prose leading-relaxed">{mod.intuition}</p>
        </Callout>
      </section>

      {/* 4. Worked Example */}
      <section aria-labelledby="ex-heading" className="space-y-2">
        <h2 id="ex-heading" className="font-serif text-xl font-semibold text-ink">
          Worked Example
        </h2>
        <Callout kind="example">
          <p className="max-w-prose whitespace-pre-line leading-relaxed font-sans">
            {mod.workedExample}
          </p>
        </Callout>
      </section>

      {/* 5. The Math + Formula Explorer */}
      <section aria-labelledby="math-heading" className="space-y-2">
        <h2 id="math-heading" className="font-serif text-xl font-semibold text-ink">
          The Mathematics
        </h2>
        <FormulaBlock
          latex={mod.mathLatex}
          caption={mod.mathCaption}
          symbolKeys={mod.symbolKeys}
        />
      </section>

      {/* 6. Interactive Activity */}
      <section aria-labelledby="act-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="act-heading" className="font-serif text-xl font-semibold text-ink">
            Interactive Activity
          </h2>
          <Button
            size="sm"
            variant="ghost"
            disabled={hintLevel >= 3}
            onClick={() => setHintLevel((h) => Math.min(3, h + 1))}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {hintLevel === 0 ? 'Show hint' : `Hint (${hintLevel}/3)`}
          </Button>
        </div>

        {hintLevel > 0 && (
          <Callout kind="hint" title={`Study Hint (${hintLevel}/3)`}>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              {hintLevel >= 1 && (
                <li>Read the Worked Example numbers again and match them to the live controls below.</li>
              )}
              {hintLevel >= 2 && (
                <li>Test an extreme value (0 or max) first, then move to an overlapping midpoint.</li>
              )}
              {hintLevel >= 3 && (
                <li>
                  Check the <Link to="/glossary" className="text-teal underline">Glossary</Link> if
                  any symbol feels unfamiliar.
                </li>
              )}
            </ul>
          </Callout>
        )}

        <ModuleActivityRenderer activityId={mod.activityId} />
      </section>

      {/* 7. Common Misconceptions */}
      <section aria-labelledby="misc-heading" className="space-y-2">
        <h2 id="misc-heading" className="font-serif text-xl font-semibold text-ink">
          Common Misconceptions
        </h2>
        <Callout kind="warning">
          <ul className="list-disc pl-5 space-y-2">
            {mod.misconceptions.map((m, i) => (
              <li key={i} className="max-w-prose">
                {m}
              </li>
            ))}
          </ul>
        </Callout>
      </section>

      {/* 8. Knowledge Check */}
      <section aria-labelledby="kc-heading" className="space-y-2">
        <h2 id="kc-heading" className="sr-only">
          Knowledge Check
        </h2>
        <KnowledgeCheck
          key={mod.id}
          moduleId={mod.id}
          questions={mod.knowledgeCheck}
          alreadyPassed={isCompleted}
          onPass={(score) => markModuleComplete(mod.id, score)}
        />
      </section>

      {/* 9. Summary & Navigation Footer */}
      <section aria-labelledby="sum-heading" className="space-y-4 border-t border-border pt-6">
        <h2 id="sum-heading" className="font-serif text-xl font-semibold text-ink">
          Module Summary
        </h2>
        <p className="max-w-prose text-sm leading-relaxed text-ink-secondary">{mod.summary}</p>

        {!isCompleted && (
          <div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => markModuleComplete(mod.id)}
            >
              Mark Module Complete Manually
            </Button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {prevMod ? (
            <Link to={`/learn/${prevMod.id}`}>
              <Button variant="secondary">
                <ArrowLeft className="h-4 w-4" />
                Previous: Module {prevMod.number}
              </Button>
            </Link>
          ) : (
            <Link to="/start">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                Back to Orientation
              </Button>
            </Link>
          )}

          {nextMod ? (
            <Link to={`/learn/${nextMod.id}`}>
              <Button variant="primary">
                Next: Module {nextMod.number} — {nextMod.title}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/quiz/final">
              <Button variant="primary">
                Take Final Assessment
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </article>
  );
}
