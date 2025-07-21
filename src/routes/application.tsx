import { Link, Outlet } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
import { ApplicationContext } from "../applicationContext";
import { generateCompleteData } from "../utils/projections";
import {
  calculateTotalYearlyGasProduction,
  calculateTotalYearlyOilProduction,
} from "../utils/calculations";
import { data } from "../generated/data";
import { exportDataSet } from "../utils/excel";
import { ShutdownMap } from "../types/types";
import { YearlyTotalOilProductionChart } from "../components/charts/yearlyTotalOilProduction";
import { YearlyTotalGasProductionChart } from "../components/charts/yearlyTotalGasProduction";
import { YearlyTotalProductionChart } from "../components/charts/yearlyOilAndGasProductionBarChart";

export function Application() {
  const [year, setYear] = useState(2025);
  const fullData = useMemo(() => generateCompleteData(data), [data]);
  // const shutdowns: ShutdownMap = {};
  // const totalOilProduction = calculateTotalYearlyOilProduction(fullData, shutdowns);
  // const totalGasProduction = calculateTotalYearlyGasProduction(fullData, shutdowns);

  return (
    <ApplicationContext value={{ year, fullData }}>
      <nav>
        <Link to="/">Hjem</Link>
        <Link to="/map">Map</Link>
        <Link to="/emissions">Utslipp</Link>
        <Link to="/production">Produksjon</Link>
      </nav>
      <header>
        <div>
          År: {year}
          <div>
            <button onClick={() => setYear((y) => y + 1)}>Neste</button>
          </div>
        </div>
        <div>
          Oljefelter avviklet: 0
          <div>
            <Link to={"/phaseout"}>
              <button>Velg felter for avvikling</button>
            </Link>
          </div>
        </div>
        <div>Utslipp til 2040: 200 (0% redusjon)</div>
        <div>Produksjon til 2040: 200 (0% redusjon)</div>
        <div>
          <p>
            <a href="https://mdg.no/politikk/utfasing">MDG</a>
          </p>
          <p>Det ER mulig</p>
        </div>
      </header>
      <main>
        <button onClick={() => exportDataSet(fullData)}>
          Last ned som Excel
        </button>
        {/*
        <YearlyTotalOilProductionChart data={totalOilProduction} />
        <YearlyTotalGasProductionChart data={totalGasProduction} />
        <YearlyTotalProductionChart oilData={totalOilProduction} gasData={totalGasProduction} />
        */}
        <Outlet />
      </main>
    </ApplicationContext>
  );
}
