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
  productionOil?: number;
  productionGas?: number;
  realEmission?: number;
  realEmissionIntensity?: number;
  yearlyRevenue: number;
  totalLifetimeEmissions: number;
  transitionPotential: "wind" | "solar" | "data_center" | "research_hub";
};

export type GameAction =
  | { type: "PHASE_OUT_FIELD"; payload: string }
  | { type: "SET_SELECTED_FIELD"; payload: Field | null }
  | { type: "TOGGLE_FIELD_MODAL"; payload: boolean }
  | { type: "UPDATE_EMISSIONS_PRODUCTION" }
  | { type: "LOAD_GAME_STATE"; payload: GameState }
  | { type: "ADD_ACHIEVEMENT"; payload: string }
  | { type: "ADVANCE_YEAR"; payload?: number }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "MAKE_INVESTMENT"; payload: { type: Investment; amount: number } }
  | {
      type: "TRANSITION_FIELD";
      payload: {
        fieldName: string;
        newType: "wind" | "solar" | "data_center" | "research_hub";
      };
    }
  | { type: "UPDATE_CLIMATE_METRICS" }
  | { type: "ADVANCE_TUTORIAL" }
  | { type: "SKIP_TUTORIAL" }
  | { type: "RESTART_GAME" }
  | { type: "RESET_TUTORIAL" }
  | { type: "TOGGLE_MULTI_SELECT" }
  | { type: "SELECT_FIELD_FOR_MULTI"; payload: Field }
  | { type: "DESELECT_FIELD_FROM_MULTI"; payload: string }
  | { type: "PHASE_OUT_SELECTED_FIELDS" }
  | { type: "CLEAR_SELECTED_FIELDS" }
  | { type: "HANDLE_EVENT"; payload: { eventId: string; choice: string } }
  | { type: "CLOSE_ACHIEVEMENT_MODAL" }
  | { type: "CLOSE_EVENT_MODAL" }
  | { type: "CLOSE_GAME_OVER_MODAL" }
  | { type: "ADVANCE_YEAR_MANUALLY" };

export type Investment =
  | "green_tech"
  | "ai_research"
  | "renewable_energy"
  | "carbon_capture"
  | "hydrogen_tech"
  | "quantum_computing"
  | "battery_tech"
  | "offshore_wind"
  | "foreign_cloud"
  | "fossil_subsidies"
  | "crypto_mining"
  | "fast_fashion";

export type ViewMode = "map" | "emissions" | "production" | "economics";

export type DataLayer = "basic" | "intermediate" | "advanced" | "expert";

export type ShutdownMap = Record<string, number>;

export interface GameState {
  gameFields: Field[];
  budget: number;
  score: number;
  year: number;
  selectedField: Field | null;
  showFieldModal: boolean;
  achievements: string[];
  totalEmissions: number;
  totalProduction: number;
  shutdowns: ShutdownMap;
  realData: any;
  currentView: ViewMode;
  investments: Record<Investment, number>;
  globalTemperature: number;
  norwayTechRank: number;
  foreignDependency: number;
  climateDamage: number;
  sustainabilityScore: number;
  playerChoices: string[];
  dataLayerUnlocked: DataLayer;
  saturationLevel: number;
  gamePhase:
    | "learning"
    | "action"
    | "crisis"
    | "victory"
    | "defeat"
    | "partial_success";
  tutorialStep: number;
  shownFacts: string[];
  badChoiceCount: number;
  goodChoiceStreak: number;
  selectedFields: Field[];
  currentEvent?: any;
  showEventModal: boolean;
  showAchievementModal: boolean;
  showGameOverModal: boolean;
  newAchievements: string[];
  nextPhaseOutDiscount?: number;
  multiPhaseOutMode: boolean;
  yearlyPhaseOutCapacity: number;
  showBudgetWarning?: boolean;
  budgetWarningMessage?: string;
}
