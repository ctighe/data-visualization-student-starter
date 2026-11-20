import { useMemo } from 'react';
import { Bars } from './Bars';
import { BarAxes } from './BarAxes';
import { Labels } from '../shared/Labels';
import { useBarScales } from '../useBarScales';
import { BAR_FIELD_LABELS, BAR_METRIC_LABELS, aggregateByCategory, categoryOf } from './aggregate';
import { HATCH_FILL, hatchBandHeight, selectedFraction } from '../shared/hatch';
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
// When rows are selected elsewhere (a clicked bar, a scatter brush, a matrix
// cell, an icicle segment), the highlighted share of each bar is drawn as a
// hatched band over that bar's top fraction. The fraction uses the active
// field/metric, so it is measured in the same units as the bar's own height:
// selected attacks over total attacks for `count`, selected users over total
// users for `users`. Because the selected rows are intersected with this pane's
// own rows, each pane shows only its share of the selection and no band can
// exceed its bar.
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

  // Fraction of each bar's own measure that is highlighted, keyed by category.
  // Categories with no highlighted rows are absent, so the render loop skips
  // them entirely.
  const hatchFractions = useMemo(() => {
    const fractions = new Map<string, number>();
    if (!scales || !selectedRows) return fractions;

    const selectedInPane = rows.filter((row) => selectedRows.has(row));
    if (selectedInPane.length === 0) return fractions;

    const totals = new Map(scales.data.map((datum) => [datum.key, datum.value]));
    for (const datum of aggregateByCategory(selectedInPane, barField, barMetric)) {
      const total = totals.get(datum.key) ?? 0;
      const fraction = selectedFraction(datum.value, total);
      if (fraction > 0) fractions.set(datum.key, fraction);
    }
    return fractions;
  }, [scales, rows, selectedRows, barField, barMetric]);

  const handleBarClick = (key: string) => {
    const contributingRows = rows.filter((row) => categoryOf(row, barField) === key);
    onBarSelect(key, contributingRows);
  };

  if (!scales) return null;

  const { xScale, yScale, data } = scales;

  return (
    <g className={`pane pane-${pane} bar`}>
      <Bars data={data} xScale={xScale} yScale={yScale} onBarClick={handleBarClick} />
      {hatchFractions.size > 0 && (
        <g className="bar-hatch" pointerEvents="none">
          {data.map((datum) => {
            const fraction = hatchFractions.get(datum.key);
            if (!fraction) return null;
            const top = yScale(datum.value);
            return (
              <rect
                key={datum.key}
                x={xScale(datum.key) ?? 0}
                y={top}
                width={xScale.bandwidth()}
                height={hatchBandHeight(fraction, yScale(0) - top)}
                fill={HATCH_FILL}
              />
            );
          })}
        </g>
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
