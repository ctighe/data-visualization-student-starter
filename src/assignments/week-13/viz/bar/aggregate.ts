import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';
import type { BarField, BarMetric } from '../types';

export interface CategoryDatum {
  key: string;
  value: number;
}

// Human-readable labels for the selectable aggregation fields.
export const BAR_FIELD_LABELS: Record<BarField, string> = {
  attack_type: 'Attack type',
  attack_vector: 'Attack vector',
  org_size: 'Organisation size',
  impact_data: 'Data sensitivity',
};

// Y-axis label for each measure.
export const BAR_METRIC_LABELS: Record<BarMetric, string> = {
  count: 'Number of attacks',
  users: 'Number of users affected',
};

// Options for the y-axis measure control (short labels).
export const BAR_METRIC_OPTIONS: { value: BarMetric; label: string }[] = [
  { value: 'count', label: 'Count of attacks' },
  { value: 'users', label: 'Sum of users affected' },
];

const FALLBACK = 'Unknown';

export function categoryOf(row: CyberattacksRow, field: BarField): string {
  const raw = row[field];
  if (typeof raw !== 'string') return FALLBACK;
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === 'NA' || trimmed === 'Missing') return FALLBACK;
  return trimmed;
}

// Aggregates rows per category using the selected measure, sorted descending so
// the largest bars read left-to-right. The 'users' measure skips rows whose
// users-affected value is missing (NA), so a category can be absent when none
// of its rows report a number.
export function aggregateByCategory(
  rows: CyberattacksRow[],
  field: BarField,
  metric: BarMetric,
): CategoryDatum[] {
  const values = new Map<string, number>();
  for (const row of rows) {
    const key = categoryOf(row, field);
    if (metric === 'users') {
      const users = row.num_users_affected;
      if (!Number.isFinite(users)) continue;
      values.set(key, (values.get(key) ?? 0) + users);
    } else {
      values.set(key, (values.get(key) ?? 0) + 1);
    }
  }
  return [...values.entries()]
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);
}
