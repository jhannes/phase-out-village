import {
  DataLayer,
  Field,
  Investment,
  ShutdownMap,
  ViewMode,
} from "../types/types";
import { OilFieldDataset } from "../types/types";

export type { Field } from "../types/types";

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
  realData: OilFieldDataset;
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
  selectedFields: Field[]; // For multi-select
  currentEvent?: any;
  showEventModal: boolean;
  showAchievementModal: boolean;
  showGameOverModal: boolean;
  newAchievements: string[];
  nextPhaseOutDiscount?: number;
  multiPhaseOutMode: boolean;
  yearlyPhaseOutCapacity: number; // How many fields can be phased out per year
  showBudgetWarning?: boolean;
  budgetWarningMessage?: string;
}

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
  | { type: "ADVANCE_YEAR_MANUALLY" }
  | { type: "SELECT_FIELD"; payload: string }
  | { type: "DESELECT_FIELD"; payload: string }
  | { type: "MULTI_PHASE_OUT"; payload: string[] }
  | { type: "UPDATE_BUDGET"; payload: number };
