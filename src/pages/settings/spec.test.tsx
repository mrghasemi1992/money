import { render, screen } from '@testing-library/react';
import { SettingsPage } from './index';
import { useLocaleStore } from '@/stores';

describe('SettingsPage', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
  });

  it('renders the page title and both setting rows', () => {
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('renders the locale and theme menu triggers', () => {
    render(<SettingsPage />);
    expect(
      screen.getByRole('button', { name: 'Language' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument();
  });
});
