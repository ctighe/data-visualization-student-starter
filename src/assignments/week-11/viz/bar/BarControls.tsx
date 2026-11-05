import { BAR_FIELD_LABELS } from './aggregate';
import type { VizControlsProps, BarField } from '../types';

const FIELDS = Object.keys(BAR_FIELD_LABELS) as BarField[];

// Style-specific controls shown below the visualization when the bar style is
// active. Lets the user choose which categorical field to aggregate by and
// whether the two panes share one y-axis domain.
export function BarControls({
  barField,
  onBarFieldChange,
  shareYDomain,
  onShareYDomainChange,
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
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={shareYDomain}
          onChange={(event) => onShareYDomainChange(event.target.checked)}
          className="h-4 w-4 cursor-pointer"
        />
        <span>Shared y-axis across panels</span>
      </label>
    </div>
  );
}
