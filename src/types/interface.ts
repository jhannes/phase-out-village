export interface Projection {
  oilFieldName: string;
  year: number;
  productionOil: number | null;
  productionGas: number | null;
  emission: number | null;
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
