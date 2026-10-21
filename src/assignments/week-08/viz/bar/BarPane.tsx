import { Bars } from './Bars';
import { BarAxes } from './BarAxes';
import { Labels } from '../shared/Labels';
import { useBarScales } from '../useBarScales';
import { BAR_FIELD_LABELS } from './aggregate';
import type { PaneContext } from '../types';

// Draws one pane of the categorical bar chart. Counts are computed from this
// pane's rows only, so the two panes keep independent domains.
//
// Tooltips are intentionally disabled for the bar style: a tooltip shows a
// single datapoint, but a bar summarizes many rows. It deliberately does not
// register a `positionOf`, so the shell never anchors the shared tooltip.
export function BarPane({
  pane,
  rows,
  width,
  height,
  margin,
  barField,
}: PaneContext) {
  const scales = useBarScales(rows, width, height, margin, pane, barField);

  if (!scales) return null;

  const { xScale, yScale, counts } = scales;

  return (
    <g className={`pane pane-${pane} bar`}>
      <Bars counts={counts} xScale={xScale} yScale={yScale} />
      <BarAxes xScale={xScale} yScale={yScale} height={height} margin={margin} />
      <Labels
        width={width}
        height={height}
        margin={margin}
        pane={pane}
        xOnly={pane === 2}
        xLabel={BAR_FIELD_LABELS[barField]}
        yLabel="Number of attacks"
      />
    </g>
  );
}
