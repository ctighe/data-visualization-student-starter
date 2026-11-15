import { useMemo } from 'react';
import { Bars } from './Bars';
import { BarAxes } from './BarAxes';
import { Labels } from '../shared/Labels';
import { useBarScales } from '../useBarScales';
import {
  BAR_FIELD_LABELS,
  BAR_METRIC_LABELS,
  aggregateByCategory,
  categoryOf,
} from './aggregate';
import { barOverlayFill, barOverlayInset, barOverlayOpacity } from '../../config';
import type { PaneContext } from '../types';

// Draws one pane of the categorical bar chart. Values are always computed from
// this pane's rows, but the y-domain comes from the shell when the user turns
// on the shared-y toggle, so both panes stay directly comparable.
//
// Tooltips are intentionally disabled for the bar style: a tooltip shows a
// single datapoint, but a bar summarizes many rows. It deliberately does not
// register a `positionOf`, so the shell never anchors the shared tooltip.
//
// Clicking a bar publishes every row in that category (all `rows`, including
// ones with a missing measure) to the shell for linked highlighting.
//
// When rows are selected elsewhere (a clicked bar or a scatter brush), a second
// orange layer is drawn over the base bars. It aggregates only the selected
// rows that belong to this pane's time split, using the active field/metric, so
// it is always a subset of the base data and fits the same scales.
export function BarPane({
  pane,
  rows,
  width,
  height,
  margin,
  barField,
  barMetric,
  yDomain,
  onBarSelect,
  selectedRows,
}: PaneContext) {
  const scales = useBarScales(rows, width, height, margin, pane, barField, barMetric, yDomain);

  // Aggregate the selected rows that fall in this pane. Intersecting with the
  // pane's own rows means each pane shows only its share of the selection and
  // the overlay never exceeds the base bar.
  const overlayData = useMemo(() => {
    if (!selectedRows) return [];
    const selectedInPane = rows.filter((row) => selectedRows.has(row));
    if (selectedInPane.length === 0) return [];
    return aggregateByCategory(selectedInPane, barField, barMetric);
  }, [rows, selectedRows, barField, barMetric]);

  const handleBarClick = (key: string) => {
    const contributingRows = rows.filter((row) => categoryOf(row, barField) === key);
    onBarSelect(key, contributingRows);
  };

  if (!scales) return null;

  const { xScale, yScale, data } = scales;

  return (
    <g className={`pane pane-${pane} bar`}>
      <Bars data={data} xScale={xScale} yScale={yScale} onBarClick={handleBarClick} />
      {overlayData.length > 0 && (
        <Bars
          data={overlayData}
          xScale={xScale}
          yScale={yScale}
          fill={barOverlayFill}
          opacity={barOverlayOpacity}
          pointerEvents="none"
          inset={barOverlayInset}
        />
      )}
      <BarAxes xScale={xScale} yScale={yScale} height={height} margin={margin} />
      <Labels
        width={width}
        height={height}
        margin={margin}
        pane={pane}
        xOnly={pane === 2}
        xLabel={BAR_FIELD_LABELS[barField]}
        yLabel={BAR_METRIC_LABELS[barMetric]}
      />
    </g>
  );
}
