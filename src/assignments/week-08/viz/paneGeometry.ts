import type { Margin } from '../../week-05/margin';
import type { PaneId } from './types';

// Number of side-by-side panes in the dual view.
export const numPanes = 2;

// The horizontal plot range (screen coordinates) for a pane, inset by the
// margin so axes and labels have room. Pane 1 occupies the left half, pane 2
// the right half.
export function paneXRange(
  width: number,
  pane: PaneId,
  margin: Margin,
): [number, number] {
  const half = width / numPanes;
  const left = (pane - 1) * half;
  return [left + margin.left * 1.1, left + half - margin.right];
}

// The horizontal center of a pane's plot area, used to place axis labels.
export function paneCenterX(width: number, pane: PaneId, margin: Margin): number {
  const [x0, x1] = paneXRange(width, pane, margin);
  return (x0 + x1) / 2;
}
