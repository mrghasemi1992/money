import { render, screen } from '@testing-library/react';
import { TransactionRow } from './index';
import styles from './styles.module.css';

describe('TransactionRow', () => {
  it('prefixes outflow with a minus sign and colors it negative', () => {
    render(
      <TransactionRow
        date="Jul 6"
        merchant="Grocery Outlet"
        categoryLabel="Groceries"
        categoryColor="#3F6B4C"
        amountMinorUnits={-8412}
        currency="USD"
      />,
    );
    const amount = screen.getByText(/−\$84\.12/);
    expect(amount).toBeInTheDocument();
    expect(amount).toHaveClass(styles.negative);
  });

  it('prefixes inflow with a plus sign and no color class', () => {
    render(
      <TransactionRow
        date="Jul 3"
        merchant="Freelance payment"
        categoryLabel="Income"
        categoryColor="#3D7A7A"
        amountMinorUnits={124000}
        currency="USD"
      />,
    );
    const amount = screen.getByText(/\+\$1,240\.00/);
    expect(amount).toBeInTheDocument();
    expect(amount).not.toHaveClass(styles.negative);
  });

  it('renders the merchant name and category badge', () => {
    render(
      <TransactionRow
        date="Jul 6"
        merchant="Grocery Outlet"
        categoryLabel="Groceries"
        categoryColor="#3F6B4C"
        amountMinorUnits={-8412}
        currency="USD"
      />,
    );
    expect(screen.getByText('Grocery Outlet')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });
});
