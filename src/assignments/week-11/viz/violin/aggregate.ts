import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';
import { density1d } from './density';
import type { ViolinGroup } from './density';

export interface GroupViolinsByYearOptions {
  xValue: (row: CyberattacksRow) => number;
  yValue: (row: CyberattacksRow) => number;
  // KDE options, forwarded to density1d.
  bandwidth: number;
  pad: number;
  bins: number;
}

export interface YearViolinGroups {
  // Years that actually have data, sorted ascending.
  presentYears: number[];
  // Every year between the first and last present year, gaps included.
  allYears: number[];
  // One density curve per present year.
  groups: ViolinGroup[];
  // Extent of the density grid in log10 units, used to size the value axis.
  densityLogExtent: [number, number];
}

// Groups rows by (rounded) year and estimates a 1-D density curve for each.
// Only finite, positive values can be log-transformed, so other rows are
// skipped. Returns null when no year has usable data.
export function groupViolinsByYear(
  rows: CyberattacksRow[],
  { xValue, yValue, bandwidth, pad, bins }: GroupViolinsByYearOptions,
): YearViolinGroups | null {
  const byYear = new Map<number, number[]>();
  for (const row of rows) {
    const value = yValue(row);
    if (!Number.isFinite(value) || value <= 0) continue;
    const year = Math.round(xValue(row));
    const logValue = Math.log10(value);
    const values = byYear.get(year);
    if (values) values.push(logValue);
    else byYear.set(year, [logValue]);
  }
  if (byYear.size === 0) return null;

  const presentYears = [...byYear.keys()].sort((a, b) => a - b);
  const firstYear = presentYears[0];
  const lastYear = presentYears[presentYears.length - 1];
  const allYears: number[] = [];
  for (let year = firstYear; year <= lastYear; year++) allYears.push(year);

  const groups: ViolinGroup[] = presentYears.map((year) => ({
    year,
    densities: density1d(byYear.get(year) ?? [], { bandwidth, pad, bins }),
  }));

  let lo = Infinity;
  let hi = -Infinity;
  for (const group of groups) {
    for (const point of group.densities) {
      if (point.x < lo) lo = point.x;
      if (point.x > hi) hi = point.x;
    }
  }

  return { presentYears, allYears, groups, densityLogExtent: [lo, hi] };
}
