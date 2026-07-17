import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomNav } from './index';
import { useLocaleStore } from '@/stores';

function renderNav(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomNav />
    </MemoryRouter>,
  );
}

describe('BottomNav', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
  });

  it('renders a link for every top-level route', () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    expect(screen.getByRole('link', { name: 'Transactions' })).toHaveAttribute(
      'href',
      '/transactions',
    );
    expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute(
      'href',
      '/reports',
    );
    expect(screen.getByRole('link', { name: 'Budgets' })).toHaveAttribute(
      'href',
      '/budgets',
    );
  });

  it('marks the current route as the active page', () => {
    renderNav('/reports');
    expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('exposes the primary navigation landmark', () => {
    renderNav();
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument();
  });
});
