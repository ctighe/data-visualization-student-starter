import { brush } from 'd3-brush';
import type { BrushSelection } from 'd3-brush';
import { pointer } from 'd3-selection';
import type { Selection } from 'd3-selection';
import { Delaunay } from 'd3-delaunay';
import type { ScaleLinear, ScaleLogarithmic } from 'd3-scale';
import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';
import type { Margin } from '../../../week-05/margin';

export interface RenderBrushOverlayOptions {
  data: CyberattacksRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLogarithmic<number, number> | ScaleLinear<number, number>;
  xValue: (row: CyberattacksRow) => number;
  yValue: (row: CyberattacksRow) => number;
  height: number;
  margin: Margin;
  setHoveredIndex: (index: number | null) => void;
  onBrushSelect: (rows: CyberattacksRow[]) => void;
  showVoronoi: boolean;
}

// One overlay that covers the plot and owns all pointer interaction:
//   - a d3-brush for drag-selecting a rectangle of marks, and
//   - a nearest-point lookup (Delaunay) for hover, since the brush's full-area
//     overlay would otherwise block the old Voronoi cells from receiving events.
// The Voronoi tessellation is still drawn, but only as the optional "V"
// easter-egg borders (pointer-events: none).
export function renderBrushOverlay(
  group: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBrushOverlayOptions,
) {
  const {
    data,
    xScale,
    yScale,
    xValue,
    yValue,
    height,
    margin,
    setHoveredIndex,
    onBrushSelect,
    showVoronoi,
  } = options;

  const extent: [[number, number], [number, number]] = [
    [xScale.range()[0], margin.top],
    [xScale.range()[1], height - margin.bottom],
  ];

  // The tessellation powers both hover (nearest point) and the optional borders.
  const delaunay = Delaunay.from(
    data,
    (row) => xScale(xValue(row)),
    (row) => yScale(yValue(row)),
  );
  const voronoi = delaunay.voronoi([extent[0][0], extent[0][1], extent[1][0], extent[1][1]]);

  group
    .selectAll<SVGPathElement, CyberattacksRow>('path.voronoi-cell')
    .data(data)
    .join('path')
    .attr('class', 'voronoi-cell')
    .attr('d', (_row, i) => voronoi.renderCell(i))
    .attr('fill', 'none')
    .attr('stroke', showVoronoi ? 'black' : 'none')
    .attr('stroke-width', 1)
    .attr('pointer-events', 'none');

  const brushBehavior = brush<unknown>()
    .extent(extent)
    // Hide the hover tooltip as soon as a drag begins. The hover index set by
    // the last mousemove would otherwise keep the tooltip visible over the very
    // area the user is trying to brush.
    .on('start', () => setHoveredIndex(null))
    .on('end', (event) => {
      const selection = event.selection as BrushSelection | null;
      if (!selection) return;
      // This is a 2-D brush, so the selection is always two corner points.
      const [[x0, y0], [x1, y1]] = selection as [[number, number], [number, number]];
      const selected = data.filter((row) => {
        const px = xScale(xValue(row));
        const py = yScale(yValue(row));
        return x0 <= px && px < x1 && y0 <= py && py < y1;
      });
      if (selected.length > 0) onBrushSelect(selected);
      // Reset the rectangle so the mark highlight is the only persistent cue and
      // the next drag starts clean. This re-fires `end` with a null selection,
      // which the guard above ignores.
      group.call(brushBehavior.move, null);
    });

  group.call(brushBehavior);

  // Hover lives on the brush's overlay because it is the topmost full-area rect.
  group
    .select<SVGRectElement>('.overlay')
    .on('mousemove', (event) => {
      // Ignore motion while the user is dragging out a selection.
      if ((event as MouseEvent).buttons !== 0) return;
      const [mx, my] = pointer(event, group.node());
      const i = delaunay.find(mx, my);
      setHoveredIndex(Number.isInteger(i) && i >= 0 ? i : null);
    })
    .on('mouseleave', () => setHoveredIndex(null));
}
