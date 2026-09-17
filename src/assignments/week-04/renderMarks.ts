import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import type { CyberattacksRow } from '../week-02/CyberattacksSummary';

const RADIUS = 3;

export interface RenderMarksOptions {
  data: CyberattacksRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (row: CyberattacksRow) => number;
  yValue: (row: CyberattacksRow) => number;
}

export function renderMarks(
  marks: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderMarksOptions,
) {
  const { data, xScale, yScale, xValue, yValue } = options;

  marks
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)))
    .attr('r', RADIUS);
}
