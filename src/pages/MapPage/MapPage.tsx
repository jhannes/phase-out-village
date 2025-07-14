import React, {
  useEffect,
  useRef,
  // useState,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import MultiPhaseOutSummary from "../../components/MultiPhaseOutSummary/MultiPhaseOutSummary";
import { gameReducer } from "../../state/GameReducer";
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
import Overlay from "ol/Overlay";
import Style from "ol/style/Style";
import { Fill, Stroke, Text } from "ol/style";
import "ol/ol.css";
import "./MapPage.css";
import { data } from "../../generated/data";
import { generateCompleteData } from "../../utils/projections";
import { OilFieldDataset, ShutdownMap } from "../../types/types";
import { EmissionsView } from "../../components/charts/EmissionsView";
import { type } from "os";
import { checkAndAwardAchievements } from "../../achievements";
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
  | "hydrogen_tech"
  | "quantum_computing"
  | "battery_tech"
  | "offshore_wind"
  | "foreign_cloud"
  | "fossil_subsidies"
  | "crypto_mining"
  | "fast_fashion";

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
const LOCAL_STORAGE_KEY = "phaseOutVillageGameState";
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
  Gudrun: { lon: 3.4, lat: 59.2 },
  Gullfaks: { lon: 2.3, lat: 61.2 },
  Heidrun: { lon: 6.6, lat: 65.3 },
  Ivar: { lon: 2.0, lat: 58.9 },
  "Johan Castberg": { lon: 10.8, lat: 71.6 },
  "Johan Sverdrup": { lon: 3.3, lat: 58.9 },
  Kristin: { lon: 6.6, lat: 65.0 },
  Kvitebjørn: { lon: 2.1, lat: 61.0 },
  "Martin Linge": { lon: 5.1, lat: 60.8 },
  Njord: { lon: 6.4, lat: 64.8 },
  Norne: { lon: 8.1, lat: 66.0 },
  Oseberg: { lon: 2.8, lat: 60.5 },
  Sleipner: { lon: 4.7, lat: 58.4 },
  Snorre: { lon: 2.1, lat: 61.4 },
  Statfjord: { lon: 1.9, lat: 61.3 },
  Troll: { lon: 3.7, lat: 60.6 },
  Ula: { lon: 2.9, lat: 57.1 },
  Visund: { lon: 2.3, lat: 61.4 },
  "Ormen Lange": { lon: 8.1, lat: 64.7 },
  Skarv: { lon: 7.5, lat: 65.5 },
  Snøhvit: { lon: 21.3, lat: 71.6 },
  Valhall: { lon: 3.4, lat: 56.3 },
  Yme: { lon: 2.2, lat: 58.1 },
  Åsgard: { lon: 7.0, lat: 65.2 },
};

const INITIAL_BUDGET = 15000; // 15 trillion NOK (closer to actual Oil Fund size)
const INITIAL_SCORE = 0; // Start from zero
const INITIAL_YEAR = 2025;
const DEFAULT_MAP_CENTER = [6, 63];
const DEFAULT_MAP_ZOOM = 6;

// --- Utility Functions ---
const getFieldAbbreviation = (fieldName: string): string => {
  const abbreviations: Record<string, string> = {
    "Aasta Hansteen": "AH",
    Alvheim: "AL",
    Balder: "BD",
    Brage: "BR",
    Draugen: "DR",
    "Edvard Grieg": "EG",
    Ekofisk: "EK",
    Eldfisk: "EL",
    Gjøa: "GJ",
    Goliat: "GO",
    Grane: "GR",
    Gullfaks: "GF",
    Heidrun: "HE",
    "Johan Castberg": "JC",
    "Johan Sverdrup": "JS",
    Kristin: "KR",
    Kvitebjørn: "KV",
    "Martin Linge": "ML",
    Njord: "NJ",
    Norne: "NO",
    "Ormen Lange": "OL",
    Oseberg: "OS",
    Skarv: "SK",
    Sleipner: "SL",
    Snorre: "SN",
    Snøhvit: "SH",
    Statfjord: "ST",
    Troll: "TR",
    Ula: "UL",
    Valhall: "VH",
    Visund: "VI",
    Yme: "YM",
    Åsgard: "ÅS",
  };
  return abbreviations[fieldName] || fieldName.substring(0, 2).toUpperCase();
};

const createFieldFromRealData = (
  fieldName: string,
  realData: OilFieldDataset,
): Field => {
  const yearlyData = realData[fieldName];
  const latestYear = Math.max(...Object.keys(yearlyData).map(Number));
  const latestData = yearlyData[latestYear.toString()];

  const coordinates = FIELD_COORDINATES[fieldName] || {
    lon: 5,
    lat: 62,
  };
  if (!FIELD_COORDINATES[fieldName]) {
    console.warn(`Missing coordinates for field: ${fieldName}, using fallback`);
  }

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
  console.log("Available fields in realData:", Object.keys(realData));
  const gameFields = Object.keys(realData).map((fieldName) =>
    createFieldFromRealData(fieldName, realData),
  );
  console.log(
    "Created gameFields:",
    gameFields.map((f) => `${f.name} [${f.lon}, ${f.lat}]`),
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
      hydrogen_tech: 0,
      quantum_computing: 0,
      battery_tech: 0,
      offshore_wind: 0,
      foreign_cloud: 0,
      fossil_subsidies: 0,
      crypto_mining: 0,
      fast_fashion: 0,
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
              ? { ...defaultState.investments, ...parsed.investments }
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
      hydrogen_tech: 0,
      quantum_computing: 0,
      battery_tech: 0,
      offshore_wind: 0,
      foreign_cloud: 0,
      fossil_subsidies: 0,
      crypto_mining: 0,
      fast_fashion: 0,
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
// Colors for the oilfields in the map, shows intensity level of production
const getColorForIntensity = (
  intensity: number,
  status: Field["status"],
): string => {
  if (status === "closed") return "#10B981"; // Bright green for phased out
  if (status === "transitioning") return "#F59E0B"; // Orange for transitioning
  if (intensity > 15) return "#DC2626"; // Dark red for very high intensity
  if (intensity > 8) return "#EF4444"; // Red for high intensity
  if (intensity > 3) return "#F97316"; // Orange for medium intensity
  return "#64748B"; // Gray for low intensity (not green!)
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
// TODO: Define what data belongs to each layer (basic, intermediate, advanced, expert)
// TODO: Implement conditional rendering for each data layer in ProgressiveDataPanel
// TODO: Add unlock logic for intermediate layer (e.g., after phasing out X fields)
// TODO: Add unlock logic for advanced layer (e.g., after reaching Y score or year)
// TODO: Add unlock logic for expert layer (e.g., after earning a specific achievement)
// TODO: Display a message or animation when a new data layer is unlocked
// TODO: Refactor data panel to support dynamic layer updates based on game state
// TODO: Implement this component
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
        <button
          onClick={() => {
            console.log(
              "Toggling multi-select mode. Current:",
              gameState.multiPhaseOutMode,
            );
            dispatch({ type: "TOGGLE_MULTI_SELECT" });
          }}
          className="control-button multi-select-button"
          style={{
            background: gameState.multiPhaseOutMode ? "#22C55E" : "#6B7280",
          }}
        >
          {gameState.multiPhaseOutMode ? "✅" : "📋"} Multi-Select Mode
        </button>
        <button
          onClick={() => {
            console.log("Advancing year. Current year:", gameState.year);
            dispatch({ type: "ADVANCE_YEAR_MANUALLY" });
          }}
          className="control-button advance-year-button"
        >
          ⏰ Gå til neste år ({gameState.year})
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
      text: "Du skal hjelpe Norge med å fase ut olje og bygge en bærekraftig fremtid. Du har 15.000 milliarder NOK (Oljefondet) til disposisjon. Mål: Fase ut 80% av feltene før 2040!",
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
      title: "Multi-Select Mode 📋",
      text: "Aktiver Multi-Select Mode for å fase ut flere felt samtidig! Dette er nøkkelen til å nå målet - du kan fase ut opptil 8 felt per år senere i spillet.",
    },
    {
      title: "Invester i fremtiden 🚀",
      text: "Bruk pengene på norsk teknologi og grønn omstilling, ikke utenlandske sky-tjenester som øker avhengighet! Investeringer øker din kapasitet til å fase ut felt.",
    },
    {
      title: "Følg med på konsekvensene 🌡️",
      text: "Temperaturen måles i grader over førindustriell tid. Over 1.5°C er farlig, over 2°C er katastrofalt. Dårlige valg fører til visuell 'fade out'.",
    },
    {
      title: "Gå til neste år ⏰",
      text: "Bruk 'Gå til neste år' knappen for å simulere tid som går. Dette gir deg mer oljeinntekter, men også økte klimakostnader. Strategisk timing er viktig!",
    },
    {
      title: "Fakta om Norge 🇳🇴",
      text: "Norge er verdens 7. største oljeprodusent. Vi har Oljefondet på 15.000 mrd NOK - verdens største suverene fond. Men vi må lede omstillingen!",
    },
    {
      title: "Klimamålene 🎯",
      text: "Paris-avtalen sier maks 1.5°C oppvarming. Vi er allerede på 1.1°C. Hver grad over 1.5°C øker klimakatastrofer dramatisk. Norge må vise vei!",
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

// Data-drevet achievement-system
const achievementRules: {
  name: string;
  condition: (state: GameState) => boolean;
}[] = [
  {
    name: "Første Skritt",
    condition: (state) => Object.keys(state.shutdowns).length >= 1,
  },
  {
    name: "Speedrunner",
    condition: (state) =>
      Object.keys(state.shutdowns).length >= 10 &&
      state.year - INITIAL_YEAR <= 5,
  },
  {
    name: "Under Press",
    condition: (state) => {
      const phasedOutFields = Object.keys(state.shutdowns).length;
      const totalFields = state.gameFields.length;
      const progressPercent = (phasedOutFields / totalFields) * 100;
      const timeLeft = 2040 - state.year;
      return progressPercent >= 50 && timeLeft <= 5;
    },
  },
  {
    name: "Klimabevisst",
    condition: (state) =>
      state.globalTemperature <= 1.2 &&
      Object.keys(state.shutdowns).length >= 5,
  },
  {
    name: "Tech-Pioner",
    condition: (state) =>
      Object.values(state.investments).reduce((sum, inv) => sum + inv, 0) >=
      200,
  },
  {
    name: "Grønn Omstilling",
    condition: (state) => Object.keys(state.shutdowns).length >= 15,
  },
  {
    name: "Perfekt Timing",
    condition: (state) => {
      const phasedOutFields = Object.keys(state.shutdowns).length;
      const totalFields = state.gameFields.length;
      return phasedOutFields === totalFields && state.year === 2040;
    },
  },
  {
    name: "Planet-Redder",
    condition: (state) => {
      const totalEmissionsSaved =
        state.gameFields
          .filter((f) => f.status === "closed")
          .reduce((sum, f) => sum + f.totalLifetimeEmissions, 0) / 1000;
      return totalEmissionsSaved >= 100;
    },
  },
  {
    name: "For Sent",
    condition: (state) => {
      const phasedOutFields = Object.keys(state.shutdowns).length;
      const totalFields = state.gameFields.length;
      return state.year >= 2040 && phasedOutFields < totalFields * 0.8;
    },
  },
  {
    name: "Klimakatastrofe",
    condition: (state) => state.globalTemperature > 1.8,
  },
];

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
      title: "🛢️ Oljepris-sjokk!",
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
    console.log(
      "Field clicked:",
      field.name,
      "Multi-mode:",
      gameState.multiPhaseOutMode,
    );

    if (gameState.multiPhaseOutMode) {
      if (field.status !== "active") {
        console.log("Field not active, ignoring click");
        return;
      }

      const isSelected = gameState.selectedFields.some(
        (f) => f.name === field.name,
      );

      console.log(
        "Field selected:",
        isSelected,
        "Current selections:",
        gameState.selectedFields.length,
      );

      if (isSelected) {
        console.log("Deselecting field:", field.name);
        dispatch({ type: "DESELECT_FIELD_FROM_MULTI", payload: field.name });
      } else {
        const capacity = calculatePhaseOutCapacity(gameState);
        console.log(
          "Capacity:",
          capacity,
          "Current selections:",
          gameState.selectedFields.length,
        );
        if (gameState.selectedFields.length < capacity) {
          console.log("Selecting field:", field.name);
          dispatch({ type: "SELECT_FIELD_FOR_MULTI", payload: field });
        } else {
          console.log("At capacity, cannot select more fields");
        }
      }
    } else {
      // Normal single-select mode
      console.log("Single-select mode, opening modal");
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
          minZoom: 4,
          maxZoom: 10,
          constrainResolution: true,
          smoothResolutionConstraint: false,
        }),
        controls: [],
      });

      // Force initial render
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.updateSize();
          mapInstanceRef.current.renderSync();
        }
      }, 100);
    }

    // Update map size when switching to map view
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateSize();
        mapInstanceRef.current.renderSync();
      }
    }, 150);

    return () => {
      if (mapInstanceRef.current && !mapRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [currentView]);

  // Separate effect for map rendering updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    let vectorLayer = map
      .getLayers()
      .getArray()
      .find((layer) => layer instanceof VectorLayer) as VectorLayer | undefined;

    // Enhanced map rendering with multi-select visual feedback
    console.log("Rendering fields on map:", gameFields.length);
    console.log(
      "Field names:",
      gameFields.map((f) => f.name),
    );

    const vectorSource = new VectorSource({
      features: gameFields.map((field) => {
        console.log(
          `Rendering field: ${field.name} at [${field.lon}, ${field.lat}] status: ${field.status}`,
        );

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
            ? 16
            : Math.max(16, Math.min(24, field.production * 1.2));

        feature.setStyle(
          new Style({
            image: new Circle({
              radius: size,
              fill: new Fill({ color }),
              stroke: new Stroke({
                color: strokeColor,
                width: strokeWidth,
              }),
            }),
          }),
        );

        // Debug logging for icon rendering
        console.log(
          `Rendered ${field.name}: status=${field.status}, icon=${field.status === "closed" ? "🌱" : "🛢️"}`,
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
    currentView,
    gameFields,
    gameState.multiPhaseOutMode,
    gameState.selectedFields,
  ]);

  // Separate effect for click handler that updates with game state
  useEffect(() => {
    if (!mapInstanceRef.current || currentView !== "map") return;

    // Add a small delay to ensure map is fully ready after view switching
    const setupClickHandler = () => {
      if (!mapInstanceRef.current) return;

      // Clear existing click events
      const existingHandler = mapInstanceRef.current.get("currentClickHandler");
      if (existingHandler) {
        mapInstanceRef.current.un("singleclick", existingHandler);
      }

      // Add new click handler with current game state
      const clickHandler = function (evt: any) {
        mapInstanceRef.current?.forEachFeatureAtPixel(
          evt.pixel,
          function (feature: any) {
            const fieldData = feature.get("fieldData");
            if (fieldData) {
              handleFieldClick(fieldData, gameState, dispatch);
            }
          },
        );
      };

      mapInstanceRef.current.on("singleclick", clickHandler);
      mapInstanceRef.current.set("currentClickHandler", clickHandler);
      console.log("Click handler setup completed for map view");
    };

    // Small delay to ensure map rendering is complete
    setTimeout(setupClickHandler, 100);
  }, [gameState.multiPhaseOutMode, gameState.selectedFields, currentView]);

  // Separate effect for map rendering updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing overlays
    map.getOverlays().clear();

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

        // Create HTML overlay for field label
        const coordinates = fromLonLat([field.lon, field.lat]);
        const element = document.createElement("div");
        element.style.cssText = `
          font-size: 12px;
          font-weight: bold;
          color: ${field.status === "closed" ? "#FFFFFF" : "#1F2937"};
          border: 1px solid ${color};
          padding: 2px 4px;
          border-radius: 3px;
          background-color: ${color};
          pointer-events: auto;
          white-space: nowrap;
          user-select: none;
          cursor: pointer;
        `;
        element.textContent = getFieldAbbreviation(field.name);

        // Add click handler to the overlay element
        element.addEventListener("click", (event) => {
          event.stopPropagation();
          handleFieldClick(field, gameState, dispatch);
        });

        const overlay = new Overlay({
          position: coordinates,
          element: element,
          positioning: "center-center",
        });

        map.addOverlay(overlay);

        // Create larger invisible clickable area
        feature.setStyle(
          new Style({
            image: new Circle({
              radius: 20,
              fill: new Fill({ color: "transparent" }),
              stroke: new Stroke({
                color: "transparent",
                width: 0,
              }),
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

    // Force map refresh after updating features

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateSize();
        mapInstanceRef.current.renderSync();
      }
    }, 50);
  }, [gameFields, gameState.multiPhaseOutMode, gameState.selectedFields]);

  const phaseOutField = useCallback((fieldName: string) => {
    dispatch({ type: "PHASE_OUT_FIELD", payload: fieldName });
  }, []);

  const navigateToField = useCallback(
    (fieldName: string) => {
      console.log(`NavigateToField called for: ${fieldName}`);

      // Switch to map view
      dispatch({ type: "SET_VIEW_MODE", payload: "map" });

      // Find the field
      const field = gameFields.find((f) => f.name === fieldName);
      if (!field) {
        console.log(`Field not found: ${fieldName}`);
        return;
      }

      console.log(`Found field: ${field.name} at [${field.lon}, ${field.lat}]`);

      // Function to animate to field once map is ready
      const animateToField = () => {
        if (mapInstanceRef.current) {
          console.log("Map instance found, starting animation");

          // Ensure map size is correct before animation
          mapInstanceRef.current.updateSize();

          // Force map to render completely
          mapInstanceRef.current.renderSync();

          // Add a small delay to ensure map is properly rendered
          setTimeout(() => {
            const view = mapInstanceRef.current?.getView();
            if (view) {
              const currentCenter = view.getCenter();
              const targetCenter = fromLonLat([field.lon, field.lat]);

              console.log(
                `Animating to field: ${field.name} at [${field.lon}, ${field.lat}]`,
                `Current center: ${currentCenter}, Target: ${targetCenter}`,
              );

              // First zoom out a bit to make animation more visible
              view.animate(
                {
                  zoom: 5,
                  duration: 500,
                },
                () => {
                  // Then animate to field location
                  view.animate({
                    center: targetCenter,
                    zoom: 8,
                    duration: 1000,
                  });
                },
              );

              // Select the field and show modal after animation
              setTimeout(() => {
                console.log("Opening modal for field:", field.name);
                dispatch({ type: "SET_SELECTED_FIELD", payload: field });
                dispatch({ type: "TOGGLE_FIELD_MODAL", payload: true });
              }, 1500);
            } else {
              console.log("Map view not available");
            }
          }, 300);
        } else {
          console.log("Map instance not available for animation");
        }
      };

      // Wait a bit longer for map to be properly initialized after view switch
      setTimeout(() => {
        console.log("Checking map initialization...");
        if (mapInstanceRef.current) {
          console.log("Map is ready, animating");
          animateToField();
        } else {
          console.log("Map not ready yet, waiting...");
          // Wait for map to be initialized, then animate
          const checkMapInterval = setInterval(() => {
            console.log("Checking map instance...");
            if (mapInstanceRef.current) {
              console.log("Map instance found after waiting");
              clearInterval(checkMapInterval);
              setTimeout(animateToField, 200);
            }
          }, 100);

          // Clear interval after 5 seconds to prevent infinite waiting
          setTimeout(() => {
            clearInterval(checkMapInterval);
            console.log("Map animation timed out, showing modal only");
            // Fallback: just show the modal if map doesn't initialize
            dispatch({ type: "SET_SELECTED_FIELD", payload: field });
            dispatch({ type: "TOGGLE_FIELD_MODAL", payload: true });
          }, 5000);
        }
      }, 500);
    },
    [gameFields],
  );

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
            <EmissionsView
              data={emissionsData}
              onFieldClick={navigateToField}
            />
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

            {/* Map Legend */}
            <div className="map-legend">
              <h4
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                Forklaring:
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#1F2937",
                      border: "1px solid #DC2626",
                      padding: "2px 4px",
                      borderRadius: "3px",
                      backgroundColor: "#DC2626",
                    }}
                  >
                    JS
                  </span>
                  <span>Høy intensitet</span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#1F2937",
                      border: "1px solid #F97316",
                      padding: "2px 4px",
                      borderRadius: "3px",
                      backgroundColor: "#F97316",
                    }}
                  >
                    JS
                  </span>
                  <span>Medium intensitet</span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#1F2937",
                      border: "1px solid #64748B",
                      padding: "2px 4px",
                      borderRadius: "3px",
                      backgroundColor: "#64748B",
                    }}
                  >
                    JS
                  </span>
                  <span>Lav intensitet</span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      border: "1px solid #10B981",
                      padding: "2px 4px",
                      borderRadius: "3px",
                      backgroundColor: "#10B981",
                    }}
                  >
                    JS
                  </span>
                  <span>Faset ut</span>
                </div>
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "11px",
                  color: "#6b7280",
                  fontStyle: "italic",
                }}
              >
                💡 Feltforkortelser (f.eks. JS = Johan Sverdrup) vises på kartet
              </div>
            </div>

            <div className="map-hint">
              {gameState.multiPhaseOutMode
                ? `⚡ Multi-utfasing: Klikk på opptil ${calculatePhaseOutCapacity(gameState)} felt å fase ut samtidig!`
                : "Klikk på et oljefelt for å fase det ut! 🛢️ → 🌱"}
              <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
                Viser {gameFields.length} felt på kartet
              </div>
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
      (state.investments.green_tech +
        state.investments.ai_research +
        state.investments.renewable_energy +
        state.investments.carbon_capture +
        state.investments.hydrogen_tech +
        state.investments.quantum_computing +
        state.investments.battery_tech +
        state.investments.offshore_wind) /
        100,
    ); // +1 for every 100 billion invested in good tech

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
      <MultiSelectControls
        gameState={gameState}
        dispatch={dispatch}
        budget={budget}
      />

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
      {/* Stats Grid */}
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
        <div className="stat-card stat-card-purple">
          <div className="stat-emoji">🚀</div>
          <div className="stat-value" style={{ color: "#7C3AED" }}>
            {gameState.norwayTechRank}%
          </div>
          <div className="stat-label" style={{ color: "#8B5CF6" }}>
            Tech-rank
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

      {/* Educational Game Stats */}
      <div
        className="educational-stats"
        style={{
          position: "relative",
          top: "20px",
          right: "20px",
          background: "rgba(0, 0, 0, 0.8)",
          padding: "15px",
          borderRadius: "10px",
          color: "white",
          maxWidth: "300px",
          fontSize: "14px",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#22C55E" }}>📚 Læring</h4>
        <div style={{ marginBottom: "8px" }}>
          <strong>🌡️ Temperatur:</strong>{" "}
          {gameState.globalTemperature.toFixed(2)}°C
          <br />
          <small
            style={{
              color: gameState.globalTemperature > 1.5 ? "#EF4444" : "#22C55E",
            }}
          >
            {gameState.globalTemperature > 1.5
              ? "⚠️ Over Paris-avtalen!"
              : "✅ Under mål"}
          </small>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <strong>💰 Budsjett:</strong> {gameState.budget.toLocaleString()} mrd
          NOK
          <br />
          <small>Oljefondet: 15.000 mrd NOK</small>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <strong>🎯 Faset ut:</strong>{" "}
          {Object.keys(gameState.shutdowns).length} /{" "}
          {gameState.gameFields.length}
          <br />
          <small>
            Mål: 80% ({Math.ceil(gameState.gameFields.length * 0.8)})
          </small>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <strong>📈 Kapasitet:</strong> {calculatePhaseOutCapacity(gameState)}{" "}
          felt/år
          <br />
          <small>Investeringer øker kapasitet!</small>
        </div>
        <div style={{ fontSize: "12px", opacity: 0.8 }}>
          💡 <strong>Fakta:</strong> 90 til 95% av CO₂ kommer fra forbrenning,
          ikke produksjon!
        </div>
      </div>

      {/* Time pressure indicator */}
      {gameState.year >= 2030 && (
        <div
          className="time-pressure-warning"
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            background:
              gameState.year >= 2038
                ? "rgba(239, 68, 68, 0.9)"
                : "rgba(245, 158, 11, 0.9)",
            padding: "15px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "bold",
          }}
        >
          ⏰ {2040 - gameState.year} år igjen til 2040!
          {gameState.year >= 2038 && (
            <span style={{ color: "#FEF3C7" }}> KRITISK!</span>
          )}
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
    state.investments.ai_research +
    state.investments.carbon_capture +
    state.investments.hydrogen_tech +
    state.investments.quantum_computing +
    state.investments.battery_tech +
    state.investments.offshore_wind;
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
  budget: number;
}> = ({ gameState, dispatch, budget }) => {
  console.log(
    "MultiSelectControls render - multiPhaseOutMode:",
    gameState.multiPhaseOutMode,
    "selectedFields:",
    gameState.selectedFields.length,
  );
  if (!gameState.multiPhaseOutMode) return null;

  const capacity = calculatePhaseOutCapacity(gameState);
  const canPhaseOut =
    gameState.selectedFields.length > 0 &&
    gameState.selectedFields.length <= capacity;

  return (
    <div
      className="multi-select-controls"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.9)",
        padding: "15px",
        borderRadius: "10px",
        zIndex: 1000,
        border: "2px solid #22C55E",
        color: "white",
      }}
    >
      <h4 style={{ margin: "0 0 10px 0", color: "#22C55E" }}>
        📋 Multi-Select Mode
      </h4>
      <div style={{ marginBottom: "10px" }}>
        <strong>Valgte felt:</strong> {gameState.selectedFields.length} /{" "}
        {capacity}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => dispatch({ type: "PHASE_OUT_SELECTED_FIELDS" })}
          disabled={!canPhaseOut}
          style={{
            background: canPhaseOut ? "#22C55E" : "#6B7280",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: canPhaseOut ? "pointer" : "not-allowed",
          }}
        >
          🚀 Fase ut valgte ({gameState.selectedFields.length})
        </button>
        <button
          onClick={() => dispatch({ type: "CLEAR_SELECTED_FIELDS" })}
          style={{
            background: "#EF4444",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ❌ Avbryt
        </button>
      </div>
      <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.8 }}>
        💡 Klikk på felt for å velge/fjerne fra batch
      </div>
      <MultiPhaseOutSummary
        selectedFields={gameState.selectedFields}
        budget={budget}
      />
    </div>
  );
};

const InvestmentPanel: React.FC<{
  gameState: GameState;
  dispatch: Function;
}> = ({ gameState, dispatch }) => {
  const investments: {
    type: Investment;
    label: string;
    color: string;
    description: string;
  }[] = [
    {
      type: "green_tech",
      label: "Grønn Teknologi",
      color: "#22C55E",
      description: "Generell grønn innovasjon og cleantech",
    },
    {
      type: "ai_research",
      label: "AI Forskning",
      color: "#6366F1",
      description: "Kunstig intelligens for klimaløsninger",
    },
    {
      type: "renewable_energy",
      label: "Fornybar Energi",
      color: "#F59E0B",
      description: "Sol, vind og vannkraft",
    },
    {
      type: "carbon_capture",
      label: "Karbonfangst",
      color: "#0EA5E9",
      description: "CCS og direkte luftfangst",
    },
    {
      type: "hydrogen_tech",
      label: "Hydrogen Teknologi",
      color: "#10B981",
      description: "Grønt hydrogen og brenselsceller",
    },
    {
      type: "quantum_computing",
      label: "Kvante Databehandling",
      color: "#8B5CF6",
      description: "Kvante-teknologi for energioptimering",
    },
    {
      type: "battery_tech",
      label: "Batteriteknologi",
      color: "#F97316",
      description: "Energilagring og batterier",
    },
    {
      type: "offshore_wind",
      label: "Havvind",
      color: "#06B6D4",
      description: "Flytende havvindteknologi",
    },
    {
      type: "foreign_cloud",
      label: "Utenlandsk Sky",
      color: "#EF4444",
      description: "Importerer datacenter-tjenester",
    },
    {
      type: "fossil_subsidies",
      label: "Fossil Subsidier",
      color: "#DC2626",
      description: "Støtter olje- og gassindustrien",
    },
    {
      type: "crypto_mining",
      label: "Kryptovaluta Mining",
      color: "#991B1B",
      description: "Energikrevende kryptovaluta",
    },
    {
      type: "fast_fashion",
      label: "Fast Fashion",
      color: "#7F1D1D",
      description: "Støtter hurtigmote-industrien",
    },
  ];

  const handleInvest = (type: Investment, amount: number) => {
    dispatch({ type: "MAKE_INVESTMENT", payload: { type, amount } });
  };

  const goodInvestments = investments.filter(
    (inv) =>
      ![
        "foreign_cloud",
        "fossil_subsidies",
        "crypto_mining",
        "fast_fashion",
      ].includes(inv.type),
  );
  const badInvestments = investments.filter((inv) =>
    [
      "foreign_cloud",
      "fossil_subsidies",
      "crypto_mining",
      "fast_fashion",
    ].includes(inv.type),
  );

  return (
    <div className="investment-panel">
      <h4>💰 Investeringer</h4>

      {/* Gode investeringer */}
      <div style={{ marginBottom: "20px" }}>
        <h5 style={{ color: "#22C55E", marginBottom: "10px" }}>
          🌱 Gode Investeringer (Øker Tech-Rank)
        </h5>
        <div className="investment-buttons">
          {goodInvestments.map((inv) => (
            <button
              key={inv.type}
              style={{
                background: inv.color,
                color: "#fff",
                margin: "4px",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: gameState.budget >= 100 ? "pointer" : "not-allowed",
                opacity: gameState.budget >= 100 ? 1 : 0.5,
                fontSize: "12px",
              }}
              disabled={gameState.budget < 100}
              onClick={() => handleInvest(inv.type, 100)}
              title={`${inv.description} - 100 mrd NOK`}
            >
              +100 mrd {inv.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dårlige investeringer */}
      <div style={{ marginBottom: "20px" }}>
        <h5 style={{ color: "#EF4444", marginBottom: "10px" }}>
          ⚠️ Dårlige Investeringer (Reduserer Tech-Rank)
        </h5>
        <div className="investment-buttons">
          {badInvestments.map((inv) => (
            <button
              key={inv.type}
              style={{
                background: inv.color,
                color: "#fff",
                margin: "4px",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: gameState.budget >= 100 ? "pointer" : "not-allowed",
                opacity: gameState.budget >= 100 ? 1 : 0.5,
                fontSize: "12px",
              }}
              disabled={gameState.budget < 100}
              onClick={() => handleInvest(inv.type, 100)}
              title={`${inv.description} - 100 mrd NOK`}
            >
              +100 mrd {inv.label}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio oversikt */}
      <div className="investment-summary">
        <h5>📊 Din portefølje:</h5>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            fontSize: "12px",
          }}
        >
          <div>
            <strong style={{ color: "#22C55E" }}>Gode investeringer:</strong>
            <ul style={{ margin: "5px 0", paddingLeft: "15px" }}>
              {goodInvestments.map(
                (inv) =>
                  gameState.investments[inv.type] > 0 && (
                    <li key={inv.type}>
                      <span style={{ color: inv.color }}>{inv.label}:</span>{" "}
                      {gameState.investments[inv.type]} mrd
                    </li>
                  ),
              )}
            </ul>
          </div>
          <div>
            <strong style={{ color: "#EF4444" }}>Dårlige investeringer:</strong>
            <ul style={{ margin: "5px 0", paddingLeft: "15px" }}>
              {badInvestments.map(
                (inv) =>
                  gameState.investments[inv.type] > 0 && (
                    <li key={inv.type}>
                      <span style={{ color: inv.color }}>{inv.label}:</span>{" "}
                      {gameState.investments[inv.type]} mrd
                    </li>
                  ),
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
