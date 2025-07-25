import React from "react";
import { ProductionTable } from "../tables/productionTable";
import { Route, Routes } from "react-router-dom";
import { ProductionPerFieldChart } from "./productionPerFieldChart";
import { YearlyTotalOilProductionChart } from "./yearlyTotalOilProduction";
import { TotalProduction } from "./totalProduction";

export function ProductionRoute() {
  return (
    <Routes>
      <Route path={"/"} element={<TotalProduction />} />
      <Route path={"/old"} element={<ProductionTable />} />
      <Route path={"/totalOil"} element={<YearlyTotalOilProductionChart />} />
      <Route path={"/oilPerField"} element={<ProductionPerFieldChart />} />
    </Routes>
  );
}
