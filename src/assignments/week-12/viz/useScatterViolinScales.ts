import { useMemo } from 'react';
import { extent, max } from 'd3-array';
import { scaleLinear, scaleLog } from 'd3-scale';
import type { ScaleLinear, ScaleLogarithmic } from 'd3-scale';
import type { CyberattacksRow } from '../../week-02/CyberattacksSummary';
import type { Margin } from '../../week-05/margin';
import { paneXRange } from './paneGeometry';
import { groupViolinsByYear } from './violin/aggregate';
import type { ViolinGroup } from './violin/density';
import { violinBandwidth, violinPad, violinThresholds, violinWidthFraction } from '../config';

export interface ScatterViolinScales {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLogarithmic<number, number>;
  halfWidthScale: ScaleLinear<number, number>;
  groups: ViolinGroup[];
}

export interface UseScatterViolinScalesOptions {
  rows: CyberattacksRow[] | null;
  width: number;
  height: number;
  margin: Margin;
  xValue: (row: CyberattacksRow) => number;
  yValue: (row: CyberattacksRow) => number;
}

// Scales for the combined single-pane view: scatter marks plus a violin
// underlay. Both share one x (year) and y (users affected, log) scale so the
// density outlines line up with the points. The plot is expanded on all four
// sides so the padded violin tails and the outermost violins fit inside it.
export function useScatterViolinScales({
  rows,
  width,
  height,
  margin,
  xValue,
  yValue,
}: UseScatterViolinScalesOptions): ScatterViolinScales | null {
  return useMemo(() => {
    if (!rows || rows.length === 0) return null;

    const grouped = groupViolinsByYear(rows, {
      xValue,
      yValue,
      bandwidth: violinBandwidth,
      pad: violinPad,
      bins: violinThresholds,
    });
    if (!grouped) return null;

    const { groups, densityLogExtent } = grouped;

    // Expand the x-domain by half a violin width on each side so the outermost
    // violins sit fully inside the plot instead of spilling into the margins.
    // A violin's maximum half-width is `violinWidthFraction / 2` years.
    const [minYear, maxYear] = extent(rows, xValue) as [number, number];
    const edgePad = violinWidthFraction / 2;
    const [x0, x1] = paneXRange(width, 1, margin, 1);
    const xScale = scaleLinear()
      .domain([minYear - edgePad, maxYear + edgePad])
      .range([x0, x1]);

    // Expand the y-domain to the union of the data extent and the padded
    // density grid, so the violin tails fit fully inside the plot.
    const positiveValues = rows
      .map(yValue)
      .filter((value) => Number.isFinite(value) && value > 0);
    const [dataMin, dataMax] = extent(positiveValues) as [number, number];
    const [densityLo, densityHi] = densityLogExtent;
    const yScale = scaleLog()
      .domain([Math.min(dataMin, 10 ** densityLo), Math.max(dataMax, 10 ** densityHi)])
      .range([height - margin.bottom, margin.top]);

    const maxDensity = max(groups, (group) => max(group.densities, (d) => d.y) ?? 0) ?? 0;
    if (maxDensity <= 0) return null;

    // Size the violins from the pixel gap between consecutive years rather than
    // a band scale, because the x-axis is continuous.
    const yearSpan = xScale.domain()[1] - xScale.domain()[0];
    const yearSpacing = (x1 - x0) / (yearSpan || 1);
    const halfBand = (yearSpacing * violinWidthFraction) / 2;
    const halfWidthScale = scaleLinear().domain([0, maxDensity]).range([0, halfBand]);

    return { xScale, yScale, halfWidthScale, groups };
  }, [rows, width, height, margin, xValue, yValue]);
}
