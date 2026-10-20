import type { Margin } from '../../../week-05/margin';
import type { PaneId } from '../types';
import { paneCenterX } from '../paneGeometry';
import {
  axisLabelFontSize,
  title,
  titleFontSize,
  xAxisLabelOffset,
  yAxisLabelOffset,
} from '../../config';

export interface LabelsProps {
  width: number;
  height: number;
  margin: Margin;
  pane: PaneId;
  xOnly: boolean;
  xLabel: string;
  yLabel: string;
}

// Shared titles and axis labels. The pane position comes from paneGeometry so
// every style places labels consistently.
export function Labels({
  width,
  height,
  margin,
  pane,
  xOnly,
  xLabel,
  yLabel,
}: LabelsProps) {
  const plotCenterX = paneCenterX(width, pane, margin);
  const plotCenterY = margin.top + (height - margin.top - margin.bottom) / 2;
  const plotLeft = pane === 1 ? margin.left : width / 2 + margin.left;

  return (
    <g className="labels">
      <text
        className="title"
        x={width / 2}
        y={margin.top / 2}
        textAnchor="middle"
        fontSize={titleFontSize}
      >
        {title}
      </text>
      <text
        className="x-axis-label"
        x={plotCenterX}
        y={height - margin.bottom + xAxisLabelOffset}
        textAnchor="middle"
        fontSize={axisLabelFontSize}
      >
        {xLabel}
      </text>
      {!xOnly && (
        <text
          className="y-axis-label"
          transform={`translate(${plotLeft - yAxisLabelOffset}, ${plotCenterY}) rotate(-90)`}
          textAnchor="middle"
          fontSize={axisLabelFontSize}
        >
          {yLabel}
        </text>
      )}
    </g>
  );
}
