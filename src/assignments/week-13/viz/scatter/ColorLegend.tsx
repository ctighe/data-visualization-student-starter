import { IMPACT_DOMAIN, IMPACT_LABEL, colorForImpact } from '../shared/colorScale';
import { LEGEND_MARK_AREA, markPath } from './markShapes';

const FADED_OPACITY = 0.2;
const SWATCH_SIZE = 14;
const SWATCH_CENTER = SWATCH_SIZE / 2;

export interface ColorLegendProps {
  // The sensitivity level currently highlighted by the pointer, or null when
  // nothing is hovered. Owned by the shell so a single legend can drive both
  // panes at once.
  highlightedImpact: string | null;
  setHighlightedImpact: (impact: string | null) => void;
}

// A single legend shared by both scatter panes. It lives in the shell (outside
// the per-pane SVG) so hovering one entry fades the non-matching marks in the
// left and right panels simultaneously.
//
// Each swatch draws the same d3 symbol as the marks it stands for (circle /
// square / triangle), so the legend mirrors the plot's shape channel as well as
// its color channel.
export function ColorLegend({ highlightedImpact, setHighlightedImpact }: ColorLegendProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <div className="text-sm font-medium text-gray-600">{IMPACT_LABEL}</div>
      <div className="flex items-center gap-5">
        {IMPACT_DOMAIN.map((impact) => {
          const isActive = highlightedImpact === impact;
          const isDimmed = highlightedImpact !== null && !isActive;
          return (
            <button
              key={impact}
              type="button"
              className="flex items-center gap-1.5 transition-opacity duration-200"
              style={{ opacity: isDimmed ? FADED_OPACITY : 1 }}
              onMouseEnter={() => setHighlightedImpact(impact)}
              onMouseLeave={() => setHighlightedImpact(null)}
              onFocus={() => setHighlightedImpact(impact)}
              onBlur={() => setHighlightedImpact(null)}
            >
              <svg
                className="inline-block transition-transform duration-200"
                width={SWATCH_SIZE}
                height={SWATCH_SIZE}
                style={{ transform: isActive ? 'scale(1.25)' : 'scale(1)' }}
                aria-hidden="true"
              >
                <path
                  d={markPath(impact, LEGEND_MARK_AREA)}
                  transform={`translate(${SWATCH_CENTER},${SWATCH_CENTER})`}
                  fill={colorForImpact(impact)}
                />
              </svg>
              <span className="text-sm text-gray-700">{impact}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
