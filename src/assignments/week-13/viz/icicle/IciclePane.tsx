import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { renderIcicle } from './renderIcicle';
import type { IcicleSelectionUpdater } from './renderIcicle';
import type { PaneContext } from '../types';

// Draws the zoomable icicle in one pane. The icicle is a single full-width view,
// so it ignores the split slider and uses the full plot height. D3 owns
// everything under this <g> (layout, zoom transition, click handling), which is
// why the renderer is called from an effect rather than rendered as JSX.
//
// The icicle has no Floating UI tooltip: a floating card covers the hatch band
// that shows the highlighted share of each segment. Hover detail is a native
// `<title>` instead, which the browser draws offset from the pointer.
//
// Highlighting is applied through a second effect calling the updater that
// `renderIcicle` returns. Keeping it out of the render effect is deliberate:
// `renderIcicle` starts by clearing the pane, so rebuilding on every selection
// change would throw away the user's zoom.
export function IciclePane({
  pane,
  rows,
  width,
  height,
  selectedRows,
  onIcicleSelect,
}: PaneContext) {
  const groupRef = useRef<SVGGElement>(null);
  const updateSelectionRef = useRef<IcicleSelectionUpdater | null>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || width <= 0 || height <= 0) return;

    const selection = select(group);
    updateSelectionRef.current = renderIcicle(selection, {
      rows,
      width,
      height,
      onSelect: onIcicleSelect,
    });

    // Drop the rendered segments when the pane unmounts or the data changes, so
    // a stale zoom state never lingers.
    return () => {
      selection.selectAll('*').remove();
      updateSelectionRef.current = null;
    };
  }, [rows, width, height, onIcicleSelect]);

  // Re-apply the highlight in place. Runs after the render effect (effects fire
  // in declaration order), so the updater is always the one for the chart that
  // was just built; the layout props are dependencies so a rebuild also
  // repaints the bands.
  useEffect(() => {
    updateSelectionRef.current?.(selectedRows);
  }, [selectedRows, rows, width, height]);

  return <g ref={groupRef} className={`pane pane-${pane} icicle`} />;
}
