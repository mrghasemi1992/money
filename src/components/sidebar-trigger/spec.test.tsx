import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarTrigger } from './index';
import { useLocaleStore, useUiStore } from '@/stores';

describe('SidebarTrigger', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
    useUiStore.setState({ sidebarCollapsed: false });
  });

  it('toggles the sidebar-collapsed store when clicked', async () => {
    render(<SidebarTrigger />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Collapse navigation' }),
    );
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);
  });

  it('shows the expand label once the sidebar is collapsed', () => {
    useUiStore.setState({ sidebarCollapsed: true });
    render(<SidebarTrigger />);
    expect(
      screen.getByRole('button', { name: 'Expand navigation' }),
    ).toBeInTheDocument();
  });
});
