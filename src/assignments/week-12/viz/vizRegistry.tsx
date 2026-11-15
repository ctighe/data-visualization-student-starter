import { ScatterPane } from './scatter/ScatterPane';
import { BarPane } from './bar/BarPane';
import { BarControls } from './bar/BarControls';
import { barYDomain } from './bar/sharedYDomain';
import { MatrixPane } from './matrix/MatrixPane';
import { matrixColorDomain } from './matrix/aggregate';
import type { VizStyle, VizStyleId } from './types';

// Stable style definitions. Component identities never change, so switching
// styles does not remount panes unnecessarily and the bar field flows through
// the shared `PaneContext` instead of a per-render closure.
export const VIZ_STYLES: Record<VizStyleId, VizStyle> = {
  scatter: {
    id: 'scatter',
    label: 'Scatter plot',
    Pane: ScatterPane,
    bottomMargin: 80,
    // Single full-width pane with a violin underlay; no time split.
    paneCount: 1,
  },
  bar: {
    id: 'bar',
    label: 'Bar chart',
    Pane: BarPane,
    Controls: BarControls,
    // Rotated category labels plus the axis label need more room than scatter.
    bottomMargin: 120,
    paneCount: 2,
    // Returns null unless the user turns on the shared-y toggle.
    sharedYDomain: barYDomain,
  },
  matrix: {
    id: 'matrix',
    label: 'Co-occurrence matrix',
    Pane: MatrixPane,
    // No x-axis labels below the grid, so only a little breathing room.
    bottomMargin: 40,
    // One matrix per side of the time split, sharing one color scale.
    paneCount: 2,
    // The exposed-data-type columns are populated for every incident, so the
    // matrix counts the full dataset rather than the scatter's filtered rows.
    useAllRows: true,
    sharedColorDomain: matrixColorDomain,
  },
};

export const VIZ_STYLE_LIST: VizStyle[] = [VIZ_STYLES.scatter, VIZ_STYLES.bar, VIZ_STYLES.matrix];

export function getVizStyle(id: VizStyleId): VizStyle {
  return VIZ_STYLES[id];
}
