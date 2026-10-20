import { scaleSequentialLog } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';

// A shared color scale for encoding magnitude (users affected). Kept in one
// place so every style encodes the same value with the same colors.
const colorScale = scaleSequentialLog(interpolateYlOrRd).domain([1, 1_000_000_000]);

export function colorForUsers(users: number): string {
  if (!Number.isFinite(users) || users <= 0) return '#cbd5e1';
  return colorScale(users);
}
