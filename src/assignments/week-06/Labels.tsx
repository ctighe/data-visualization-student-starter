import type { Margin } from '../week-05/margin';
import {
  axisLabelFontSize,
  title,
  titleFontSize,
  xAxisLabel,
  xAxisLabelOffset,
  yAxisLabel,
  yAxisLabelOffset,
  numPanes,
} from './config';

export interface LabelsProps {
  width: number;
  height: number;
  margin: Margin;
  pane: number;
  xonly: boolean;
}

export function Labels({ width, height, margin, pane, xonly }: LabelsProps) {
  // The centers of the plot area define where the axis labels are centered.
  const plotCenterX = margin.left + (width*pane/numPanes - margin.left - margin.right) - width/(numPanes*2);
  const plotCenterY = margin.top + (height - margin.top - margin.bottom) / 2;

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
        {xAxisLabel}
      </text>
      {!xonly && (
      <text
        className="y-axis-label"
        transform={`translate(${margin.left - yAxisLabelOffset + (pane-1)*width/2}, ${plotCenterY}) rotate(-90)`}
        textAnchor="middle"
        fontSize={axisLabelFontSize}
      >
        {yAxisLabel}
      </text>
      )}
      
    </g>
  );
}
