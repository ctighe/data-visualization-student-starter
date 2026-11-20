import { hierarchy, partition } from 'd3-hierarchy';
import type { HierarchyRectangularNode } from 'd3-hierarchy';
import { quantize } from 'd3-interpolate';
import { scaleOrdinal } from 'd3-scale';
import { interpolateRainbow } from 'd3-scale-chromatic';
import { format } from 'd3-format';
import type { Selection } from 'd3-selection';
import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';
import { HATCH_FILL, hatchBandHeight, selectedFraction } from '../shared/hatch';
import { buildIcicleHierarchy } from './hierarchy';
import { ROOT_KEY, pathKeyOf, rowsForPath, tallySelectedPaths } from './paths';
import type { IcicleDatum } from './types';

// Small gutter on three sides: the chart draws its own heading in the top band.
const MARGIN = { top: 64, right: 10, bottom: 10, left: 10 };
const MIN_INNER_SIZE = 240;
const ZOOM_DURATION = 750;
const ROOT_FILL = '#cbd5e1';
const LABEL_FILL = '#111827';
// A segment only gets a label once it is tall enough to hold 10px text.
const LABEL_MIN_HEIGHT = 16;

interface Rect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

// A laid-out node plus the rectangle it is heading toward (`target`) and the
// path key that identifies it. Keeping all three on the node lets the zoom
// transition, the label visibility, the tooltip anchor, and the selection tally
// read one source of truth.
type IcicleNode = HierarchyRectangularNode<IcicleDatum> & { target: Rect; key: string };

// Applies a new highlighted subset to an already-rendered chart. Returning this
// from `renderIcicle` is what keeps highlighting from rebuilding the DOM (and
// therefore from resetting the user's zoom).
export type IcicleSelectionUpdater = (selectedRows: ReadonlySet<CyberattacksRow> | null) => void;

export interface RenderIcicleOptions {
  rows: CyberattacksRow[];
  width: number;
  height: number;
  // Called with a segment's path key and every incident beneath it when the
  // user shift-/ctrl-clicks it.
  onSelect: (key: string, contributingRows: CyberattacksRow[]) => void;
}

const countFormat = format(',d');

// Height of a segment inside its band, leaving a hairline gap between levels.
const rectHeight = (rect: Rect) =>
  Math.max(0, rect.x1 - rect.x0 - Math.min(1, (rect.x1 - rect.x0) / 2));

// A label is only readable while its segment sits inside the visible breadth
// and is tall enough to hold text.
const labelVisible = (rect: Rect, innerWidth: number) =>
  rect.y1 <= innerWidth && rect.y0 >= 0 && rect.x1 - rect.x0 > LABEL_MIN_HEIGHT;

// Full root-to-segment path, skipping the synthetic root so the tooltip reads
// as the three derived dimensions.
const pathOf = (node: IcicleNode) =>
  node
    .ancestors()
    .filter((ancestor) => ancestor.depth > 0)
    .map((ancestor) => ancestor.data.name)
    .reverse();

// Draws the zoomable icicle: exposed data type -> response action -> legal
// aftermath. Incidents are aggregated per path, so each segment's value is a
// count. Clicking a segment zooms it to the full breadth of the plot; clicking
// the focused segment steps back out. Shift-/Ctrl-/Cmd-clicking toggles that
// segment's incidents in the shared highlight. Zooming is a D3 transition, so
// this renderer owns the DOM under the passed <g>.
//
// Returns an updater for the highlighted subset. The pane calls it from a
// separate effect so highlight changes repaint the hatch bands without
// rerunning this renderer (which would reset the zoom).
export function renderIcicle(
  selection: Selection<SVGGElement, unknown, null, undefined>,
  { rows, width, height, onSelect }: RenderIcicleOptions,
): IcicleSelectionUpdater {
  selection.selectAll('*').remove();

  const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, MIN_INNER_SIZE);
  const innerHeight = Math.max(height - MARGIN.top - MARGIN.bottom, MIN_INNER_SIZE);

  // Title and subtitle. The size adapts a little so the long title still fits
  // when the pane is narrow.
  const titleSize = Math.min(18, Math.max(12, width * 0.018));
  selection
    .append('text')
    .attr('x', width / 2)
    .attr('y', 26)
    .attr('text-anchor', 'middle')
    .attr('font-size', titleSize)
    .attr('font-weight', 700)
    .attr('fill', LABEL_FILL)
    .text('Cyberattacks: Exposed Data → Response Actions → Legal Aftermath');

  selection
    .append('text')
    .attr('x', width / 2)
    .attr('y', 46)
    .attr('text-anchor', 'middle')
    .attr('font-size', Math.min(12, Math.max(10, width * 0.012)))
    .attr('fill', '#6b7280')
    .text('Click a segment to zoom in; shift- or ctrl-click it to highlight its incidents.');

  const hierarchyRoot = hierarchy<IcicleDatum>(buildIcicleHierarchy(rows))
    // Only the leaves carry a value; `sum` rolls those counts into ancestors.
    .sum((node) => node.value ?? 0)
    .sort((a, b) => b.height - a.height || (b.value ?? 0) - (a.value ?? 0));

  const topLevel = hierarchyRoot.children ?? [];

  // An empty dataset would leave only the root; say so rather than drawing a
  // single featureless bar.
  if (topLevel.length === 0) {
    selection
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('fill', '#6b7280')
      .text('No incidents to summarize.');
    return () => {};
  }

  // One equal-width band per level of the hierarchy. With the three derived
  // dimensions (root + 3) this fills the plot exactly at scale 4.
  const levelCount = hierarchyRoot.height + 1;
  const breadth = (innerWidth * levelCount) / 4;

  // `partition` takes [breadth, depth]: x is the across-segments axis and y is
  // the level axis, which matches the icicle's horizontal layout.
  const root = partition<IcicleDatum>().size([innerHeight, breadth])(hierarchyRoot) as IcicleNode;
  const nodes = root.descendants() as IcicleNode[];

  // Start with every node's target equal to its layout position, and give each
  // a path key so the selection tally can find it.
  for (const node of nodes) {
    node.target = { x0: node.x0, x1: node.x1, y0: node.y0, y1: node.y1 };
    node.key = node.depth === 0 ? ROOT_KEY : pathKeyOf(pathOf(node));
  }

  // Highlighted incident count and share per node. Refreshed in place by
  // `updateSelection`; the share drives the hatch geometry and the count is
  // reported by the native tooltip.
  const selectedCounts = new Map<IcicleNode, number>();
  const selectedShares = new Map<IcicleNode, number>();
  const hatchHeightOf = (node: IcicleNode) =>
    hatchBandHeight(selectedShares.get(node) ?? 0, rectHeight(node.target));

  // One hue per top-level branch, spread around the color wheel. Segments
  // inherit the hue of the branch they fall under, so a path reads as a color
  // family while depth is conveyed by position.
  const colors = quantize(interpolateRainbow, Math.max(2, topLevel.length + 1));
  const branchColor = scaleOrdinal<string, string>(colors);
  const colorOf = (node: IcicleNode) => {
    if (!node.depth) return ROOT_FILL;
    let branch = node;
    while (branch.depth > 1 && branch.parent) branch = branch.parent as IcicleNode;
    return branchColor(branch.data.name);
  };

  const cellG = selection.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  const cell = cellG
    .selectAll<SVGGElement, IcicleNode>('g.segment')
    .data(nodes)
    .join('g')
    .attr('class', 'segment')
    .attr('transform', (d) => `translate(${d.target.y0},${d.target.x0})`);

  const rect = cell
    .append('rect')
    .attr('width', (d) => Math.max(0, d.target.y1 - d.target.y0 - 1))
    .attr('height', (d) => rectHeight(d.target))
    .attr('fill', colorOf)
    .attr('fill-opacity', (d) => (d.depth ? 0.6 : 0.5))
    .attr('class', 'cursor-pointer')
    .on('click', (event, d) => {
      // Shift/Ctrl/Cmd toggles this segment's incidents in the shared
      // highlight; a plain click keeps its original meaning (zoom).
      const highlight = event.shiftKey || event.ctrlKey || event.metaKey;
      if (highlight) {
        // The root band stands for "everything" and doubles as the zoom-out
        // target, so it is not a selectable group.
        if (d.depth === 0) return;
        event.preventDefault();
        const names = pathOf(d);
        onSelect(pathKeyOf(names), rowsForPath(rows, names));
        return;
      }
      zoom(d);
    });

  // Hatched band over the top fraction of each segment, covering the share of
  // its incidents that are highlighted (by this view or any other). Appended
  // after the base rect and before the label, so text stays on top.
  const hatch = cell
    .append('rect')
    .attr('class', 'icicle-hatch')
    .attr('pointer-events', 'none')
    .attr('fill', HATCH_FILL)
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', (d) => Math.max(0, d.target.y1 - d.target.y0 - 1))
    .attr('height', (d) => hatchHeightOf(d));

  // Segment name plus its incident count. Labels are suppressed (opacity 0) for
  // segments too short to read, so nothing overlaps.
  const text = cell
    .append('text')
    .attr('pointer-events', 'none')
    .attr('user-select', 'none')
    .attr('x', 4)
    .attr('y', 13)
    .attr('font-size', 10)
    .attr('fill', LABEL_FILL)
    .attr('fill-opacity', (d) => (labelVisible(d.target, innerWidth) ? 1 : 0));

  text.append('tspan').text((d) => d.data.name);

  const counts = text
    .append('tspan')
    .attr('fill-opacity', (d) => (labelVisible(d.target, innerWidth) ? 0.7 : 0))
    .text((d) => ` ${countFormat(d.value ?? 0)}`);

  // Hover detail comes from a native SVG <title>. The browser draws that tooltip
  // itself, offset from the pointer, so unlike the Floating UI card it never
  // covers the segment's hatch band. `updateSelection` refreshes the text when
  // the highlighted count changes.
  const titleFor = (node: IcicleNode) => {
    const names = pathOf(node);
    const label = names.length > 0 ? names.join(' → ') : node.data.name;
    const count = node.value ?? 0;
    const selected = selectedCounts.get(node) ?? 0;
    const lines = [label, `${countFormat(count)} incidents`];
    if (selected > 0) {
      const percent = count > 0 ? Math.round((selected / count) * 1000) / 10 : 0;
      lines.push(`${countFormat(selected)} highlighted (${percent}%)`);
    }
    return lines.join('\n');
  };

  const titles = cell.append('title').text(titleFor);

  // The current focus. `root` initially, then whichever segment was clicked.
  let focus: IcicleNode = root;

  // Rewrites every node's target rectangle relative to `next`, so the clicked
  // branch expands to the full breadth. Returns false when the node has no
  // breadth to scale by (which would produce NaN coordinates).
  const applyFocus = (next: IcicleNode) => {
    const span = next.x1 - next.x0;
    if (!(span > 0)) return false;
    for (const node of nodes) {
      node.target = {
        x0: ((node.x0 - next.x0) / span) * innerHeight,
        x1: ((node.x1 - next.x0) / span) * innerHeight,
        y0: node.y0 - next.y0,
        y1: node.y1 - next.y0,
      };
    }
    return true;
  };

  // Every selection transitions on its own. D3 starts transitions created in
  // the same tick with the same duration together, so the segments, their
  // labels, and their counts stay in lockstep.
  const animate = () => {
    cell
      .transition()
      .duration(ZOOM_DURATION)
      .attr('transform', (d) => `translate(${d.target.y0},${d.target.x0})`);

    rect
      .transition()
      .duration(ZOOM_DURATION)
      .attr('height', (d) => rectHeight(d.target));
    hatch
      .transition()
      .duration(ZOOM_DURATION)
      .attr('height', (d) => hatchHeightOf(d));
    text
      .transition()
      .duration(ZOOM_DURATION)
      .attr('fill-opacity', (d) => (labelVisible(d.target, innerWidth) ? 1 : 0));
    counts
      .transition()
      .duration(ZOOM_DURATION)
      .attr('fill-opacity', (d) => (labelVisible(d.target, innerWidth) ? 0.7 : 0));
  };

  // Which segment a click should focus. Clicking the focused segment steps out
  // one level; clicking a leaf focuses its parent, because a leaf has no
  // breadth of its own to expand.
  const focusFor = (clicked: IcicleNode): IcicleNode | null => {
    if (clicked === focus) return (focus.parent as IcicleNode | null) ?? null;
    if (!clicked.children || clicked.children.length === 0 || clicked.x1 - clicked.x0 <= 0) {
      return (clicked.parent as IcicleNode | null) ?? null;
    }
    return clicked;
  };

  function zoom(clicked: IcicleNode) {
    const next = focusFor(clicked);
    if (!next || !applyFocus(next)) return;
    focus = next;
    animate();
  }

  // Tracks whether the bands have been positioned once. The first application
  // (mount, or a rebuild after a resize) sets them without animating so the
  // chart does not grow hatches on load.
  let selectionApplied = false;

  // Applies the highlighted subset in place: recomputes every segment's share
  // and animates its hatch band to the matching height. Called by the pane
  // whenever the shared selection changes, never as part of the initial render.
  function updateSelection(selectedRows: ReadonlySet<CyberattacksRow> | null) {
    const tally = selectedRows ? tallySelectedPaths(selectedRows) : new Map<string, number>();
    for (const node of nodes) {
      const selected = tally.get(node.key) ?? 0;
      selectedCounts.set(node, selected);
      selectedShares.set(node, selectedFraction(selected, node.value ?? 0));
    }
    titles.text(titleFor);

    if (!selectionApplied) {
      selectionApplied = true;
      hatch.attr('height', (d) => hatchHeightOf(d));
      return;
    }

    hatch
      .transition()
      .duration(ZOOM_DURATION)
      .attr('height', (d) => hatchHeightOf(d));
  }

  return updateSelection;
}
