import { scaleOrdinal } from 'd3-scale';

// Ordinal scale encoding a breach's leaked-data sensitivity. The three levels
// are ordered (Low < Medium < High), so we use an ordered green -> red ramp
// rather than arbitrary categorical hues.
export const IMPACT_DOMAIN = ['Low', 'Medium', 'High'] as const;
export type ImpactLevel = (typeof IMPACT_DOMAIN)[number];

export const IMPACT_LABEL = 'Leaked data sensitivity';

// Deliberately spread across both hue and lightness so the three levels stay
// distinguishable from each other (and from the white background) even where
// marks overlap. Low = dark green, Medium = vivid orange, High = dark red.
const IMPACT_COLORS = ['#2e7d32', '#f57c00', '#b71c1c'];
const UNKNOWN_COLOR = '#cbd5e1';

const impactScale = scaleOrdinal<string, string>().domain(IMPACT_DOMAIN).range(IMPACT_COLORS);

export function colorForImpact(impact: string): string {
  if (!IMPACT_DOMAIN.includes(impact as ImpactLevel)) return UNKNOWN_COLOR;
  return impactScale(impact);
}
