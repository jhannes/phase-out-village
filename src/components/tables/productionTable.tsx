import { data } from "../../generated/data";
import React from "react";
import { useState } from "react";
import { productionProjections } from "../../utils/projections";

export function ProductionTable() {
  const [view, setView] = useState<"oil" | "gas" | "both">("oil");

  const oilFields = Object.keys(data);
  const projections = productionProjections(data);

  const years = new Set<string>();
  for (const oilField of oilFields) {
    Object.keys(data[oilField]).forEach((y) => years.add(y));
  }

  for (const proj of projections) {
    years.add(proj.year.toString());
  }

  const allYears = [...years].sort();

  return (
    <div>
      <h2>Årlige produksjonstall</h2>
      <div className="production-view-toggle-button">
        <button
          className={view === "oil" ? "active" : ""}
          onClick={() => setView("oil")}
        >
          Olje
        </button>
        <button
          className={view === "gas" ? "active" : ""}
          onClick={() => setView("gas")}
        >
          Gass
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th rowSpan={2}>År</th>
            {oilFields.map((field) => (
              <th key={field}>{field}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allYears.map((year) => (
            <tr key={year}>
              <td className="year">{year}</td>
              {oilFields.map((field, idx) => {
                const raw = data[field]?.[year];
                const proj = projections.find(
                  (p) => p.oilFieldName === field && p.year.toString() === year,
                );

                const production =
                  view === "oil"
                    ? (raw?.productionOil ?? proj?.productionOil ?? "-")
                    : (raw?.productionGas ?? proj?.productionGas ?? "-");

                const emission = raw?.emission ?? proj?.emission ?? "-";

                return (
                  <React.Fragment key={field}>
                    <td
                      className={`${idx > 0 ? "field-separator" : ""} sub-separator ${
                        Number(year) >= 2023 &&
                        raw?.[
                          view === "oil" ? "productionOil" : "productionGas"
                        ] === undefined &&
                        proj?.[
                          view === "oil" ? "productionOil" : "productionGas"
                        ] !== null
                          ? "projected"
                          : ""
                      }`}
                    >
                      {production}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
