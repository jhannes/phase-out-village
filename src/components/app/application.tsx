import React, { useMemo, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { MapRoute } from "../map/mapRoute";
import { FlatApplication } from "./flatApplication";
import { generateCompleteData } from "../../utils/projections";
import { data } from "../../generated/data";
import { ApplicationContext } from "../../applicationContext";
import { FrontPage } from "./frontPage";
import { PhaseOutRoute } from "../phaseout/phaseOutRoute";
import { ProductionRoute } from "../production/productionRoute";
import { PhaseOutSchedule, Year } from "../../data";

function ApplicationRoutes() {
  return (
    <Routes>
      <Route path={"/"} element={<FrontPage />} />
      <Route path={"/phaseout"} element={<PhaseOutRoute />} />
      <Route path={"/map/*"} element={<MapRoute />} />
      <Route path={"/emissions"} element={<FlatApplication />} />
      <Route path={"/production/*"} element={<ProductionRoute />} />
      <Route path={"*"} element={<h2>Not Found</h2>} />
    </Routes>
  );
}

export function Application() {
  const [year, setYear] = useState<Year>("2025");
  const [phaseOut, setPhaseOut] = useState<PhaseOutSchedule>({});
  const fullData = useMemo(() => generateCompleteData(data), [data]);

  function nextYear() {
    setYear((y) => (parseInt(y) + 1).toString() as Year);
  }

  return (
    <ApplicationContext
      value={{ year, nextYear, fullData, data, phaseOut, setPhaseOut }}
    >
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
            <button onClick={nextYear}>Neste</button>
          </div>
        </div>
        <div>
          Oljefelter avviklet: {Object.keys(phaseOut).length}
          <div>
            <Link to={"/phaseout"}>
              <button>Velg felter for avvikling</button>
            </Link>
          </div>
        </div>
        <div>Utslipp til 2040: 200 (0% redusjon)</div>
        <div>Produksjon til 2040: 200 (0% redusjon)</div>
      </header>
      <main>
        <ApplicationRoutes />
      </main>
      <footer>
        <div>
          <a href="https://mdg.no/politikk/utfasing">MDG</a>
        </div>
        <div>Det ER mulig</div>
      </footer>
    </ApplicationContext>
  );
}
