import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeMenu } from './index';
import { useThemeStore } from '@/stores';

describe('ThemeMenu', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'system' });
  });

  it('renders a trigger for the theme menu', () => {
    render(<ThemeMenu />);
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument();
  });

  it('opens the menu and lists all three modes', async () => {
    render(<ThemeMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Theme' }));
    expect(
      screen.getByRole('menuitemradio', { name: 'Light' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: 'Dark' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: 'System' }),
    ).toBeInTheDocument();
  });

  it('marks the active mode as checked', async () => {
    render(<ThemeMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Theme' }));
    expect(
      screen.getByRole('menuitemradio', { name: 'System' }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('updates the store when a different mode is chosen', async () => {
    render(<ThemeMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Theme' }));
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Dark' }));
    expect(useThemeStore.getState().mode).toBe('dark');
  });
});
