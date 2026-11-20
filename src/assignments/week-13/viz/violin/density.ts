// A one-dimensional Gaussian kernel density estimate.
//
// The violin plot smooths each year's users-affected values into a density
// curve. Callers pass log10-transformed values so the estimate is computed in
// log space, where a fixed bandwidth stays meaningful across the many orders
// of magnitude this dataset spans.

export interface DensityPoint {
  // Position on the (log10) value axis.
  x: number;
  // Kernel density at `x`.
  y: number;
}

export interface DensityOptions {
  // Smoothing bandwidth, in the same units as the values (log10 decades here).
  bandwidth: number;
  // Extends the evaluation grid beyond the data by this many bandwidths, so
  // the tails of the density are visible.
  pad: number;
  // Number of grid points to evaluate.
  bins: number;
}

// One density curve, ready to be drawn as a violin.
export interface ViolinGroup {
  year: number;
  densities: DensityPoint[];
}

const SQRT_2PI = Math.sqrt(2 * Math.PI);

// Evaluates a Gaussian KDE over `values`. Returns an empty array for no data.
export function density1d(values: number[], options: DensityOptions): DensityPoint[] {
  const { bandwidth, pad, bins } = options;
  const n = values.length;
  if (n === 0) return [];

  const gridBins = Math.max(2, Math.floor(bins));

  let min = values[0];
  let max = values[0];
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }

  // A single value (or all-equal values) has no spread; give the grid a small
  // symmetric span so the density still has a finite shape.
  const span = max - min || bandwidth;
  const center = (min + max) / 2;
  const lo = center - span / 2 - pad * bandwidth;
  const hi = center + span / 2 + pad * bandwidth;
  const step = (hi - lo) / (gridBins - 1);

  const normalization = 1 / (n * bandwidth * SQRT_2PI);
  const points: DensityPoint[] = [];
  for (let i = 0; i < gridBins; i++) {
    const x = lo + i * step;
    let sum = 0;
    for (let j = 0; j < n; j++) {
      const z = (x - values[j]) / bandwidth;
      sum += Math.exp(-0.5 * z * z);
    }
    points.push({ x, y: normalization * sum });
  }
  return points;
}
