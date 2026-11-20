import type { Selection } from 'd3-selection';
import type { ScaleLinear, ScaleLogarithmic } from 'd3-scale';
import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';
import { HOVERED_MARK_AREA, MARK_AREA, markPath } from './markShapes';

const FADED_OPACITY = 0.2;
// CSS handles the fades so highlighting the legend or a mark eases in/out
// instead of snapping. Size is carried by the path's `d`, which CSS cannot
// transition, so the hovered mark grows in one step instead of easing.
const TRANSITION = 'opacity 200ms ease';

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
  // Rows selected in another view (e.g. a clicked bar), or null. Used as a
  // fallback highlight below hover and the legend.
  selectedRows: ReadonlySet<CyberattacksRow> | null;
}

export function renderMarks(
  marks: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderMarksOptions,
) {
  const {
    data,
    xScale,
    yScale,
    xValue,
    yValue,
    hoveredIndex,
    colorFor,
    highlightedImpact,
    selectedRows,
  } = options;

  marks
    .selectAll('path.mark')
    .data(data)
    .join('path')
    .attr('class', 'mark')
    // Shapes are generated centered on the origin, so positioning a mark is a
    // single translate rather than per-shape cx/cy or x/y/width/height.
    .attr('transform', (d) => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`)
    // Circle = Low, square = Medium, triangle = High (unknown -> circle). The
    // fill comes from the unchanged sensitivity color scale.
    .attr('d', (d, i) =>
      markPath(d.impact_data, i === hoveredIndex ? HOVERED_MARK_AREA : MARK_AREA),
    )
    .attr('fill', (d) => colorFor(d))
    .style('transition', TRANSITION)
    // Priority: a directly hovered mark > the color-legend highlight > a
    // linked bar selection. A hovered mark only stays lit itself; the legend
    // and linked selection emphasize every matching mark in the pane.
    .style('opacity', (d, i) => {
      if (hoveredIndex !== null) return i === hoveredIndex ? 1 : FADED_OPACITY;
      if (highlightedImpact !== null)
        return d.impact_data === highlightedImpact ? 1 : FADED_OPACITY;
      if (selectedRows) return selectedRows.has(d) ? 1 : FADED_OPACITY;
      return 1;
    });
}
