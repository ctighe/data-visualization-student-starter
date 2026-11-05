import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useDimensions } from './useDimensions';
import { useCyberattacksDataset } from './CyberattacksSummary';
import { StyleSelector } from './StyleSelector';
import { getVizStyle } from './viz/vizRegistry';
import { Tooltip } from './viz/shared/Tooltip';
import { colorForImpact } from './viz/shared/colorScale';
import { ColorLegend } from './viz/scatter/ColorLegend';
import type { PaneId, VizStyleId, BarField, BarMetric, PositionOf, RowSelection } from './viz/types';
import type { CyberattacksRow } from '../week-02/CyberattacksSummary';
import { margin, xValue, yValue } from './config';

const numberFormat = new Intl.NumberFormat('en-US');

const VALID_STYLE_IDS: VizStyleId[] = ['scatter', 'bar'];

function parseStyleId(raw: string | null): VizStyleId {
  return raw && (VALID_STYLE_IDS as string[]).includes(raw) ? (raw as VizStyleId) : 'scatter';
}

export function Week11() {
  const { ref: divRef, dimensions } = useDimensions();
  const data = useCyberattacksDataset();

  // Style selection is URL-driven so the chosen view can be deep linked.
  const [searchParams, setSearchParams] = useSearchParams();
  const vizStyleId = parseStyleId(searchParams.get('viz'));

  // The internal split keeps the existing half-year offset (2014.5 == 2014/15
  // boundary); the slider displays the rounded year.
  const [timeSplit, setTimeSplit] = useState(2014.5);
  const [barField, setBarField] = useState<BarField>('attack_type');
  // What the bar y-axis encodes: attack counts or summed users affected.
  const [barMetric, setBarMetric] = useState<BarMetric>('count');
  // Bar y-domain sharing toggle. Off by default, which keeps each bar pane
  // scaled to its own largest category count.
  const [barShareYDomain, setBarShareYDomain] = useState(false);

  // Rows selected in one view, to be emphasized in the others. Multi-select:
  // clicking a bar toggles it, while Esc / "Clear highlights" clears all.
  // Selections deliberately survive bar-field, metric, and time-split changes.
  const [rowSelections, setRowSelections] = useState<RowSelection[]>([]);

  const [lHoveredIndex, setLHoveredIndex] = useState<number | null>(null);
  const [rHoveredIndex, setRHoveredIndex] = useState<number | null>(null);
  // Sensitivity level highlighted by the shared color legend. Lives in the
  // shell so one legend row can emphasize matching marks in both panes.
  const [highlightedImpact, setHighlightedImpact] = useState<string | null>(null);
  // Each pane owns its scales, so it publishes a `positionOf` callback that
  // maps a hovered row to local screen coordinates. The shell keeps those
  // callbacks in refs rather than state: a function passed to `useState` is
  // mistaken for an updater function and silently dropped. Refs sidestep that
  // React footgun, and hovering already triggers the render that reads them.
  const lPositionOfRef = useRef<PositionOf | null>(null);
  const rPositionOfRef = useRef<PositionOf | null>(null);

  // Some rows have missing measurements (NA), which would map to undefined
  // positions. Drop those rows so every mark maps to a valid location.
  const rows = useMemo(
    () =>
      data?.filter((row) => Number.isFinite(xValue(row)) && Number.isFinite(yValue(row))) ?? null,
    [data],
  );

  const years = [...new Set(rows?.map((row) => Math.round(row.year)))].sort();
  const minYear = years.length > 0 ? years[0] : 0;
  const maxYear = years.length > 0 ? years[years.length - 1] : 0;

  // Split the data between the left/right panes. Each pane gets a disjoint
  // subset, so each pane computes its own scales.
  const leftRows = useMemo(
    () => rows?.filter((row) => xValue(row) <= timeSplit) ?? [],
    [rows, timeSplit],
  );
  const rightRows = useMemo(
    () => rows?.filter((row) => xValue(row) > timeSplit) ?? [],
    [rows, timeSplit],
  );

  const colorFor = useCallback((row: CyberattacksRow) => colorForImpact(row.impact_data), []);

  // Union of every active selection, as a Set for O(1) membership in the
  // scatter's mark renderer. Null when nothing is selected.
  const selectedRows = useMemo(() => {
    if (rowSelections.length === 0) return null;
    const union = new Set<CyberattacksRow>();
    for (const selection of rowSelections) {
      for (const row of selection.rows ?? []) union.add(row);
    }
    return union;
  }, [rowSelections]);

  // Toggle the bar clicked in `pane` in or out of the selection. Identity
  // excludes the metric because the metric changes a bar's height, not the rows
  // it contains (every category row is stored, per the linked-highlight spec).
  const handleBarSelect = useCallback(
    (pane: PaneId, key: string, contributingRows: CyberattacksRow[]) => {
      const id = `bar|${barField}|${pane}|${key}`;
      setRowSelections((current) => {
        if (current.some((selection) => selection.id === id)) {
          return current.filter((selection) => selection.id !== id);
        }
        return [
          ...current,
          {
            source: 'bar',
            id,
            rows: contributingRows,
            field: barField,
            metric: barMetric,
            pane,
            key,
          } satisfies RowSelection,
        ];
      });
    },
    [barField, barMetric],
  );

  const selectBarPane1 = useCallback(
    (key: string, contributingRows: CyberattacksRow[]) => handleBarSelect(1, key, contributingRows),
    [handleBarSelect],
  );
  const selectBarPane2 = useCallback(
    (key: string, contributingRows: CyberattacksRow[]) => handleBarSelect(2, key, contributingRows),
    [handleBarSelect],
  );
  const onBarSelectFor = (pane: PaneId) => (pane === 1 ? selectBarPane1 : selectBarPane2);

  const clearHighlights = useCallback(() => setRowSelections([]), []);

  // Add a scatter brush selection, dropping rows that are already selected so
  // repeated or overlapping brushes never duplicate points.
  const scatterSelectionId = useRef(0);
  const handleScatterSelect = useCallback((brushRows: CyberattacksRow[]) => {
    if (brushRows.length === 0) return;
    const id = `scatter|${scatterSelectionId.current++}`;
    setRowSelections((current) => {
      const existing = new Set<CyberattacksRow>();
      for (const selection of current) {
        for (const row of selection.rows ?? []) existing.add(row);
      }
      const additions = brushRows.filter((row) => !existing.has(row));
      if (additions.length === 0) return current;
      return [...current, { source: 'scatter', id, rows: additions } satisfies RowSelection];
    });
  }, []);

  // Esc clears highlights when any exist; otherwise it falls through to the
  // app-wide handler that toggles the sidebar. Capture + stopImmediatePropagation
  // lets us consume the key before that handler runs.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || rowSelections.length === 0) return;
      event.stopImmediatePropagation();
      event.preventDefault();
      setRowSelections([]);
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [rowSelections.length]);

  // Changing the split re-partitions the rows, so clear any hover state that
  // points into the old partition.
  const handleSplitChange = (year: number) => {
    setTimeSplit(year - 0.5);
    setLHoveredIndex(null);
    setRHoveredIndex(null);
  };

  const setStyleId = (id: VizStyleId) => {
    const next = new URLSearchParams(searchParams);
    next.set('viz', id);
    // Reset hover and legend highlight when switching styles so stale state
    // does not linger.
    setLHoveredIndex(null);
    setRHoveredIndex(null);
    setHighlightedImpact(null);
    setSearchParams(next, { replace: true });
  };

  const activeStyle = getVizStyle(vizStyleId);
  const paneCount = activeStyle.paneCount;

  // Dual-pane styles share one y-domain across both panes so their vertical
  // scales are directly comparable. Single-pane styles compute their own, so
  // the provider is absent and this stays null. `shareYDomain` lets the bar
  // style honor its toggle and return null (independent panes) when off.
  const sharedYDomain = useMemo(
    () =>
      activeStyle.sharedYDomain?.(rows ?? [], {
        barField,
        metric: barMetric,
        shareYDomain: barShareYDomain,
      }) ?? null,
    [activeStyle, rows, barField, barMetric, barShareYDomain],
  );

  // The bottom margin adapts to the active style so larger x-axis labels
  // (e.g. the bar chart's rotated categories) never collide with the style
  // selector below the plot. Memoized so a stable identity does not force the
  // pane scale/brush effects to re-run on every hover render.
  const activeMargin = useMemo(
    () => ({ ...margin, bottom: activeStyle.bottomMargin }),
    [activeStyle.bottomMargin],
  );

  const hoveredIndexFor = (pane: PaneId) => (pane === 1 ? lHoveredIndex : rHoveredIndex);
  const setHoveredIndexFor = (pane: PaneId) => (pane === 1 ? setLHoveredIndex : setRHoveredIndex);

  // Stable publish callbacks so a pane's registration effect only reruns when
  // its own `positionOf` identity changes, not on every shell render.
  const publishLPositionOf = useCallback((positionOf: PositionOf | null) => {
    lPositionOfRef.current = positionOf;
  }, []);
  const publishRPositionOf = useCallback((positionOf: PositionOf | null) => {
    rPositionOfRef.current = positionOf;
  }, []);
  const setPositionOfFor = (pane: PaneId) => (pane === 1 ? publishLPositionOf : publishRPositionOf);

  // Bounds-check the hovered indices: a split change re-partitions the rows
  // while an old index may still be stored, so an out-of-range index must
  // resolve to null rather than an undefined row.
  const rowAt = (rows: CyberattacksRow[], index: number | null) =>
    index !== null && index >= 0 && index < rows.length ? rows[index] : null;

  // The rows a pane actually renders. Single-pane styles give pane 1 all rows;
  // dual-pane styles split at `timeSplit`. A pane's hover index is relative to
  // this same array, so the tooltip lookup must resolve against it too.
  const paneRowsFor = (pane: PaneId): CyberattacksRow[] =>
    pane === 1 ? (paneCount === 1 ? rows ?? [] : leftRows) : rightRows;

  const leftHoveredRow = rowAt(paneRowsFor(1), lHoveredIndex);
  const rightHoveredRow = paneCount === 2 ? rowAt(paneRowsFor(2), rHoveredIndex) : null;
  const hoveredRow = leftHoveredRow ?? rightHoveredRow;
  const hoveredPane: PaneId | null = leftHoveredRow ? 1 : rightHoveredRow ? 2 : null;

  // The position callbacks are stored in refs (see above), so reading them
  // here intentionally bypasses React's "no refs in render" rule. It is safe
  // in this component: `positionOf` is only used to anchor the tooltip, and
  // every input that can change it (dimensions, split, rows) already triggers
  // a shell render, so the value is fresh whenever a tooltip is shown.
  /* eslint-disable react-hooks/refs */
  const activePositionOf = hoveredPane === 1 ? lPositionOfRef.current : rPositionOfRef.current;
  const tooltipPoint = hoveredRow && activePositionOf ? activePositionOf(hoveredRow) : null;
  /* eslint-enable react-hooks/refs */

  return (
    <div className="flex h-full w-full flex-col">
      {paneCount === 2 && (
        <div className="flex h-10 w-full shrink-0">
          <label className="flex w-full items-center justify-center gap-2">
            <span>Year to split the data:</span>
            <input
              type="range"
              min={minYear}
              max={maxYear}
              step={1}
              value={Math.round(timeSplit)}
              onChange={(event) => handleSplitChange(parseFloat(event.target.value))}
              className="h-2 w-48 cursor-pointer appearance-none rounded-lg bg-gray-200"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              {Math.round(timeSplit)}
            </span>
          </label>
        </div>
      )}

      <div ref={divRef} className="relative min-h-0 flex-1">
        <svg className="absolute inset-0 h-full w-full" role="img" aria-label="">
          {dimensions.width > 0 && dimensions.height > 0 && (
            <>
              <activeStyle.Pane
                pane={1}
                rows={paneRowsFor(1)}
                width={dimensions.width}
                height={dimensions.height}
                margin={activeMargin}
                yDomain={sharedYDomain}
                colorFor={colorFor}
                barField={barField}
                barMetric={barMetric}
                hoveredIndex={hoveredIndexFor(1)}
                setHoveredIndex={setHoveredIndexFor(1)}
                setPositionOf={setPositionOfFor(1)}
                highlightedImpact={highlightedImpact}
                selectedRows={selectedRows}
                onBarSelect={onBarSelectFor(1)}
                onBrushSelect={handleScatterSelect}
              />
              {paneCount === 2 && (
                <activeStyle.Pane
                  pane={2}
                  rows={rightRows}
                  width={dimensions.width}
                  height={dimensions.height}
                  margin={activeMargin}
                  yDomain={sharedYDomain}
                  colorFor={colorFor}
                  barField={barField}
                  barMetric={barMetric}
                  hoveredIndex={hoveredIndexFor(2)}
                  setHoveredIndex={setHoveredIndexFor(2)}
                  setPositionOf={setPositionOfFor(2)}
                  highlightedImpact={highlightedImpact}
                  selectedRows={selectedRows}
                  onBarSelect={onBarSelectFor(2)}
                  onBrushSelect={handleScatterSelect}
                />
              )}
            </>
          )}
        </svg>

        {hoveredRow && tooltipPoint && (
          <Tooltip anchorRef={divRef} x={tooltipPoint[0]} y={tooltipPoint[1]}>
            <div className="font-medium">{hoveredRow.organisation}</div>
            <div>Detected by: {hoveredRow.detector}</div>
            {Number.isFinite(hoveredRow.num_users_affected) && (
              <div>Users affected: {numberFormat.format(hoveredRow.num_users_affected)}</div>
            )}
            <div>Leaked data sensitivity: {hoveredRow.impact_data}</div>
            <div>Attack summary: {hoveredRow.summary}</div>
          </Tooltip>
        )}
      </div>

      <div className="shrink-0">
        {/* One shared legend centered under both panels; only the scatter
            style encodes marks by data sensitivity. */}
        {vizStyleId === 'scatter' && (
          <ColorLegend
            highlightedImpact={highlightedImpact}
            setHighlightedImpact={setHighlightedImpact}
          />
        )}
        <StyleSelector
          value={vizStyleId}
          onChange={setStyleId}
          onClearHighlights={clearHighlights}
          hasHighlights={rowSelections.length > 0}
        />
        {activeStyle.Controls && (
          <div className="flex justify-center pb-3">
            <activeStyle.Controls
              rows={rows ?? []}
              barField={barField}
              onBarFieldChange={setBarField}
              barMetric={barMetric}
              onBarMetricChange={setBarMetric}
              shareYDomain={barShareYDomain}
              onShareYDomainChange={setBarShareYDomain}
              hasSelection={selectedRows !== null && selectedRows.size > 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}
