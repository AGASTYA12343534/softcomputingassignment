import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Card } from '@/components/ui';
import { NotFoundPage } from '@/pages/NotFoundPage';

const HomePage = lazy(() => import('@/pages/HomePage'));
const StartPage = lazy(() => import('@/pages/StartPage'));
const LearnPage = lazy(() => import('@/pages/LearnPage'));
const ControllerPage = lazy(() => import('@/pages/ControllerPage'));
const LabPage = lazy(() => import('@/pages/LabPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const FinalAssessmentPage = lazy(() => import('@/pages/FinalAssessmentPage'));
const ChallengePage = lazy(() => import('@/pages/ChallengePage'));
const ApplicationsPage = lazy(() => import('@/pages/ApplicationsPage'));
const GlossaryPage = lazy(() => import('@/pages/GlossaryPage'));

function RouteSkeleton() {
  return (
    <Card className="animate-pulse space-y-3">
      <div className="h-4 w-32 rounded bg-subtle" />
      <div className="h-8 w-2/3 rounded bg-subtle" />
      <div className="h-24 w-full rounded bg-subtle" />
    </Card>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/learn" element={<Navigate to="/learn/module-1" replace />} />
        <Route path="/learn/:moduleId" element={<LearnPage />} />
        <Route path="/controller" element={<ControllerPage />} />
        <Route path="/lab" element={<LabPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/quiz/final" element={<FinalAssessmentPage />} />
        <Route path="/quiz/challenge" element={<ChallengePage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

