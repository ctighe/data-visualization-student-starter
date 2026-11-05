import { axisBottom, axisLeft } from 'd3-axis';
import type { Selection } from 'd3-selection';
import type { ScaleBand, ScaleLinear } from 'd3-scale';

export interface RenderBarAxesOptions {
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
}

// Sums of users affected can reach the billions, so abbreviate large ticks
// (e.g. 1.2K / 3.4M / 5B) to keep the y-axis readable.
const Y_TICK_FORMAT = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function renderBarAxes(
  axes: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBarAxesOptions,
) {
  const { xScale, yScale } = options;

  axes.select<SVGGElement>('g.x-axis').call(axisBottom(xScale));
  axes
    .select<SVGGElement>('g.y-axis')
    .call(
      axisLeft(yScale)
        .ticks(5)
        .tickFormat((value) => Y_TICK_FORMAT.format(Number(value))),
    );

  // Category labels are long, so tilt them to avoid overlap.
  axes
    .selectAll<SVGTextElement, string>('g.x-axis text')
    .attr('transform', 'rotate(-30)')
    .attr('text-anchor', 'end')
    .attr('dx', '-0.5em')
    .attr('dy', '0.25em');
}
