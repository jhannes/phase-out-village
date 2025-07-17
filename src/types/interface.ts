import { OilFieldDataset, ShutdownMap } from "./types";

export interface Projection {
  oilFieldName: string;
  year: number;
  productionOil: number | null;
  productionGas: number | null;
  emission: number | null;
  emissionIntensity: number | null;
}

export interface PriceControlsProps {
  price: { oil: number; gas: number };
  setPrice: React.Dispatch<React.SetStateAction<{ oil: number; gas: number }>>;
  onPriceUpdate: () => void;
}

export interface YearlyIncome {
  year: string;
  totalIncome: number;
}

export interface YearlyEmission {
  year: string;
  totalEmission: number;
}

export interface EmissionIntensity {
  fieldName: string;
  year: number;
  totalProduction: number;
  emissionIntensity: number;
}

export interface ShutdownControlsProps {
  data: OilFieldDataset;
  shutdowns: ShutdownMap;
  onShutdownChange: (fieldName: string, year: number) => void;
}
