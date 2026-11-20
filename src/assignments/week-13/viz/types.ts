import type { ComponentType } from 'react';
import type { CyberattacksRow } from '../../week-02/CyberattacksSummary';
import type { Margin } from '../../week-05/margin';
import type { MatrixHover } from './matrix/types';

// The two panes of the dual view. Pane 1 shows rows at or before the time
// split, pane 2 shows rows after it.
export type PaneId = 1 | 2;

// Every selectable visualization style has one of these ids.
export type VizStyleId = 'scatter' | 'bar' | 'matrix' | 'icicle';

// The tooltip needs to know where a hovered row lives on screen. Styles that
// use Cartesian scales can supply this; the coordinates are relative to the
// visualization container (the same space as the x/y scale outputs).
//
// A row may be missing (no hover yet, a stale index, or an empty pane), so the
// function is total: it returns `null` instead of throwing when it cannot
// position the row.
export type PositionOf = (row: CyberattacksRow | null | undefined) => [number, number] | null;

// A set of rows selected in one view, to be emphasized in the others. Today
// only the bar chart creates these; the shape is generic so the scatter can
// publish its own selections later.
export interface RowSelection {
  // Which view created the selection: 'bar', 'scatter', the co-occurrence
  // matrix, or the icicle.
  source: 'bar' | 'scatter' | 'matrix' | 'icicle';
  // Stable identity used to toggle this selection on and off.
  id: string;
  // The rows the selection covers.
  rows: CyberattacksRow[];
  // Provenance for bar selections (unused by other sources).
  field?: BarField;
  metric?: BarMetric;
  pane?: PaneId;
  key?: string;
}

// Everything a style renderer needs to draw a single pane. Deliberately does
// not include shared scales: each pane owns a disjoint subset of the data and
// therefore computes its own scales.
export interface PaneContext {
  pane: PaneId;
  rows: CyberattacksRow[];
  width: number;
  height: number;
  margin: Margin;
  // A y-domain shared by every pane in a dual-pane view, computed by the
  // shell from all rows so both panes use the same vertical scale. `null` for
  // single-pane styles, which scale to their own rows.
  yDomain: [number, number] | null;
  colorFor: (row: CyberattacksRow) => string;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  // Sensitivity level selected in the shared color legend, or null. Styles
  // that color marks by `impact_data` use it to emphasize matching marks
  // across both panes at once.
  highlightedImpact: string | null;
  // Styles that can map a row to screen coordinates publish a `positionOf`
  // function through this callback so the shell can anchor the shared tooltip.
  // It is a plain callback (not a state setter): the shell stores the value in
  // a ref, so publishing a function value is safe and requires no updater
  // wrapper.
  setPositionOf: (positionOf: PositionOf | null) => void;
  // The categorical field and quantitative measure the bar style aggregates
  // by. Unused by scatter but carried on the shared context so style
  // components stay stateless.
  barField: BarField;
  barMetric: BarMetric;
  // The sequential color domain shared by every pane of a style that encodes a
  // value by color (the co-occurrence matrix). `null` for styles that do not
  // use it.
  colorDomain: [number, number] | null;
  // Matrix styles: the cell keys (`"row-col"`) selected in this pane, so the
  // pane can mark them. Empty when nothing is selected.
  selectedCellKeys: ReadonlySet<string>;
  // Union of every active selection, or null when nothing is selected. The
  // scatter uses it the same way it uses `highlightedImpact`.
  selectedRows: ReadonlySet<CyberattacksRow> | null;
  // Bar panes call this when a bar is clicked so the shell can toggle that
  // bar's contributing rows into the shared selection. Unused by scatter.
  onBarSelect: (key: string, contributingRows: CyberattacksRow[]) => void;
  // Scatter panes call this with the rows inside a completed brush so the shell
  // can add them to the shared selection (deduplicated against what is already
  // selected). Unused by bar.
  onBrushSelect: (rows: CyberattacksRow[]) => void;
  // Matrix panes call this when a cell is clicked so the shell can toggle that
  // cell's contributing rows into the shared selection. Unused by the others.
  onMatrixSelect: (key: string, contributingRows: CyberattacksRow[]) => void;
  // Matrix panes publish the hovered cell and its anchor point so the shell can
  // render a cell tooltip; `null` clears it. Unused by the others.
  onMatrixHover: (hover: MatrixHover | null) => void;
  // Icicle panes call this with a segment's path key and every incident beneath
  // it when the user shift-/ctrl-clicks the segment. The shell toggles it into
  // the shared selection. The icicle has no hover tooltip (it would cover the
  // hatch band), so it publishes no hover state. Unused by the others.
  onIcicleSelect: (key: string, contributingRows: CyberattacksRow[]) => void;
}

// A selectable visualization style. `Pane` draws one pane and `Controls`
// renders optional style-specific settings below the visualization.
export interface VizStyle {
  id: VizStyleId;
  label: string;
  Pane: ComponentType<PaneContext>;
  Controls?: ComponentType<VizControlsProps>;
  // Extra space (px) the style needs below the plot for its x-axis ticks and
  // axis label. The shell adds this to the base margin's bottom so styles with
  // larger labels (e.g. the bar chart's rotated categories) never collide with
  // the controls below the visualization.
  bottomMargin: number;
  // How many panes the style draws. Dual-pane styles split the data by the
  // time slider; single-pane styles use all rows in one full-width plot.
  paneCount: 1 | 2;
  // When true, the shell feeds this style every row in the dataset instead of
  // the scatter-filtered subset (which drops rows missing a users-affected
  // measurement). The matrix counts exposed data types, which are recorded for
  // every incident, so it needs the full dataset.
  useAllRows?: boolean;
  // Optional shared y-domain provider. When present, the shell computes one
  // domain from all rows and hands it to every pane so the panes are directly
  // comparable. Styles without it scale each pane to its own rows.
  // `shareYDomain` lets a style opt out per render (the bar chart's toggle);
  // providers that always share (scatter) ignore it.
  sharedYDomain?: (
    rows: CyberattacksRow[],
    options: { barField: BarField; metric: BarMetric; shareYDomain?: boolean },
  ) => [number, number] | null;
  // Optional shared color-domain provider. When present, the shell computes
  // one domain from the two panes' rows and hands it to every pane so a color
  // means the same value on both sides of the time split. Used by the matrix.
  sharedColorDomain?: (
    leftRows: CyberattacksRow[],
    rightRows: CyberattacksRow[],
  ) => [number, number] | null;
}

export interface VizControlsProps {
  rows: CyberattacksRow[];
  barField: BarField;
  onBarFieldChange: (field: BarField) => void;
  // The quantitative measure the bar y-axis encodes.
  barMetric: BarMetric;
  onBarMetricChange: (metric: BarMetric) => void;
  // Bar-style control: when true both panes share one y-domain; when false
  // each pane scales to its own rows.
  shareYDomain: boolean;
  onShareYDomainChange: (share: boolean) => void;
  // Whether any rows are currently selected. Controls use this to show the
  // overlay legend only when the overlay layer is actually visible.
  hasSelection?: boolean;
}

// Categorical fields the bar style can aggregate by.
export type BarField = 'attack_type' | 'attack_vector' | 'org_size' | 'impact_data';

// The quantitative measure the bar y-axis encodes: the number of attacks in a
// category, or the sum of users affected across the rows in it.
export type BarMetric = 'count' | 'users';
