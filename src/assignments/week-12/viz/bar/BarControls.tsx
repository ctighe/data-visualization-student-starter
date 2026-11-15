import { BAR_FIELD_LABELS, BAR_METRIC_OPTIONS } from './aggregate';
import { barOverlayFill } from '../../config';
import type { VizControlsProps, BarField, BarMetric } from '../types';

const FIELDS = Object.keys(BAR_FIELD_LABELS) as BarField[];

// Style-specific controls shown below the visualization when the bar style is
// active. Lets the user choose the category field, the y-axis measure, and
// whether the two panes share one y-axis domain. Also explains the orange
// selection overlay when one is visible.
export function BarControls({
  barField,
  onBarFieldChange,
  barMetric,
  onBarMetricChange,
  shareYDomain,
  onShareYDomainChange,
  hasSelection,
}: VizControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
      <label className="flex items-center gap-2">
        <span>Group bars by:</span>
        <select
          value={barField}
          onChange={(event) => onBarFieldChange(event.target.value as BarField)}
          className="rounded border border-gray-300 px-2 py-1"
        >
          {FIELDS.map((field) => (
            <option key={field} value={field}>
              {BAR_FIELD_LABELS[field]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span>Y-axis:</span>
        <select
          value={barMetric}
          onChange={(event) => onBarMetricChange(event.target.value as BarMetric)}
          className="rounded border border-gray-300 px-2 py-1"
        >
          {BAR_METRIC_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={shareYDomain}
          onChange={(event) => onShareYDomainChange(event.target.checked)}
          className="h-4 w-4 cursor-pointer"
        />
        <span>Shared y-axis across panels</span>
      </label>
      {hasSelection && (
        <span className="flex items-center gap-2 text-gray-600">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: barOverlayFill }}
            aria-hidden="true"
          />
          <span>Orange bars show the rows you selected</span>
        </span>
      )}
    </div>
  );
}
