import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleBand, ScaleLinear } from 'd3-scale';
import { renderBarAxes } from './renderBarAxes';
import type { Margin } from '../../../week-05/margin';

export interface BarAxesProps {
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  height: number;
  margin: Margin;
}

export function BarAxes({ xScale, yScale, height, margin }: BarAxesProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderBarAxes(select(group), { xScale, yScale });
  }, [xScale, yScale]);

  return (
    <g ref={groupRef} className="axes">
      <g className="x-axis" transform={`translate(0, ${height - margin.bottom})`} />
      <g className="y-axis" transform={`translate(${xScale.range()[0]}, 0)`} />
    </g>
  );
}
