import { OilFieldMap } from "../components/map/oilFieldMap";
import { Outlet, useParams } from "@tanstack/react-router";
import React from "react";
import { OilfieldName, Slugify } from "../data";

export function MapRoute() {
  const slug = useParams({ strict: false }).slug as Slugify<OilfieldName>;
  return (
    <div className="oilfield-map">
      <OilFieldMap slug={slug} />
      <div className="details">
        <Outlet />
      </div>
    </div>
  );
}
