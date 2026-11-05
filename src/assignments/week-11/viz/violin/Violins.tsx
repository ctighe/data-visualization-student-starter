import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear, ScaleLogarithmic } from 'd3-scale';
import { renderViolins } from './renderViolins';
import type { ViolinGroup } from './density';

export interface ViolinsProps {
  groups: ViolinGroup[];
  centerX: (year: number) => number;
  yScale: ScaleLogarithmic<number, number>;
  halfWidthScale: ScaleLinear<number, number>;
  stroke: string;
  strokeWidth: number;
}

export function Violins({
  groups,
  centerX,
  yScale,
  halfWidthScale,
  stroke,
  strokeWidth,
}: ViolinsProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderViolins(select(group), { groups, centerX, yScale, halfWidthScale, stroke, strokeWidth });
  }, [groups, centerX, yScale, halfWidthScale, stroke, strokeWidth]);

  return <g ref={groupRef} className="violins" />;
}
