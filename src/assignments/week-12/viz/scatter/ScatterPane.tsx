import { useCallback, useState, useEffect } from 'react';
import { Marks } from './Marks';
import { BrushOverlay } from './BrushOverlay';
import { Violins } from '../violin/Violins';
import { Axes } from '../shared/Axes';
import { Labels } from '../shared/Labels';
import { useScatterViolinScales } from '../useScatterViolinScales';
import { xValue, yValue, violinStroke, violinStrokeWidth, xAxisLabel, yAxisLabel } from '../../config';
import type { PaneContext, PositionOf } from '../types';

// Draws the scatter plot: a single full-width pane with a violin underlay.
// The violins share the scatter's x/y scales, so each year's density outline
// sits directly behind that year's marks. Scales are computed from all rows
// (no time split), and the plot is expanded so the violin tails fit inside it.
export function ScatterPane({
  pane,
  rows,
  width,
  height,
  margin,
  colorFor,
  hoveredIndex,
  setHoveredIndex,
  setPositionOf,
  highlightedImpact,
  selectedRows,
  onBrushSelect,
}: PaneContext) {
  const scales = useScatterViolinScales({ rows, width, height, margin, xValue, yValue });

  // Easter egg: pressing "V" toggles the Voronoi cell borders on and off.
  const [showVoronoi, setShowVoronoi] = useState(false);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'v') {
        setShowVoronoi((shown) => !shown);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Report this pane's scale-based positioning to the shell so the tooltip
  // can follow the hovered mark. Returns null for a missing row, a missing
  // scale, or non-finite coordinates so callers can skip the tooltip.
  const positionOf = useCallback<PositionOf>(
    (row) => {
      if (!scales || !row) return null;
      const x = xValue(row);
      const y = yValue(row);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return [scales.xScale(x), scales.yScale(y)];
    },
    [scales],
  );

  useEffect(() => {
    setPositionOf(positionOf);
    return () => setPositionOf(null);
  }, [positionOf, setPositionOf]);

  // Linear year scale, so each violin is centered exactly on its year. Stable
  // callback so the Violins render effect only reruns when the scales change.
  const centerX = useCallback((year: number) => (scales ? scales.xScale(year) : 0), [scales]);

  if (!scales) return null;
  const { xScale, yScale, halfWidthScale, groups } = scales;

  return (
    <g className={`pane pane-${pane} scatter`}>
      <Violins
        groups={groups}
        centerX={centerX}
        yScale={yScale}
        halfWidthScale={halfWidthScale}
        stroke={violinStroke}
        strokeWidth={violinStrokeWidth}
      />
      <Marks
        data={rows}
        xScale={xScale}
        yScale={yScale}
        xValue={xValue}
        yValue={yValue}
        hoveredIndex={hoveredIndex}
        colorFor={colorFor}
        highlightedImpact={highlightedImpact}
        selectedRows={selectedRows}
      />
      <Axes xScale={xScale} yScale={yScale} height={height} margin={margin} />
      <Labels
        width={width}
        height={height}
        margin={margin}
        pane={pane}
        paneCount={1}
        xOnly={false}
        xLabel={xAxisLabel}
        yLabel={yAxisLabel}
      />
      <BrushOverlay
        data={rows}
        xScale={xScale}
        yScale={yScale}
        xValue={xValue}
        yValue={yValue}
        height={height}
        margin={margin}
        setHoveredIndex={setHoveredIndex}
        onBrushSelect={onBrushSelect}
        showVoronoi={showVoronoi}
      />
    </g>
  );
}
