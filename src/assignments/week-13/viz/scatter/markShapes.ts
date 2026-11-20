import { symbol, symbolCircle, symbolSquare, symbolTriangle } from 'd3-shape';
import type { SymbolType } from 'd3-shape';
import type { ImpactLevel } from '../shared/colorScale';

// Shape is a second channel for leaked-data sensitivity, layered on top of the
// existing color scale (which is unchanged). Encoding the level twice keeps the
// marks distinguishable without relying on color alone — grayscale printing,
// color-vision deficiency, and overlapping marks all stay readable.
const SHAPES: Record<ImpactLevel, SymbolType> = {
  Low: symbolCircle,
  Medium: symbolSquare,
  High: symbolTriangle,
};

// Rows whose sensitivity is missing/unknown keep the grey fallback color and get
// a circle, so the shape channel never claims a level the data does not state.
const FALLBACK_SHAPE = symbolCircle;

export function shapeForImpact(impact: string): SymbolType {
  return SHAPES[impact as ImpactLevel] ?? FALLBACK_SHAPE;
}

// d3 symbols are sized by area, which is what keeps the three shapes optically
// balanced (a square and a triangle of equal area look neither heavier nor
// lighter than a circle). These areas reproduce the previous circle radii of
// 3px, or 4px when hovered.
export const MARK_AREA = Math.PI * 3 * 3;
export const HOVERED_MARK_AREA = Math.PI * 4 * 4;

// Legend swatch area: small enough that the triangle's ~13.6px base still fits
// inside the 14px swatch box.
export const LEGEND_MARK_AREA = 80;

// Path data for one mark, centered on the origin so callers can position it with
// a plain translate. Using paths (rather than a <circle> element) is what lets
// one data join render three different shapes.
export function markPath(impact: string, area: number): string {
  // d3-shape returns null only when a canvas context is supplied; these symbols
  // are always rendered as SVG path data.
  return symbol(shapeForImpact(impact), area)() ?? '';
}
