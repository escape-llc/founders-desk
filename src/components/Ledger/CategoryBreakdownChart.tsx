import { BarChart } from '#toolcrib';
import type { CategoryRecord, TransactionRecord } from '../../types';

interface CategoryBreakdownChartProps {
  categories: CategoryRecord[];
  transactions: TransactionRecord[];
}

// A handful of the seed category names are long enough that six of them
// side by side on a ~400px-wide axis overlap -- BarChart's own AxisBottom
// centers a fixed-size label per band with no rotation/truncation option
// of its own, so this is the caller's problem to solve, not the chart's.
const SHORT_LABELS: Record<string, string> = {
  'Meals & Entertainment': 'Meals',
  'Software & Subscriptions': 'Software',
  'Professional Development': 'Prof Dev',
  'Team Events': 'Team',
};

function shortLabel(name: string): string {
  return SHORT_LABELS[name] ?? name;
}

export default function CategoryBreakdownChart({ categories, transactions }: CategoryBreakdownChartProps) {
  const categoriesWithSpend = categories.filter((c) => transactions.some((t) => t.categoryId === c.id));
  const spendByCategory = categoriesWithSpend.map((c) =>
    transactions.filter((t) => t.categoryId === c.id).reduce((sum, t) => sum + t.amount, 0)
  );

  return (
    <BarChart
      title="Spend by category, this month"
      categories={categoriesWithSpend.map((c) => shortLabel(c.name))}
      series={[{ label: 'Spend', values: spendByCategory }]}
      width={340}
      height={240}
    />
  );
}
