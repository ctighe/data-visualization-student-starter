import { useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useDimensions } from './useDimensions';
import { useCyberattacksDataset } from '../week-05/CyberattacksSummary';
import { StyleSelector } from './StyleSelector';
import { getVizStyle } from './viz/vizRegistry';
import { Tooltip } from './viz/shared/Tooltip';
import { colorForUsers } from './viz/shared/colorScale';
import type { PaneId, VizStyleId, BarField, PositionOf } from './viz/types';
import type { CyberattacksRow } from '../week-02/CyberattacksSummary';
import { margin, xValue, yValue } from './config';

const numberFormat = new Intl.NumberFormat('en-US');

const VALID_STYLE_IDS: VizStyleId[] = ['scatter', 'bar'];

function parseStyleId(raw: string | null): VizStyleId {
  return raw && (VALID_STYLE_IDS as string[]).includes(raw)
    ? (raw as VizStyleId)
    : 'scatter';
}

export function Week8() {
  const { ref: divRef, dimensions } = useDimensions();
  const data = useCyberattacksDataset();

  // Style selection is URL-driven so the chosen view can be deep linked.
  const [searchParams, setSearchParams] = useSearchParams();
  const vizStyleId = parseStyleId(searchParams.get('viz'));

  // The internal split keeps the existing half-year offset (2014.5 == 2014/15
  // boundary); the slider displays the rounded year.
  const [timeSplit, setTimeSplit] = useState(2014.5);
  const [barField, setBarField] = useState<BarField>('attack_type');

  const [lHoveredIndex, setLHoveredIndex] = useState<number | null>(null);
  const [rHoveredIndex, setRHoveredIndex] = useState<number | null>(null);
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

  const colorFor = useCallback(
    (row: CyberattacksRow) => colorForUsers(row.num_users_affected),
    [],
  );

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
    // Reset hover when switching styles so stale indices do not linger.
    setLHoveredIndex(null);
    setRHoveredIndex(null);
    setSearchParams(next, { replace: true });
  };

  const activeStyle = getVizStyle(vizStyleId);

  // The bottom margin adapts to the active style so larger x-axis labels
  // (e.g. the bar chart's rotated categories) never collide with the style
  // selector below the plot.
  const activeMargin = { ...margin, bottom: activeStyle.bottomMargin };

  const hoveredIndexFor = (pane: PaneId) =>
    pane === 1 ? lHoveredIndex : rHoveredIndex;
  const setHoveredIndexFor = (pane: PaneId) =>
    pane === 1 ? setLHoveredIndex : setRHoveredIndex;

  // Stable publish callbacks so a pane's registration effect only reruns when
  // its own `positionOf` identity changes, not on every shell render.
  const publishLPositionOf = useCallback((positionOf: PositionOf | null) => {
    lPositionOfRef.current = positionOf;
  }, []);
  const publishRPositionOf = useCallback((positionOf: PositionOf | null) => {
    rPositionOfRef.current = positionOf;
  }, []);
  const setPositionOfFor = (pane: PaneId) =>
    pane === 1 ? publishLPositionOf : publishRPositionOf;

  // Bounds-check the hovered indices: a split change re-partitions the rows
  // while an old index may still be stored, so an out-of-range index must
  // resolve to null rather than an undefined row.
  const rowAt = (rows: CyberattacksRow[], index: number | null) =>
    index !== null && index >= 0 && index < rows.length ? rows[index] : null;

  const leftHoveredRow = rowAt(leftRows, lHoveredIndex);
  const rightHoveredRow = rowAt(rightRows, rHoveredIndex);
  const hoveredRow = leftHoveredRow ?? rightHoveredRow;
  const hoveredPane: PaneId | null = leftHoveredRow
    ? 1
    : rightHoveredRow
      ? 2
      : null;

  // The position callbacks are stored in refs (see above), so reading them
  // here intentionally bypasses React's "no refs in render" rule. It is safe
  // in this component: `positionOf` is only used to anchor the tooltip, and
  // every input that can change it (dimensions, split, rows) already triggers
  // a shell render, so the value is fresh whenever a tooltip is shown.
  /* eslint-disable react-hooks/refs */
  const activePositionOf =
    hoveredPane === 1 ? lPositionOfRef.current : rPositionOfRef.current;
  const tooltipPoint =
    hoveredRow && activePositionOf ? activePositionOf(hoveredRow) : null;
  /* eslint-enable react-hooks/refs */

  return (
    <div className="flex h-full w-full flex-col">
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

      <div ref={divRef} className="relative min-h-0 flex-1">
        <svg className="absolute inset-0 h-full w-full" role="img" aria-label="">
          {dimensions.width > 0 && dimensions.height > 0 && (
            <>
              <activeStyle.Pane
                pane={1}
                rows={leftRows}
                width={dimensions.width}
                height={dimensions.height}
                margin={activeMargin}
                colorFor={colorFor}
                barField={barField}
                hoveredIndex={hoveredIndexFor(1)}
                setHoveredIndex={setHoveredIndexFor(1)}
                setPositionOf={setPositionOfFor(1)}
              />
              <activeStyle.Pane
                pane={2}
                rows={rightRows}
                width={dimensions.width}
                height={dimensions.height}
                margin={activeMargin}
                colorFor={colorFor}
                barField={barField}
                hoveredIndex={hoveredIndexFor(2)}
                setHoveredIndex={setHoveredIndexFor(2)}
                setPositionOf={setPositionOfFor(2)}
              />
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
        <StyleSelector value={vizStyleId} onChange={setStyleId} />
        {activeStyle.Controls && (
          <div className="flex justify-center pb-3">
            <activeStyle.Controls
              rows={rows ?? []}
              barField={barField}
              onBarFieldChange={setBarField}
            />
          </div>
        )}
      </div>
    </div>
  );
}
