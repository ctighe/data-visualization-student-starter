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
  // Optional styling so the same component can draw both the base layer and
  // the selection overlay. Defaults reproduce the base layer exactly.
  fill?: string;
  opacity?: number;
  pointerEvents?: 'auto' | 'none';
  // Inset the bars within their band by this fraction of the band width on each
  // side. The overlay uses a small inset so the base bar's edges remain visible.
  inset?: number;
}

// Bars are simple enough to render declaratively in React. They are purely
// decorative: the bar style does not show per-datapoint tooltips, so bars do
// not report hover state. Clicking a base bar toggles its linked highlight; the
// overlay layer is non-interactive so clicks always reach the base layer.
export function Bars({
  data,
  xScale,
  yScale,
  onBarClick,
  fill = barFill,
  opacity = 1,
  pointerEvents = 'auto',
  inset = 0,
}: BarsProps) {
  const bandWidth = xScale.bandwidth();
  const barWidth = bandWidth * (1 - 2 * inset);
  const offset = bandWidth * inset;

  return (
    <g className="bars" opacity={opacity} pointerEvents={pointerEvents}>
      {data.map((datum) => {
        const x = (xScale(datum.key) ?? 0) + offset;
        const y = yScale(datum.value);
        const barHeight = yScale(0) - y;
        return (
          <rect
            key={datum.key}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={fill}
            className={onBarClick ? 'cursor-pointer' : undefined}
            onClick={onBarClick ? () => onBarClick(datum.key) : undefined}
          />
        );
      })}
    </g>
  );
}
