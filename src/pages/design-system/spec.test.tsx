import { render, screen } from '@testing-library/react';
import { DesignSystemPage } from './index';

describe('DesignSystemPage', () => {
  it('renders the page title and every token/primitive section', () => {
    render(<DesignSystemPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Design system' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Color' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Type' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Button' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Input' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Card' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Table row — transaction',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Toggle / switch' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Empty state' }),
    ).toBeInTheDocument();
  });
});
