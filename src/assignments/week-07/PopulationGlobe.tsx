import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { Feature, Polygon, MultiPolygon, Position } from "geojson";
// import { useDimensions } from "../week-01/useDimensions";



export type CountryFeature = Feature<Polygon | MultiPolygon> & {
  id?: string | number;
};

export interface PopulationGlobeProps {
  /** GeoJSON country features; `id` must be the ISO 3166-1 numeric code
   *  (e.g. from topojson-client `feature(world, world.objects.countries)`). */
  countries: CountryFeature[];
  /** Initial globe radius in SVG units. */
  initialRadius?: number;
  className?: string;
}
// const { dimensions } = useDimensions();
const W = 640;
const CX = W / 2;
const CY = W / 2;
const R_MIN = 80;
const R_MAX = W;

// Population (millions, 2023 est.) by ISO 3166-1 numeric code
const POP: Record<number, number> = {
  4: 42, 8: 2.8, 12: 45, 24: 36, 32: 46, 36: 26, 40: 9.1, 50: 173, 56: 11.6,
  64: 0.8, 68: 12, 70: 3.2, 72: 2.6, 76: 216, 100: 6.5, 104: 55, 108: 13,
  112: 9.2, 116: 17, 120: 28, 124: 39, 140: 5.6, 144: 22, 148: 17, 152: 19,
  156: 1412, 170: 52, 178: 6, 180: 102, 188: 5.2, 191: 3.9, 192: 11, 196: 1.3,
  203: 10.8, 204: 13, 208: 5.9, 214: 11, 218: 18, 222: 6.3, 226: 1.5, 231: 126,
  232: 3.6, 233: 1.4, 246: 5.6, 250: 68, 262: 1, 266: 2.4, 268: 3.7, 270: 2.4,
  276: 84, 288: 34, 300: 10.4, 320: 18, 324: 14, 328: 0.8, 332: 12, 340: 10,
  348: 9.6, 352: 0.4, 356: 1428, 360: 277, 364: 88, 368: 44, 372: 5.1, 376: 9.8,
  380: 59, 384: 28, 388: 2.8, 392: 125, 400: 11, 404: 55, 408: 26, 410: 52,
  414: 4.3, 417: 6.7, 418: 7.5, 422: 5.3, 426: 2.3, 430: 5.3, 434: 7, 440: 2.8,
  442: 0.7, 450: 30, 454: 20, 458: 34, 466: 22, 478: 4.8, 484: 129, 496: 3.4,
  504: 37, 508: 33, 512: 4.6, 516: 2.6, 524: 30, 528: 17.6, 540: 0.3, 548: 0.3,
  554: 5.2, 558: 7, 562: 26, 566: 224, 578: 5.5, 586: 230, 591: 4.4, 598: 9.2,
  600: 7, 604: 34, 608: 117, 616: 38, 620: 10.3, 634: 2.7, 642: 19, 643: 144,
  646: 14, 682: 37, 686: 17, 694: 8.6, 702: 5.6, 703: 5.5, 704: 99, 705: 2.1,
  706: 18, 710: 60, 716: 16, 724: 48, 729: 46, 740: 0.6, 752: 10.5, 756: 8.8,
  760: 22, 762: 10, 764: 72, 768: 9, 780: 1.5, 784: 10, 788: 12, 792: 85,
  800: 48, 804: 37, 818: 110, 826: 68, 834: 65, 840: 335, 854: 23, 858: 3.4,
  860: 36, 862: 28, 887: 34, 894: 20,
};

const toRad = (d: number) => (d * Math.PI) / 180;
const colorScale = d3
  .scaleSequentialLog(d3.interpolateYlOrRd)
  .domain([0.3, 1500]);

const getColor = (f: CountryFeature): string => {
  const v = POP[Number(f.id)];
  return v ? colorScale(v) : "#c4b99a";
};

const polysOf = (f: CountryFeature): Position[][][] =>
  f.geometry.type === "Polygon"
    ? [f.geometry.coordinates]
    : f.geometry.coordinates;

const linePath = (pts: [number, number][]) =>
  pts
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join("");

export const PopulationGlobe: React.FC<PopulationGlobeProps> = ({
  countries,
  initialRadius = 200,
  className,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    // ---- Mutable view state (kept out of React state: it changes every frame)
    let R = initialRadius;
    const R0 = R;
    const rot = { lon: 0, lat: 15 };
    let dragging = false;
    let autoRotate = true;
    let sx = 0, sy = 0;
    let sr = { ...rot };
    let raf = 0;

    // ---- Projection (orthographic, with "horizon overflow" for back hemisphere)
    const project = (lon: number, lat: number): [number, number] => {
      const dλ = toRad(lon - rot.lon);
      const φ = toRad(lat);
      const φc = toRad(rot.lat);
      const cosφ = Math.cos(φ), sinφ = Math.sin(φ);
      const cosφc = Math.cos(φc), sinφc = Math.sin(φc);
      let px = R * cosφ * Math.sin(dλ);
      let py = -R * (cosφc * sinφ - sinφc * cosφ * Math.cos(dλ));
      const cosC = sinφc * sinφ + cosφc * cosφ * Math.cos(dλ);
      if (cosC < 0) {
        const d = Math.hypot(px, py) || 1;
        const s = (2 * R - d) / d;
        px *= s;
        py *= s;
      }
      return [CX + px, CY + py];
    };

    const visible = (lon: number, lat: number) => {
      const dλ = toRad(lon - rot.lon);
      const φ = toRad(lat);
      const φc = toRad(rot.lat);
      return (
        Math.sin(φc) * Math.sin(φ) +
          Math.cos(φc) * Math.cos(φ) * Math.cos(dλ) >
        0
      );
    };

    const pathOf = (f: CountryFeature) =>
      polysOf(f)
        .flatMap((poly) =>
          poly.map(
            (ring) => linePath(ring.map(([lo, la]) => project(lo, la))) + "Z"
          )
        )
        .join(" ");

    // Meridians and parallels every 30°
    const graticulePath = () => {
      const parts: string[] = [];
      for (let lon = -180; lon < 180; lon += 30) {
        const pts: [number, number][] = [];
        for (let lat = -90; lat <= 90; lat += 2) pts.push(project(lon, lat));
        parts.push(linePath(pts));
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const pts: [number, number][] = [];
        for (let lon = -180; lon <= 180; lon += 2) pts.push(project(lon, lat));
        parts.push(linePath(pts));
      }
      return parts.join(" ");
    };

    // ---- Static SVG structure
    const svg = d3
      .select(svgEl)
      .attr("viewBox", `0 0 ${W} ${W}`)
      .style("width", "100%")
      .style("height", "100%")
      .style("display", "block")
      .style("cursor", "grab")
      .style("user-select", "none")
      .style("touch-action", "none")
      .style("background", "#0f172a")
      .style("border-radius", "12px");
    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    const clipCircle = defs
      .append("clipPath")
      .attr("id", "globe-clip")
      .append("circle")
      .attr("cx", CX).attr("cy", CY).attr("r", R);

    const ocean = defs
      .append("radialGradient").attr("id", "globe-ocean")
      .attr("cx", "40%").attr("cy", "35%").attr("r", "60%");
    ocean.append("stop").attr("offset", "0%").attr("stop-color", "#60a5fa");
    ocean.append("stop").attr("offset", "100%").attr("stop-color", "#1e40af");

    const shine = defs
      .append("radialGradient").attr("id", "globe-shine")
      .attr("cx", "35%").attr("cy", "30%").attr("r", "60%");
    shine.append("stop").attr("offset", "0%")
      .attr("stop-color", "white").attr("stop-opacity", 0.15);
    shine.append("stop").attr("offset", "100%")
      .attr("stop-color", "white").attr("stop-opacity", 0);

    const glow = defs
      .append("filter").attr("id", "globe-glow")
      .attr("x", "-20%").attr("y", "-20%")
      .attr("width", "140%").attr("height", "140%");
    glow.append("feGaussianBlur")
      .attr("in", "SourceGraphic").attr("stdDeviation", 3).attr("result", "blur");
    glow.append("feMerge").selectAll("feMergeNode")
      .data(["blur", "SourceGraphic"]).join("feMergeNode")
      .attr("in", (d) => d);

    // Layers: ocean → countries (clipped) → graticule (clipped) → glow → shine
    const cOcean = svg.append("circle")
      .attr("cx", CX).attr("cy", CY).attr("r", R).attr("fill", "url(#globe-ocean)");
    const g = svg.append("g").attr("clip-path", "url(#globe-clip)");
    const gGrat = svg.append("g").attr("clip-path", "url(#globe-clip)")
      .attr("fill", "none").attr("stroke", "white")
      .attr("stroke-width", 0.5).attr("stroke-opacity", 0.15)
      .style("pointer-events", "none");
    const gratPath = gGrat.append("path");
    const cGlow = svg.append("circle")
      .attr("cx", CX).attr("cy", CY).attr("r", R)
      .attr("fill", "none").attr("stroke", "#60a5fa")
      .attr("stroke-width", 1.5).attr("stroke-opacity", 0.5)
      .attr("filter", "url(#globe-glow)");
    const cShine = svg.append("circle")
      .attr("cx", CX).attr("cy", CY).attr("r", R)
      .attr("fill", "url(#globe-shine)").style("pointer-events", "none");

    const updateRadius = () => {
      clipCircle.attr("r", R);
      cOcean.attr("r", R);
      cGlow.attr("r", R);
      cShine.attr("r", R);
    };

    // ---- Legend
    const lw = 160, lh = 8, lx = 20, ly = W - 30;
    const lg = svg.append("g").attr("transform", `translate(${lx},${ly})`);
    const legendScale = d3.scaleLog().domain([0.3, 1500]).range([0, lw]);
    for (let i = 0; i < lw; i++) {
      lg.append("rect")
        .attr("x", i).attr("y", 0).attr("width", 1).attr("height", lh)
        .attr("fill", colorScale(legendScale.invert(i)));
    }
    [1, 10, 100, 1000].forEach((v) => {
      lg.append("text")
        .attr("x", legendScale(v)).attr("y", lh + 11)
        .text(v >= 1000 ? `${v / 1000}B` : `${v}M`)
        .attr("fill", "#94a3b8").attr("font-size", 8)
        .attr("text-anchor", "middle").attr("font-family", "sans-serif");
    });
    lg.append("text")
      .attr("x", lw / 2).attr("y", -4)
      .text("Population (2023)")
      .attr("fill", "#94a3b8").attr("font-size", 9)
      .attr("text-anchor", "middle").attr("font-family", "sans-serif");

    // ---- Render (data join keyed by country id; only visible countries kept)
    const render = () => {
      const shown = countries.filter((f) =>
        polysOf(f).some((poly) => poly[0].some(([lo, la]) => visible(lo, la)))
      );
      g.selectAll<SVGPathElement, CountryFeature>("path")
        .data(shown, (d) => String(d.id))
        .join("path")
        .attr("d", pathOf)
        .attr("fill", getColor)
        .attr("stroke", "rgba(255,255,255,0.3)")
        .attr("stroke-width", 0.5);
      gratPath.attr("d", graticulePath());
    };
    render();

    // ---- Auto-rotation
    const spin = () => {
      if (autoRotate && !dragging) {
        rot.lon -= 0.15;
        render();
      }
      raf = requestAnimationFrame(spin);
    };
    raf = requestAnimationFrame(spin);

    // ---- Drag (pointer events: mouse + touch + pen)
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const k = (0.3 * R0) / R;
      rot.lon = sr.lon - (e.clientX - sx) * k;
      rot.lat = Math.max(-80, Math.min(80, sr.lat + (e.clientY - sy) * k));
      render();
    };
    const onUp = () => {
      dragging = false;
      svg.style("cursor", "grab");
    };

    svg.on("pointerdown", (e: PointerEvent) => {
      dragging = true;
      autoRotate = false;
      sx = e.clientX;
      sy = e.clientY;
      sr = { ...rot };
      svg.style("cursor", "grabbing");
    });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // ---- Zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      R = Math.max(R_MIN, Math.min(R_MAX, R - e.deltaY * 0.3));
      updateRadius();
      render();
    };
    svgEl.addEventListener("wheel", onWheel, { passive: false });

    // ---- Cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      svgEl.removeEventListener("wheel", onWheel);
      svg.on("pointerdown", null);
      svg.selectAll("*").remove();
    };
  }, [countries, initialRadius]);

  return <svg ref={svgRef} className={className} role="img" aria-label="Interactive globe colored by country population" />;
};

export default PopulationGlobe;