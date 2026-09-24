import type { CyberattacksRow } from '../week-02/CyberattacksSummary';
import type { Margin } from './margin';

// Accessors extract the x and y values from each row of the dataset.
export const xValue = (row: CyberattacksRow) => row.year;
export const yValue = (row: CyberattacksRow) => row.num_users_affected;

// Chart configuration. All tweakable values live here in one place so they
// can be adjusted without hunting through the components and render functions.
export const margin: Margin = { top: 60, right: 20, bottom: 160, left: 80 };
export const title = 'Publicly Acknowledged Cyberattacks';
export const titleFontSize = 20;
export const xAxisLabel = 'Year';
export const yAxisLabel = 'Number of Users Affected (LOG)';
export const axisLabelFontSize = 14;
export const xAxisLabelOffset = 40;
export const yAxisLabelOffset = 40;
export const noteText = '2019 data is incomplete';
export const yNoteTextOffset = 40;
export const markWiggleRoom = 0.3
export const useWiggleRoom = true;