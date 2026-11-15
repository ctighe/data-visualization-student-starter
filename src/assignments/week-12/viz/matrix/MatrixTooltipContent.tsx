import { DATA_FIELDS } from './fields';
import type { MatrixCell } from './types';

export interface MatrixTooltipContentProps {
  cell: MatrixCell;
}

// Content for the matrix cell tooltip. Diagonal cells report a single-field
// total; off-diagonal cells report the pair co-occurrence and what share of the
// row field's incidents also exposed the column field.
export function MatrixTooltipContent({ cell }: MatrixTooltipContentProps) {
  if (cell.isDiagonal) {
    return (
      <>
        <div className="font-medium">{cell.rowLabel}</div>
        <div>
          Single-field total: <span className="font-semibold">{cell.count}</span> incidents
        </div>
      </>
    );
  }

  const share = cell.rowTotal > 0 ? ((cell.count / cell.rowTotal) * 100).toFixed(1) : '0.0';
  return (
    <>
      <div className="font-medium">
        {cell.rowLabel} &amp; {cell.colLabel}
      </div>
      <div>
        Pair co-occurrence: <span className="font-semibold">{cell.count}</span> incidents
      </div>
      <div>
        Share of &quot;{DATA_FIELDS[cell.row].short}&quot;:{' '}
        <span className="font-semibold">{share}%</span>
      </div>
    </>
  );
}
