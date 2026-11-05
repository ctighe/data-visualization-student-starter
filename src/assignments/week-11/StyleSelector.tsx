import { VIZ_STYLE_LIST } from './viz/vizRegistry';
import type { VizStyleId } from './viz/types';

export interface StyleSelectorProps {
  value: VizStyleId;
  onChange: (id: VizStyleId) => void;
}

// The button row below the visualization that switches between styles. Also
// hosts any style-specific controls registered on the active style.
export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-200 bg-white py-3">
      <span className="mr-1 text-sm font-medium text-gray-500">View:</span>
      {VIZ_STYLE_LIST.map((style) => (
        <button
          key={style.id}
          onClick={() => onChange(style.id)}
          className={`rounded px-3 py-1.5 text-sm transition-colors ${
            value === style.id
              ? 'bg-gray-900 font-semibold text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {style.label}
        </button>
      ))}
    </div>
  );
}
