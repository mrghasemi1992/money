import { render, screen } from '@testing-library/react';
import { Card } from './index';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Monthly rent</Card>);
    expect(screen.getByText('Monthly rent')).toBeInTheDocument();
  });

  it('is not focusable or a button by default', () => {
    render(<Card>Monthly rent</Card>);
    const card = screen.getByText('Monthly rent');
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabIndex');
  });

  it('becomes a focusable button role when interactive', () => {
    render(<Card interactive>Monthly rent</Card>);
    expect(
      screen.getByRole('button', { name: 'Monthly rent' }),
    ).toHaveAttribute('tabIndex', '0');
  });
});
