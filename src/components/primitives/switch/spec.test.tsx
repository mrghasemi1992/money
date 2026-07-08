import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './index';

describe('Switch', () => {
  it('exposes the accessible label', () => {
    render(<Switch label="Enable notifications" />);
    expect(
      screen.getByRole('switch', { name: 'Enable notifications' }),
    ).toBeInTheDocument();
  });

  it('starts unchecked by default', () => {
    render(<Switch label="Enable notifications" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onCheckedChange when toggled', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch label="Enable notifications" onCheckedChange={onCheckedChange} />,
    );
    await userEvent.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        label="Enable notifications"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    await userEvent.click(screen.getByRole('switch'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
