export type OilFieldDataset = Record<
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

export type ShutdownMap = Record<string, number>;

export type Investment =
  | "green_tech"
  | "ai_research"
  | "renewable_energy"
  | "carbon_capture"
  | "foreign_cloud"
  | "hydrogen_tech"
  | "quantum_computing"
  | "battery_tech"
  | "offshore_wind"
  | "geothermal_energy"
  | "space_tech"
  | "fossil_subsidies"
  | "crypto_mining"
  | "fast_fashion";

export type Field = {
  name: string;
  lon: number;
  lat: number;
  emissions: number[];
  intensity: number;
  status: "active" | "closed" | "transitioning";
  production: number;
  workers: number;
  phaseOutCost: number;
  // Add real data fields
  productionOil?: number;
  productionGas?: number;
  realEmission?: number;
  realEmissionIntensity?: number;
  yearlyRevenue: number;
  totalLifetimeEmissions: number; // 98% from burning, not production
  transitionPotential: "wind" | "solar" | "data_center" | "research_hub";
};

export type ViewMode = "map" | "emissions" | "production" | "economics";

export type DataLayer = "basic" | "intermediate" | "advanced" | "expert";
