import { Link, Outlet } from "@tanstack/react-router";
import React from "react";
import { oilfieldNames, oilfields } from "../data";

export function OilFieldMapList() {
  return (
    <div>
      <h1>Map</h1>
      {oilfields.map((o) => (
        <li key={o}>
          <Link to="/map/$slug" params={{ slug: o }}>
            {oilfieldNames[o]}
          </Link>
        </li>
      ))}
      <Outlet />
    </div>
  );
}
