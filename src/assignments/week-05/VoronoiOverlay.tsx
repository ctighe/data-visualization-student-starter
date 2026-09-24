import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderVoronoiOverlay } from './renderVoronoiOverlay';
import type { CyberattacksRow } from '../week-02/CyberattacksSummary';
import type { Margin } from './margin';

export interface VoronoiOverlayProps {
  data: CyberattacksRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (row: CyberattacksRow) => number;
  yValue: (row: CyberattacksRow) => number;
  width: number;
  height: number;
  margin: Margin;
  setHoveredIndex: (index: number | null) => void;
  showVoronoi: boolean;
}

export function VoronoiOverlay({
  data,
  xScale,
  yScale,
  xValue,
  yValue,
  width,
  height,
  margin,
  setHoveredIndex,
  showVoronoi,
}: VoronoiOverlayProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderVoronoiOverlay(select(group), {
      data,
      xScale,
      yScale,
      xValue,
      yValue,
      width,
      height,
      margin,
      setHoveredIndex,
      showVoronoi,
    });
  }, [data, xScale, yScale, xValue, yValue, width, height, margin, setHoveredIndex, showVoronoi]);

  return <g ref={groupRef} className="voronoi-overlay" />;
}
