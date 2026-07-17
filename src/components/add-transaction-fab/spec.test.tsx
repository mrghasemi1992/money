import { render, screen } from '@testing-library/react';
import { AddTransactionFab } from './index';
import { useLocaleStore } from '@/stores';

describe('AddTransactionFab', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
  });

  it('renders an accessible add-transaction button', () => {
    render(<AddTransactionFab />);
    expect(
      screen.getByRole('button', { name: 'Add transaction' }),
    ).toBeInTheDocument();
  });
});
