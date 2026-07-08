import { render, screen } from '@testing-library/react';
import { Badge } from './index';
import { hexToBadgeHue } from './hue';

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge color="#3F6B4C">Groceries</Badge>);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('sets a --badge-hue custom property derived from the given hex', () => {
    render(<Badge color="#3D5A85">Transport</Badge>);
    const badge = screen.getByText('Transport');
    expect(badge.style.getPropertyValue('--badge-hue')).toBe(
      String(hexToBadgeHue('#3D5A85')),
    );
  });

  it('renders different colors with different hues', () => {
    render(
      <>
        <Badge color="#3F6B4C">Groceries</Badge>
        <Badge color="#6B4A8A">Rent</Badge>
      </>,
    );
    const groceries = screen
      .getByText('Groceries')
      .style.getPropertyValue('--badge-hue');
    const rent = screen.getByText('Rent').style.getPropertyValue('--badge-hue');
    expect(groceries).not.toBe(rent);
  });
});
