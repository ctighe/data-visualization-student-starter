import { BAR_FIELD_LABELS } from './aggregate';
import type { VizControlsProps, BarField } from '../types';

const FIELDS = Object.keys(BAR_FIELD_LABELS) as BarField[];

// Style-specific control shown below the visualization when the bar style is
// active. Lets the user choose which categorical field to aggregate by.
export function BarControls({ barField, onBarFieldChange }: VizControlsProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
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
  );
}
