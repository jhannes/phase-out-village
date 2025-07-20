import {
  YearlyEmission,
  YearlyGasProduction,
  YearlyIncome,
  YearlyOilProduction,
} from "../types/interface";
import { OilFieldDataset, ShutdownMap } from "../types/types";

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
  const GAS_GSM3_TO_SM3 = 1000000000;
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

export function calculateTotalYearlyOilProduction(
  data: OilFieldDataset,
  shutdowns: ShutdownMap,
): YearlyOilProduction[] {
  const yearlyTotals: Record<string, number> = {};

  for (const [fieldname, field] of Object.entries(data)) {
    const shutdownYear = shutdowns[fieldname] ?? 2040;

    for (const [year, record] of Object.entries(field)) {
      if (parseInt(year) > shutdownYear) continue;

      const oil = record.productionOil ?? 0;
      yearlyTotals[year] = (yearlyTotals[year] ?? 0) + oil;
    }
  }

  return Object.entries(yearlyTotals)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, totalOil]) => ({
      year,
      totalOilProduction: parseFloat(totalOil.toFixed(2)),
    }));
}

export function calculateTotalYearlyGasProduction(
  data: OilFieldDataset,
  shutdowns: ShutdownMap,
): YearlyGasProduction[] {
  const yearlyTotals: Record<string, number> = {};

  for (const [fieldname, field] of Object.entries(data)) {
    const shutdownYear = shutdowns[fieldname] ?? 2040;

    for (const [year, record] of Object.entries(field)) {
      if (parseInt(year) > shutdownYear) continue;

      const gas = record.productionGas ?? 0;
      yearlyTotals[year] = (yearlyTotals[year] ?? 0) + gas;
    }
  }

  return Object.entries(yearlyTotals)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, totalGas]) => ({
      year,
      totalGasProduction: parseFloat(totalGas.toFixed(2)),
    }));
}

export function calculateAverage(
  yearlyData: Record<
    string,
    {
      productionOil?: number;
      productionGas?: number;
      emission?: number;
      emissionIntensity?: number;
    }
  >,
  resourceKey:
    | "productionOil"
    | "productionGas"
    | "emission"
    | "emissionIntensity",
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
