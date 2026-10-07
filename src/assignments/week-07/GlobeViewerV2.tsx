import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import PopulationGlobe from "./PopulationGlobe";
import type { CountryFeature } from "./PopulationGlobe";
import { useDimensions } from "../week-01/useDimensions";
// import PopulationGlobe, { CountryFeature } from "./PopulationGlobe";

const countries = (feature(world as any, (world as any).objects.countries) as any)
  .features as CountryFeature[];

export function GlobeViewer() {
    const { ref: divRef } = useDimensions();
    return (
    <><div ref={divRef} className="relative w-full h-full">
        <PopulationGlobe countries={countries} />
        </div>
        </>
        
    );
}