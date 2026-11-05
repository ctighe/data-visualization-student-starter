import type { Margin } from '../../week-05/margin';
import type { PaneId } from './types';

// Number of side-by-side panes in the dual view.
export const numPanes = 2;

// The horizontal plot range (screen coordinates) for a pane, inset by the
// margin so axes and labels have room. Dual-pane styles split the width in
// half (pane 1 left, pane 2 right); a single-pane style uses the full width.
export function paneXRange(
  width: number,
  pane: PaneId,
  margin: Margin,
  paneCount: 1 | 2 = numPanes,
): [number, number] {
  if (paneCount === 1) return [margin.left, width - margin.right];
  const half = width / paneCount;
  const left = (pane - 1) * half;
  return [left + margin.left * 1.1, left + half - margin.right];
}

// The horizontal center of a pane's plot area, used to place axis labels.
export function paneCenterX(
  width: number,
  pane: PaneId,
  margin: Margin,
  paneCount: 1 | 2 = numPanes,
): number {
  const [x0, x1] = paneXRange(width, pane, margin, paneCount);
  return (x0 + x1) / 2;
}
