import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './index';
import { useThemeStore } from '../../stores/theme-store';

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'system' });
  });

  it('renders all three modes', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'System' })).toBeInTheDocument();
  });

  it('marks the active mode as checked', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('radio', { name: 'System' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('updates the store when a different mode is chosen', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(useThemeStore.getState().mode).toBe('dark');
  });
});
