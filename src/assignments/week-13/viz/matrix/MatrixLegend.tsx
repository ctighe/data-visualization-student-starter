import { scaleSequential } from 'd3-scale';
import { interpolateBlues } from 'd3-scale-chromatic';

export interface MatrixLegendProps {
  // The shared color domain `[0, max]` both matrix panes use.
  domain: [number, number];
}

const STOPS = 10;

// The sequential color legend for the co-occurrence matrix. Like the scatter's
// impact legend it lives in the shell, outside the per-pane SVG, so one legend
// describes the single color scale shared by both panes.
export function MatrixLegend({ domain }: MatrixLegendProps) {
  const [min, max] = domain;
  const scale = scaleSequential(interpolateBlues).domain(domain);
  const colors = Array.from({ length: STOPS + 1 }, (_, i) =>
    scale(min + (i / STOPS) * (max - min)),
  );
  const gradient = `linear-gradient(to right, ${colors.join(', ')})`;

  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <div className="text-sm font-medium text-gray-600">Co-occurrence count</div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">{min}</span>
        <div
          className="h-3 w-40 rounded-sm border border-gray-300"
          style={{ background: gradient }}
        />
        <span className="text-xs text-gray-500">{max}</span>
      </div>
      <div className="text-xs text-gray-400">Diagonal = single-field total</div>
    </div>
  );
}
