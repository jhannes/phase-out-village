import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import { OSM } from "ol/source";
import TileLayer from "ol/layer/Tile";
import { useGeographic } from "ol/proj";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Fill, Stroke, Style, Text } from "ol/style";
import { OilfieldName, slugify, Slugify } from "../../data";
import { SimpleGeometry } from "ol/geom";

useGeographic();

const oilfieldSource = new VectorSource({
  url: "/phase-out-village/geojson/oilfields.geojson",
  format: new GeoJSON(),
});
const defaultViewport = { center: [10, 65], zoom: 4 };
const view = new View(defaultViewport);
const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    new VectorLayer({
      source: oilfieldSource,
      style: (f) =>
        new Style({
          fill: new Fill({ color: "red" }),
          stroke: new Stroke({ color: "black", width: 2 }),
          text: new Text({
            font: "9pt sans-serif",
            text: f.getProperties()["fldName"],
            //overflow: true,
          }),
        }),
    }),
  ],
  view,
});

export function OilFieldMap({ slug }: { slug?: Slugify<OilfieldName> }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
    map.on("click", (e) => {
      const features = map.getFeaturesAtPixel(e.pixel);
      console.log({ features });
      if (features.length === 1) {
        const { geometry, ...properties } = features[0].getProperties();
        alert(JSON.stringify(properties));
      }
    });
    oilfieldSource.on("featuresloadend", () => focusOnOilfield());
  }, []);

  function focusOnOilfield() {
    console.log("Finding " + slug);
    const field = oilfieldSource
      .getFeatures()
      .find((f) => slugify(f.getProperties().fldName) === slug);
    const geometry = field?.getGeometry();
    if (geometry) {
      console.log({ geometry });
      view.fit(geometry as SimpleGeometry, {
        maxZoom: 6,
        duration: 500,
      });
    } else if (oilfieldSource.getFeatures().length > 0) {
      view.fit(oilfieldSource.getExtent(), {
        duration: 500,
        padding: [10, 10, 10, 10],
      });
    }
  }
  useEffect(() => focusOnOilfield(), [slug]);

  return <div ref={mapRef}></div>;
}
