import { useMemo } from 'react';
import { scaleBand, scaleLinear } from 'd3-scale';
import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { CyberattacksRow } from '../../week-02/CyberattacksSummary';
import type { Margin } from '../../week-05/margin';
import { paneXRange } from './paneGeometry';
import type { PaneId, BarField } from './types';
import { countByCategory } from './bar/aggregate';

export interface BarScales {
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  counts: { key: string; value: number }[];
}

// Builds band + linear scales for a single bar pane, aggregated by the chosen
// categorical field. Domains come from this pane's rows only.
export function useBarScales(
  rows: CyberattacksRow[] | null,
  width: number,
  height: number,
  margin: Margin,
  pane: PaneId,
  field: BarField,
): BarScales | null {
  return useMemo(() => {
    if (!rows || rows.length === 0) return null;

    const counts = countByCategory(rows, field);
    const [x0, x1] = paneXRange(width, pane, margin);

    // A steady padding so category labels have room; bars fill the rest.
    const xScale = scaleBand<string>()
      .domain(counts.map((c) => c.key))
      .range([x0, x1])
      .padding(0.2);

    const maxCount = counts.reduce((max, c) => Math.max(max, c.value), 0);
    const yScale = scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([height - margin.bottom, margin.top]);

    return { xScale, yScale, counts };
  }, [rows, width, height, margin, pane, field]);
}
