import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';
import { DATA_FIELDS } from './fields';
import type { MatrixCell, MatrixData } from './types';

// Builds the symmetric 7x7 co-occurrence matrix for a set of rows. A field
// counts when it reports exactly "Yes". The diagonal holds single-field totals
// (how many rows exposed that field at all); an off-diagonal cell counts the
// rows where both fields were exposed. The matrix is symmetric by construction.
export function buildMatrix(rows: CyberattacksRow[]): MatrixData {
  const n = DATA_FIELDS.length;
  const singleCounts = new Array<number>(n).fill(0);
  const counts: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));

  for (const row of rows) {
    // Collect this row's exposed fields, then increment every ordered pair
    // (including i === i, which is the single-field total).
    const active: number[] = [];
    for (let i = 0; i < n; i++) {
      if (row[DATA_FIELDS[i].key] === 'Yes') {
        singleCounts[i] += 1;
        active.push(i);
      }
    }
    for (const i of active) {
      for (const j of active) counts[i][j] += 1;
    }
  }

  let maxCount = 0;
  const matrix: MatrixCell[][] = counts.map((rowCounts, i) =>
    rowCounts.map((count, j) => {
      if (count > maxCount) maxCount = count;
      const rowField = DATA_FIELDS[i];
      const colField = DATA_FIELDS[j];
      return {
        row: i,
        col: j,
        rowKey: rowField.key,
        colKey: colField.key,
        rowLabel: rowField.label,
        colLabel: colField.label,
        count,
        rowTotal: singleCounts[i],
        colTotal: singleCounts[j],
        isDiagonal: i === j,
      };
    }),
  );

  return { matrix, singleCounts, maxCount };
}

// Shared color domain for the dual-pane matrix. Both panes map their cell
// counts onto the same sequential scale so a given shade means the same count
// on either side of the time split. The upper bound is the largest cell in
// whichever pane reaches highest, so the busier era still uses the full ramp.
export function matrixColorDomain(
  leftRows: CyberattacksRow[],
  rightRows: CyberattacksRow[],
): [number, number] {
  const leftMax = buildMatrix(leftRows).maxCount;
  const rightMax = buildMatrix(rightRows).maxCount;
  const max = Math.max(leftMax, rightMax);
  return [0, max > 0 ? max : 1];
}
