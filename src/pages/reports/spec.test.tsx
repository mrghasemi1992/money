import { render, screen } from '@testing-library/react';
import { ReportsPage } from './index';

describe('ReportsPage', () => {
  it('renders the Reports route title', () => {
    render(<ReportsPage />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });
});
