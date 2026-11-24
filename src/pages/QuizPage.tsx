import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, RotateCcw, Target, XCircle } from 'lucide-react';
import { QUIZ_BANK } from '@/quiz/bank';
import { gradeQuestion, seededShuffle } from '@/quiz/grading';
import { useProgressStore } from '@/state/progressStore';
import { Badge, Button, Card } from '@/components/ui';

export default function QuizPage() {
  const { practiceAnswers, bestFinalScore, recordPracticeAnswer, resetProgress } = useProgressStore();
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [shuffleSeed, setShuffleSeed] = useState(101);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [numericInputs, setNumericInputs] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    document.title = 'Quiz & Practice — FuzzyLab';
  }, []);

  const topics = useMemo(
    () => ['All', ...Array.from(new Set(QUIZ_BANK.map((q) => q.topic)))],
    []
  );

  const filteredQuestions = useMemo(() => {
    const base =
      topicFilter === 'All'
        ? QUIZ_BANK
        : QUIZ_BANK.filter((q) => q.topic === topicFilter);
    return seededShuffle(base, shuffleSeed);
  }, [topicFilter, shuffleSeed]);

  const solvedCount = Object.values(practiceAnswers).filter((a) => a.correct).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-teal">
            Practice & Assessment
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-ink">Quiz & Practice Bank</h1>
          <p className="mt-1 max-w-prose text-sm text-ink-secondary">
            {QUIZ_BANK.length} questions across conceptual understanding, membership calculations,
            rule firing, and controller outputs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/quiz/final">
            <Button variant="primary">
              <Award className="h-4 w-4" />
              Final Assessment (20 Questions)
            </Button>
          </Link>
          <Link to="/quiz/challenge">
            <Button variant="secondary">
              <Target className="h-4 w-4" />
              Challenge Mode
            </Button>
          </Link>
        </div>
      </header>

      {/* Progress & Best Score Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card subtle>
          <div className="text-xs text-ink-secondary">Practice Solved</div>
          <div className="mt-1 font-mono text-2xl font-bold text-ink">
            {solvedCount} / {QUIZ_BANK.length}
          </div>
        </Card>
        <Card subtle>
          <div className="text-xs text-ink-secondary">Best Final Assessment</div>
          <div className="mt-1 font-mono text-2xl font-bold text-teal">
            {bestFinalScore ? `${bestFinalScore.percentage}%` : 'Not taken'}
          </div>
        </Card>
        <Card subtle className="flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-secondary">Reset Saved Progress</div>
            <div className="text-[11px] text-ink-secondary">Modules & quiz scores</div>
          </div>
          {!confirmReset ? (
            <Button size="sm" variant="ghost" onClick={() => setConfirmReset(true)}>
              Reset
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                }}
              >
                Confirm
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Topic Filter & Reshuffle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by topic">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopicFilter(t)}
              className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                topicFilter === t
                  ? 'border-teal bg-teal text-white'
                  : 'border-border bg-surface text-ink-secondary hover:bg-subtle hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setShuffleSeed((s) => s + 17);
            setSelected({});
            setNumericInputs({});
            setChecked({});
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Shuffle Order
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isChecked = checked[q.id];
          const answer = q.type === 'numeric' ? numericInputs[q.id] : selected[q.id];
          const ok = isChecked ? gradeQuestion(q, answer) : false;

          return (
            <Card key={q.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink-secondary">#{idx + 1}</span>
                  <Badge tone="teal">{q.topic}</Badge>
                  <Badge tone="neutral">Module {q.moduleNumber}</Badge>
                </div>
                {practiceAnswers[q.id]?.correct && <Badge tone="success">Solved</Badge>}
              </div>

              <p className="text-sm font-medium text-ink">{q.prompt}</p>

              {q.type === 'numeric' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={numericInputs[q.id] ?? ''}
                    onChange={(e) =>
                      setNumericInputs((p) => ({ ...p, [q.id]: e.target.value }))
                    }
                    aria-label={`Numeric answer for ${q.id}`}
                    className="w-40 rounded border border-border-strong bg-surface px-3 py-1.5 font-mono text-sm text-ink"
                    placeholder="Enter number"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!(numericInputs[q.id] ?? '').trim()}
                    onClick={() => {
                      setChecked((p) => ({ ...p, [q.id]: true }));
                      recordPracticeAnswer(q.id, gradeQuestion(q, numericInputs[q.id]));
                    }}
                  >
                    Check
                  </Button>
                  {isChecked && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setChecked((p) => ({ ...p, [q.id]: false }))}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {(q.options ?? []).map((opt, optIdx) => {
                    const isChosen = selected[q.id] === optIdx;
                    const isRight = q.correctIndex === optIdx;
                    let cls = 'border-border bg-surface hover:bg-subtle';
                    if (isChecked && isRight) cls = 'border-success bg-success/10';
                    else if (isChecked && isChosen && !isRight) cls = 'border-error bg-error/10';
                    else if (isChosen) cls = 'border-teal bg-teal/5';

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isChecked}
                        onClick={() => setSelected((p) => ({ ...p, [q.id]: optIdx }))}
                        className={`flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm ${cls}`}
                      >
                        <span>{opt}</span>
                        {isChecked && isRight && <CheckCircle2 className="h-4 w-4 text-success" />}
                        {isChecked && isChosen && !isRight && <XCircle className="h-4 w-4 text-error" />}
                      </button>
                    );
                  })}
                  <div className="flex gap-2 pt-1">
                    {!isChecked ? (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={typeof selected[q.id] !== 'number'}
                        onClick={() => {
                          setChecked((p) => ({ ...p, [q.id]: true }));
                          recordPracticeAnswer(q.id, gradeQuestion(q, selected[q.id]));
                        }}
                      >
                        Check Answer
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setChecked((p) => ({ ...p, [q.id]: false }))}
                      >
                        Retry Question
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {isChecked && (
                <div
                  className={`rounded border p-3 text-xs space-y-1 ${
                    ok ? 'border-success/40 bg-success/10' : 'border-error/40 bg-error/10'
                  }`}
                >
                  <div className={`font-semibold ${ok ? 'text-success' : 'text-error'}`}>
                    {ok ? 'Correct!' : 'Incorrect.'}
                  </div>
                  {!ok &&
                    q.type !== 'numeric' &&
                    typeof selected[q.id] === 'number' &&
                    q.optionExplanations?.[selected[q.id]] && (
                      <p>
                        <strong>Why that choice is wrong:</strong>{' '}
                        {q.optionExplanations[selected[q.id]]}
                      </p>
                    )}
                  <p>
                    <strong>Worked Reasoning:</strong> {q.workedReasoning}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

