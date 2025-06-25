import React from "react";
import { createRoot } from "react-dom/client";

import "./application.css";
import { OilProductionTable } from "./components/tables/oilProductionTable";

createRoot(document.getElementById("app")!).render(
  <div>
    <h1>Chill, baby! Chill!</h1>
    <OilProductionTable />
  </div>,
);
