import React from "react";
import { OilFieldDataset } from "./types/types";

export const ApplicationContext = React.createContext<{
  year: number;
  fullData: OilFieldDataset;
}>({
  year: 2025,
  fullData: {},
});
