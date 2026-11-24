import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AppRoutes } from '@/routes';

function renderRoute(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </MemoryRouter>
  );
}

describe('App Route & Controller Integration Smoke Tests', () => {
  it('renders Home page with live temperature miniature', async () => {
    renderRoute('/');
    expect(
      await screen.findByText(/Fuzzy Logic, from first principles to a working controller/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Begin Module 1/i)).toBeInTheDocument();
  });

  it('renders Controller page and verifies reference case (44.57% discrete, 44.708% continuous)', async () => {
    renderRoute('/controller');
    const refBtn = await screen.findByRole(
      'button',
      {
        name: /Load reference case \(24 °C \/ 45 %\)/i,
      },
      { timeout: 5000 }
    );
    fireEvent.click(refBtn);

    const matches = await screen.findAllByText('44.57%');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/44\.70\d%/)).toBeInTheDocument();
    expect(screen.getByText(/Medium \(0\.80\)/i)).toBeInTheDocument();
  });

  it('renders Walkthrough tab and advances stages', async () => {
    renderRoute('/controller');
    const tab = await screen.findByRole('tab', {
      name: /Step-by-Step Walkthrough/i,
    });
    fireEvent.click(tab);

    expect(await screen.findByText(/Stage 1: Input Collection/i)).toBeInTheDocument();
    const nextBtn = screen.getByRole('button', { name: /Next stage/i });
    fireEvent.click(nextBtn);
    expect(await screen.findByText(/Stage 2: Fuzzification/i)).toBeInTheDocument();
  });

  it('renders Learn Module 1 and Module 3 Playground', async () => {
    renderRoute('/learn/module-1');
    expect(await screen.findByText(/Introduction to Fuzzy Logic/i)).toBeInTheDocument();

    renderRoute('/learn/module-3');
    expect(await screen.findByText(/Membership Function Playground/i)).toBeInTheDocument();
  });

  it('renders Lab, Quiz, Applications, and Glossary routes cleanly', async () => {
    renderRoute('/lab');
    expect(await screen.findByText(/Fuzzy Logic Experiment Lab/i)).toBeInTheDocument();

    renderRoute('/quiz');
    expect(await screen.findByText(/Quiz & Practice Bank/i)).toBeInTheDocument();

    renderRoute('/applications');
    expect(await screen.findByText(/Real-World Fuzzy Control Applications/i)).toBeInTheDocument();

    renderRoute('/glossary');
    expect(await screen.findByText(/Glossary & Formula Cheat Sheet/i)).toBeInTheDocument();
  });
});
