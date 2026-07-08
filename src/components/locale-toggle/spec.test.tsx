import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleToggle } from './index';
import { useLocaleStore } from '../../stores/locale-store';

describe('LocaleToggle', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
  });

  it('renders both locales', () => {
    render(<LocaleToggle />);
    expect(screen.getByRole('radio', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'فارسی' })).toBeInTheDocument();
  });

  it('marks the active locale as checked', () => {
    render(<LocaleToggle />);
    expect(screen.getByRole('radio', { name: 'English' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('updates the store when a different locale is chosen', async () => {
    render(<LocaleToggle />);
    await userEvent.click(screen.getByRole('radio', { name: 'فارسی' }));
    expect(useLocaleStore.getState().locale).toBe('fa');
  });
});
