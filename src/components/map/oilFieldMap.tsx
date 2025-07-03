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

useGeographic();

const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    new VectorLayer({
      source: new VectorSource({
        url: "/geojson/oilfields.geojson",
        format: new GeoJSON(),
      }),
      style: (f) =>
        new Style({
          fill: new Fill({ color: "red" }),
          stroke: new Stroke({ color: "black", width: 2 }),
          text: new Text({
            font: "9pt sans-serif",
            text: f.getProperties()["fldName"],
            overflow: true,
          }),
        }),
    }),
  ],
  view: new View({ center: [10, 65], zoom: 6 }),
});

export function OilFieldMap() {
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
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "50vh" }}></div>;
}
