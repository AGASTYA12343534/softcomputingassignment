import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { AppShell } from '@/components/layout/AppShell';
import { AppRoutes } from '@/routes';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
