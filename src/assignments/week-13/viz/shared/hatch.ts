import { hatchMinHeight, hatchOpacity, hatchStroke } from '../../config';

// Id of the shared `<pattern>` rendered once per dashboard by `<HatchPattern>`.
// Every hatched mark references it with `HATCH_FILL`.
export const HATCH_PATTERN_ID = 'selected-hatch';

export const HATCH_FILL = `url(#${HATCH_PATTERN_ID})`;

// The same stroke color/opacity as a CSS color, so HTML swatches (the bar
// controls, the icicle legend) can reproduce the SVG hatch exactly.
export const HATCH_STROKE_CSS = toRgba(hatchStroke, hatchOpacity);

function toRgba(hex: string, alpha: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

// Share of a mark's incidents that are highlighted, in [0, 1]. Missing or
// nonsensical inputs collapse to 0 so callers never divide by zero.
export function selectedFraction(selected: number, total: number): number {
  if (!(total > 0) || !(selected > 0)) return 0;
  return Math.min(1, selected / total);
}

// Height of the hatched band over a mark `fullHeight` px tall. Any non-zero
// selection shows at least `hatchMinHeight` px, so one highlighted incident in a
// tall bar is still visible instead of rounding away to a sub-pixel sliver.
export function hatchBandHeight(fraction: number, fullHeight: number): number {
  if (!(fraction > 0) || !(fullHeight > 0)) return 0;
  return Math.min(fullHeight, Math.max(hatchMinHeight, fraction * fullHeight));
}
