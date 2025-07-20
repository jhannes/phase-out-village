import { Link, Outlet } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
import { ApplicationContext } from "../applicationContext";
import { generateCompleteData } from "../utils/projections";
import { calculateTotalYearlyOilProduction } from "../utils/calculations";
import { data } from "../generated/data";
import { exportDataSet } from "../utils/excel";

export function Application() {
  const [year, setYear] = useState(2025);
  const fullData = useMemo(() => generateCompleteData(data), [data]);

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
        <Outlet />
      </main>
    </ApplicationContext>
  );
}
