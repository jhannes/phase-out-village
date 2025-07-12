import React, {
  useEffect,
  useRef,
  useState,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import OlMap from "ol/Map";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Circle from "ol/style/Circle";
import Style from "ol/style/Style";
import { Fill, Stroke, Text } from "ol/style";
import "ol/ol.css";
import "./MapPage.css";
import { data } from "../../generated/data";
import { generateCompleteData } from "../../utils/projections";
import { OilFieldDataset, ShutdownMap } from "../../types/types";
import { EmissionsView } from "../../components/charts/EmissionsView";
// import { FieldModal } from "../../components/modals/FieldModal";
// import of badge components removed due to missing module and unused imports

// Placeholder for FieldModal to resolve import error
const FieldModal: React.FC<{
  selectedField: Field | null;
  budget: number;
  onPhaseOut: (fieldName: string) => void;
  onClose: () => void;
}> = ({ selectedField, budget, onPhaseOut, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!selectedField) {
    return null;
  }

  const canAfford = budget >= selectedField.phaseOutCost;

  // Handle background click to close modal
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Auto-scroll to modal when it opens
  useEffect(() => {
    if (modalRef.current) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        modalRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedField?.name]); // Re-run when field changes

  return (
    <div
      className="modal field-modal"
      ref={modalRef}
      onClick={handleBackgroundClick}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="modal-close-button"
          aria-label="Lukk modal"
        >
          &times;
        </button>

        <h2
          style={{
            marginTop: "8px",
            marginBottom: "20px",
            color: selectedField.status === "closed" ? "#10B981" : "#1F2937",
          }}
        >
          {selectedField.status === "closed" ? "🌱" : "🛢️"} {selectedField.name}
        </h2>

        <div className="field-details">
          <p>
            <strong>Status:</strong>
            <span className={`status-${selectedField.status}`}>
              {selectedField.status === "active"
                ? "Aktiv"
                : selectedField.status === "closed"
                  ? "Faset ut"
                  : "Overgangsfase"}
            </span>
          </p>

          {selectedField.status === "active" ? (
            <>
              <p>
                <strong>Årlig produksjon:</strong>
                <span>{selectedField.production.toFixed(1)} mill. boe</span>
              </p>
              <p>
                <strong>Årlige utslipp:</strong>
                <span style={{ color: "#DC2626", fontWeight: "bold" }}>
                  {selectedField.emissions[0].toFixed(1)} Mt CO₂
                </span>
              </p>
              <p>
                <strong>Utslippsintensitet:</strong>
                <span>{selectedField.intensity.toFixed(1)} kg CO₂/boe</span>
              </p>
              <p>
                <strong>Arbeidsplasser:</strong>
                <span>~{selectedField.workers.toLocaleString()}</span>
              </p>
              <p>
                <strong>Omstillingspotensial:</strong>
                <span style={{ color: "#059669", fontWeight: "bold" }}>
                  {selectedField.transitionPotential.replace("_", " ")}
                </span>
              </p>

              <hr />

              <div className="cost">
                <strong>💥 Totalt livstidsutslipp ved forbrenning:</strong>
                <div
                  style={{
                    fontSize: "1.2em",
                    color: "#DC2626",
                    marginTop: "8px",
                  }}
                >
                  {(selectedField.totalLifetimeEmissions / 1000).toFixed(0)} Mt
                  CO₂
                </div>
                <small style={{ opacity: 0.8 }}>
                  Dette er CO₂ som slippes ut når oljen brennes av forbrukere
                </small>
              </div>

              <div className="cost">
                <strong>💰 Kostnad for utfasing:</strong>
                <div style={{ fontSize: "1.2em", marginTop: "8px" }}>
                  {selectedField.phaseOutCost.toLocaleString()} mrd NOK
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "3em", marginBottom: "16px" }}>🌱</div>
              <p
                style={{
                  color: "#10B981",
                  fontSize: "1.2em",
                  fontWeight: "bold",
                }}
              >
                Dette feltet er allerede faset ut!
              </p>
              <p style={{ color: "#6B7280", marginTop: "8px" }}>
                Du hindrer nå{" "}
                {(selectedField.totalLifetimeEmissions / 1000).toFixed(0)} Mt
                CO₂ fra å bli sluppet ut i atmosfæren.
              </p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {selectedField.status === "active" ? (
            <>
              <button
                onClick={() => onPhaseOut(selectedField.name)}
                disabled={!canAfford}
                className="phase-out-button"
              >
                {canAfford
                  ? `🌱 Fase ut feltet (${selectedField.phaseOutCost.toLocaleString()} mrd NOK)`
                  : `💰 Ikke nok penger (${selectedField.phaseOutCost.toLocaleString()} mrd NOK)`}
              </button>
              {!canAfford && (
                <div className="budget-warning">
                  Du mangler{" "}
                  {(selectedField.phaseOutCost - budget).toLocaleString()} mrd
                  NOK
                </div>
              )}
            </>
          ) : (
            <button
              onClick={onClose}
              className="phase-out-button"
              style={{ background: "#10B981" }}
            >
              ✅ Forstått
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Types ---
type Investment =
  | "green_tech"
  | "ai_research"
  | "renewable_energy"
  | "carbon_capture"
  | "foreign_cloud";

type Field = {
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

type ViewMode = "map" | "emissions" | "production" | "economics";

type DataLayer = "basic" | "intermediate" | "advanced" | "expert";

type GameState = {
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
  globalTemperature: number; // Track climate impact
  norwayTechRank: number; // Track Norway's tech independence
  foreignDependency: number; // How much we pay to foreign cloud providers
  climateDamage: number; // Cost of climate damage
  sustainabilityScore: number;
  playerChoices: string[]; // Track player decisions for education
  dataLayerUnlocked: DataLayer;
  saturationLevel: number; // 0-100, affects visual desaturation
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
};

type GameAction =
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

// --- Constants ---
const LOCAL_STORAGE_KEY = "phaseOutGameState";
const LOCAL_STORAGE_THEME_KEY = "userPreferredTheme";
const ACHIEVEMENT_FIRST_PHASE_OUT = "First Phase Out";

// Oil field coordinates (approximate Norwegian Continental Shelf positions)
const FIELD_COORDINATES: Record<string, { lon: number; lat: number }> = {
  "Aasta Hansteen": { lon: 6.8, lat: 65.1 },
  Alvheim: { lon: 2.1, lat: 56.5 },
  Balder: { lon: 2.8, lat: 56.3 },
  Brage: { lon: 2.4, lat: 60.5 },
  Draugen: { lon: 7.8, lat: 64.3 },
  "Edvard Grieg": { lon: 2.1, lat: 56.1 },
  Ekofisk: { lon: 3.2, lat: 56.5 },
  Eldfisk: { lon: 3.3, lat: 56.3 },
  Gjøa: { lon: 3.9, lat: 61.0 },
  Goliat: { lon: 22.2, lat: 71.1 },
  Grane: { lon: 2.8, lat: 59.1 },
  Gullfaks: { lon: 2.5, lat: 61.2 },
  Heidrun: { lon: 7.3, lat: 65.3 },
  "Johan Castberg": { lon: 19.0, lat: 71.6 },
  "Johan Sverdrup": { lon: 2.8, lat: 56.1 },
  Kristin: { lon: 6.6, lat: 65.0 },
  Kvitebjørn: { lon: 2.5, lat: 61.1 },
  "Martin Linge": { lon: 3.3, lat: 60.8 },
  Njord: { lon: 6.6, lat: 64.8 },
  Norne: { lon: 8.1, lat: 66.0 },
  "Ormen Lange": { lon: 6.3, lat: 63.4 },
  Oseberg: { lon: 2.8, lat: 60.8 },
  Skarv: { lon: 7.5, lat: 65.5 },
  Sleipner: { lon: 2.9, lat: 58.4 },
  Snorre: { lon: 2.2, lat: 61.4 },
  Snøhvit: { lon: 21.3, lat: 71.6 },
  Statfjord: { lon: 1.8, lat: 61.8 },
  Troll: { lon: 3.7, lat: 60.6 },
  Ula: { lon: 2.8, lat: 57.1 },
  Valhall: { lon: 3.4, lat: 56.3 },
  Visund: { lon: 2.4, lat: 61.4 },
  Yme: { lon: 2.2, lat: 58.1 },
  Åsgard: { lon: 7.0, lat: 65.2 },
};

const INITIAL_BUDGET = 15000; // 15 trillion NOK (closer to actual Oil Fund size)
const INITIAL_SCORE = 0; // Start from zero
const INITIAL_YEAR = 2025;
const DEFAULT_MAP_CENTER = [5, 62];
const DEFAULT_MAP_ZOOM = 6;

// --- Utility Functions ---
const createFieldFromRealData = (
  fieldName: string,
  realData: OilFieldDataset,
): Field => {
  const yearlyData = realData[fieldName];
  const latestYear = Math.max(...Object.keys(yearlyData).map(Number));
  const latestData = yearlyData[latestYear.toString()];

  const coordinates = FIELD_COORDINATES[fieldName] || { lon: 5, lat: 62 };

  // Calculate emissions history (last 5 years)
  const emissionsHistory = Object.keys(yearlyData)
    .map(Number)
    .sort((a, b) => b - a)
    .slice(0, 5)
    .map((year) => (yearlyData[year.toString()]?.emission || 0) / 1000); // Convert to Mt

  const currentProduction =
    (latestData?.productionOil || 0) + (latestData?.productionGas || 0);

  // Calculate more realistic lifetime emissions based on actual data
  const yearlyEmissionMt = (latestData?.emission || 0) / 1000;
  const estimatedLifetimeYears = 15; // Average field lifetime
  // Use actual emission intensity from data instead of arbitrary multiplier
  const totalLifetimeEmissions = yearlyEmissionMt * estimatedLifetimeYears;

  // Calculate more realistic phase-out cost based on production and field size
  // Base cost on production volume, with minimum cost for smaller fields
  const baseCostPerBoe = 15; // More realistic cost estimate (15 billion per million boe)
  const phaseOutCost = Math.max(
    5,
    Math.floor(currentProduction * baseCostPerBoe),
  );

  // More realistic revenue calculation based on actual oil prices
  // Current oil price ~80 USD/barrel, ~6.3 barrels per boe
  const oilPriceUSD = 80;
  const exchangeRate = 10; // USD to NOK
  const revenuePerBoe = (oilPriceUSD * 6.3 * exchangeRate) / 1000; // Convert to thousands NOK
  const yearlyRevenue = Math.floor(currentProduction * revenuePerBoe * 1000); // Convert to millions NOK

  // Assign transition potential based on location and field type
  let transitionPotential: "wind" | "solar" | "data_center" | "research_hub" =
    "wind";
  if (coordinates.lat > 70)
    transitionPotential = "wind"; // Northern fields good for wind
  else if (coordinates.lat < 58)
    transitionPotential = "solar"; // Southern fields good for solar
  else if (currentProduction > 5)
    transitionPotential = "data_center"; // Large fields for data centers
  else transitionPotential = "research_hub"; // Smaller fields for research

  return {
    name: fieldName,
    lon: coordinates.lon,
    lat: coordinates.lat,
    emissions: emissionsHistory.length > 0 ? emissionsHistory : [0],
    intensity: latestData?.emissionIntensity || 0,
    status: "active", // Always start as active, let user phase out
    production: currentProduction,
    workers: Math.floor(currentProduction * 50), // More realistic worker estimate
    phaseOutCost,
    productionOil: latestData?.productionOil,
    productionGas: latestData?.productionGas,
    realEmission: latestData?.emission,
    realEmissionIntensity: latestData?.emissionIntensity,
    yearlyRevenue,
    totalLifetimeEmissions,
    transitionPotential,
  };
};

const loadGameState = (): GameState => {
  // Check if localStorage is available
  if (typeof window === "undefined" || !window.localStorage) {
    console.warn("localStorage not available");
    // Fallback to default state
  }

  const realData = generateCompleteData(data);
  const gameFields = Object.keys(realData).map((fieldName) =>
    createFieldFromRealData(fieldName, realData),
  );

  const defaultState: GameState = {
    gameFields,
    budget: INITIAL_BUDGET,
    score: INITIAL_SCORE,
    year: INITIAL_YEAR,
    selectedField: null,
    showFieldModal: false,
    achievements: [],
    totalEmissions: 0,
    totalProduction: 0,
    shutdowns: {},
    realData,
    currentView: "map",
    investments: {
      green_tech: 0,
      ai_research: 0,
      renewable_energy: 0,
      carbon_capture: 0,
      foreign_cloud: 0,
    },
    globalTemperature: 1.1,
    norwayTechRank: 0,
    foreignDependency: 0,
    climateDamage: 0,
    sustainabilityScore: 100,
    playerChoices: [],
    dataLayerUnlocked: "basic",
    saturationLevel: 100,
    gamePhase: "learning",
    tutorialStep: 0,
    shownFacts: [],
    badChoiceCount: 0,
    goodChoiceStreak: 0,
    selectedFields: [],
    currentEvent: undefined,
    showEventModal: false,
    showAchievementModal: false,
    showGameOverModal: false,
    newAchievements: [],
    nextPhaseOutDiscount: undefined,
    multiPhaseOutMode: false,
    yearlyPhaseOutCapacity: 0,
  };

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    console.log(
      "Loading game state from localStorage:",
      saved ? "found" : "not found",
    );
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("Parsed saved state:", {
        hasGameFields: !!parsed.gameFields,
        gameFieldsCount: parsed.gameFields?.length,
        hasShutdowns: !!parsed.shutdowns,
        shutdownsCount: Object.keys(parsed.shutdowns || {}).length,
        savedFieldStatuses: parsed.gameFields?.map((f: any) => ({
          name: f.name,
          status: f.status,
        })),
      });

      if (parsed && typeof parsed === "object") {
        // Build field status map from saved data
        const savedFieldStatuses = new Map<
          string,
          "active" | "closed" | "transitioning"
        >();

        // Extract field statuses from saved gameFields array
        if (parsed.gameFields && Array.isArray(parsed.gameFields)) {
          parsed.gameFields.forEach((savedField: any) => {
            if (savedField && savedField.name && savedField.status) {
              const status = savedField.status as
                | "active"
                | "closed"
                | "transitioning";
              if (["active", "closed", "transitioning"].includes(status)) {
                savedFieldStatuses.set(savedField.name, status);
                console.log(
                  `Found saved field: ${savedField.name} = ${status}`,
                );
              }
            }
          });
        }

        // Also extract from shutdowns object (backup method)
        if (parsed.shutdowns && typeof parsed.shutdowns === "object") {
          Object.keys(parsed.shutdowns).forEach((fieldName) => {
            if (!savedFieldStatuses.has(fieldName)) {
              savedFieldStatuses.set(fieldName, "closed");
              console.log(`Found field in shutdowns: ${fieldName} = closed`);
            }
          });
        }

        console.log("Total saved field statuses:", savedFieldStatuses.size);

        // Create merged state with proper field statuses
        const mergedState: GameState = {
          ...defaultState,
          // Restore all saved values
          budget:
            typeof parsed.budget === "number"
              ? parsed.budget
              : defaultState.budget,
          score:
            typeof parsed.score === "number"
              ? parsed.score
              : defaultState.score,
          year:
            typeof parsed.year === "number" ? parsed.year : defaultState.year,
          achievements: Array.isArray(parsed.achievements)
            ? parsed.achievements
            : defaultState.achievements,
          shutdowns:
            parsed.shutdowns && typeof parsed.shutdowns === "object"
              ? parsed.shutdowns
              : defaultState.shutdowns,
          investments:
            parsed.investments && typeof parsed.investments === "object"
              ? parsed.investments
              : defaultState.investments,
          globalTemperature:
            typeof parsed.globalTemperature === "number"
              ? parsed.globalTemperature
              : defaultState.globalTemperature,
          norwayTechRank:
            typeof parsed.norwayTechRank === "number"
              ? parsed.norwayTechRank
              : defaultState.norwayTechRank,
          foreignDependency:
            typeof parsed.foreignDependency === "number"
              ? parsed.foreignDependency
              : defaultState.foreignDependency,
          climateDamage:
            typeof parsed.climateDamage === "number"
              ? parsed.climateDamage
              : defaultState.climateDamage,
          sustainabilityScore:
            typeof parsed.sustainabilityScore === "number"
              ? parsed.sustainabilityScore
              : defaultState.sustainabilityScore,
          playerChoices: Array.isArray(parsed.playerChoices)
            ? parsed.playerChoices
            : defaultState.playerChoices,
          dataLayerUnlocked:
            parsed.dataLayerUnlocked || defaultState.dataLayerUnlocked,
          saturationLevel:
            typeof parsed.saturationLevel === "number"
              ? parsed.saturationLevel
              : defaultState.saturationLevel,
          gamePhase: parsed.gamePhase || defaultState.gamePhase,
          tutorialStep:
            typeof parsed.tutorialStep === "number"
              ? parsed.tutorialStep
              : defaultState.tutorialStep,
          shownFacts: Array.isArray(parsed.shownFacts)
            ? parsed.shownFacts
            : defaultState.shownFacts,
          badChoiceCount:
            typeof parsed.badChoiceCount === "number"
              ? parsed.badChoiceCount
              : defaultState.badChoiceCount,
          goodChoiceStreak:
            typeof parsed.goodChoiceStreak === "number"
              ? parsed.goodChoiceStreak
              : defaultState.goodChoiceStreak,
          currentView: parsed.currentView || defaultState.currentView,
          multiPhaseOutMode:
            typeof parsed.multiPhaseOutMode === "boolean"
              ? parsed.multiPhaseOutMode
              : defaultState.multiPhaseOutMode,
          yearlyPhaseOutCapacity:
            typeof parsed.yearlyPhaseOutCapacity === "number"
              ? parsed.yearlyPhaseOutCapacity
              : defaultState.yearlyPhaseOutCapacity,

          // Apply saved field statuses to fresh field data
          gameFields: gameFields.map((field) => {
            const savedStatus = savedFieldStatuses.get(field.name);
            if (savedStatus) {
              console.log(
                `Applying saved status to ${field.name}: ${savedStatus}`,
              );
              return { ...field, status: savedStatus };
            }
            return field;
          }),

          // Restore selected fields with proper status
          selectedFields: Array.isArray(parsed.selectedFields)
            ? parsed.selectedFields
                .map((savedField: any) => {
                  const baseField = gameFields.find(
                    (f) => f.name === savedField.name,
                  );
                  if (baseField) {
                    const savedStatus =
                      savedFieldStatuses.get(savedField.name) ||
                      savedField.status;
                    return { ...baseField, status: savedStatus };
                  }
                  return null;
                })
                .filter(Boolean)
            : defaultState.selectedFields,
        };

        console.log("Final merged state:", {
          totalFields: mergedState.gameFields.length,
          closedFields: mergedState.gameFields.filter(
            (f: Field) => f.status === "closed",
          ).length,
          activeFields: mergedState.gameFields.filter(
            (f: Field) => f.status === "active",
          ).length,
          shutdownsCount: Object.keys(mergedState.shutdowns).length,
          year: mergedState.year,
          budget: mergedState.budget,
          achievements: mergedState.achievements.length,
        });

        return mergedState;
      }
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
    // If there's any error loading the saved state, clear it and start fresh
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  console.log("Using default state");
  return defaultState;
};

// Game restart utility
const createFreshGameState = (): GameState => {
  const realData = generateCompleteData(data);
  const gameFields = Object.keys(realData).map((fieldName) =>
    createFieldFromRealData(fieldName, realData),
  );

  return {
    gameFields,
    budget: INITIAL_BUDGET,
    score: INITIAL_SCORE,
    year: INITIAL_YEAR,
    selectedField: null,
    showFieldModal: false,
    achievements: [],
    totalEmissions: 0,
    totalProduction: 0,
    shutdowns: {},
    realData,
    currentView: "map",
    investments: {
      green_tech: 0,
      ai_research: 0,
      renewable_energy: 0,
      carbon_capture: 0,
      foreign_cloud: 0,
    },
    globalTemperature: 1.1,
    norwayTechRank: 0,
    foreignDependency: 0,
    climateDamage: 0,
    sustainabilityScore: 100,
    playerChoices: [],
    dataLayerUnlocked: "basic",
    saturationLevel: 100,
    gamePhase: "learning",
    tutorialStep: 0,
    shownFacts: [],
    badChoiceCount: 0,
    goodChoiceStreak: 0,
    selectedFields: [],
    currentEvent: undefined,
    showEventModal: false,
    showAchievementModal: false,
    showGameOverModal: false,
    newAchievements: [],
    nextPhaseOutDiscount: undefined,
    multiPhaseOutMode: false,
    yearlyPhaseOutCapacity: 0,
  };
};

const getColorForIntensity = (
  intensity: number,
  status: Field["status"],
): string => {
  if (status === "closed") return "#10B981";
  if (status === "transitioning") return "#F59E0B";
  if (intensity > 15) return "#EF4444";
  if (intensity > 8) return "#F97316";
  if (intensity > 3) return "#EAB308";
  return "#22C55E";
};

// Enhanced badge system with educational messages
const ACHIEVEMENT_BADGES = {
  FIRST_STEPS: {
    emoji: "👶",
    title: "Første Skritt",
    desc: "Faset ut ditt første oljefelt",
  },
  CLIMATE_AWARE: {
    emoji: "🌡️",
    title: "Klimabevisst",
    desc: "Holdt temperaturstigningen under 1.5°C",
  },
  TECH_PIONEER: {
    emoji: "🚀",
    title: "Tech-Pioner",
    desc: "Investerte 100+ mrd i norsk teknologi",
  },
  GREEN_TRANSITION: {
    emoji: "🌱",
    title: "Grønn Omstilling",
    desc: "Konverterte 5+ felt til fornybar energi",
  },
  INDEPENDENCE_HERO: {
    emoji: "🇳🇴",
    title: "Uavhengighets-Helt",
    desc: "Nådde 80%+ teknologisk selvstendighet",
  },
  PLANET_SAVER: {
    emoji: "🌍",
    title: "Planet-Redder",
    desc: "Hindret 500+ Mt CO₂ fra å bli brent",
  },
  ECONOMIC_GENIUS: {
    emoji: "💰",
    title: "Økonomi-Geni",
    desc: "Opprettholdt 1000+ mrd i budsjett",
  },
  FUTURE_BUILDER: {
    emoji: "🏗️",
    title: "Fremtidsbygger",
    desc: "Vant spillet med perfekt balanse",
  },
  CLIMATE_FAILURE: {
    emoji: "🔥",
    title: "Klimakatastrofe",
    desc: "Lot temperaturen stige over 2°C",
  },
  TECH_DEPENDENT: {
    emoji: "🔗",
    title: "Tech-Avhengig",
    desc: "Ble for avhengig av utenlandsk teknologi",
  },
  SHORT_SIGHTED: {
    emoji: "💸",
    title: "Kortsiktig",
    desc: "Prioriterte profitt over planet",
  },
};

// Try to import badge components, fallback if they don't exist
let BadgeComponents: Record<string, React.ComponentType> = {};
try {
  const badges = require("../../components/badges/BadgeShowcase");
  BadgeComponents = {
    "Første Skritt": badges.FirstSteps,
    Klimabevisst: badges.ClimateAware,
    "Tech-Pioner": badges.TechPioneer,
    "Grønn Omstilling": badges.GreenTransition,
    "Uavhengighets-Helt": badges.IndependenceHero,
    "Planet-Redder": badges.PlanetSaver,
    "Økonomi-Geni": badges.EconomicGenius,
    Fremtidsbygger: badges.FutureBuilder,
    Klimakatastrofe: badges.ClimateFailure,
    "Tech-Avhengig": badges.TechDependent,
    Kortsiktig: badges.ShortSighted,
  };
} catch (e) {
  console.log("Badge components not found, using fallback display");
}

// Environmental consequences system
const calculateEnvironmentalState = (gameState: GameState) => {
  const temp = gameState.globalTemperature;
  const activeFields = gameState.gameFields.filter(
    (f) => f.status === "active",
  ).length;
  const totalFields = gameState.gameFields.length;

  if (temp > 2.5)
    return {
      phase: "crisis",
      saturation: 20,
      message: "🔥 KLIMAKATASTROFE! Verden brenner!",
    };
  if (temp > 2.0)
    return {
      phase: "danger",
      saturation: 40,
      message: "⚠️ KRITISK! Temperaturen stiger farlig!",
    };
  if (temp > 1.5)
    return {
      phase: "warning",
      saturation: 70,
      message: "⚡ ADVARSEL! Klimamålene er i fare!",
    };
  if (activeFields / totalFields < 0.3)
    return {
      phase: "victory",
      saturation: 100,
      message: "🌟 FANTASTISK! Du redder verden!",
    };

  return {
    phase: "normal",
    saturation: 85,
    message: "🎯 Fortsett arbeidet for klimaet!",
  };
};

// Progressive UI component that reveals data based on player progress
const ProgressiveDataPanel: React.FC<{
  gameState: GameState;
  layer: DataLayer;
}> = ({ gameState, layer }) => {
  const showBasic = ["basic", "intermediate", "advanced", "expert"].includes(
    layer,
  );
  const showIntermediate = ["intermediate", "advanced", "expert"].includes(
    layer,
  );
  const showAdvanced = ["advanced", "expert"].includes(layer);
  const showExpert = layer === "expert";

  return (
    <div className="progressive-data-panel">
      {showBasic && (
        <div className="data-layer basic">
          <h4>📊 Grunnleggende Data</h4>
          <div className="data-grid">
            <div className="data-item">
              <span>Aktive felt:</span>
              <span>
                {
                  gameState.gameFields.filter((f) => f.status === "active")
                    .length
                }
              </span>
            </div>
            <div className="data-item">
              <span>Utslipp per år:</span>
              <span>{gameState.totalEmissions.toFixed(1)} Mt</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Game Control Panel Component
const GameControlPanel: React.FC<{
  gameState: GameState;
  dispatch: Function;
}> = ({ gameState, dispatch }) => {
  const handleRestart = () => {
    if (
      window.confirm(
        "Er du sikker på at du vil starte spillet på nytt? All fremgang vil gå tapt.",
      )
    ) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      dispatch({ type: "RESTART_GAME" });
    }
  };

  const handleResetTutorial = () => {
    dispatch({ type: "RESET_TUTORIAL" });
  };

  const handleClearStorage = () => {
    if (window.confirm("Er du sikker på at du vil slette all lagret data?")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  };

  const handleTestStorage = () => {
    console.log("=== localStorage Test ===");

    // Test 1: Basic localStorage functionality
    try {
      localStorage.setItem("test-basic", "hello");
      const basicTest = localStorage.getItem("test-basic");
      console.log("Basic test:", basicTest === "hello" ? "PASS" : "FAIL");
    } catch (e) {
      console.log("Basic test: FAIL -", e);
    }

    // Test 2: JSON functionality
    try {
      const testData = { test: "data", timestamp: Date.now() };
      localStorage.setItem("test-json", JSON.stringify(testData));
      const retrieved = localStorage.getItem("test-json");
      const parsed = JSON.parse(retrieved || "{}");
      console.log(
        "JSON test:",
        JSON.stringify(parsed) === JSON.stringify(testData) ? "PASS" : "FAIL",
      );
    } catch (e) {
      console.log("JSON test: FAIL -", e);
    }

    // Test 3: Check current game state
    try {
      const currentGameState = localStorage.getItem(LOCAL_STORAGE_KEY);
      console.log(
        "Current game state:",
        currentGameState ? "EXISTS" : "NOT FOUND",
      );
      if (currentGameState) {
        const parsed = JSON.parse(currentGameState);
        console.log("Game state details:", {
          hasGameFields: !!parsed.gameFields,
          gameFieldsCount: parsed.gameFields?.length,
          closedFields: parsed.gameFields?.filter(
            (f: any) => f.status === "closed",
          )?.length,
        });
      }
    } catch (e) {
      console.log("Game state check: FAIL -", e);
    }

    // Test 4: Try to save a simple game state
    try {
      const simpleState = {
        gameFields: [{ name: "Test Field", status: "closed" }],
        budget: 1000,
        year: 2025,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(simpleState));
      console.log("Save test: PASS");
    } catch (e) {
      console.log("Save test: FAIL -", e);
    }

    alert("Check console for detailed localStorage test results");
  };

  const handleManualSave = () => {
    console.log("=== Manual Save Test ===");
    try {
      const simpleState = {
        gameFields: [{ name: "Test Field", status: "closed" }],
        budget: 1000,
        year: 2025,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(simpleState));
      console.log("Manual save: SUCCESS");
      alert("Manual save completed - refresh to test loading");
    } catch (e) {
      console.log("Manual save: FAIL -", e);
      alert("Manual save failed: " + e);
    }
  };

  const handleTestPhaseOut = () => {
    console.log("=== Testing Phase Out ===");
    // Dispatch a test phase out action
    dispatch({ type: "PHASE_OUT_FIELD", payload: "Ekofisk" });
    console.log("Dispatched PHASE_OUT_FIELD action");
  };

  return (
    <div className="game-control-panel">
      <h3>⚙️ Spillinnstillinger</h3>
      <div className="control-buttons">
        <button
          onClick={handleRestart}
          className="control-button restart-button"
        >
          🔄 Start på nytt
        </button>
        <button
          onClick={handleResetTutorial}
          className="control-button tutorial-button"
        >
          📚 Vis tutorial igjen
        </button>
        <button
          onClick={handleClearStorage}
          className="control-button clear-storage-button"
        >
          🗑️ Slett lagret data
        </button>
        <button
          onClick={handleTestStorage}
          className="control-button test-storage-button"
        >
          🧪 Test localStorage
        </button>
        <button
          onClick={handleManualSave}
          className="control-button manual-save-button"
        >
          💾 Manual Save
        </button>
        <button
          onClick={handleTestPhaseOut}
          className="control-button test-phaseout-button"
        >
          🧪 Test Phase Out
        </button>
        <div className="game-info">
          <small>Spillfremgang lagres automatisk</small>
          <small>
            Environment: {typeof window !== "undefined" ? "Browser" : "Server"}
          </small>
          <small>
            localStorage:{" "}
            {typeof window !== "undefined" && window.localStorage
              ? "Available"
              : "Not Available"}
          </small>
        </div>
      </div>
    </div>
  );
};

// Enhanced tutorial system
const TutorialOverlay: React.FC<{
  step: number;
  onNext: () => void;
  onSkip: () => void;
}> = ({ step, onNext, onSkip }) => {
  const tutorials = [
    {
      title: "Velkommen til Phase Out Village! 🌍",
      text: "Du skal hjelpe Norge med å fase ut olje og bygge en bærekraftig fremtid. Du har 15.000 milliarder NOK (Oljefondet) til disposisjon.",
    },
    {
      title: "Forstå tallene 📊",
      text: "BOE = Barrel Oil Equivalent (fat oljeekvivalent). Mt = Millioner tonn CO₂. mrd = milliarder NOK. Disse enhetene hjelper deg å måle produksjon, utslipp og kostnader.",
    },
    {
      title: "Se oljefeltene 🛢️",
      text: "Røde felt har høy utslippsintensitet (kg CO₂ per BOE). Grønne er 'renere'. Men husk: 98% av utslippene kommer fra FORBRENNING av oljen senere!",
    },
    {
      title: "Klikk for å fase ut 🌱",
      text: "Hver gang du faser ut et felt, hindrer du LIVSTID med CO₂-utslipp fra forbrenning! Kostnaden er i milliarder NOK, men klimagevinsten er enorm.",
    },
    {
      title: "Invester i fremtiden 🚀",
      text: "Bruk pengene på norsk teknologi og grønn omstilling, ikke utenlandske sky-tjenester som øker avhengighet!",
    },
    {
      title: "Følg med på konsekvensene 🌡️",
      text: "Temperaturen måles i grader over førindustriell tid. Over 1.5°C er farlig, over 2°C er katastrofalt. Dårlige valg fører til visuell 'fade out'.",
    },
    {
      title: "Forstå klimapoeng 🌱",
      text: "Du får klimapoeng basert på hvor mye CO₂-utslipp du hindrer. 1 klimapoeng = 1000 tonn CO₂ hindret. Dette viser din reelle klimapåvirkning!",
    },
  ];

  if (step >= tutorials.length) return null;

  const current = tutorials[step];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-popup">
        <div className="tutorial-progress">
          Steg {step + 1} av {tutorials.length}
        </div>
        <h3>{current.title}</h3>
        <p>{current.text}</p>
        <div className="tutorial-buttons">
          <button onClick={onNext} className="tutorial-next">
            {step < tutorials.length - 1 ? "Neste" : "Start spillet!"}
          </button>
          <button onClick={onSkip} className="tutorial-skip">
            Hopp over
          </button>
        </div>
      </div>
    </div>
  );
};

// Gamification feedback system
const GameFeedback: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const envState = calculateEnvironmentalState(gameState);

  return (
    <div className={`game-feedback ${envState.phase}`}>
      <div className="feedback-message">{envState.message}</div>
      {gameState.goodChoiceStreak > 3 && (
        <div className="streak-bonus">
          🔥 {gameState.goodChoiceStreak} gode valg på rad!
        </div>
      )}
      {gameState.badChoiceCount > 2 && (
        <div className="warning-streak">
          ⚠️ {gameState.badChoiceCount} dårlige valg - vær forsiktig!
        </div>
      )}
    </div>
  );
};

// Enhanced achievement checking system
const checkAndAwardAchievements = (state: GameState): string[] => {
  const newAchievements: string[] = [];
  const phasedOutFields = Object.keys(state.shutdowns).length;
  const totalTechInvestment = Object.values(state.investments).reduce(
    (sum, inv) => sum + inv,
    0,
  );
  const totalEmissionsSaved =
    state.gameFields
      .filter((f) => f.status === "closed")
      .reduce((sum, f) => sum + f.totalLifetimeEmissions, 0) / 1000;
  const timeLeft = 2040 - state.year;
  const totalFields = state.gameFields.length;
  const progressPercent = (phasedOutFields / totalFields) * 100;

  console.log("Checking achievements:", {
    phasedOutFields,
    totalTechInvestment,
    totalEmissionsSaved,
    currentTemp: state.globalTemperature,
    timeLeft,
    progressPercent,
  });

  // FØRSTE SKRITT - Umiddelbart når du faser ut første felt
  if (phasedOutFields >= 1 && !state.achievements.includes("Første Skritt")) {
    newAchievements.push("Første Skritt");
  }

  // SPEEDRUNNER - Faset ut 10+ felt på under 5 år
  if (
    phasedOutFields >= 10 &&
    state.year - INITIAL_YEAR <= 5 &&
    !state.achievements.includes("Speedrunner")
  ) {
    newAchievements.push("Speedrunner");
  }

  // UNDER PRESS - Faset ut 50%+ av felt med mindre enn 5 år igjen
  if (
    progressPercent >= 50 &&
    timeLeft <= 5 &&
    !state.achievements.includes("Under Press")
  ) {
    newAchievements.push("Under Press");
  }

  // KLIMABEVISST - Holdt temperatur under 1.5°C og faset ut 5+ felt
  if (
    state.globalTemperature <= 1.2 &&
    phasedOutFields >= 5 &&
    !state.achievements.includes("Klimabevisst")
  ) {
    newAchievements.push("Klimabevisst");
  }

  // TECH-PIONER - 200+ milliarder i tech-investeringer (økt krav)
  if (
    totalTechInvestment >= 200 &&
    !state.achievements.includes("Tech-Pioner")
  ) {
    newAchievements.push("Tech-Pioner");
  }

  // GRØNN OMSTILLING - 15+ felt faset ut (økt krav)
  if (
    phasedOutFields >= 15 &&
    !state.achievements.includes("Grønn Omstilling")
  ) {
    newAchievements.push("Grønn Omstilling");
  }

  // PERFEKT TIMING - Faset ut alle felt akkurat på 2040
  if (
    phasedOutFields === totalFields &&
    state.year === 2040 &&
    !state.achievements.includes("Perfekt Timing")
  ) {
    newAchievements.push("Perfekt Timing");
  }

  // PLANET-REDDER - 100+ Mt CO₂ hindret (økt krav)
  if (
    totalEmissionsSaved >= 100 &&
    !state.achievements.includes("Planet-Redder")
  ) {
    newAchievements.push("Planet-Redder");
  }

  // NEGATIVE ACHIEVEMENTS - nå strengere
  if (
    state.year >= 2040 &&
    phasedOutFields < totalFields * 0.8 &&
    !state.achievements.includes("For Sent")
  ) {
    newAchievements.push("For Sent");
  }

  if (
    state.globalTemperature > 1.8 &&
    !state.achievements.includes("Klimakatastrofe")
  ) {
    newAchievements.push("Klimakatastrofe");
  }

  return newAchievements;
};

// Add time pressure and economic constraints
const calculateYearlyConsequences = (state: GameState) => {
  const yearsPassed = state.year - INITIAL_YEAR;
  const timeLeft = 2040 - state.year;

  // Yearly oil revenue (temptation to keep fields open)
  const activeFields = state.gameFields.filter((f) => f.status === "active");
  const yearlyOilRevenue = activeFields.reduce(
    (sum, f) => sum + f.yearlyRevenue,
    0,
  );

  // Pressure increases as we approach 2040
  const urgencyMultiplier = Math.max(1, (15 - timeLeft) / 5);

  // Climate damage costs increase exponentially
  const climateCostIncrease =
    Math.pow(state.globalTemperature - 1.1, 2) * 500 * urgencyMultiplier;

  // International pressure (Norway must lead by example)
  const internationalPressure = timeLeft < 10 ? (10 - timeLeft) * 100 : 0;

  return {
    yearlyOilRevenue,
    climateCostIncrease,
    internationalPressure,
    urgencyMultiplier,
    timeLeft,
  };
};

// Add random events and challenges
const getRandomEvent = (state: GameState) => {
  const events = [
    {
      id: "oil_price_spike",
      condition: () => Math.random() < 0.3,
      title: "🛢️ Oljepris-sjokkk!",
      description:
        "Oljeprisen har steget dramatisk! Regjeringen presser på for å holde felt åpne.",
      effect: "Får 2000 mrd ekstra, men mister 20 klimapoeng",
      action: (state: GameState) => ({
        ...state,
        budget: state.budget + 2000,
        score: Math.max(0, state.score - 20),
        badChoiceCount: state.badChoiceCount + 1,
      }),
    },
    {
      id: "climate_protests",
      condition: () => state.globalTemperature > 1.3 && Math.random() < 0.4,
      title: "🌍 Klimaprotester!",
      description:
        "Ungdom demonstrerer! Du må fase ut 2 felt GRATIS eller miste legitimitet.",
      effect: "Velg 2 felt å fase ut gratis, eller mist 1000 mrd i støtte",
      action: (state: GameState) => state, // Handle in modal
    },
    {
      id: "tech_breakthrough",
      condition: () => state.norwayTechRank > 50 && Math.random() < 0.25,
      title: "🚀 Teknologisk gjennombrudd!",
      description: "Norsk forskning lykkes! Får rabatt på neste utfasing.",
      effect: "50% rabatt på neste felt du faser ut",
      action: (state: GameState) => ({
        ...state,
        // Add a temporary discount flag
        nextPhaseOutDiscount: 0.5,
      }),
    },
  ];

  return events.find((event) => event.condition());
};

// Place these reducer cases inside your reducer function, for example:

const gameReducer = (state: GameState, action: GameAction): GameState => {
  let newState: GameState;

  // Handle actions that should not trigger localStorage saves
  if (action.type === "RESTART_GAME") {
    return createFreshGameState();
  }

  if (action.type === "LOAD_GAME_STATE") {
    return { ...state, ...action.payload };
  }

  // Process all other actions
  switch (action.type) {
    case "RESET_TUTORIAL":
      newState = { ...state, tutorialStep: 0 };
      break;

    case "PHASE_OUT_FIELD": {
      const fieldName = action.payload;
      const field = state.gameFields.find((f) => f.name === fieldName);

      if (
        !field ||
        field.status === "closed" ||
        state.budget < field.phaseOutCost
      ) {
        return state;
      }

      // Apply discount if available
      const actualCost = state.nextPhaseOutDiscount
        ? field.phaseOutCost * (1 - state.nextPhaseOutDiscount)
        : field.phaseOutCost;

      newState = {
        ...state,
        budget: state.budget - actualCost,
        score: state.score + Math.floor(field.totalLifetimeEmissions / 1000),
        globalTemperature: Math.max(
          1.1,
          state.globalTemperature - field.emissions[0] * 0.001,
        ),
        gameFields: state.gameFields.map((f) =>
          f.name === fieldName
            ? { ...f, status: "closed" as const, production: 0 }
            : f,
        ),
        playerChoices: [
          ...state.playerChoices,
          `Faset ut ${fieldName} - Hindret ${(field.totalLifetimeEmissions / 1000).toFixed(0)} Mt CO2`,
        ],
        year: state.year + 1, // Each phase-out takes 1 year
        goodChoiceStreak: state.goodChoiceStreak + 1,
        badChoiceCount: Math.max(0, state.badChoiceCount - 1),
        shutdowns: { ...state.shutdowns, [fieldName]: state.year + 1 },
        showFieldModal: false,
        selectedField: null,
        nextPhaseOutDiscount: undefined, // Remove discount after use
      };

      // Apply yearly consequences
      const yearlyConsequences = calculateYearlyConsequences(newState);

      // Add oil revenue temptation
      newState.budget += yearlyConsequences.yearlyOilRevenue;

      // Apply climate costs
      newState.budget = Math.max(
        0,
        newState.budget - yearlyConsequences.climateCostIncrease,
      );
      newState.climateDamage += yearlyConsequences.climateCostIncrease;

      // Check for random events
      const randomEvent = getRandomEvent(newState);
      if (randomEvent) {
        newState.currentEvent = randomEvent;
        newState.showEventModal = true;
      }

      // Check for game over conditions
      if (newState.year >= 2040) {
        const totalFields = newState.gameFields.length;
        const phasedOutCount = Object.keys(newState.shutdowns).length;
        const successRate = phasedOutCount / totalFields;

        if (successRate >= 0.8) {
          newState.gamePhase = "victory";
          newState.showGameOverModal = true;
        } else if (successRate >= 0.5) {
          newState.gamePhase = "partial_success";
          newState.showGameOverModal = true;
        } else {
          newState.gamePhase = "defeat";
          newState.showGameOverModal = true;
        }
      }

      // Immediately check for achievements after phase out
      const immediateAchievements = checkAndAwardAchievements(newState);
      if (immediateAchievements.length > 0) {
        newState.achievements = [
          ...newState.achievements,
          ...immediateAchievements,
        ];
        newState.newAchievements = immediateAchievements; // Show modal
        newState.showAchievementModal = true;
      }
      break;
    }

    // Enhanced phase out system - can handle multiple fields per year
    case "PHASE_OUT_SELECTED_FIELDS": {
      const fieldsToPhaseOut = state.selectedFields.filter(
        (field) =>
          field.status === "active" && state.budget >= field.phaseOutCost,
      );

      const capacity = calculatePhaseOutCapacity(state);
      const actualFields = fieldsToPhaseOut.slice(0, capacity);

      if (actualFields.length === 0) return state;

      const totalCost = actualFields.reduce((sum, field) => {
        const actualCost = state.nextPhaseOutDiscount
          ? field.phaseOutCost * (1 - state.nextPhaseOutDiscount)
          : field.phaseOutCost;
        return sum + actualCost;
      }, 0);

      if (state.budget < totalCost) {
        // Show warning - not enough budget
        return {
          ...state,
          showBudgetWarning: true,
          budgetWarningMessage: `Du mangler ${Math.round(totalCost - state.budget)} mrd NOK for å fase ut ${actualFields.length} felt.`,
        };
      }

      const totalEmissionsSaved = actualFields.reduce(
        (sum, field) => sum + field.totalLifetimeEmissions,
        0,
      );
      const totalEmissionsReduction = actualFields.reduce(
        (sum, field) => sum + field.emissions[0],
        0,
      );

      newState = {
        ...state,
        budget: state.budget - totalCost,
        score: state.score + Math.floor(totalEmissionsSaved / 1000),
        globalTemperature: Math.max(
          1.1,
          state.globalTemperature - totalEmissionsReduction * 0.001,
        ),
        gameFields: state.gameFields.map((field) => {
          const isBeingPhasedOut = actualFields.some(
            (f) => f.name === field.name,
          );
          return isBeingPhasedOut
            ? { ...field, status: "closed" as const, production: 0 }
            : field;
        }),
        playerChoices: [
          ...state.playerChoices,
          `År ${state.year + 1}: Faset ut ${actualFields.length} felt - Hindret ${Math.round(totalEmissionsSaved / 1000)} Mt CO2`,
        ],
        year: state.year + 1,
        goodChoiceStreak: state.goodChoiceStreak + actualFields.length,
        badChoiceCount: Math.max(
          0,
          state.badChoiceCount - Math.floor(actualFields.length / 2),
        ),
        shutdowns: {
          ...state.shutdowns,
          ...actualFields.reduce(
            (acc, field) => ({ ...acc, [field.name]: state.year + 1 }),
            {},
          ),
        },
        selectedFields: [],
        multiPhaseOutMode: false,
        nextPhaseOutDiscount: undefined,
        yearlyPhaseOutCapacity: 1, // Set to a default value or calculate inline if needed
      };

      // Apply yearly consequences
      const yearlyConsequences = calculateYearlyConsequences(newState);
      newState.budget += yearlyConsequences.yearlyOilRevenue;
      newState.budget = Math.max(
        0,
        newState.budget - yearlyConsequences.climateCostIncrease,
      );
      newState.climateDamage += yearlyConsequences.climateCostIncrease;

      // Check for random events
      const randomEvent = getRandomEvent(newState);
      if (randomEvent) {
        newState.currentEvent = randomEvent;
        newState.showEventModal = true;
      }

      // Check achievements
      const immediateAchievements = checkAndAwardAchievements(newState);
      if (immediateAchievements.length > 0) {
        newState.achievements = [
          ...newState.achievements,
          ...immediateAchievements,
        ];
        newState.newAchievements = immediateAchievements;
        newState.showAchievementModal = true;
      }

      // Check for game over
      if (newState.year >= 2040) {
        const totalFields = newState.gameFields.length;
        const phasedOutCount = Object.keys(newState.shutdowns).length;
        const successRate = phasedOutCount / totalFields;

        if (successRate >= 0.8) {
          newState.gamePhase = "victory";
        } else if (successRate >= 0.5) {
          newState.gamePhase = "partial_success";
        } else {
          newState.gamePhase = "defeat";
        }
        newState.showGameOverModal = true;
      }

      return newState;
    }

    case "TOGGLE_MULTI_SELECT":
      return {
        ...state,
        multiPhaseOutMode: !state.multiPhaseOutMode,
        selectedFields: [],
        selectedField: null,
        showFieldModal: false,
      };

    case "SELECT_FIELD_FOR_MULTI":
      if (state.selectedFields.some((f) => f.name === action.payload.name)) {
        return state; // Already selected
      }
      return {
        ...state,
        selectedFields: [...state.selectedFields, action.payload],
      };

    case "DESELECT_FIELD_FROM_MULTI":
      return {
        ...state,
        selectedFields: state.selectedFields.filter(
          (f) => f.name !== action.payload,
        ),
      };

    case "CLEAR_SELECTED_FIELDS":
      return {
        ...state,
        selectedFields: [],
        multiPhaseOutMode: false,
      };

    case "ADVANCE_YEAR_MANUALLY": {
      // Allow players to skip a year if they want
      const yearlyConsequences = calculateYearlyConsequences(state);

      newState = {
        ...state,
        year: state.year + 1,
        budget:
          state.budget +
          yearlyConsequences.yearlyOilRevenue -
          yearlyConsequences.climateCostIncrease,
        climateDamage:
          state.climateDamage + yearlyConsequences.climateCostIncrease,
        globalTemperature: Math.min(3.0, state.globalTemperature + 0.02), // Slight temperature increase for inaction
        badChoiceCount: state.badChoiceCount + 1,
        goodChoiceStreak: 0,
      };

      // Random event chance
      const randomEvent = getRandomEvent(newState);
      if (randomEvent) {
        newState.currentEvent = randomEvent;
        newState.showEventModal = true;
      }

      return newState;
    }

    case "CLOSE_ACHIEVEMENT_MODAL":
      return { ...state, showAchievementModal: false };

    case "CLOSE_EVENT_MODAL":
      return { ...state, showEventModal: false };

    case "CLOSE_GAME_OVER_MODAL":
      return { ...state, showGameOverModal: false };

    case "SET_SELECTED_FIELD":
      return { ...state, selectedField: action.payload };

    case "TOGGLE_FIELD_MODAL":
      return { ...state, showFieldModal: action.payload };

    case "UPDATE_EMISSIONS_PRODUCTION":
      const activeFields = state.gameFields.filter(
        (f) => f.status === "active",
      );
      const totalEmissions = activeFields.reduce(
        (sum, f) => sum + f.emissions[0],
        0,
      );
      const totalProduction = activeFields.reduce(
        (sum, f) => sum + f.production,
        0,
      );
      return { ...state, totalEmissions, totalProduction };

    case "SET_VIEW_MODE":
      return { ...state, currentView: action.payload };

    case "MAKE_INVESTMENT":
      const { type: investmentType, amount } = action.payload;
      if (state.budget < amount) return state;

      newState = {
        ...state,
        budget: state.budget - amount,
        investments: {
          ...state.investments,
          [investmentType]: state.investments[investmentType] + amount,
        },
      };

      // Update tech rank based on investments
      const totalGoodInvestments =
        newState.investments.green_tech +
        newState.investments.ai_research +
        newState.investments.renewable_energy;
      const totalBadInvestments = newState.investments.foreign_cloud;

      newState.norwayTechRank = Math.min(
        100,
        Math.max(0, (totalGoodInvestments - totalBadInvestments) / 10),
      );

      return newState;

    case "ADVANCE_TUTORIAL":
      return { ...state, tutorialStep: state.tutorialStep + 1 };

    case "SKIP_TUTORIAL":
      return { ...state, tutorialStep: 10 }; // Skip all tutorial steps

    // ...existing cases...

    default:
      return state;
  }

  // Save to localStorage - improved saving logic
  if (newState) {
    console.log("Saving state for action:", action.type);
    try {
      // Create a complete state object for saving that preserves field statuses
      const stateToSave = {
        // Save complete field data with status
        gameFields: newState.gameFields.map((field) => ({
          name: field.name,
          status: field.status,
          // Include other essential field properties that might have changed
          phaseOutCost: field.phaseOutCost,
          production: field.production,
        })),
        budget: newState.budget,
        score: newState.score,
        year: newState.year,
        achievements: newState.achievements,
        shutdowns: newState.shutdowns,
        investments: newState.investments,
        globalTemperature: newState.globalTemperature,
        norwayTechRank: newState.norwayTechRank,
        foreignDependency: newState.foreignDependency,
        climateDamage: newState.climateDamage,
        sustainabilityScore: newState.sustainabilityScore,
        playerChoices: newState.playerChoices,
        dataLayerUnlocked: newState.dataLayerUnlocked,
        saturationLevel: newState.saturationLevel,
        gamePhase: newState.gamePhase,
        tutorialStep: newState.tutorialStep,
        shownFacts: newState.shownFacts,
        badChoiceCount: newState.badChoiceCount,
        goodChoiceStreak: newState.goodChoiceStreak,
        selectedFields: newState.selectedFields.map((field) => ({
          name: field.name,
          status: field.status,
        })),
        currentView: newState.currentView,
        multiPhaseOutMode: newState.multiPhaseOutMode,
        yearlyPhaseOutCapacity: newState.yearlyPhaseOutCapacity,
        // Include timestamp for debugging
        lastSaved: new Date().toISOString(),
      };

      const serializedState = JSON.stringify(stateToSave);
      localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);

      const closedFieldsCount = stateToSave.gameFields.filter(
        (f) => f.status === "closed",
      ).length;
      console.log(
        `✅ Saved game state - Action: ${action.type}, Closed fields: ${closedFieldsCount}, Shutdowns: ${Object.keys(stateToSave.shutdowns).length}`,
      );

      // Verify the save worked by reading it back
      const verification = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (verification) {
        const parsed = JSON.parse(verification);
        const verifyClosedFields =
          parsed.gameFields?.filter((f: any) => f.status === "closed")
            ?.length || 0;
        console.log(
          `✅ Verification: ${verifyClosedFields} closed fields saved correctly`,
        );
      }
    } catch (error) {
      console.error("❌ Failed to save game state:", error);

      // Try a simpler save as fallback
      try {
        const simplifiedState = {
          gameFields: newState.gameFields.map((f) => ({
            name: f.name,
            status: f.status,
          })),
          shutdowns: newState.shutdowns,
          budget: newState.budget,
          score: newState.score,
          year: newState.year,
          achievements: newState.achievements,
        };
        localStorage.setItem(
          LOCAL_STORAGE_KEY + "_backup",
          JSON.stringify(simplifiedState),
        );
        console.log("✅ Fallback save completed");
      } catch (fallbackError) {
        console.error("❌ Even fallback save failed:", fallbackError);
      }
    }

    return newState;
  }

  return state;
};

// Enhanced Achievement Modal with your badge images
const AchievementModal: React.FC<{
  achievements: string[];
  onClose: () => void;
}> = ({ achievements, onClose }) => {
  if (achievements.length === 0) return null;

  return (
    <div className="modal achievement-modal">
      <div className="modal-content achievement-modal-content">
        <h2 className="achievement-modal-title">🎉 Gratulerer!</h2>
        <div className="achievement-modal-grid">
          {achievements.map((achievement, index) => {
            const BadgeComponent = BadgeComponents[achievement];
            const badge = Object.values(ACHIEVEMENT_BADGES).find(
              (b) => b.title === achievement,
            );

            return (
              <div key={index} className="achievement-modal-item">
                <div className="achievement-modal-badge">
                  {BadgeComponent ? (
                    <BadgeComponent />
                  ) : (
                    <div className="fallback-emoji">{badge?.emoji}</div>
                  )}
                </div>
                <h3 className="achievement-modal-name">
                  {badge?.title || achievement}
                </h3>
                <p className="achievement-modal-desc">{badge?.desc}</p>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="achievement-modal-close">
          Fantastisk! 🎊
        </button>
      </div>
    </div>
  );
};

// Game Over Modal
const GameOverModal: React.FC<{
  gamePhase: string;
  stats: any;
  onRestart: () => void;
  onClose: () => void;
}> = ({ gamePhase, stats, onRestart, onClose }) => {
  const getGameOverContent = () => {
    switch (gamePhase) {
      case "victory":
        return {
          title: "🌟 PERFEKT! Norge er karbonnøytral!",
          message:
            "Du klarte å fase ut olje-industrien i tide! Verden ser til Norge som et forbilde.",
          color: "#10B981",
        };
      case "partial_success":
        return {
          title: "⚡ Delvis suksess",
          message:
            "Du kom langt, men ikke helt i mål. Norge må fortsette arbeidet.",
          color: "#F59E0B",
        };
      case "defeat":
        return {
          title: "💥 Klimakatastrofe",
          message: "Tiden løp ut. Norge klarte ikke omstillingen i tide.",
          color: "#EF4444",
        };
      default:
        return { title: "Spill over", message: "", color: "#6B7280" };
    }
  };

  const content = getGameOverContent();

  return (
    <div className="modal game-over-modal">
      <div
        className="modal-content game-over-content"
        style={{ borderTop: `4px solid ${content.color}` }}
      >
        <h2 style={{ color: content.color }}>{content.title}</h2>
        <p className="game-over-message">{content.message}</p>

        <div className="game-over-stats">
          <h3>📊 Dine resultater:</h3>
          <div className="stat-row">
            <span>Felt faset ut:</span>
            <span>
              {stats.phasedOut}/{stats.total} (
              {Math.round((stats.phasedOut / stats.total) * 100)}%)
            </span>
          </div>
          <div className="stat-row">
            <span>CO₂ hindret:</span>
            <span>{stats.co2Saved} Mt</span>
          </div>
          <div className="stat-row">
            <span>Sluttår:</span>
            <span>{stats.finalYear}</span>
          </div>
          <div className="stat-row">
            <span>Prestasjoner:</span>
            <span>{stats.achievements}</span>
          </div>
        </div>

        <div className="game-over-buttons">
          <button onClick={onRestart} className="restart-button">
            🔄 Spill igjen
          </button>
          <button onClick={onClose} className="close-button">
            📊 Se resultater
          </button>
        </div>
      </div>
    </div>
  );
};

// Updated main component
const PhaseOutMapPage: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, loadGameState());
  const {
    gameFields,
    budget,
    score,
    year,
    selectedField,
    showFieldModal,
    achievements,
    totalEmissions,
    totalProduction,
    currentView,
  } = gameState;

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<OlMap | null>(null);

  // Update totals
  useEffect(() => {
    dispatch({ type: "UPDATE_EMISSIONS_PRODUCTION" });
  }, [gameFields]);

  // Enhanced field click handling for multi-select
  const handleFieldClick = (
    field: Field,
    gameState: GameState,
    dispatch: Function,
  ) => {
    if (gameState.multiPhaseOutMode) {
      if (field.status !== "active") return;

      const isSelected = gameState.selectedFields.some(
        (f) => f.name === field.name,
      );

      if (isSelected) {
        dispatch({ type: "DESELECT_FIELD_FROM_MULTI", payload: field.name });
      } else {
        const capacity = calculatePhaseOutCapacity(gameState);
        if (gameState.selectedFields.length < capacity) {
          dispatch({ type: "SELECT_FIELD_FOR_MULTI", payload: field });
        }
      }
    } else {
      // Normal single-select mode
      dispatch({ type: "SET_SELECTED_FIELD", payload: field });
      dispatch({ type: "TOGGLE_FIELD_MODAL", payload: true });
    }
  };

  // Initialize map only when in map view
  useEffect(() => {
    if (!mapRef.current || currentView !== "map") return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new OlMap({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: "https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
              attributions: "&copy; OpenStreetMap contributors & Carto",
            }),
          }),
        ],
        view: new View({
          center: fromLonLat(DEFAULT_MAP_CENTER),
          zoom: DEFAULT_MAP_ZOOM,
        }),
        controls: [],
      });

      mapInstanceRef.current.on("singleclick", function (evt: any) {
        mapInstanceRef.current?.forEachFeatureAtPixel(
          evt.pixel,
          function (feature: any) {
            const fieldData = feature.get("fieldData");
            if (fieldData) {
              handleFieldClick(fieldData, gameState, dispatch);
            }
          },
        );
      });
    }

    // Update map size when switching to map view
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateSize();
      }
    }, 100);

    const map = mapInstanceRef.current;
    let vectorLayer = map
      .getLayers()
      .getArray()
      .find((layer) => layer instanceof VectorLayer) as VectorLayer | undefined;

    // Enhanced map rendering with multi-select visual feedback
    const vectorSource = new VectorSource({
      features: gameFields.map((field) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([field.lon, field.lat])),
          name: field.name,
          fieldData: field,
        });

        let color = getColorForIntensity(field.intensity, field.status);
        let strokeColor = "#FFFFFF";
        let strokeWidth = 2;

        // Multi-select visual feedback
        if (gameState.multiPhaseOutMode) {
          const isSelected = gameState.selectedFields.some(
            (f) => f.name === field.name,
          );
          if (isSelected) {
            strokeColor = "#FFD700"; // Gold border for selected
            strokeWidth = 4;
          } else if (field.status === "active") {
            strokeColor = "#00FF00"; // Green border for selectable
            strokeWidth = 3;
          }
        }

        const size =
          field.status === "closed"
            ? 8
            : Math.max(8, Math.min(16, field.production * 0.5));

        feature.setStyle(
          new Style({
            image: new Circle({
              radius: size,
              fill: new Fill({ color: color }),
              stroke: new Stroke({ color: strokeColor, width: strokeWidth }),
            }),
            text: new Text({
              text: field.status === "closed" ? "🌱" : "🛢️",
              offsetY: -25,
              font: "16px sans-serif",
            }),
          }),
        );
        return feature;
      }),
    });

    if (vectorLayer) {
      vectorLayer.setSource(vectorSource);
    } else {
      vectorLayer = new VectorLayer({ source: vectorSource });
      map.addLayer(vectorLayer);
    }

    return () => {
      if (mapInstanceRef.current && !mapRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [
    gameFields,
    currentView,
    gameState.multiPhaseOutMode,
    gameState.selectedFields,
  ]);

  const phaseOutField = useCallback((fieldName: string) => {
    dispatch({ type: "PHASE_OUT_FIELD", payload: fieldName });
  }, []);

  const emissionsData = useMemo(() => {
    // Transform game data for emissions chart
    const years = Array.from({ length: year - 2020 + 1 }, (_, i) => 2020 + i);
    return gameFields.map((field) => ({
      name: field.name,
      data: years.map((y) => {
        // If field is closed and shutdown year is before current year, emissions = 0
        const shutdownYear = gameState.shutdowns[field.name];
        if (shutdownYear && y >= shutdownYear) {
          return 0;
        }
        // Use historical data or current emissions
        return field.emissions[0] || 0;
      }),
    }));
  }, [gameFields, year, gameState.shutdowns]);

  const renderCurrentView = () => {
    switch (currentView) {
      case "emissions":
        return (
          <div className="view-container">
            <EmissionsView data={emissionsData} />
            <div className="game-impact-summary">
              <h3>🎮 Din påvirkning</h3>
              <p>
                Totale utslipp redusert:{" "}
                {Object.keys(gameState.shutdowns).length * 2.5}Mt CO₂
              </p>
              <p>Felt faset ut: {Object.keys(gameState.shutdowns).length}</p>
            </div>
          </div>
        );
      case "map":
      default:
        return (
          <div className="map-container">
            <h2 className="map-title">🗺️ Norske Oljeområder</h2>
            <div ref={mapRef} className="map-div" />
            <div className="map-hint">
              {gameState.multiPhaseOutMode
                ? `⚡ Multi-utfasing: Klikk på opptil ${calculatePhaseOutCapacity(gameState)} felt å fase ut samtidig!`
                : "Klikk på et oljefelt for å fase det ut! 🛢️ → 🌱"}
            </div>
          </div>
        );
    }
  };

  // Enhanced phase out system - can handle multiple fields per year
  const calculatePhaseOutCapacity = (state: GameState): number => {
    const baseCapacity = 3; // Can phase out 3 fields per year by default
    const techBonus = Math.floor(state.norwayTechRank / 20); // +1 for every 20% tech rank
    const investmentBonus = Math.floor(
      Object.values(state.investments).reduce((sum, inv) => sum + inv, 0) / 100,
    ); // +1 for every 100 billion invested

    return Math.min(8, baseCapacity + techBonus + investmentBonus); // Max 8 fields per year
  };

  return (
    <div
      className="container"
      style={{
        filter: `saturate(${gameState.saturationLevel}%) brightness(${gameState.saturationLevel > 60 ? 100 : 80}%)`,
        transition: "filter 1s ease-in-out",
      }}
    >
      {/* Achievement Notification */}
      <AchievementNotification achievements={gameState.achievements} />

      {/* Tutorial overlay */}
      {gameState.tutorialStep < 7 && (
        <TutorialOverlay
          step={gameState.tutorialStep}
          onNext={() => dispatch({ type: "ADVANCE_TUTORIAL" })}
          onSkip={() => dispatch({ type: "SKIP_TUTORIAL" })}
        />
      )}

      {/* Game feedback */}
      <GameFeedback gameState={gameState} />

      {/* Debug panel */}
      <AchievementDebugPanel gameState={gameState} />

      {/* Multi-select controls */}
      <MultiSelectControls gameState={gameState} dispatch={dispatch} />

      {/* Header */}
      <div className="header">
        <div className="header-top">
          <h1 className="title">🌍 PHASE OUT VILLAGE</h1>
          <div className="year-badge">TIL 2040!</div>
        </div>

        {/* Progress Bar - Moved here to be inside the header, as in the screenshot */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((gameFields.length - gameFields.filter((f) => f.status === "active").length) / gameFields.length) * 100}%`,
            }}
          />
        </div>

        {/* Game Stats */}
        <div className="stats-grid">
          <div className="stat-card stat-card-green">
            <div className="stat-emoji">🌱</div>
            <div className="stat-value" style={{ color: "#166534" }}>
              {score}
            </div>
            <div className="stat-label" style={{ color: "#16A34A" }}>
              Klimapoeng
            </div>
          </div>
          <div className="stat-card stat-card-yellow">
            <div className="stat-emoji">💰</div>
            <div className="stat-value" style={{ color: "#92400E" }}>
              {budget} mrd
            </div>
            <div className="stat-label" style={{ color: "#D97706" }}>
              Budsjett
            </div>
          </div>
          <div className="stat-card stat-card-blue">
            <div className="stat-emoji">📅</div>
            <div className="stat-value" style={{ color: "#1E40AF" }}>
              {year}
            </div>
            <div className="stat-label" style={{ color: "#2563EB" }}>
              År
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`view-button ${currentView === "map" ? "view-button-active" : ""}`}
          onClick={() => dispatch({ type: "SET_VIEW_MODE", payload: "map" })}
        >
          🗺️ Kart
        </button>
        <button
          className={`view-button ${currentView === "emissions" ? "view-button-active" : ""}`}
          onClick={() =>
            dispatch({ type: "SET_VIEW_MODE", payload: "emissions" })
          }
        >
          📊 Utslipp
        </button>
      </div>

      {/* Dynamic View Container and Stats Dashboard */}
      <div className="main-content-area">
        {renderCurrentView()}

        {/* Stats Dashboard */}
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3 className="dashboard-title">📊 Utslipp</h3>
            <div className="dashboard-value">
              {totalEmissions.toFixed(1)} Mt
            </div>
            <div className="dashboard-label">CO₂ per år</div>
          </div>
          <div className="dashboard-card">
            <h3 className="dashboard-title">⚡ Produksjon</h3>
            <div className="dashboard-value-orange">
              {totalProduction.toFixed(1)} mill. boe
            </div>
            <div className="dashboard-label">per år</div>
          </div>
        </div>

        {/* Enhanced achievements display - always show even if empty */}
        <div className="achievement-card">
          <h3 className="achievement-title">
            🏆 Dine Prestasjoner ({achievements.length})
          </h3>
          {achievements.length === 0 ? (
            <div className="no-achievements">
              <p>
                Ingen prestasjoner ennå. Fase ut ditt første oljefelt for å få
                "Første Skritt"!
              </p>
            </div>
          ) : (
            <div className="achievement-list enhanced">
              {achievements.map((achievement, index) => {
                const BadgeComponent = BadgeComponents[achievement];
                const badge = Object.values(ACHIEVEMENT_BADGES).find(
                  (b) => b.title === achievement,
                );

                return (
                  <div
                    key={index}
                    className="achievement-item"
                    title={badge?.desc}
                  >
                    <div className="achievement-badge-display">
                      {BadgeComponent ? (
                        <BadgeComponent />
                      ) : (
                        <div className="fallback-badge">
                          <span className="fallback-emoji">{badge?.emoji}</span>
                          <span className="fallback-title">
                            {badge?.title || achievement}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="achievement-label">
                      {badge?.title || achievement}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Game Control Panel */}
        <GameControlPanel gameState={gameState} dispatch={dispatch} />

        {/* Climate Dashboard */}
        {/* <ClimateDashboard gameState={gameState} /> */}

        {/* Investment Panel */}
        <InvestmentPanel gameState={gameState} dispatch={dispatch} />
      </div>

      {/* Progressive data panel */}
      <ProgressiveDataPanel
        gameState={gameState}
        layer={gameState.dataLayerUnlocked}
      />

      {/* Field Modal */}
      {showFieldModal && (
        <FieldModal
          selectedField={selectedField}
          budget={budget}
          onPhaseOut={phaseOutField}
          onClose={() =>
            dispatch({ type: "TOGGLE_FIELD_MODAL", payload: false })
          }
        />
      )}

      {/* Achievement Modal */}
      {gameState.showAchievementModal && (
        <AchievementModal
          achievements={gameState.newAchievements || []}
          onClose={() => dispatch({ type: "CLOSE_ACHIEVEMENT_MODAL" })}
        />
      )}

      {/* Game Over Modal */}
      {gameState.showGameOverModal && (
        <GameOverModal
          gamePhase={gameState.gamePhase}
          stats={{
            phasedOut: Object.keys(gameState.shutdowns).length,
            total: gameState.gameFields.length,
            co2Saved: Math.round(
              gameState.gameFields
                .filter((f) => f.status === "closed")
                .reduce((sum, f) => sum + f.totalLifetimeEmissions, 0) / 1000,
            ),
            finalYear: gameState.year,
            achievements: gameState.achievements.length,
          }}
          onRestart={() => dispatch({ type: "RESTART_GAME" })}
          onClose={() => dispatch({ type: "CLOSE_GAME_OVER_MODAL" })}
        />
      )}

      {/* Time pressure indicator */}
      {gameState.year >= 2030 && (
        <div className="time-pressure-warning">
          ⏰ {2040 - gameState.year} år igjen til 2040!
          {gameState.year >= 2038 && <span className="urgent"> KRITISK!</span>}
          <br />
          <small>
            Kapasitet: {calculatePhaseOutCapacity(gameState)} felt/år
          </small>
        </div>
      )}
    </div>
  );
};

export default PhaseOutMapPage;

// This function should be moved outside the component to be accessible by the reducer.
const calculatePhaseOutCapacity = (state: GameState): number => {
  // Base capacity: How many fields can be phased out per year by default.
  const baseCapacity = 3;

  // Tech bonus: Capacity increases with Norway's tech rank.
  // For every 20 points in tech rank, capacity increases by 1.
  const techBonus = Math.floor(state.norwayTechRank / 20);

  // Investment bonus: Capacity increases with total investments in green tech.
  // For every 100 billion NOK invested, capacity increases by 1.
  const totalInvestment =
    state.investments.green_tech +
    state.investments.renewable_energy +
    state.investments.ai_research;
  const investmentBonus = Math.floor(totalInvestment / 100);

  // The total capacity is the sum of base capacity and bonuses, with a maximum cap.
  const totalCapacity = baseCapacity + techBonus + investmentBonus;

  // Cap the maximum number of fields that can be phased out in a single year.
  return Math.min(8, totalCapacity);
};

// The following components are not defined in the provided code.
// These are placeholders to resolve compilation errors.

const AchievementNotification: React.FC<{ achievements: string[] }> = ({
  achievements,
}) => {
  // This is a placeholder. A real implementation would show a temporary notification.
  if (achievements.length > 0) {
    // console.log("New achievement unlocked:", achievements[achievements.length - 1]);
  }
  return null;
};

const AchievementDebugPanel: React.FC<{ gameState: GameState }> = ({
  gameState,
}) => {
  // This is a placeholder for a debug component.
  return null;
};

const MultiSelectControls: React.FC<{
  gameState: GameState;
  dispatch: Function;
}> = ({ gameState, dispatch }) => {
  // This is a placeholder for multi-select UI controls.
  if (!gameState.multiPhaseOutMode) return null;
  return (
    <div className="multi-select-controls">
      <button onClick={() => dispatch({ type: "PHASE_OUT_SELECTED_FIELDS" })}>
        Phase Out Selected ({gameState.selectedFields.length})
      </button>
      <button onClick={() => dispatch({ type: "CLEAR_SELECTED_FIELDS" })}>
        Cancel
      </button>
    </div>
  );
};

const InvestmentPanel: React.FC<{
  gameState: GameState;
  dispatch: Function;
}> = ({ gameState, dispatch }) => {
  // This is a placeholder for an investment UI panel.
  return (
    <div className="investment-panel">
      <h4>Invest</h4>
      {/* Add investment buttons here */}
    </div>
  );
};
