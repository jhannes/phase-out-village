import React from "react";
import { Link } from "react-router-dom";
import { OilfieldName, oilfieldNames, Slugify } from "../../data";

export function OilfieldDetails(props: { slug: Slugify<OilfieldName> }) {
  return (
    <div>
      <h3>Details for singe oilfield: {oilfieldNames[props.slug]}</h3>
      <Link to={".."}>Up</Link>
    </div>
  );
}
