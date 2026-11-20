import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear, ScaleLogarithmic } from 'd3-scale';
import { renderBrushOverlay } from './renderBrushOverlay';
import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';
import type { Margin } from '../../../week-05/margin';

export interface BrushOverlayProps {
  data: CyberattacksRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLogarithmic<number, number> | ScaleLinear<number, number>;
  xValue: (row: CyberattacksRow) => number;
  yValue: (row: CyberattacksRow) => number;
  height: number;
  margin: Margin;
  setHoveredIndex: (index: number | null) => void;
  onBrushSelect: (rows: CyberattacksRow[]) => void;
  showVoronoi: boolean;
}

// A single overlay that handles both hover (nearest-point) and click-and-drag
// brushing. See `renderBrushOverlay` for why they share one layer.
export function BrushOverlay({
  data,
  xScale,
  yScale,
  xValue,
  yValue,
  height,
  margin,
  setHoveredIndex,
  onBrushSelect,
  showVoronoi,
}: BrushOverlayProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderBrushOverlay(select(group), {
      data,
      xScale,
      yScale,
      xValue,
      yValue,
      height,
      margin,
      setHoveredIndex,
      onBrushSelect,
      showVoronoi,
    });

    const selection = select(group);
    return () => {
      selection.on('.brush', null);
      selection.select('.overlay').on('mousemove', null).on('mouseleave', null);
    };
  }, [
    data,
    xScale,
    yScale,
    xValue,
    yValue,
    height,
    margin,
    setHoveredIndex,
    onBrushSelect,
    showVoronoi,
  ]);

  return <g ref={groupRef} className="brush-overlay" />;
}
