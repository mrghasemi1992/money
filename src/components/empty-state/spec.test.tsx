import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from './index';

describe('EmptyState', () => {
  it('renders the title, body, and call to action', () => {
    render(<EmptyState />);
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add a transaction' }),
    ).toBeInTheDocument();
  });

  it('fires onAction when the call to action is clicked', async () => {
    const onAction = vi.fn();
    render(<EmptyState onAction={onAction} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Add a transaction' }),
    );
    expect(onAction).toHaveBeenCalledOnce();
  });
});
