import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './index';
import { useLocaleStore } from '@/stores';

function renderShell() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<div>Dashboard content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function mockViewport(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

describe('AppShell', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
    mockViewport(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a skip link pointing at the main content', () => {
    renderShell();
    expect(
      screen.getByRole('link', { name: 'Skip to content' }),
    ).toHaveAttribute('href', '#main-content');
  });

  it('renders the primary navigation landmark', () => {
    renderShell();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });

  it('renders the routed page inside the main landmark', () => {
    renderShell();
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveTextContent('Dashboard content');
  });

  it('renders the sidebar on wide viewports', () => {
    renderShell();
    expect(
      screen.getByRole('button', { name: 'Collapse navigation' }),
    ).toBeInTheDocument();
  });

  it('renders the bottom nav and FAB instead of the sidebar on narrow viewports', () => {
    mockViewport(true);
    renderShell();
    expect(
      screen.queryByRole('button', { name: 'Collapse navigation' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add transaction' }),
    ).toBeInTheDocument();
  });
});
