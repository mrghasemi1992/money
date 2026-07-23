import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SidebarNav } from './index';
import { useLocaleStore, useUiStore } from '@/stores';

function renderNav(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <SidebarNav />
    </MemoryRouter>,
  );
}

describe('SidebarNav', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
    useUiStore.setState({ sidebarCollapsed: false });
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
    renderNav('/transactions');
    expect(screen.getByRole('link', { name: 'Transactions' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('link', { name: 'Dashboard' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('renders a link to settings and no add-transaction action', () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    );
    expect(
      screen.queryByRole('button', { name: 'Add transaction' }),
    ).not.toBeInTheDocument();
  });

  it('marks settings as the active page when on /settings', () => {
    renderNav('/settings');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
