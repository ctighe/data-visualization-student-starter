import { IMPACT_DOMAIN, IMPACT_LABEL, colorForImpact } from '../shared/colorScale';

const FADED_OPACITY = 0.2;
const SWATCH_SIZE = 14;

export interface ColorLegendProps {
  // The sensitivity level currently highlighted by the pointer, or null when
  // nothing is hovered. Owned by the shell so a single legend can drive both
  // panes at once.
  highlightedImpact: string | null;
  setHighlightedImpact: (impact: string | null) => void;
}

// A single color legend shared by both scatter panes. It lives in the shell
// (outside the per-pane SVG) so hovering one entry fades the non-matching
// marks in the left and right panels simultaneously.
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
              <span
                className="inline-block rounded-full transition-transform duration-200"
                style={{
                  width: SWATCH_SIZE,
                  height: SWATCH_SIZE,
                  backgroundColor: colorForImpact(impact),
                  transform: isActive ? 'scale(1.25)' : 'scale(1)',
                }}
              />
              <span className="text-sm text-gray-700">{impact}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
