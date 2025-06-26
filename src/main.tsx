import React from "react";
import { createRoot } from "react-dom/client";

import "./application.css";
import { ProductionTable } from "./components/tables/productionTable";
import { OilFieldMap } from "./components/map/oilFieldMap";

createRoot(document.getElementById("app")!).render(
  <div>
    <h1>Chill, baby! Chill!</h1>
    <OilFieldMap />
    <ProductionTable />
  </div>,
);
