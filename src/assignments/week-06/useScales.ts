import { useMemo } from 'react';
import { extent } from 'd3-array';
import { scaleLinear, scaleLog } from 'd3-scale';
import { numPanes } from './config';
import type { ScaleLinear, ScaleLogarithmic } from 'd3-scale';
import type { CyberattacksRow } from '../week-02/CyberattacksSummary';
import type { Margin } from '../week-05/margin';

export interface Accessor {
  (row: CyberattacksRow): number;
}

export interface UseScalesOptions {
  xdata: CyberattacksRow[] | null;
  ydata: CyberattacksRow[] | null;
  width: number;
  height: number;
  margin: Margin;
  pane: number;
  yLog: boolean;
  xValue: Accessor;
  yValue: Accessor;
}

export interface Scales {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLogarithmic<number, number> | ScaleLinear<number,number>;
}

export function useScales({
  xdata,
  ydata,
  width,
  height,
  margin,
  pane,
  yLog,
  xValue,
  yValue,
}: UseScalesOptions): Scales | null {
  return useMemo(() => {
    // No data yet, so no scales can be constructed.
    if (!xdata || !ydata) return null;

    const leftBuffer = pane === 1 ? 0 : width/numPanes*(pane-1)

    // The domain maps data space, and the range maps to screen space.
    // The range is inset by the margin so the plot area leaves room
    // for the axes and labels around it.
    const xScale = scaleLinear()
      // `extent` returns the min and max of the data for the domain.
      .domain(extent(xdata, xValue) as [number, number])
      .range([leftBuffer + margin.left*1.1, leftBuffer + width/2 - margin.right]);

    // Flip the y range so that larger values appear higher on the screen.

    const yScale = (yLog? scaleLog() : scaleLinear())
      .domain(extent(ydata, yValue) as [number, number])
      .range([height - margin.bottom, margin.top]);

    return { xScale, yScale };
  }, [xdata, ydata, width, height, margin, xValue, yValue]);
}
