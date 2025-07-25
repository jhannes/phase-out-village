import { data } from "./generated/data";

export type OilfieldName = keyof typeof data;
export const OilfieldValues = Object.keys(data) as OilfieldName[];
export type Slugify<S extends string> =
  Lowercase<S> extends infer L extends string
    ? L extends `${infer T} ${infer U}`
      ? `${T}-${Slugify<U>}`
      : L
    : never;

export function slugify<T extends string>(name: T): Slugify<T> {
  return name.toLowerCase().replace(/\s+/g, "-") as Slugify<T>;
}

export const oilfields = Object.keys(data).map((name) =>
  slugify(name),
) as Slugify<OilfieldName>[];
export const oilfieldNames = Object.fromEntries(
  Object.keys(data).map((name) => [
    name.toLowerCase().replace(/\s+/g, "-"),
    name,
  ]),
) as Record<Slugify<OilfieldName>, OilfieldName>;
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type Year = `19${Digit}${Digit}` | `20${Digit}${Digit}`;
export type PhaseOutSchedule = Partial<Record<OilfieldName, Year>>;
type DataValue = { value: number; estimate?: boolean };
export type YearlyDataset = Partial<Record<Year, DataValue>>;
type EstimatedYearlyDataset = Partial<
  Record<Year, DataValue & { estimate: true }>
>;

export function measuredOilProduction(
  data: Record<Year, { productionOil?: number }>,
): YearlyDataset {
  const result: YearlyDataset = {};
  for (let y = 1990; y < 2040; y++) {
    const year = y.toString() as Year;
    const { productionOil } = data[year] || {};
    if (productionOil) result[year] = { value: productionOil };
  }
  return result;
}

export const allYears = Array.from({ length: 200 }, (_, i) =>
  String(1900 + i),
) as Year[];

export function estimatedOilProduction(
  measured: YearlyDataset,
  phaseOut: Year | undefined,
): EstimatedYearlyDataset {
  const values = allYears
    .toReversed()
    .map((y) => [y, measured[y]?.value])
    .filter(([_, v]) => v)
    .slice(0, 5) as [Year, number][];

  if (values.length == 0) return {};
  const average =
    values.map(([_, v]) => v).reduce((a, b) => a + b, 0) / values.length;

  const result: EstimatedYearlyDataset = {};
  let current = average;
  for (let y = parseInt(values[0][0]) + 1; y < 2040; y++) {
    const year = y.toString() as Year;
    if (year === phaseOut) {
      result[year] = { value: 0, estimate: true };
      break;
    }
    current *= 0.9;
    result[year] = { value: current, estimate: true };
  }
  return result;
}
