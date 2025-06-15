import data from "../tmp/data.json";

const [firstHeader, secondHeader, ...rows] = data as (number | string)[][];

const result: Record<
  string,
  Record<
    number,
    { productionOil?: number; productionGas?: number; emission?: number }
  >
> = {};

for (const [
  field,
  year,
  gwh,
  productionOil,
  productionGas,
  _,
  emission,
] of rows) {
  const dataPoint = { productionOil, productionGas, emission };
  for (const k of Object.keys(dataPoint)) {
    if (!(dataPoint as any)[k]) delete (dataPoint as any)[k];
  }
  if (Object.keys(dataPoint)) ((result[field] as any) ||= {})[year] = dataPoint;
}

const compactJson = JSON.stringify(result, null, 2).replace(
  /{([^{}]+)}/g,
  (match, contents) =>
    `{ ${(contents as string)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" ")} }`,
);

console.log(
  "export const data: Record<string, Record<string, { productionOil?: number; productionGas?: number; emission?: number }>> = " +
    compactJson,
);
