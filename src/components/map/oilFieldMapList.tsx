import React from "react";
import { Link } from "react-router-dom";
import { oilfieldNames, oilfields } from "../../data";

export function OilFieldMapList() {
  return (
    <div>
      <h1>Map</h1>
      {oilfields.map((o) => (
        <li key={o}>
          <Link to={`/map/${o}`}>{oilfieldNames[o]}</Link>
        </li>
      ))}
    </div>
  );
}
