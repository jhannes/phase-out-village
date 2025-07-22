import { OilFieldMap } from "./oilFieldMap";
import { Route, Routes, useParams } from "react-router-dom";
import React from "react";
import { OilFieldMapList } from "./oilFieldMapList";
import { OilfieldDetails } from "./oilfieldDetails";
import { OilfieldName, Slugify } from "../../data";

export function MapRoute() {
  return (
    <div className="oilfield-map">
      <OilFieldMap />

      <div className="details">
        <Routes>
          <Route path={""} element={<OilFieldMapList />} />
          <Route path={":slug"} element={<SlugWrapper />} />
        </Routes>
      </div>
    </div>
  );
}

const SlugWrapper = () => {
  const { slug } = useParams();
  return <OilfieldDetails slug={slug as Slugify<OilfieldName>} />;
};
