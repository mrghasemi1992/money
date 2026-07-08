import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './index';

describe('Input', () => {
  it('associates the label with the input', () => {
    render(<Input label="Account name" />);
    expect(screen.getByLabelText('Account name')).toBeInTheDocument();
  });

  it('shows a hint when there is no error', () => {
    render(<Input label="Account name" hint="Shown on statements." />);
    expect(screen.getByText('Shown on statements.')).toBeInTheDocument();
  });

  it('shows the error message instead of the hint, and marks the field invalid', () => {
    render(
      <Input
        label="Opening balance"
        hint="Shown on statements."
        error="Enter a valid number."
      />,
    );
    expect(screen.getByText('Enter a valid number.')).toBeInTheDocument();
    expect(screen.queryByText('Shown on statements.')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Opening balance')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('accepts typed input', async () => {
    render(<Input label="Account name" />);
    const input = screen.getByLabelText('Account name');
    await userEvent.type(input, 'Checking');
    expect(input).toHaveValue('Checking');
  });
});
