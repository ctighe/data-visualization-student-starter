import type { ComponentType } from 'react';
import type { CyberattacksRow } from '../../week-02/CyberattacksSummary';
import type { Margin } from '../../week-05/margin';

// The two panes of the dual view. Pane 1 shows rows at or before the time
// split, pane 2 shows rows after it.
export type PaneId = 1 | 2;

// Every selectable visualization style has one of these ids.
export type VizStyleId = 'scatter' | 'bar';

// The tooltip needs to know where a hovered row lives on screen. Styles that
// use Cartesian scales can supply this; the coordinates are relative to the
// visualization container (the same space as the x/y scale outputs).
//
// A row may be missing (no hover yet, a stale index, or an empty pane), so the
// function is total: it returns `null` instead of throwing when it cannot
// position the row.
export type PositionOf = (
  row: CyberattacksRow | null | undefined,
) => [number, number] | null;

// Everything a style renderer needs to draw a single pane. Deliberately does
// not include shared scales: each pane owns a disjoint subset of the data and
// therefore computes its own scales.
export interface PaneContext {
  pane: PaneId;
  rows: CyberattacksRow[];
  width: number;
  height: number;
  margin: Margin;
  colorFor: (row: CyberattacksRow) => string;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  // Styles that can map a row to screen coordinates report a `positionOf`
  // function here so the shell can anchor the shared tooltip.
  setPositionOf: (positionOf: PositionOf | null) => void;
  // The categorical field the bar style aggregates by. Unused by scatter but
  // carried on the shared context so style components stay stateless.
  barField: BarField;
}

// A selectable visualization style. `Pane` draws one pane and `Controls`
// renders optional style-specific settings below the visualization.
export interface VizStyle {
  id: VizStyleId;
  label: string;
  Pane: ComponentType<PaneContext>;
  Controls?: ComponentType<VizControlsProps>;
}

export interface VizControlsProps {
  rows: CyberattacksRow[];
  barField: BarField;
  onBarFieldChange: (field: BarField) => void;
}

// Categorical fields the bar style can aggregate by.
export type BarField = 'attack_type' | 'attack_vector' | 'org_size' | 'impact_data';
