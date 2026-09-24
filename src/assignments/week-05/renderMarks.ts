import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import type { CyberattacksRow } from '../week-02/CyberattacksSummary';

const RADIUS = 3;
const HOVERED_RADIUS = 4;
const FADED_OPACITY = 0.2;

export interface RenderMarksOptions {
  data: CyberattacksRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (row: CyberattacksRow) => number;
  yValue: (row: CyberattacksRow) => number;
  hoveredIndex: number | null;
}

export function renderMarks(
  marks: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderMarksOptions,
) {
  const { data, xScale, yScale, xValue, yValue, hoveredIndex } = options;

  marks
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)))
    // The hovered mark grows slightly, and the rest fade into the background
    // so the hovered point stands out.
    .attr('r', (_d, i) => (i === hoveredIndex ? HOVERED_RADIUS : RADIUS))
    .attr('fill', 'black')
    .attr('opacity', (_d, i) => (hoveredIndex === null || i === hoveredIndex ? 1 : FADED_OPACITY));
}
