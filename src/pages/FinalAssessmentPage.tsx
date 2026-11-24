import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { QUIZ_BANK } from '@/quiz/bank';
import { drawFinalAssessment, gradeQuestion } from '@/quiz/grading';
import { MODULE_META } from '@/content/moduleMeta';
import { useProgressStore } from '@/state/progressStore';
import { Badge, Button, Card, ProgressBar } from '@/components/ui';

export default function FinalAssessmentPage() {
  const { recordFinalScore, bestFinalScore } = useProgressStore();
  const [seed, setSeed] = useState(20261124);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Final Assessment — FuzzyLab';
  }, []);

  const questions = useMemo(() => drawFinalAssessment(QUIZ_BANK, 20, seed), [seed]);
  const currentQ = questions[currentIdx];

  const results = useMemo(() => {
    if (!submitted) return null;
    let totalCorrect = 0;
    const byModule: Record<number, { total: number; correct: number }> = {};

    for (const q of questions) {
      if (!byModule[q.moduleNumber]) byModule[q.moduleNumber] = { total: 0, correct: 0 };
      byModule[q.moduleNumber].total += 1;
      if (gradeQuestion(q, answers[q.id])) {
        totalCorrect += 1;
        byModule[q.moduleNumber].correct += 1;
      }
    }

    const pct = Math.round((totalCorrect / questions.length) * 100);
    const weakModules = Object.entries(byModule)
      .filter(([, s]) => s.correct < s.total)
      .map(([m]) => Number(m));

    return { totalCorrect, pct, byModule, weakModules };
  }, [submitted, questions, answers]);

  const handleFinish = () => {
    let correct = 0;
    for (const q of questions) {
      if (gradeQuestion(q, answers[q.id])) correct += 1;
    }
    recordFinalScore(correct, questions.length);
    setSubmitted(true);
  };

  const handleRetake = () => {
    setSeed((s) => s + 13);
    setCurrentIdx(0);
    setAnswers({});
    setSubmitted(false);
  };

  if (submitted && results) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-teal">
                Final Assessment Complete
              </p>
              <h1 className="font-serif text-3xl font-bold text-ink">
                Score: {results.totalCorrect} / {questions.length} ({results.pct}%)
              </h1>
            </div>
            <Badge tone={results.pct >= 70 ? 'success' : 'warning'}>
              {results.pct >= 70 ? 'Passed' : 'Needs Review'}
            </Badge>
          </div>

          {bestFinalScore && (
            <p className="text-xs text-ink-secondary">
              Best recorded score: <strong className="font-mono">{bestFinalScore.percentage}%</strong>
            </p>
          )}

          <div>
            <h2 className="font-serif text-base font-semibold text-ink mb-2">
              Per-Module Breakdown
            </h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {MODULE_META.map((m) => {
                const stat = results.byModule[m.number];
                if (!stat) return null;
                return (
                  <div key={m.id} className="rounded border border-border bg-subtle p-2.5 text-xs">
                    <div className="font-medium text-ink">
                      {m.number}. {m.shortTitle}
                    </div>
                    <div className="mt-1 font-mono font-semibold text-teal">
                      {stat.correct} / {stat.total} correct
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {results.weakModules.length > 0 && (
            <div className="rounded border border-warning/40 bg-warning/10 p-3 text-xs">
              <strong>Recommended modules to revisit:</strong>{' '}
              {results.weakModules.map((num, idx) => (
                <span key={num}>
                  {idx > 0 && ', '}
                  <Link to={`/learn/module-${num}`} className="text-teal underline">
                    Module {num}
                  </Link>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={handleRetake}>
              <RotateCcw className="h-4 w-4" />
              Retake Assessment
            </Button>
            <Link to="/quiz">
              <Button variant="secondary">Back to Practice Bank</Button>
            </Link>
          </div>
        </Card>

        <div className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-ink">Detailed Review</h2>
          {questions.map((q, i) => {
            const ok = gradeQuestion(q, answers[q.id]);
            return (
              <Card key={q.id} className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-secondary">
                    Question {i + 1} · Module {q.moduleNumber}
                  </span>
                  {ok ? (
                    <Badge tone="success">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                    </Badge>
                  ) : (
                    <Badge tone="error">
                      <XCircle className="h-3.5 w-3.5" /> Incorrect
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-ink">{q.prompt}</p>
                <p className="text-xs text-ink-secondary">
                  <strong>Answer:</strong>{' '}
                  {q.type === 'numeric'
                    ? q.correctNumber
                    : q.options?.[q.correctIndex ?? 0]}{' '}
                  — {q.workedReasoning}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="border-b border-border pb-4">
        <p className="font-mono text-xs uppercase tracking-wider text-teal">
          Final Assessment
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-ink">
          20-Question Course Exam
        </h1>
        <ProgressBar
          value={currentIdx + 1}
          max={questions.length}
          label={`Question ${currentIdx + 1} of ${questions.length}`}
          showPercent
          className="mt-3"
        />
      </header>

      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge tone="teal">{currentQ.topic}</Badge>
          <Badge tone="neutral">Module {currentQ.moduleNumber}</Badge>
        </div>

        <p className="text-base font-medium text-ink">{currentQ.prompt}</p>

        {currentQ.type === 'numeric' ? (
          <input
            type="number"
            step="any"
            value={answers[currentQ.id] ?? ''}
            onChange={(e) =>
              setAnswers((p) => ({ ...p, [currentQ.id]: e.target.value }))
            }
            aria-label="Numeric answer"
            className="w-44 rounded border border-border-strong bg-surface px-3 py-2 font-mono text-sm text-ink"
            placeholder="Enter number"
          />
        ) : (
          <div className="space-y-2">
            {(currentQ.options ?? []).map((opt, idx) => {
              const selected = answers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAnswers((p) => ({ ...p, [currentQ.id]: idx }))}
                  className={`w-full rounded border px-3.5 py-2.5 text-left text-sm transition-colors ${
                    selected
                      ? 'border-teal bg-teal/10 font-medium text-ink'
                      : 'border-border bg-surface hover:bg-subtle'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="secondary"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentIdx < questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleFinish}>
              Submit Assessment
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

