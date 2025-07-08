import { Projection, YearlyEmission, YearlyIncome } from "../types/interface";
import { OilFieldDataset, ShutdownMap } from "../types/types";

export function isStillProducing(
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

export function calculateAverage(
  yearlyData: Record<
    string,
    { productionOil?: number; productionGas?: number; emission?: number }
  >,
  resourceKey: "productionOil" | "productionGas" | "emission",
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

export function productionProjections(data: OilFieldDataset): Projection[] {
  const projections: Projection[] = [];
  const projectionStart = 2023;
  const projectionEnd = 2040;
  const annualDeclineRate = 0.1;
  const constantIncrease = 0.03;

  for (const [fieldName, yearlyData] of Object.entries(data)) {
    const oilActive = isStillProducing(yearlyData, "productionOil");
    const gasActive = isStillProducing(yearlyData, "productionGas");
    const shouldProjectEmission = oilActive || gasActive;

    let projectedOil = oilActive
      ? calculateAverage(yearlyData, "productionOil")
      : null;
    let projectedGas = gasActive
      ? calculateAverage(yearlyData, "productionGas")
      : null;
    let projectedEmission = shouldProjectEmission
      ? calculateAverage(yearlyData, "emission")
      : null;

    for (let year = projectionStart; year <= projectionEnd; year++) {
      projections.push({
        oilFieldName: fieldName,
        year,
        productionOil:
          projectedOil !== null ? parseFloat(projectedOil.toFixed(2)) : null,
        productionGas:
          projectedGas !== null ? parseFloat(projectedGas.toFixed(2)) : null,
        emission:
          projectedEmission !== null
            ? parseFloat(projectedEmission.toFixed(2))
            : null,
      });

      if (projectedOil !== null) {
        projectedOil *= 1 - annualDeclineRate;
        if (projectedOil < 0.01) projectedOil = 0;
      }

      if (projectedGas !== null) {
        projectedGas *= 1 - annualDeclineRate;
        if (projectedGas < 0.01) projectedGas = 0;
      }

      if (projectedEmission !== null) {
        projectedEmission *= 1 + constantIncrease;
        if (projectedEmission < 0.01) projectedEmission = 0;
      }
    }
  }

  return projections;
}

export function generateCompleteData(data: OilFieldDataset): OilFieldDataset {
  const projections = productionProjections(data);

  const combined: OilFieldDataset = JSON.parse(JSON.stringify(data));

  for (const proj of projections) {
    const { oilFieldName, year, productionOil, productionGas, emission } = proj;

    if (!combined[oilFieldName]) {
      combined[oilFieldName] = {};
    }

    combined[oilFieldName][year.toString()] = {
      productionOil:
        productionOil !== null
          ? parseFloat(productionOil.toFixed(2))
          : undefined,
      productionGas:
        productionGas !== null
          ? parseFloat(productionGas.toFixed(2))
          : undefined,
      emission: emission !== null ? parseFloat(emission.toFixed(2)) : undefined,
    };
  }

  return combined;
}

export function calculateTotalYearlyIncome(
  data: OilFieldDataset,
  oilPrice: number,
  gasPrice: number,
  shutdowns: ShutdownMap,
): YearlyIncome[] {
  const yearlyTotals: Record<string, number> = {};

  // https://www.norskpetroleum.no/en/calculator/about-energy-calculator/
  const OIL_SM3_TO_BARREL = 6289800;

  // https://ngc.equinor.com/
  const GAS_GSM3_TO_SM3 = 1_000_000_000;
  const GAS_SM3_TO_MMBTU = 0.037913;

  for (const [fieldName, field] of Object.entries(data)) {
    const shutdownYear = shutdowns[fieldName] ?? 2040;

    for (const [year, record] of Object.entries(field)) {
      if (parseInt(year) > shutdownYear) continue;

      const oilMillionSm3 = record.productionOil ?? 0;
      const gasMillionGSm3 = record.productionGas ?? 0;
      const priceMultiplier = Number(year) > 2022 ? 1 : 0;

      const oilIncome =
        oilMillionSm3 * OIL_SM3_TO_BARREL * (priceMultiplier ? oilPrice : 80);

      const gasIncome =
        gasMillionGSm3 *
        GAS_GSM3_TO_SM3 *
        GAS_SM3_TO_MMBTU *
        (priceMultiplier ? gasPrice : 50);

      const totalIncome = oilIncome + gasIncome;

      yearlyTotals[year] = (yearlyTotals[year] ?? 0) + totalIncome;
    }
  }

  return Object.entries(yearlyTotals)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, income]) => ({
      year,
      totalIncome: parseFloat(income.toFixed(2)),
    }));
}

export function calculateTotalYearlyEmission(
  data: OilFieldDataset,
  shutdowns: ShutdownMap,
): YearlyEmission[] {
  const yearlyTotals: Record<string, number> = {};

  for (const [fieldname, field] of Object.entries(data)) {
    const shutdownYear = shutdowns[fieldname] ?? 2040;

    for (const [year, record] of Object.entries(field)) {
      if (parseInt(year) > shutdownYear) continue;

      const emission = record.emission ?? 0;
      yearlyTotals[year] = (yearlyTotals[year] ?? 0) + emission;
    }
  }

  return Object.entries(yearlyTotals)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, emission]) => ({
      year,
      totalEmission: parseFloat(emission.toFixed(2)),
    }));
}
