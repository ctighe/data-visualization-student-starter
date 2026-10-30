import { useMemo } from 'react';
import { extent } from 'd3-array';
import { scaleLinear, scaleLog } from 'd3-scale';
import type { ScaleLinear, ScaleLogarithmic } from 'd3-scale';
import type { CyberattacksRow } from '../../week-02/CyberattacksSummary';
import type { Margin } from '../../week-05/margin';
import { paneXRange } from './paneGeometry';
import type { PaneId } from './types';

export interface Accessor {
  (row: CyberattacksRow): number;
}

export interface UsePaneScalesOptions {
  rows: CyberattacksRow[] | null;
  width: number;
  height: number;
  margin: Margin;
  pane: PaneId;
  yLog: boolean;
  xValue: Accessor;
  yValue: Accessor;
}

export interface Scales {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLogarithmic<number, number> | ScaleLinear<number, number>;
}

// Builds the Cartesian scales for a single pane. The domains come from this
// pane's rows alone, so each pane is scaled to its own disjoint subset of the
// data.
export function usePaneScales({
  rows,
  width,
  height,
  margin,
  pane,
  yLog,
  xValue,
  yValue,
}: UsePaneScalesOptions): Scales | null {
  return useMemo(() => {
    // No data yet, so no scales can be constructed.
    if (!rows || rows.length === 0) return null;

    const [x0, x1] = paneXRange(width, pane, margin);

    const xScale = scaleLinear()
      .domain(extent(rows, xValue) as [number, number])
      .range([x0, x1]);

    // Flip the y range so that larger values appear higher on the screen.
    const yScale = (yLog ? scaleLog() : scaleLinear())
      .domain(extent(rows, yValue) as [number, number])
      .range([height - margin.bottom, margin.top]);

    return { xScale, yScale };
  }, [rows, width, height, margin, pane, yLog, xValue, yValue]);
}
