import { useState } from 'react';
import styles from './styles.module.css';
import { useLocaleStore } from '@/stores';
import { Button, Input, Card, Badge, Switch } from '@/components/primitives';
import {
  ThemeToggle,
  LocaleToggle,
  TransactionRow,
  EmptyState,
} from '@/components';

const NEUTRAL_STEPS = [
  { label: 'bg', varName: '--color-bg' },
  { label: 'surface', varName: '--color-surface' },
  { label: 'border', varName: '--color-border' },
  { label: 'muted text', varName: '--color-text-muted' },
  { label: 'text', varName: '--color-text' },
];

const SPACING_STEPS = [
  { name: 'space-1', px: 4 },
  { name: 'space-2', px: 8 },
  { name: 'space-3', px: 12 },
  { name: 'space-4', px: 16 },
  { name: 'space-5', px: 24 },
  { name: 'space-6', px: 32 },
  { name: 'space-7', px: 48 },
  { name: 'space-8', px: 64 },
];

const RADIUS_STEPS = [
  { name: 'radius-sm', varName: '--radius-sm', label: '6px' },
  { name: 'radius-md', varName: '--radius-md', label: '10px' },
  { name: 'radius-lg', varName: '--radius-lg', label: '16px' },
  { name: 'radius-pill', varName: '--radius-pill', label: '999px' },
];

// Demo-only stand-ins for what will eventually be user-created categories —
// Badge takes an arbitrary hex color, not a fixed enum, so these are just
// sample data for the showcase, not a list Badge knows about.
const CATEGORY_COLOR = {
  groceries: '#3F6B4C',
  transport: '#3D5A85',
  rent: '#6B4A8A',
  dining: '#8A4A6B',
  income: '#3D7A7A',
};

const CATEGORIES_EN = [
  { label: 'Groceries', color: CATEGORY_COLOR.groceries },
  { label: 'Transport', color: CATEGORY_COLOR.transport },
  { label: 'Rent', color: CATEGORY_COLOR.rent },
  { label: 'Dining', color: CATEGORY_COLOR.dining },
  { label: 'Income', color: CATEGORY_COLOR.income },
];

const CATEGORIES_FA = [
  { label: 'خواربار', color: CATEGORY_COLOR.groceries },
  { label: 'حمل‌ونقل', color: CATEGORY_COLOR.transport },
  { label: 'اجاره', color: CATEGORY_COLOR.rent },
  { label: 'رستوران', color: CATEGORY_COLOR.dining },
  { label: 'درآمد', color: CATEGORY_COLOR.income },
];

const TRANSACTIONS_EN = [
  {
    date: 'Jul 6',
    merchant: 'Grocery Outlet',
    categoryLabel: 'Groceries',
    categoryColor: CATEGORY_COLOR.groceries,
    amountMinorUnits: -8412,
    currency: 'USD',
  },
  {
    date: 'Jul 3',
    merchant: 'Freelance payment',
    categoryLabel: 'Income',
    categoryColor: CATEGORY_COLOR.income,
    amountMinorUnits: 124000,
    currency: 'USD',
  },
  {
    date: 'Jul 1',
    merchant: 'Berlin rent transfer',
    categoryLabel: 'Rent',
    categoryColor: CATEGORY_COLOR.rent,
    amountMinorUnits: -124000,
    currency: 'EUR',
  },
  {
    date: 'Jun 28',
    merchant: 'Salary deposit',
    categoryLabel: 'Income',
    categoryColor: CATEGORY_COLOR.income,
    amountMinorUnits: 12400000,
    currency: 'IRR',
  },
];

const TRANSACTIONS_FA = [
  {
    date: '۱۵ تیر',
    merchant: 'فروشگاه مواد غذایی',
    categoryLabel: 'خواربار',
    categoryColor: CATEGORY_COLOR.groceries,
    amountMinorUnits: -840000,
    currency: 'IRR',
  },
  {
    date: '۱۳ تیر',
    merchant: 'واریز حقوق',
    categoryLabel: 'درآمد',
    categoryColor: CATEGORY_COLOR.income,
    amountMinorUnits: 12400000,
    currency: 'IRR',
  },
  {
    date: '۱۰ تیر',
    merchant: 'اجاره خانه',
    categoryLabel: 'اجاره',
    categoryColor: CATEGORY_COLOR.rent,
    amountMinorUnits: -1240000,
    currency: 'IRR',
  },
  {
    date: '۸ تیر',
    merchant: 'رستوران',
    categoryLabel: 'رستوران',
    categoryColor: CATEGORY_COLOR.dining,
    amountMinorUnits: -420000,
    currency: 'IRR',
  },
];

export function FoundationsPage() {
  const locale = useLocaleStore((state) => state.locale);
  const [switchOn, setSwitchOn] = useState(true);
  const transactions = locale === 'fa' ? TRANSACTIONS_FA : TRANSACTIONS_EN;
  const categories = locale === 'fa' ? CATEGORIES_FA : CATEGORIES_EN;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Settle — Phase 1</div>
          <h1 className={styles.title}>Foundation layer</h1>
          <p className={styles.lede}>
            Tokens and base primitives for a local-first ledger app — the pieces
            everything else gets built from.
          </p>
        </div>
        <div className={styles.controls}>
          <ThemeToggle />
          <LocaleToggle />
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Color</h2>
        <div className={styles.swatchGrid}>
          {NEUTRAL_STEPS.map((step) => (
            <div className={styles.swatch} key={step.varName}>
              <div
                className={styles.swatchColor}
                style={{ background: `var(${step.varName})` }}
              />
              <div className={styles.swatchLabel}>{step.label}</div>
            </div>
          ))}
        </div>
        <div className={`${styles.swatchGrid} ${styles.swatchGridSecondary}`}>
          <div className={styles.swatch}>
            <div
              className={`${styles.swatchColor} ${styles.swatchColorAccent}`}
            />
            <div className={styles.swatchLabel}>Brass — accent</div>
          </div>
          <div className={styles.swatch}>
            <div
              className={`${styles.swatchColor} ${styles.swatchColorNegative}`}
            />
            <div className={styles.swatchLabel}>Rust — negative</div>
          </div>
        </div>
        <p className={`${styles.lede} ${styles.ledeSpaced}`}>
          Positive amounts carry no dedicated hue — body text color plus a "+"
          prefix only. Category badges never reuse the Rust hue, so a category
          tag never reads as "this is a loss".
        </p>
        <div className={`${styles.row} ${styles.rowSpaced}`}>
          {categories.map((category) => (
            <Badge key={category.label} color={category.color}>
              {category.label}
            </Badge>
          ))}
          <Badge color="#3a34eb">Test</Badge>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Type</h2>
        <div className={styles.stack}>
          <div className={styles.typeRole}>
            <div className={styles.typeRoleLabel}>Display · 600 · 34/1.15</div>
            <div className={styles.displaySample}>
              {locale === 'fa'
                ? 'هر تراکنش، ثبت‌شده'
                : 'Every transaction, accounted for'}
            </div>
          </div>
          <div className={styles.typeRole}>
            <div className={styles.typeRoleLabel}>Body · 400 · 16/1.55</div>
            <div className={styles.bodySample}>
              {locale === 'fa'
                ? 'سِتل تمام حساب‌ها را روی دستگاه شما نگه می‌دارد. چیزی بدون اجازه شما جایی همگام نمی‌شود.'
                : "Settle keeps every account on-device. Nothing syncs anywhere you didn't choose."}
            </div>
          </div>
          <div className={styles.typeRole}>
            <div className={styles.typeRoleLabel}>
              Numeric · 500 · tabular-nums
            </div>
            <div className={styles.numericDemo}>
              <div>
                <div className={styles.numericColumnLabel}>
                  without tabular-nums
                </div>
                <div className={styles.numericColumn}>
                  <div>1.00</div>
                  <div>11.00</div>
                  <div>111.00</div>
                </div>
              </div>
              <div>
                <div className={styles.numericColumnLabel}>
                  with tabular-nums
                </div>
                <div
                  className={`${styles.numericColumn} ${styles.numericColumnMedium} tabular-nums`}
                >
                  <div>1.00</div>
                  <div>11.00</div>
                  <div>111.00</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className={styles.typeRoleLabel}>Caption · 400 · 13/1.4</div>
            <div className={styles.captionSample}>
              {locale === 'fa'
                ? 'آخرین همگام‌سازی محلی · ۲ دقیقه پیش'
                : 'Last synced locally · 2 minutes ago'}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Spacing &amp; radius</h2>
        <div className={styles.stack}>
          {SPACING_STEPS.map((step) => (
            <div className={styles.spacingBar} key={step.name}>
              <div className={styles.spacingBarLabel}>{step.name}</div>
              <div
                className={styles.spacingBarFill}
                style={{ width: step.px }}
              />
              <div className={`${styles.spacingBarValue} tabular-nums`}>
                {step.px}px
              </div>
            </div>
          ))}
        </div>
        <div className={styles.radiusGrid}>
          {RADIUS_STEPS.map((step) => (
            <div key={step.name}>
              <div
                className={styles.radiusSample}
                style={{ borderRadius: `var(${step.varName})` }}
              />
              <div className={styles.radiusLabel}>
                {step.name}
                <br />
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Elevation</h2>
        <div className={styles.row}>
          <div className={styles.elevationSample}>elevation-0</div>
          <div
            className={`${styles.elevationSample} ${styles.elevationSample1}`}
          >
            elevation-1
          </div>
          <div
            className={`${styles.elevationSample} ${styles.elevationSample2}`}
          >
            elevation-2
          </div>
          <div
            className={`${styles.elevationSample} ${styles.elevationSample3}`}
          >
            elevation-3
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Button</h2>
        <div className={styles.row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="primary" disabled>
            Primary — disabled
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Input</h2>
        <div className={styles.row}>
          <div className={styles.inputWrapper}>
            <Input
              label="Account name"
              placeholder="Checking — main"
              hint="Shown on statements and exports."
            />
          </div>
          <div className={styles.inputWrapper}>
            <Input
              label="Opening balance"
              defaultValue="12,4a0"
              error="Enter a valid number."
            />
          </div>
          <div className={styles.inputWrapper}>
            <Input label="Currency" defaultValue="USD" disabled />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Card</h2>
        <div className={styles.row}>
          <Card className={styles.cardSample}>
            <div className={styles.cardLabel}>Default</div>
            <div className={styles.cardTitle}>Monthly rent</div>
            <div className={styles.cardBody}>Auto-paid on the 1st</div>
          </Card>
          <Card interactive className={styles.cardSample}>
            <div className={styles.cardLabel}>Interactive</div>
            <div className={styles.cardTitle}>Monthly rent</div>
            <div className={styles.cardBody}>Auto-paid on the 1st</div>
          </Card>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Table row — transaction</h2>
        <p className={styles.lede}>
          The amount column uses <code>text-align: end</code>, not left/right —
          flip the language toggle above and it mirrors for free.
        </p>
        <div className={styles.listCard}>
          {transactions.map((tx) => (
            <TransactionRow key={tx.date + tx.merchant} {...tx} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Toggle / switch</h2>
        <div className={styles.row}>
          <Switch
            label="Off example"
            checked={false}
            onCheckedChange={() => {}}
          />
          <Switch
            label="Interactive example"
            checked={switchOn}
            onCheckedChange={setSwitchOn}
          />
          <Switch label="Disabled example" disabled />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Empty state</h2>
        <EmptyState />
      </section>
    </div>
  );
}
