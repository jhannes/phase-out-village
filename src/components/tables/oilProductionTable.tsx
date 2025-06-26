import { data } from "../../generated/data";
import React from "react";

interface Projection {
  oilFieldName: string;
  year: number;
  productionOil: number | null;
  productionGas: number | null;
  emission: number | null;
}

type OilFieldDataset = Record<
  string,
  Record<
    string,
    { productionOil?: number; productionGas?: number; emission?: number }
  >
>;

function isStillProducing(
  yearlyData: Record<
    string,
    { productionOil?: number; productionGas?: number; emission?: number }
  >,
  resourceKey: "productionOil" | "productionGas",
): boolean {
  const years = Object.keys(yearlyData)
    .map(Number)
    .sort((a, b) => b - a);
  const latestYear = years[0];
  return yearlyData[latestYear]?.[resourceKey] !== undefined;
}

function calculateAverage(
  yearlyData: Record<
    string,
    { productionOil?: number; productionGas?: number; emission?: number }
  >,
  resourceKey: "productionOil" | "productionGas",
): number | null {
  const years = Object.keys(yearlyData)
    .map(Number)
    .filter((year) => yearlyData[year]?.[resourceKey] !== undefined)
    .sort((a, b) => b - a)
    .slice(0, 5);

  const values = years.map((year) => yearlyData[year]![resourceKey]!);

  if (values.length === 0) return null;

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg;
}

function oilProjections(data: OilFieldDataset): Projection[] {
  const projections: Projection[] = [];
  const projectionStart = 2023;
  const projectionEnd = 2040;
  const annualDeclineRate = 0.1;

  for (const [fieldName, yearlyData] of Object.entries(data)) {
    const oilActive = isStillProducing(yearlyData, "productionOil");
    const gasActive = isStillProducing(yearlyData, "productionGas");

    let projectedOil = oilActive
      ? calculateAverage(yearlyData, "productionOil")
      : null;
    let projectedGas = gasActive
      ? calculateAverage(yearlyData, "productionGas")
      : null;

    for (let year = projectionStart; year <= projectionEnd; year++) {
      projections.push({
        oilFieldName: fieldName,
        year,
        productionOil:
          projectedOil !== null ? parseFloat(projectedOil.toFixed(2)) : null,
        productionGas:
          projectedGas !== null ? parseFloat(projectedGas.toFixed(2)) : null,
        emission: null,
      });

      if (projectedOil !== null) {
        projectedOil *= 1 - annualDeclineRate;
        if (projectedOil < 0.01) projectedOil = 0;
      }

      if (projectedGas !== null) {
        projectedGas *= 1 - annualDeclineRate;
        if (projectedGas < 0.01) projectedGas = 0;
      }
    }
  }

  return projections;
}

export function OilProductionTable() {
  const oilFields = Object.keys(data);
  const projections = oilProjections(data);

  const years = new Set<string>();
  for (const oilField of oilFields) {
    Object.keys(data[oilField]).forEach((y) => years.add(y));
  }

  for (const proj of projections) {
    years.add(proj.year.toString());
  }

  const allYears = [...years].sort();

  return (
    <table>
      <thead>
        <tr>
          <th>År</th>
          {oilFields.map((oilField) => (
            <th>{oilField}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {allYears.map((year) => (
          <tr key={year}>
            <td>{year}</td>
            {oilFields.map((field) => {
              const raw = data[field]?.[year];
              const proj = projections.find(
                (p) => p.oilFieldName === field && p.year.toString() === year,
              );

              const isProjected = !raw && proj;
              const value = raw?.productionOil ?? proj?.productionOil ?? "-";

              return (
                <td
                  key={field + year}
                  style={{
                    color: isProjected ? "red" : "black",
                    fontStyle: isProjected ? "italic" : "normal",
                  }}
                >
                  {value}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
