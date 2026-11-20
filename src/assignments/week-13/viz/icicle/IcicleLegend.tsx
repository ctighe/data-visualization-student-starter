import { HatchSwatch } from '../shared/HatchSwatch';

export interface IcicleLegendProps {
  // Incidents represented by the whole hierarchy.
  total: number;
  // Incidents currently highlighted across every view.
  highlighted: number;
}

// Shell-owned legend for the icicle, centered under the plot like the scatter's
// color legend and the matrix's gradient. Explains the hatch band and reports
// how many incidents are highlighted overall.
export function IcicleLegend({ total, highlighted }: IcicleLegendProps) {
  const percent = total > 0 ? Math.round((highlighted / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <HatchSwatch className="h-3 w-8" />
        <span>Hatched = highlighted incidents</span>
        {highlighted > 0 && (
          <span className="text-gray-400">
            ({highlighted} of {total}, {percent}%)
          </span>
        )}
      </div>
      <div className="text-xs text-gray-400">
        Click a segment to zoom; shift- or ctrl-click it to highlight its incidents
      </div>
    </div>
  );
}
