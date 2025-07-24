import React from "react";
import { OilFieldDataset } from "./types/types";
import { data } from "./generated/data";

export const ApplicationContext = React.createContext<{
  year: number;
  fullData: OilFieldDataset;
  data: Record<
    string,
    Record<
      string,
      {
        productionOil?: number;
        productionGas?: number;
        emission?: number;
        emissionIntensity?: number;
      }
    >
  >;
}>({
  year: 2025,
  fullData: {},
  data: data,
});
