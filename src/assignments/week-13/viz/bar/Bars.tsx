import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { CategoryDatum } from './aggregate';
import { barFill } from '../../config';

export interface BarsProps {
  data: CategoryDatum[];
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  // Called with the clicked bar's category key. The bar chart uses this to
  // publish the rows that contribute to the bar for linked highlighting.
  onBarClick?: (key: string) => void;
}

// Bars are simple enough to render declaratively in React. They are purely
// decorative: the bar style does not show per-datapoint tooltips, so bars do
// not report hover state. Clicking a bar toggles its linked highlight; the
// hatched highlight band drawn by `BarPane` is non-interactive so clicks always
// reach the base bar.
export function Bars({ data, xScale, yScale, onBarClick }: BarsProps) {
  const barWidth = xScale.bandwidth();

  return (
    <g className="bars">
      {data.map((datum) => {
        const x = xScale(datum.key) ?? 0;
        const y = yScale(datum.value);
        const barHeight = yScale(0) - y;
        return (
          <rect
            key={datum.key}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={barFill}
            className={onBarClick ? 'cursor-pointer' : undefined}
            onClick={onBarClick ? () => onBarClick(datum.key) : undefined}
          />
        );
      })}
    </g>
  );
}
