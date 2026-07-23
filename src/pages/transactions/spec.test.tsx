import { render, screen } from '@testing-library/react';
import { TransactionsPage } from './index';

describe('TransactionsPage', () => {
  it('renders the Transactions route title', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });
});
