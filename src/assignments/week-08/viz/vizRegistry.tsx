import { ScatterPane } from './scatter/ScatterPane';
import { BarPane } from './bar/BarPane';
import { BarControls } from './bar/BarControls';
import type { VizStyle, VizStyleId } from './types';

// Stable style definitions. Component identities never change, so switching
// styles does not remount panes unnecessarily and the bar field flows through
// the shared `PaneContext` instead of a per-render closure.
export const VIZ_STYLES: Record<VizStyleId, VizStyle> = {
  scatter: {
    id: 'scatter',
    label: 'Scatter plot',
    Pane: ScatterPane,
  },
  bar: {
    id: 'bar',
    label: 'Bar chart',
    Pane: BarPane,
    Controls: BarControls,
  },
};

export const VIZ_STYLE_LIST: VizStyle[] = [VIZ_STYLES.scatter, VIZ_STYLES.bar];

export function getVizStyle(id: VizStyleId): VizStyle {
  return VIZ_STYLES[id];
}
