import { useCallback, useEffect } from 'react';
import { Bars } from './Bars';
import { BarAxes } from './BarAxes';
import { Labels } from '../shared/Labels';
import { useBarScales } from '../useBarScales';
import { BAR_FIELD_LABELS } from './aggregate';
import type { PaneContext, PositionOf } from '../types';

// Draws one pane of the categorical bar chart. Counts are computed from this
// pane's rows only, so the two panes keep independent domains.
export function BarPane({
  pane,
  rows,
  width,
  height,
  margin,
  barField,
  hoveredIndex,
  setHoveredIndex,
  setPositionOf,
}: PaneContext) {
  const scales = useBarScales(rows, width, height, margin, pane, barField);

  // Anchor the tooltip at the hovered bar's top center. The row's category is
  // resolved through the same band scale the bars use. Returns null for a
  // missing row or non-finite coordinates so callers can skip the tooltip.
  const positionOf = useCallback<PositionOf>(
    (row) => {
      if (!scales || !row) return null;
      const key = String(row[barField] ?? 'Unknown').trim() || 'Unknown';
      const found = scales.counts.find((c) => c.key === key) ?? scales.counts[0];
      const x = (scales.xScale(key) ?? scales.xScale.range()[0]) + scales.xScale.bandwidth() / 2;
      const y = scales.yScale(found?.value ?? 0);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return [x, y];
    },
    [scales, barField],
  );

  useEffect(() => {
    setPositionOf(positionOf);
    return () => setPositionOf(null);
  }, [positionOf, setPositionOf]);

  if (!scales) return null;

  const { xScale, yScale, counts } = scales;

  return (
    <g className={`pane pane-${pane} bar`}>
      <Bars
        counts={counts}
        xScale={xScale}
        yScale={yScale}
        hoveredIndex={hoveredIndex}
        setHoveredIndex={setHoveredIndex}
      />
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
