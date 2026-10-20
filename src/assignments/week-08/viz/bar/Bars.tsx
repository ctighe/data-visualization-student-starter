import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { CategoryCount } from './aggregate';

export interface BarsProps {
  counts: CategoryCount[];
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

// Bars are simple enough to render declaratively in React. Hovering a bar
// reports its index so the shell can show the shared tooltip.
export function Bars({
  counts,
  xScale,
  yScale,
  hoveredIndex,
  setHoveredIndex,
}: BarsProps) {
  return (
    <g className="bars">
      {counts.map((count, i) => {
        const x = xScale(count.key) ?? 0;
        const barWidth = xScale.bandwidth();
        const y = yScale(count.value);
        const barHeight = yScale(0) - y;
        const opacity = hoveredIndex === null || hoveredIndex === i ? 1 : 0.5;
        return (
          <rect
            key={count.key}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill="#2563eb"
            opacity={opacity}
            onMouseOver={() => setHoveredIndex(i)}
            onMouseOut={() => setHoveredIndex(null)}
          />
        );
      })}
    </g>
  );
}
