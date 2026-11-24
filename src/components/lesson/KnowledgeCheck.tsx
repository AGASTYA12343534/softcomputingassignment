import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';

export interface CheckQuestion {
  id: string;
  type: 'mc' | 'tf' | 'numeric';
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctNumber?: number;
  tolerance?: number;
  optionExplanations?: string[];
  explanation: string;
}

export interface KnowledgeCheckProps {
  moduleId: string;
  questions: CheckQuestion[];
  alreadyPassed: boolean;
  onPass: (scorePct: number) => void;
}

export function KnowledgeCheck({
  questions,
  alreadyPassed,
  onPass,
}: KnowledgeCheckProps) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [numericInputs, setNumericInputs] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const checkNumericCorrect = (q: CheckQuestion, raw: string): boolean => {
    const val = Number(raw);
    if (!Number.isFinite(val) || typeof q.correctNumber !== 'number') return false;
    return Math.abs(val - q.correctNumber) <= (q.tolerance ?? 0.05);
  };

  const isCorrect = (q: CheckQuestion): boolean => {
    if (!submitted[q.id]) return false;
    if (q.type === 'numeric') {
      return checkNumericCorrect(q, numericInputs[q.id] ?? '');
    }
    return selected[q.id] === q.correctIndex;
  };

  const allSubmitted = questions.every((q) => submitted[q.id]);
  const correctCount = questions.filter((q) => isCorrect(q)).length;
  const scorePct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  const handleSubmitOne = (q: CheckQuestion) => {
    const nextSubmitted = { ...submitted, [q.id]: true };
    setSubmitted(nextSubmitted);

    if (questions.every((item) => nextSubmitted[item.id])) {
      const count = questions.filter((item) => {
        if (item.type === 'numeric') {
          return checkNumericCorrect(item, numericInputs[item.id] ?? '');
        }
        return selected[item.id] === item.correctIndex;
      }).length;
      const pct = Math.round((count / questions.length) * 100);
      if (pct >= 70) {
        onPass(pct);
      }
    }
  };

  const handleReset = () => {
    setSelected({});
    setNumericInputs({});
    setSubmitted({});
  };

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink">Knowledge Check</h3>
          <p className="text-xs text-ink-secondary">
            Score at least 70% to mark this module complete. Immediate feedback is shown for every option.
          </p>
        </div>
        {alreadyPassed && <Badge tone="success">Module Passed</Badge>}
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const isSub = submitted[q.id];
          const ok = isCorrect(q);
          const chosenIdx = selected[q.id];

          return (
            <div key={q.id} className="space-y-2.5 border-b border-border pb-5 last:border-b-0 last:pb-0">
              <div className="text-sm font-medium text-ink">
                <span className="font-mono text-xs text-teal mr-2">Q{idx + 1}.</span>
                {q.prompt}
              </div>

              {q.type === 'numeric' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={numericInputs[q.id] ?? ''}
                    disabled={isSub}
                    onChange={(e) =>
                      setNumericInputs((p) => ({ ...p, [q.id]: e.target.value }))
                    }
                    aria-label={`Numeric answer for question ${idx + 1}`}
                    className="w-36 rounded border border-border-strong bg-surface px-3 py-1.5 font-mono text-sm text-ink"
                    placeholder="Enter number"
                  />
                  {!isSub && (
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={!(numericInputs[q.id] ?? '').trim()}
                      onClick={() => handleSubmitOne(q)}
                    >
                      Check Answer
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {(q.options ?? []).map((opt, optIdx) => {
                    const isChosen = chosenIdx === optIdx;
                    const isRightOpt = q.correctIndex === optIdx;
                    let borderClass = 'border-border bg-surface hover:bg-subtle';
                    if (isSub && isRightOpt) borderClass = 'border-success bg-success/10';
                    else if (isSub && isChosen && !isRightOpt) borderClass = 'border-error bg-error/10';
                    else if (isChosen) borderClass = 'border-teal bg-teal/5';

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isSub}
                        onClick={() => setSelected((p) => ({ ...p, [q.id]: optIdx }))}
                        className={`flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm transition-colors ${borderClass}`}
                      >
                        <span>{opt}</span>
                        {isSub && isRightOpt && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                        {isSub && isChosen && !isRightOpt && <XCircle className="h-4 w-4 text-error shrink-0" />}
                      </button>
                    );
                  })}
                  {!isSub && (
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={typeof chosenIdx !== 'number'}
                      onClick={() => handleSubmitOne(q)}
                      className="mt-1"
                    >
                      Check Answer
                    </Button>
                  )}
                </div>
              )}

              {isSub && (
                <div
                  className={`rounded border p-3 text-xs space-y-1 ${
                    ok
                      ? 'border-success/40 bg-success/10 text-ink'
                      : 'border-error/40 bg-error/10 text-ink'
                  }`}
                >
                  <div className={`font-semibold ${ok ? 'text-success' : 'text-error'}`}>
                    {ok ? 'Correct!' : 'Not quite.'}
                  </div>
                  {!ok &&
                    q.type !== 'numeric' &&
                    typeof chosenIdx === 'number' &&
                    q.optionExplanations?.[chosenIdx] && (
                      <p>
                        <strong>Why that option is wrong:</strong> {q.optionExplanations[chosenIdx]}
                      </p>
                    )}
                  <p>
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allSubmitted && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-border bg-subtle p-3">
          <div className="text-sm">
            Score:{' '}
            <strong className="font-mono">
              {correctCount}/{questions.length} ({scorePct}%)
            </strong>{' '}
            — {scorePct >= 70 ? 'Passed! Module marked complete.' : 'Below 70%. Review and retry.'}
          </div>
          <Button size="sm" variant="secondary" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Retry Check
          </Button>
        </div>
      )}
    </Card>
  );
}

