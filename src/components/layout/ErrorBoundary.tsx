import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Card } from '@/components/ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'An unexpected error occurred.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('FuzzyLab ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-xl p-8">
          <Card>
            <h1 className="font-serif text-2xl font-bold text-error">Something went wrong</h1>
            <p className="mt-2 text-sm text-ink-secondary">{this.state.message}</p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  this.setState({ hasError: false, message: '' });
                  window.location.href = '/';
                }}
              >
                Return Home
              </Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

