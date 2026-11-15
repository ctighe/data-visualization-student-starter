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

// Bar chart. The base layer uses `barFill`; when rows are selected an orange
// overlay layer is drawn on top at reduced opacity, slightly inset so the base
// bar's edges stay visible around it.
export const barFill = '#2563eb';
export const barOverlayFill = '#f97316'; // orange-500
export const barOverlayOpacity = 0.5;
export const barOverlayInset = 0.12; // fraction of the band width inset per side
