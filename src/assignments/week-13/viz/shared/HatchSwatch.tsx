import { hatchStrokeWidth, hatchTileSize } from '../../config';
import { HATCH_STROKE_CSS } from './hatch';

export interface HatchSwatchProps {
  // Sizing comes from the caller so the same swatch works inline in the bar
  // controls and as a wider sample in the icicle legend.
  className?: string;
}

// HTML twin of the SVG `<HatchPattern>`, for legends and control rows that live
// outside the SVG. Uses the same stroke color, opacity, and tile size so the
// sample matches the marks it explains.
export function HatchSwatch({ className = 'h-3 w-3' }: HatchSwatchProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-sm border border-gray-300 ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, ${HATCH_STROKE_CSS} 0 ${hatchStrokeWidth}px, transparent ${hatchStrokeWidth}px ${hatchTileSize}px)`,
      }}
    />
  );
}
