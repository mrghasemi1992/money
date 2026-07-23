import { render, screen } from '@testing-library/react';
import { DashboardPage } from './index';

describe('DashboardPage', () => {
  it('renders the Dashboard route title', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
