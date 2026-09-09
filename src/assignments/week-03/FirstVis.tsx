import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { useDimensions } from '../week-01/useDimensions';
import { useCyberattacksDataset } from '../week-02/CyberattacksSummary';
import { useScales } from './useScales';
import type { CyberattacksRow } from '../week-02/CyberattacksSummary';
import { renderCircles } from './renderCircles';

// Accessors extract the x and y values from each row of the dataset.
const xValue = (row: CyberattacksRow) => row.year;
const yValue = (row: CyberattacksRow) => row.num_users_affected;

export function FirstVis() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();
  const data = useCyberattacksDataset()?.filter((row) => !isNaN(row.num_users_affected));
  const scales = useScales({ data, ...dimensions, xValue, yValue });
  
  console.log(data)

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || dimensions.width === 0 || dimensions.height === 0 || !data || !scales) return;

    renderCircles(select(svg), {
      data,
      xScale: scales.xScale,
      yScale: scales.yScale,
      xValue,
      yValue,
    });
  }, [dimensions, data, scales]);

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Scatter plot of year vs number of users affected by a specific cyberattack in that year"
      ></svg>
    </div>
  );
}