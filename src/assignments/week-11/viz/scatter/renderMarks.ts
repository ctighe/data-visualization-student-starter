import type { Selection } from 'd3-selection';
import type { ScaleLinear, ScaleLogarithmic } from 'd3-scale';
import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';

const RADIUS = 3;
const HOVERED_RADIUS = 4;
const FADED_OPACITY = 0.2;
// CSS handles the fades so highlighting the legend or a mark eases in/out
// instead of snapping.
const TRANSITION = 'opacity 200ms ease, r 150ms ease';

export interface RenderMarksOptions {
  data: CyberattacksRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLogarithmic<number, number> | ScaleLinear<number, number>;
  xValue: (row: CyberattacksRow) => number;
  yValue: (row: CyberattacksRow) => number;
  hoveredIndex: number | null;
  colorFor: (row: CyberattacksRow) => string;
  // Sensitivity level selected in the shared color legend, or null. When set,
  // every mark matching it is emphasized while the rest fade.
  highlightedImpact: string | null;
}

export function renderMarks(
  marks: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderMarksOptions,
) {
  const { data, xScale, yScale, xValue, yValue, hoveredIndex, colorFor, highlightedImpact } =
    options;

  marks
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)))
    .attr('fill', (d) => colorFor(d))
    .style('transition', TRANSITION)
    // The hovered mark grows slightly.
    .attr('r', (_d, i) => (i === hoveredIndex ? HOVERED_RADIUS : RADIUS))
    // A hovered mark takes priority: only it stays at full opacity. Otherwise
    // a legend selection emphasizes the matching sensitivity across the pane.
    .style('opacity', (d, i) => {
      if (hoveredIndex !== null) return i === hoveredIndex ? 1 : FADED_OPACITY;
      if (highlightedImpact !== null)
        return d.impact_data === highlightedImpact ? 1 : FADED_OPACITY;
      return 1;
    });
}
