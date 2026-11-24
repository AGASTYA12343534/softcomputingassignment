import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Check, Menu, X } from 'lucide-react';
import { MODULE_META } from '@/content/moduleMeta';
import { useProgressStore } from '@/state/progressStore';
import { ProgressBar, SegmentedControl } from '@/components/ui';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/start', label: 'Start' },
  { to: '/learn/module-1', label: 'Learn', matchPrefix: '/learn' },
  { to: '/controller', label: 'Controller' },
  { to: '/lab', label: 'Lab' },
  { to: '/quiz', label: 'Quiz', matchPrefix: '/quiz' },
  { to: '/applications', label: 'Applications' },
  { to: '/glossary', label: 'Glossary' },
];

export interface AppShellProps {
  children: ReactNode;
  showLessonRail?: boolean;
}

export function AppShell({ children, showLessonRail }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode, completedModules, storageError } = useProgressStore();

  const isLearnRoute = location.pathname.startsWith('/learn');
  const railVisible = showLessonRail ?? isLearnRoute;
  const pctComplete = Math.round((completedModules.length / MODULE_META.length) * 100);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleModeChange = (nextMode: 'learn' | 'experiment') => {
    setMode(nextMode);
    if (nextMode === 'experiment' && location.pathname.startsWith('/learn')) {
      navigate('/lab');
    } else if (nextMode === 'learn' && location.pathname === '/lab') {
      navigate('/learn/module-1');
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-teal focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <header className="no-print sticky top-0 z-30 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              className="rounded border border-border p-1.5 text-ink hover:bg-subtle lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2 font-serif text-lg font-bold text-ink">
              <img src="/favicon.svg" alt="" className="h-6 w-6" />
              <span>FuzzyLab</span>
            </Link>
          </div>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((item) => {
              const active = item.matchPrefix
                ? location.pathname.startsWith(item.matchPrefix)
                : location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`rounded px-2.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-subtle text-teal font-semibold'
                      : 'text-ink-secondary hover:bg-subtle/60 hover:text-ink'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-ink-secondary">
              <span className="font-mono tabular-nums font-medium text-ink">
                {completedModules.length}/{MODULE_META.length}
              </span>
              <div className="w-16">
                <ProgressBar value={pctComplete} label="Course completion" />
              </div>
            </div>
            <SegmentedControl
              ariaLabel="Application mode"
              size="sm"
              value={mode}
              onChange={handleModeChange}
              options={[
                { value: 'learn', label: 'Learn' },
                { value: 'experiment', label: 'Lab' },
              ]}
            />
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-surface px-4 py-3 lg:hidden">
            <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-1.5">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-subtle text-teal' : 'text-ink hover:bg-subtle/60'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 border-t border-border pt-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Modules ({completedModules.length}/{MODULE_META.length} complete)
              </div>
              <div className="grid grid-cols-1 gap-1 max-h-56 overflow-y-auto">
                {MODULE_META.map((m) => {
                  const done = completedModules.includes(m.id);
                  return (
                    <Link
                      key={m.id}
                      to={`/learn/${m.id}`}
                      className="flex items-center justify-between rounded px-2.5 py-1.5 text-xs hover:bg-subtle"
                    >
                      <span>
                        <span className="font-mono text-ink-secondary mr-1.5">{m.number}.</span>
                        {m.title}
                      </span>
                      {done && <Check className="h-3.5 w-3.5 text-success" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {storageError && (
        <div
          role="status"
          className="no-print border-b border-warning/40 bg-warning/10 px-4 py-2 text-center text-xs text-ink"
        >
          {storageError}
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        {railVisible && (
          <aside
            aria-label="Course modules"
            className="no-print hidden w-64 shrink-0 border-r border-border bg-surface/60 p-4 lg:block"
          >
            <div className="mb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Curriculum
              </div>
              <ProgressBar
                value={pctComplete}
                label={`${completedModules.length} of ${MODULE_META.length} completed`}
                showPercent
                className="mt-2"
              />
            </div>
            <nav className="space-y-1">
              {MODULE_META.map((m) => {
                const done = completedModules.includes(m.id);
                const active = location.pathname === `/learn/${m.id}`;
                return (
                  <Link
                    key={m.id}
                    to={`/learn/${m.id}`}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center justify-between rounded px-2.5 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-subtle font-semibold text-teal border border-border'
                        : 'text-ink-secondary hover:bg-subtle/60 hover:text-ink'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs shrink-0">{m.number}.</span>
                      <span className="truncate">{m.shortTitle}</span>
                    </span>
                    {done && (
                      <Check
                        className="h-4 w-4 shrink-0 text-success"
                        aria-label="Completed"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        <main id="main-content" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <footer className="no-print border-t border-border bg-surface py-5 text-xs text-ink-secondary">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <div>
            <span className="font-serif font-semibold text-ink">FuzzyLab</span> — Interactive Fuzzy
            Logic Learning Platform. All outputs computed live by the Mamdani inference engine.
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/start" className="hover:text-ink">
              Start Learning
            </Link>
            <Link to="/controller" className="hover:text-ink">
              Controller
            </Link>
            <Link to="/lab" className="hover:text-ink">
              Experiment Lab
            </Link>
            <Link to="/glossary" className="hover:text-ink">
              Glossary & Cheat Sheet
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

