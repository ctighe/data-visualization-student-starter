import type { CyberattacksRow } from '../week-02/CyberattacksSummary';
import type { Margin } from '../week-05/margin';

// Accessors extract the x and y values from each row of the dataset.
export const xValue = (row: CyberattacksRow) => row.year;
export const yValue = (row: CyberattacksRow) => row.num_users_affected;

// Chart configuration. All tweakable values live here in one place so they
// can be adjusted without hunting through the components and render functions.
export const margin: Margin = { top: 60, right: 20, bottom: 20, left: 60 };
export const title = 'Publicly Acknowledged Cyberattacks';
export const titleFontSize = 20;
export const xAxisLabel = 'Year';
export const yAxisLabel = 'Number of Users Affected (LOG)';
export const axisLabelFontSize = 14;
export const xAxisLabelOffset = 140;
export const yAxisLabelOffset = 40;
export const noteText = '2019 data is incomplete';
export const yNoteTextOffset = 40;
export const markWiggleRoom = 0.3;
export const useWiggleRoom = true;

// Scatter y-values span many orders of magnitude, so use a log scale.
export const yLog = true;

// Violin plot. Densities are estimated on log10-transformed users-affected
// values, so bandwidth is measured in log10 units (decades).
export const violinBandwidth = 0.35;
export const violinPad = 2; // in bandwidths, extends the density grid
export const violinThresholds = 40; // density grid points per year
export const violinWidthFraction = 0.9; // max fraction of a band the violin fills
// Violins are drawn as unfilled outlines so the scatter marks stay readable.
export const violinStroke = '#60a5fa';
export const violinStrokeWidth = 1;

// Bar chart. Base bars use `barFill`; the highlighted share of a bar is drawn
// as a hatched band over its top fraction (see the hatch constants below).
export const barFill = '#2563eb';

// Linked-highlight hatch, shared by every view that marks selected incidents
// (the bar chart's fractional band and the icicle's segment bands). A neutral
// dark stroke at medium opacity reads against any fill, so the encoding does not
// depend on the color palette staying what it is today.
export const hatchStroke = '#111827'; // gray-900
export const hatchOpacity = 0.85;
export const hatchStrokeWidth = 1.5;
export const hatchTileSize = 7; // pattern tile edge, in px
export const hatchMinHeight = 2; // keep tiny selections visible
