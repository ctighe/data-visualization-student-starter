import { useMemo } from 'react';
import { scaleBand, scaleLinear } from 'd3-scale';
import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { CyberattacksRow } from '../../week-02/CyberattacksSummary';
import type { Margin } from '../../week-05/margin';
import { paneXRange } from './paneGeometry';
import type { PaneId, BarField, BarMetric } from './types';
import { aggregateByCategory } from './bar/aggregate';
import type { CategoryDatum } from './bar/aggregate';

export interface BarScales {
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  data: CategoryDatum[];
}

// Builds band + linear scales for a single bar pane, aggregated by the chosen
// categorical field and measure. Domains come from this pane's rows only.
export function useBarScales(
  rows: CyberattacksRow[] | null,
  width: number,
  height: number,
  margin: Margin,
  pane: PaneId,
  field: BarField,
  metric: BarMetric,
  yDomain?: [number, number] | null,
): BarScales | null {
  return useMemo(() => {
    if (!rows || rows.length === 0) return null;

    const data = aggregateByCategory(rows, field, metric);
    const [x0, x1] = paneXRange(width, pane, margin);

    // A steady padding so category labels have room; bars fill the rest.
    const xScale = scaleBand<string>()
      .domain(data.map((d) => d.key))
      .range([x0, x1])
      .padding(0.2);

    // A shared domain from the shell keeps both panes on the same value scale;
    // otherwise each pane scales to its own largest bar.
    const maxValue = data.reduce((max, d) => Math.max(max, d.value), 0);
    const yScale = scaleLinear()
      .domain(yDomain ?? [0, maxValue])
      .nice()
      .range([height - margin.bottom, margin.top]);

    return { xScale, yScale, data };
  }, [rows, width, height, margin, pane, field, metric, yDomain]);
}
