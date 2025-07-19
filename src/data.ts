import { data } from "./generated/data";

export type OilfieldName = keyof typeof data;
export const OilfieldValues = Object.keys(data) as OilfieldName[];
export type Slugify<S extends string> =
  Lowercase<S> extends infer L extends string
    ? L extends `${infer T} ${infer U}`
      ? `${T}-${Slugify<U>}`
      : L
    : never;
export const oilfields = Object.keys(data).map((name) =>
  name.toLowerCase().replace(/\s+/g, "-"),
) as Slugify<OilfieldName>[];
export const oilfieldNames = Object.fromEntries(
  Object.keys(data).map((name) => [
    name.toLowerCase().replace(/\s+/g, "-"),
    name,
  ]),
) as Record<Slugify<OilfieldName>, OilfieldName>;
