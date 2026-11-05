import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';
import type { BarField, BarMetric } from '../types';
import { aggregateByCategory } from './aggregate';

// Shared y-domain for both bar panes: the largest category value across all
// rows, using the active aggregation field and measure. Returned as `[0, max]`;
// the linear scale `.nice()`s it, and because both panes receive the same input
// they round to identical ticks.
//
// `shareYDomain` is wired to the bar chart's toggle. When it is false the
// provider returns `null`, which tells the shell to leave `yDomain` null so each
// pane scales to its own rows (independent y-axes).
export function barYDomain(
  rows: CyberattacksRow[],
  {
    barField,
    metric,
    shareYDomain = true,
  }: { barField: BarField; metric: BarMetric; shareYDomain?: boolean },
): [number, number] | null {
  if (!shareYDomain || rows.length === 0) return null;
  const data = aggregateByCategory(rows, barField, metric);
  const maxValue = data.reduce((max, d) => Math.max(max, d.value), 0);
  return [0, maxValue];
}
