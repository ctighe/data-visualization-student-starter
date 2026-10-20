import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';
import type { BarField } from '../types';

export interface CategoryCount {
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

const FALLBACK = 'Unknown';

function categoryOf(row: CyberattacksRow, field: BarField): string {
  const raw = row[field];
  if (typeof raw !== 'string') return FALLBACK;
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === 'NA' || trimmed === 'Missing') return FALLBACK;
  return trimmed;
}

// Counts attacks per category for the given field. Sorted descending so the
// most common categories read left-to-right.
export function countByCategory(
  rows: CyberattacksRow[],
  field: BarField,
): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = categoryOf(row, field);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);
}
