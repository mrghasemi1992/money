import { render, screen } from '@testing-library/react';
import { BudgetsPage } from './index';

describe('BudgetsPage', () => {
  it('renders the Budgets route title', () => {
    render(<BudgetsPage />);
    expect(screen.getByText('Budgets')).toBeInTheDocument();
  });
});
