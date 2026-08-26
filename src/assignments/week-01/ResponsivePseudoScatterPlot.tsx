import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { useDimensions } from './useDimensions';

interface DataPoint {
  x: number;
  y: number;
  r: number;
}

const data: DataPoint[] = [
  { x: 132, y: 391, r: 30},
  { x: 330, y: 349, r: 32},
  { x: 410, y: 192, r: 25},
  { x: 527, y: 257, r:40},
  { x: 688, y: 119, r:17},
  { x: 878, y: 55, r:38},
  { x: 250, y: 143, r:22},
];

const ORIGINAL_WIDTH = 960;
const ORIGINAL_HEIGHT = 500;

export function ResponsivePseudoScatterPlot() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || dimensions.width === 0 || dimensions.height === 0) return;

    const xScale = scaleLinear().domain([0, ORIGINAL_WIDTH]).range([0, dimensions.width]);

    const yScale = scaleLinear().domain([0, ORIGINAL_HEIGHT]).range([0, dimensions.height]);

    select(svg)
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d: DataPoint) => xScale(d.x))
      .attr('cy', (d: DataPoint) => yScale(d.y))
      .attr('r', (d: DataPoint) => d.r)
      .attr('fill', 'blue');
  }, [dimensions]);

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Responsive scatter plot showing 7 data points"
      ></svg>
    </div>
  );
}
