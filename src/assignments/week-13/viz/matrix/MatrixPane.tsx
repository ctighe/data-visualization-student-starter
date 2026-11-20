import { useMemo, useState } from 'react';
import { scaleBand, scaleSequential } from 'd3-scale';
import { interpolateBlues } from 'd3-scale-chromatic';
import { range } from 'd3-array';
import { buildMatrix } from './aggregate';
import { DATA_FIELDS } from './fields';
import { paneXRange } from '../paneGeometry';
import type { PaneContext } from '../types';
import type { MatrixCell } from './types';

// Cell and label styling. Kept here (rather than a stylesheet) so the matrix
// matches the inline-attribute approach the other styles use.
const ZERO_FILL = '#ffffff';
const GRID_BACKGROUND = '#f3f4f6';
const CELL_STROKE = '#e5e7eb';
const CELL_HOVER_STROKE = '#1e3a8a';
const CELL_SELECTED_STROKE = '#dc2626';
const GUIDE_FILL = '#3b82f6';
const COUNT_DARK = '#1e293b';
const COUNT_LIGHT = '#ffffff';
const LABEL_FILL = '#4b5563';
const LABEL_ACTIVE_FILL = '#1d4ed8';
const LABEL_SELECTED_FILL = '#b91c1c';

// Draws one pane of the co-occurrence matrix: a 7x7 grid of cells whose fill
// encodes how many incidents exposed both the row and column data types. The
// two panes share one color domain (from the shell) so their shades are
// directly comparable.
//
// Interaction mirrors the rest of the dashboard: hovering a cell highlights its
// row/column labels and publishes the cell to the shell for the tooltip;
// clicking a cell toggles its contributing rows in the shared selection so the
// scatter and bar views light up too. The grid is small and fixed (49 cells),
// so it is rendered declaratively by React while D3 supplies the scales.
export function MatrixPane({
  pane,
  rows,
  width,
  height,
  margin,
  colorDomain,
  selectedCellKeys,
  onMatrixSelect,
  onMatrixHover,
}: PaneContext) {
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  const data = useMemo(() => buildMatrix(rows), [rows]);

  // Layout: reserve room on the left for the row labels and on top for the
  // rotated column labels, then fit the largest square grid that remains.
  const layout = useMemo(() => {
    const [x0, x1] = paneXRange(width, pane, margin);
    const paneWidth = x1 - x0;
    const rowLabelWidth = Math.min(150, Math.max(70, paneWidth * 0.3));
    const colLabelHeight = Math.min(80, Math.max(44, paneWidth * 0.18));
    const top = margin.top + colLabelHeight + 22;
    const bottom = height - margin.bottom;
    const availW = paneWidth - rowLabelWidth;
    const availH = bottom - top;
    const size = Math.max(60, Math.min(availW, availH));
    const gridX = x0 + rowLabelWidth + Math.max(0, (availW - size) / 2);
    const gridY = top + Math.max(0, (availH - size) / 2);
    return { size, gridX, gridY };
  }, [width, height, margin, pane]);

  const bandScale = useMemo(
    () =>
      scaleBand<number>()
        .domain(range(DATA_FIELDS.length))
        .range([0, layout.size])
        .paddingInner(0.06),
    [layout.size],
  );
  const band = bandScale.bandwidth();

  const colorScale = useMemo(() => {
    const max = colorDomain ? colorDomain[1] : data.maxCount;
    return scaleSequential(interpolateBlues).domain([0, max > 0 ? max : 1]);
  }, [colorDomain, data.maxCount]);
  // The top of the (possibly shared) color domain, used to decide when a cell
  // is dark enough for light count text.
  const colorMax = colorDomain ? colorDomain[1] : data.maxCount;

  // Label indices that belong to any selected cell, so a row/column stays
  // marked while the matrix selection is active.
  const selectedLabels = useMemo(() => {
    const set = new Set<number>();
    for (const key of selectedCellKeys) {
      const [row, col] = key.split('-').map(Number);
      set.add(row);
      set.add(col);
    }
    return set;
  }, [selectedCellKeys]);

  // The year span each pane covers, shown above the grid so the pre/post-AI
  // comparison is unambiguous.
  const yearRange = useMemo(() => {
    if (rows.length === 0) return null;
    let min = Infinity;
    let max = -Infinity;
    for (const row of rows) {
      const year = Math.round(row.year);
      if (year < min) min = year;
      if (year > max) max = year;
    }
    return [min, max] as const;
  }, [rows]);

  const cellKey = (cell: MatrixCell) => `${cell.row}-${cell.col}`;

  const handleEnter = (cell: MatrixCell) => {
    setHovered({ row: cell.row, col: cell.col });
    onMatrixHover({
      cell,
      x: layout.gridX + (bandScale(cell.col) ?? 0) + band / 2,
      y: layout.gridY + (bandScale(cell.row) ?? 0) + band / 2,
    });
  };

  const handleLeave = () => {
    setHovered(null);
    onMatrixHover(null);
  };

  const handleClick = (cell: MatrixCell) => {
    const rowKey = DATA_FIELDS[cell.row].key;
    const colKey = DATA_FIELDS[cell.col].key;
    const contributingRows = rows.filter((row) => row[rowKey] === 'Yes' && row[colKey] === 'Yes');
    onMatrixSelect(cellKey(cell), contributingRows);
  };

  const cellX = (col: number) => layout.gridX + (bandScale(col) ?? 0);
  const cellY = (row: number) => layout.gridY + (bandScale(row) ?? 0);

  const labelColor = (index: number) => {
    if (hovered && (hovered.row === index || hovered.col === index)) return LABEL_ACTIVE_FILL;
    if (selectedLabels.has(index)) return LABEL_SELECTED_FILL;
    return LABEL_FILL;
  };

  const labelWeight = (index: number) =>
    (hovered && (hovered.row === index || hovered.col === index)) || selectedLabels.has(index)
      ? 700
      : 400;

  return (
    <g className={`pane pane-${pane} matrix`}>
      {/* Shared heading, rendered once (over pane 1) so it is centered on the
          whole view rather than repeated above each half. */}
      {pane === 1 && (
        <g className="matrix-heading">
          <text
            x={width / 2}
            y={22}
            textAnchor="middle"
            fontSize={Math.min(18, Math.max(14, width * 0.02))}
            fontWeight={700}
            fill="#111827"
          >
            Co-occurrence of exposed data types
          </text>
          <text x={width / 2} y={40} textAnchor="middle" fontSize={12} fill="#6b7280">
            Incident count where both data types were exposed (&quot;Yes&quot;). Click a cell to
            highlight its incidents.
          </text>
        </g>
      )}

      {yearRange && (
        <text
          x={layout.gridX + layout.size / 2}
          y={margin.top + 14}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="#374151"
        >
          {yearRange[0]}–{yearRange[1]}
        </text>
      )}

      <rect
        x={layout.gridX}
        y={layout.gridY}
        width={layout.size}
        height={layout.size}
        rx={4}
        fill={GRID_BACKGROUND}
      />

      {/* Row/column guides for the hovered cell. */}
      {hovered && (
        <g className="matrix-guides" pointerEvents="none">
          <rect
            x={layout.gridX}
            y={cellY(hovered.row)}
            width={layout.size}
            height={band}
            fill={GUIDE_FILL}
            opacity={0.1}
          />
          <rect
            x={cellX(hovered.col)}
            y={layout.gridY}
            width={band}
            height={layout.size}
            fill={GUIDE_FILL}
            opacity={0.1}
          />
        </g>
      )}

      {/* Cells. */}
      <g className="matrix-cells">
        {data.matrix.map((rowCells) =>
          rowCells.map((cell) => {
            const isHovered = hovered?.row === cell.row && hovered?.col === cell.col;
            const isSelected = selectedCellKeys.has(cellKey(cell));
            return (
              <rect
                key={cellKey(cell)}
                x={cellX(cell.col)}
                y={cellY(cell.row)}
                width={band}
                height={band}
                rx={3}
                fill={cell.count === 0 ? ZERO_FILL : colorScale(cell.count)}
                stroke={
                  isSelected ? CELL_SELECTED_STROKE : isHovered ? CELL_HOVER_STROKE : CELL_STROKE
                }
                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                className="cursor-pointer"
                onMouseEnter={() => handleEnter(cell)}
                onMouseLeave={handleLeave}
                onClick={() => handleClick(cell)}
              />
            );
          }),
        )}
      </g>

      {/* Count labels, only when the cells are large enough to read. */}
      {band > 26 && (
        <g className="matrix-counts" pointerEvents="none">
          {data.matrix.map((rowCells) =>
            rowCells.map((cell) =>
              cell.count > 0 ? (
                <text
                  key={cellKey(cell)}
                  x={cellX(cell.col) + band / 2}
                  y={cellY(cell.row) + band / 2}
                  dy="0.35em"
                  textAnchor="middle"
                  fontSize={Math.max(9, Math.min(13, band * 0.32))}
                  fontWeight={600}
                  fill={cell.count > colorMax * 0.55 ? COUNT_LIGHT : COUNT_DARK}
                >
                  {cell.count}
                </text>
              ) : null,
            ),
          )}
        </g>
      )}

      {/* Row headers (left). */}
      <g className="matrix-row-labels">
        {DATA_FIELDS.map((field, index) => (
          <text
            key={field.key}
            x={layout.gridX - 8}
            y={cellY(index) + band / 2}
            dy="0.32em"
            textAnchor="end"
            fontSize={11}
            fill={labelColor(index)}
            fontWeight={labelWeight(index)}
            className="cursor-pointer select-none"
            onClick={() => handleClick(data.matrix[index][index])}
          >
            {field.label}
          </text>
        ))}
      </g>

      {/* Column headers (top, rotated). Short labels keep them inside a pane. */}
      <g className="matrix-col-labels">
        {DATA_FIELDS.map((field, index) => (
          <g
            key={field.key}
            transform={`translate(${cellX(index) + band / 2}, ${layout.gridY - 8}) rotate(-45)`}
            className="cursor-pointer select-none"
            onClick={() => handleClick(data.matrix[index][index])}
          >
            <text
              x={0}
              y={0}
              dy="0.32em"
              textAnchor="start"
              fontSize={11}
              fill={labelColor(index)}
              fontWeight={labelWeight(index)}
            >
              {field.short}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}
