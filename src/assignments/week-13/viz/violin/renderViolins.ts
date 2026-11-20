import { area, curveLinear } from 'd3-shape';
import type { Selection } from 'd3-selection';
import type { ScaleLinear, ScaleLogarithmic } from 'd3-scale';
import type { DensityPoint, ViolinGroup } from './density';

export interface RenderViolinsOptions {
  groups: ViolinGroup[];
  // Horizontal center (pixels) of each violin, derived from its year.
  centerX: (year: number) => number;
  yScale: ScaleLogarithmic<number, number>;
  halfWidthScale: ScaleLinear<number, number>;
  stroke: string;
  strokeWidth: number;
}

// Draws one violin per year as an unfilled outline. Each density point maps to
// a centered horizontal half-width (`halfWidthScale`) at a vertical position on
// the log value scale. The area generator closes the left and right sides into
// a single closed path which we stroke instead of fill, keeping the scatter
// marks underneath visible.
export function renderViolins(
  group: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderViolinsOptions,
) {
  const { groups, centerX, yScale, halfWidthScale, stroke, strokeWidth } = options;

  const violinArea = area<DensityPoint>()
    .x0((d) => -halfWidthScale(d.y))
    .x1((d) => halfWidthScale(d.y))
    .y((d) => yScale(10 ** d.x))
    .curve(curveLinear);

  group
    .selectAll<SVGPathElement, ViolinGroup>('path.violin')
    .data(groups, (d) => d.year)
    .join('path')
    .attr('class', 'violin')
    .attr('fill', 'none')
    .attr('stroke', stroke)
    .attr('stroke-width', strokeWidth)
    .attr('d', (d) => violinArea(d.densities))
    .attr('transform', (d) => `translate(${centerX(d.year)}, 0)`);
}
