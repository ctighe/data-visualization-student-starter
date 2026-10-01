import { useEffect, useMemo, useState } from 'react';
import { useDimensions } from './useDimensions';
import { useCyberattacksDataset } from '../week-05/CyberattacksSummary';
import { useScales } from './useScales';
import { Marks } from './Marks';
import { Axes } from './Axes';
import { Labels } from './Labels';
import { VoronoiOverlay } from './VoronoiOverlay';
import { Tooltip } from './Tooltip';
import { margin, xValue, yValue } from './config';

const numberFormat = new Intl.NumberFormat('en-US');


export function ProjV1() {
  const { ref: divRef, dimensions } = useDimensions();
  const data = useCyberattacksDataset();
  const [lHoveredIndex, setLHoveredIndex] = useState<number | null>(null);
  const [rHoveredIndex, setRHoveredIndex] = useState<number | null>(null);
  const [showVoronoi, setShowVoronoi] = useState(false);
  const [timeSplit, setTimeSplit] = useState(2014.5);
  


  // Some rows in the dataset have missing measurements (NA), which would
  // map to undefined circle positions and render as stray dots at the
  // origin. Drop those rows so every remaining row maps to a valid circle.
  const rows = useMemo(
    () =>
      data?.filter((row) => Number.isFinite(xValue(row)) && Number.isFinite(yValue(row))) ?? null,
    [data],
  );
  const years = [...new Set(rows?.map((row) => Math.round(row.year)))].sort()

  // Split the data between the left/right views
  const leftRows = rows?.filter((row) => xValue(row) <= timeSplit) ?? null
  const rightRows = rows?.filter((row) => xValue(row) > timeSplit) ?? null

  const leftScales = useScales({ xdata: leftRows, ydata: rows, ...dimensions, margin, pane:1, yLog:true, xValue, yValue });
  const rightScales = useScales({ xdata: rightRows, ydata:rows, ...dimensions, margin, pane:2, yLog:true, xValue, yValue });
  const scales = [leftScales,rightScales]

  // Easter egg: pressing "V" toggles the Voronoi cell borders on and off.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'v') {
        setShowVoronoi((shown) => !shown);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // The Voronoi overlay reports which row is hovered; everything else is
  // derived from that single piece of state.
  var hoveredRow = null;
  var hoveredPane = null;
  if (lHoveredIndex !== null && leftRows !== null) {
    hoveredRow = leftRows[lHoveredIndex] ?? null;
    hoveredPane = 0;
  }
  if (rHoveredIndex !== null && rightRows !== null) {
    hoveredRow = rightRows[rHoveredIndex] ?? null;
    hoveredPane = 1;
  }
  // const leftHoveredRow = lHoveredIndex === null || leftRows === null ? null : (leftRows[lHoveredIndex] ?? null);
  // const rightHoveredRow = rHoveredIndex === null || rightRows === null ? null : (rightRows[rHoveredIndex] ?? null);

  // The hovered row is the logical anchor. The scales turn its data values
  // into coordinates within the visualization container; the Tooltip takes it
  // from there and converts to viewport coordinates.
  const tooltipX = hoveredRow && hoveredPane !== null ? scales[hoveredPane]?.xScale(xValue(hoveredRow)) ?? 0 : 0;
  const tooltipY = hoveredRow && hoveredPane !== null ? (scales[hoveredPane]?.yScale(yValue(hoveredRow)) ?? 0) : 0;
  

  // const tooltipX = hoveredRow && hoveredPane && scales[0] && scales[1] ? scales[hoveredPane].xScale(xValue(hoveredRow)) : 0;
  // const tooltipY = hoveredRow && hoveredPane && scales[0] && scales[1] ? leftScales.yScale(yValue(leftHoveredRow)) : 0;

  return (
    <><div ref={divRef} className="relative w-full h-full">
      <div className='flex w-full h-10'>
      <label className='flex w-full justify-center items-center gap-2'>
        <span>Year to split the data:</span>
        <select
          className="rounded border border-slate-300 p-2"
          value={Math.round(timeSplit)}
          onChange={(event) => setTimeSplit(parseFloat(event.target.value) - 0.5)}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
      </div>
      <div id="svg image" className="relative w-full h-full">
        <svg
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label=""
        >
          {leftRows && rightRows && scales[0] && scales[1] && dimensions.width > 0 && dimensions.height > 0 && (
            <>
              {/* Set up the first view/pane */}
              <g className="left pane">
                <Marks
                  data={leftRows}
                  xScale={scales[0].xScale}
                  yScale={scales[0].yScale}
                  xValue={xValue}
                  yValue={yValue}
                  hoveredIndex={lHoveredIndex} />
                <Axes
                  xScale={scales[0].xScale}
                  yScale={scales[0].yScale}
                  height={dimensions.height}
                  margin={margin} />
                <Labels width={dimensions.width} height={dimensions.height} margin={margin} pane={1} xonly={false} />

                <VoronoiOverlay
                  data={leftRows}
                  xScale={scales[0].xScale}
                  yScale={scales[0].yScale}
                  xValue={xValue}
                  yValue={yValue}
                  height={dimensions.height}
                  margin={margin}
                  setHoveredIndex={setLHoveredIndex}
                  showVoronoi={showVoronoi} />
              </g>

              <g className="right pane">
                {/* Set up the second view/pane */}
                <Marks
                  data={rightRows}
                  xScale={scales[1].xScale}
                  yScale={scales[1].yScale}
                  xValue={xValue}
                  yValue={yValue}
                  hoveredIndex={rHoveredIndex} />
                <Axes
                  xScale={scales[1].xScale}
                  yScale={scales[1].yScale}
                  height={dimensions.height}
                  margin={margin} />
                <Labels width={dimensions.width} height={dimensions.height} margin={margin} pane={2} xonly={true} />

                <VoronoiOverlay
                  data={rightRows}
                  xScale={scales[1].xScale}
                  yScale={scales[1].yScale}
                  xValue={xValue}
                  yValue={yValue}
                  height={dimensions.height}
                  margin={margin}
                  setHoveredIndex={setRHoveredIndex}
                  showVoronoi={showVoronoi} />
              </g>
            </>
          )}
        </svg>
      </div>
      {hoveredRow && leftScales && (
        <Tooltip anchorRef={divRef} x={tooltipX} y={tooltipY}>
          <div className="font-medium">{hoveredRow.organisation}</div>
          <div>Detected by: {hoveredRow.detector}</div>
          {/* <div>Bill depth: {hoveredRow.bill_depth_mm} mm</div> */}
          {Number.isFinite(hoveredRow.num_users_affected) && (
            <div>Users affected: {numberFormat.format(hoveredRow.num_users_affected)}</div>
          )}
          <div>Leaked data sensitivity: {hoveredRow.impact_data}</div>
          <div>Attack summary: {hoveredRow.summary}</div>
        </Tooltip>
      )}
    </div></>
  );
}
