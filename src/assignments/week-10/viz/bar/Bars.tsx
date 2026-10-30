import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { CategoryCount } from './aggregate';

export interface BarsProps {
  counts: CategoryCount[];
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
}

// Bars are simple enough to render declaratively in React. They are purely
// decorative: the bar style does not show per-datapoint tooltips, so bars do
// not report hover state.
export function Bars({ counts, xScale, yScale }: BarsProps) {
  return (
    <g className="bars">
      {counts.map((count) => {
        const x = xScale(count.key) ?? 0;
        const barWidth = xScale.bandwidth();
        const y = yScale(count.value);
        const barHeight = yScale(0) - y;
        return (
          <rect key={count.key} x={x} y={y} width={barWidth} height={barHeight} fill="#2563eb" />
        );
      })}
    </g>
  );
}
