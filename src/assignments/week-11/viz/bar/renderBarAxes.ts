import { axisBottom, axisLeft } from 'd3-axis';
import type { Selection } from 'd3-selection';
import type { ScaleBand, ScaleLinear } from 'd3-scale';

export interface RenderBarAxesOptions {
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
}

export function renderBarAxes(
  axes: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBarAxesOptions,
) {
  const { xScale, yScale } = options;

  axes.select<SVGGElement>('g.x-axis').call(axisBottom(xScale));
  axes.select<SVGGElement>('g.y-axis').call(axisLeft(yScale).ticks(5));

  // Category labels are long, so tilt them to avoid overlap.
  axes
    .selectAll<SVGTextElement, string>('g.x-axis text')
    .attr('transform', 'rotate(-30)')
    .attr('text-anchor', 'end')
    .attr('dx', '-0.5em')
    .attr('dy', '0.25em');
}
