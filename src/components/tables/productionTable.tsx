import { data } from "../../generated/data";
import React from "react";
import { useState } from "react";
import { productionProjections } from "../../utils/projections";

export function ProductionTable() {
  const debug = localStorage.getItem("debug") === "true";
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

  //TODO: Make years per page dependent on device type, and further improve design for mobile and desktop
  const yearsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allYears.length / yearsPerPage);

  const paginatedYears = allYears.slice(
    (currentPage - 1) * yearsPerPage,
    currentPage * yearsPerPage,
  );
  const maxVisiblePages = 5;
  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = start + maxVisiblePages - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

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
      {debug && <button>Last ned</button>}
      <table>
        <thead>
          <tr>
            <th>Felt</th>
            {paginatedYears.map((year) => (
              <th key={year}>{year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {oilFields.map((field, fieldIdx) => (
            <tr key={field}>
              <td className="field-name">{field}</td>
              {paginatedYears.map((year) => {
                const raw = data[field]?.[year];
                const proj = projections.find(
                  (p) => p.oilFieldName === field && p.year.toString() === year,
                );

                const production =
                  view === "oil"
                    ? (raw?.productionOil ?? proj?.productionOil ?? "-")
                    : (raw?.productionGas ?? proj?.productionGas ?? "-");

                const isProjected =
                  Number(year) >= 2023 &&
                  raw?.[view === "oil" ? "productionOil" : "productionGas"] ===
                    undefined &&
                  proj?.[view === "oil" ? "productionOil" : "productionGas"] !==
                    null;

                return (
                  <td
                    key={year}
                    className={`sub-separator ${isProjected ? "projected" : ""}`}
                  >
                    {production}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {currentPage > 1 && (
          <>
            <button onClick={() => setCurrentPage(1)}>{"<<"}</button>
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              {"<"}
            </button>
          </>
        )}
        {getVisiblePages().map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={page === currentPage ? "active" : ""}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages && (
          <>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              {">"}
            </button>
            <button onClick={() => setCurrentPage(totalPages)}>{">>"}</button>
          </>
        )}
      </div>
    </div>
  );
}
