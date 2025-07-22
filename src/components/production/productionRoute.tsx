import React from "react";
import { ProductionTable } from "../tables/productionTable";
import { Route, Routes } from "react-router-dom";
import { ProductionPerFieldChart } from "./productionPerFieldChart";
import { YearlyTotalOilProductionChart } from "./yearlyTotalOilProduction";

export function ProductionRoute() {
  return (
    <Routes>
      <Route path={"/"} element={<ProductionTable />} />
      <Route path={"/totalOil"} element={<YearlyTotalOilProductionChart />} />
      <Route path={"/oilPerField"} element={<ProductionPerFieldChart />} />
    </Routes>
  );
}
