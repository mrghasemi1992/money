import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('toggles the sidebar-collapsed store when the collapse button is clicked', async () => {
    renderNav();
    await userEvent.click(
      screen.getByRole('button', { name: 'Collapse navigation' }),
    );
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);
  });

  it('renders the add-transaction action and the locale/theme controls', () => {
    renderNav();
    expect(
      screen.getByRole('button', { name: 'Add transaction' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Language' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument();
  });
});
