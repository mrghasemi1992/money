import { Badge } from '@primitives/badge';
import { useTranslation } from '../../i18n';
import { formatAmount } from '../../i18n/format';
import styles from './styles.module.css';

export interface TransactionRowProps {
  date: string;
  merchant: string;
  categoryLabel: string;
  /** Hex color for the category badge — see components/primitives/badge. */
  categoryColor: string;
  /** Integer minor units (cents/rials), as stored in Dexie. Sign determines in/outflow. */
  amountMinorUnits: number;
  currency: string;
}

// Positive amounts carry no dedicated hue — body text color plus a "+"
// prefix only. Only outflow gets a color (Rust), so color means something
// instead of decorating every row.
export function TransactionRow({
  date,
  merchant,
  categoryLabel,
  categoryColor,
  amountMinorUnits,
  currency,
}: TransactionRowProps) {
  const { locale } = useTranslation();
  const isOutflow = amountMinorUnits < 0;
  const formatted = formatAmount(Math.abs(amountMinorUnits), currency, locale);
  const sign = isOutflow ? '−' : '+';

  return (
    <div className={styles.row}>
      <div className={`${styles.date} tabular-nums`}>{date}</div>
      <div className={styles.details}>
        <div className={styles.merchant}>{merchant}</div>
        <Badge color={categoryColor}>{categoryLabel}</Badge>
      </div>
      <div
        className={`${styles.amount} tabular-nums ${isOutflow ? styles.negative : ''}`}
      >
        {sign}
        {formatted}
      </div>
    </div>
  );
}
