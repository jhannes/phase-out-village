import { OilfieldName, oilfieldNames, Slugify } from "../data";
import React from "react";
import { Link } from "@tanstack/react-router";

export function OilfieldMap(props: { slug: Slugify<OilfieldName> }) {
  return (
    <div>
      <h3>Details for singe oilfield: {oilfieldNames[props.slug]}</h3>
      <Link to={".."}>Up</Link>
    </div>
  );
}
