import { render, screen } from '@testing-library/react';
import { RoutePlaceholder } from './index';

describe('RoutePlaceholder', () => {
  it('renders the route eyebrow and given title', () => {
    render(<RoutePlaceholder title="Dashboard" />);
    expect(screen.getByText('Route')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders the placeholder copy', () => {
    render(<RoutePlaceholder title="Dashboard" />);
    expect(screen.getByText('Page content renders here')).toBeInTheDocument();
  });
});
