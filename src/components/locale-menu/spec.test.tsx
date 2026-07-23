import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleMenu } from './index';
import { useLocaleStore } from '@/stores';

describe('LocaleMenu', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
  });

  it('renders a trigger showing the active locale code', () => {
    render(<LocaleMenu />);
    expect(screen.getByRole('button', { name: 'Language' })).toHaveTextContent(
      'EN',
    );
  });

  it('opens the menu and lists both locales', async () => {
    render(<LocaleMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Language' }));
    expect(
      screen.getByRole('menuitemradio', { name: 'English' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: 'فارسی' }),
    ).toBeInTheDocument();
  });

  it('marks the active locale as checked', async () => {
    render(<LocaleMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Language' }));
    expect(
      screen.getByRole('menuitemradio', { name: 'English' }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('updates the store when a different locale is chosen', async () => {
    render(<LocaleMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Language' }));
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'فارسی' }));
    expect(useLocaleStore.getState().locale).toBe('fa');
  });
});
