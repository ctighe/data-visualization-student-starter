import { hatchOpacity, hatchStroke, hatchStrokeWidth, hatchTileSize } from '../../config';
import { HATCH_PATTERN_ID } from './hatch';

// The single diagonal-hatch pattern that marks highlighted incidents across the
// dashboard. Rendered once by the shell inside its `<svg>`; marks elsewhere
// reference it with `HATCH_FILL` (`url(#selected-hatch)`).
//
// `patternUnits="userSpaceOnUse"` keeps the stripes a constant pixel width no
// matter how tall the marked shape is, and since the icicle only translates its
// segments during zoom (it never scales them), the hatch never distorts.
export function HatchPattern() {
  return (
    <defs>
      <pattern
        id={HATCH_PATTERN_ID}
        patternUnits="userSpaceOnUse"
        width={hatchTileSize}
        height={hatchTileSize}
        patternTransform="rotate(45)"
      >
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={hatchTileSize}
          stroke={hatchStroke}
          strokeWidth={hatchStrokeWidth}
          strokeOpacity={hatchOpacity}
        />
      </pattern>
    </defs>
  );
}
