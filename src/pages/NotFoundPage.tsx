import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl py-12">
      <Card>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-secondary">404</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          The route you requested does not exist in FuzzyLab. You can return to the home page,
          continue the curriculum, or open the interactive controller.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/">
            <Button variant="primary">Go Home</Button>
          </Link>
          <Link to="/learn/module-1">
            <Button variant="secondary">Begin Module 1</Button>
          </Link>
          <Link to="/controller">
            <Button variant="ghost">Open Controller</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

