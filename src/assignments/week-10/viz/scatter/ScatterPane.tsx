import { useCallback, useState, useEffect } from 'react';
import { Marks } from './Marks';
import { VoronoiOverlay } from './VoronoiOverlay';
import { Axes } from '../shared/Axes';
import { Labels } from '../shared/Labels';
import { usePaneScales } from '../usePaneScales';
import { xValue, yValue, yLog } from '../../config';
import type { PaneContext, PositionOf } from '../types';

// Draws one pane of the scatter plot: marks, axes, labels, and the Voronoi
// hover overlay. Scales are computed from this pane's rows only.
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
}: PaneContext) {
  const scales = usePaneScales({
    rows,
    width,
    height,
    margin,
    pane,
    yLog,
    xValue,
    yValue,
  });

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

  if (!scales) return null;
  const { xScale, yScale } = scales;

  return (
    <g className={`pane pane-${pane} scatter`}>
      <Marks
        data={rows}
        xScale={xScale}
        yScale={yScale}
        xValue={xValue}
        yValue={yValue}
        hoveredIndex={hoveredIndex}
        colorFor={colorFor}
        highlightedImpact={highlightedImpact}
      />
      <Axes xScale={xScale} yScale={yScale} height={height} margin={margin} />
      <Labels
        width={width}
        height={height}
        margin={margin}
        pane={pane}
        xOnly={pane === 2}
        xLabel="Year"
        yLabel="Number of Users Affected (LOG)"
      />
      <VoronoiOverlay
        data={rows}
        xScale={xScale}
        yScale={yScale}
        xValue={xValue}
        yValue={yValue}
        height={height}
        margin={margin}
        setHoveredIndex={setHoveredIndex}
        showVoronoi={showVoronoi}
      />
    </g>
  );
}
