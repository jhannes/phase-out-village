import React, {
  useEffect,
  useRef,
  useState,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import Map from "ol/Map";
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
  gamePhase: "learning" | "action" | "crisis" | "victory" | "defeat";
  tutorialStep: number;
  shownFacts: string[];
  badChoiceCount: number;
  goodChoiceStreak: number;
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
  | { type: "RESET_TUTORIAL" };

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
    status: currentProduction > 0 ? "active" : "closed",
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
  const realData = generateCompleteData(data);
  const gameFields = Object.keys(realData).map((fieldName) =>
    createFieldFromRealData(fieldName, realData),
  );

  // Default state with all new properties
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
  };

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.gameFields) {
        // Merge saved state with default state to ensure all properties exist
        return {
          ...defaultState,
          ...parsed,
          realData, // Always use fresh real data
          gameFields: gameFields.map((field) => {
            const savedField = parsed.gameFields.find(
              (f: Field) => f.name === field.name,
            );
            return savedField ? { ...field, status: savedField.status } : field;
          }),
          // Ensure new properties have default values if not in saved state
          investments: parsed.investments || defaultState.investments,
          globalTemperature:
            parsed.globalTemperature ?? defaultState.globalTemperature,
          norwayTechRank: parsed.norwayTechRank ?? defaultState.norwayTechRank,
          foreignDependency:
            parsed.foreignDependency ?? defaultState.foreignDependency,
          climateDamage: parsed.climateDamage ?? defaultState.climateDamage,
          sustainabilityScore:
            parsed.sustainabilityScore ?? defaultState.sustainabilityScore,
          playerChoices: parsed.playerChoices || defaultState.playerChoices,
          dataLayerUnlocked:
            parsed.dataLayerUnlocked || defaultState.dataLayerUnlocked,
          saturationLevel:
            parsed.saturationLevel ?? defaultState.saturationLevel,
          gamePhase: parsed.gamePhase || defaultState.gamePhase,
          tutorialStep: parsed.tutorialStep ?? defaultState.tutorialStep,
          shownFacts: parsed.shownFacts || defaultState.shownFacts,
          badChoiceCount: parsed.badChoiceCount ?? defaultState.badChoiceCount,
          goodChoiceStreak:
            parsed.goodChoiceStreak ?? defaultState.goodChoiceStreak,
        };
      }
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
  }

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

  // Failure badges (consequences)
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

      {showIntermediate && (
        <div className="data-layer intermediate">
          <h4>🔍 Detaljert Analyse</h4>
          <div className="data-grid">
            <div className="data-item">
              <span>Utslippsintensitet gjennomsnitt:</span>
              <span>
                {(
                  gameState.gameFields.reduce(
                    (sum, f) => sum + f.intensity,
                    0,
                  ) / gameState.gameFields.length
                ).toFixed(1)}{" "}
                kg/boe
              </span>
            </div>
            <div className="data-item">
              <span>Fremtidig forbrenning:</span>
              <span>
                {gameState.gameFields
                  .filter((f) => f.status === "active")
                  .reduce((sum, f) => sum + f.totalLifetimeEmissions, 0)
                  .toFixed(0)}{" "}
                Mt
              </span>
            </div>
          </div>
        </div>
      )}

      {showAdvanced && (
        <div className="data-layer advanced">
          <h4>📈 Avansert Statistikk</h4>
          <div className="data-grid">
            <div className="data-item">
              <span>Teknologi-investeringer:</span>
              <span>
                {Object.values(gameState.investments).reduce(
                  (sum, inv) => sum + inv,
                  0,
                )}{" "}
                mrd
              </span>
            </div>
            <div className="data-item">
              <span>Utenlandsavhengighet:</span>
              <span
                className={
                  gameState.foreignDependency > 50 ? "warning" : "good"
                }
              >
                {gameState.foreignDependency}%
              </span>
            </div>
          </div>
        </div>
      )}

      {showExpert && (
        <div className="data-layer expert">
          <h4>🎓 Ekspert-Innsikt</h4>
          <div className="expert-insights">
            <p>
              💡 Med nåværende tempo vil Norge nå karbon-nøytralitet i{" "}
              {2040 + Math.floor(gameState.totalEmissions / 10)} år
            </p>
            <p>
              🏭 Gjennomsnittlig felt har{" "}
              {(
                gameState.gameFields.reduce((sum, f) => sum + f.workers, 0) /
                gameState.gameFields.length
              ).toFixed(0)}{" "}
              arbeidere
            </p>
            <p>
              ⚡ Overgangspotensialet kan skape{" "}
              {gameState.gameFields.filter((f) => f.status === "closed")
                .length * 200}{" "}
              nye grønne jobber
            </p>
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
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const handleRestart = () => {
    if (
      window.confirm(
        "Er du sikker på at du vil starte spillet på nytt? All fremgang vil gå tapt.",
      )
    ) {
      // Clear localStorage
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      // Restart game
      dispatch({ type: "RESTART_GAME" });
      setShowRestartConfirm(false);
    }
  };

  const handleResetTutorial = () => {
    dispatch({ type: "RESET_TUTORIAL" });
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
        <div className="game-info">
          <small>Spillfremgang lagres automatisk</small>
        </div>
      </div>
    </div>
  );
};

// Enhanced tutorial system with better state management
const TutorialOverlay: React.FC<{
  step: number;
  onNext: () => void;
  onSkip: () => void;
}> = ({ step, onNext, onSkip }) => {
  const tutorials = [
    {
      title: "Velkommen til Phase Out Village! 🌍",
      text: "Du skal hjelpe Norge med å fase ut olje og bygge en bærekraftig fremtid. Du har 15.000 milliarder NOK (Oljefondet) til disposisjon.",
      highlight: ".header",
    },
    {
      title: "Forstå tallene 📊",
      text: "BOE = Barrel Oil Equivalent (fat oljeekvivalent). Mt = Millioner tonn CO₂. mrd = milliarder NOK. Disse enhetene hjelper deg å måle produksjon, utslipp og kostnader.",
      highlight: ".stats-grid",
    },
    {
      title: "Se oljefeltene 🛢️",
      text: "Røde felt har høy utslippsintensitet (kg CO₂ per BOE). Grønne er 'renere'. Men husk: 98% av utslippene kommer fra FORBRENNING av oljen senere!",
      highlight: ".map-container",
    },
    {
      title: "Klikk for å fase ut 🌱",
      text: "Hver gang du faser ut et felt, hindrer du LIVSTID med CO₂-utslipp fra forbrenning! Kostnaden er i milliarder NOK, men klimagevinsten er enorm.",
      highlight: ".map-div",
    },
    {
      title: "Invester i fremtiden 🚀",
      text: "Bruk pengene på norsk teknologi og grønn omstilling, ikke utenlandske sky-tjenester som øker avhengighet!",
      highlight: ".investment-panel",
    },
    {
      title: "Følg med på konsekvensene 🌡️",
      text: "Temperaturen måles i grader over førindustriell tid. Over 1.5°C er farlig, over 2°C er katastrofalt. Dårlige valg fører til visuell 'fade out'.",
      highlight: ".climate-dashboard",
    },
    {
      title: "Forstå klimapoeng 🌱",
      text: "Du får klimapoeng basert på hvor mye CO₂-utslipp du hindrer. 1 klimapoeng = 1000 tonn CO₂ hindret. Dette viser din reelle klimapåvirkning!",
      highlight: ".stat-card-green",
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

// Enhanced achievement checking system with immediate triggers
const checkAndAwardAchievements = (state: GameState): string[] => {
  const newAchievements: string[] = [];
  const phasedOutFields = Object.keys(state.shutdowns).length;
  const totalTechInvestment = Object.values(state.investments).reduce((sum, inv) => sum + inv, 0);
  const totalEmissionsSaved = state.gameFields.filter((f) => f.status === "closed").reduce((sum, f) => sum + f.totalLifetimeEmissions, 0) / 1000;

  console.log("Checking achievements:", { phasedOutFields, totalTechInvestment, totalEmissionsSaved, currentTemp: state.globalTemperature });

  // FØRSTE SKRITT - Umiddelbart når du faser ut første felt
  if (phasedOutFields >= 1 && !state.achievements.includes("Første Skritt")) {
    newAchievements.push("Første Skritt");
    console.log("🏆 Første Skritt unlocked!");
  }

  // KLIMABEVISST - Holdt temperatur under 1.5°C og faset ut 3+ felt
  if (state.globalTemperature <= 1.5 && phasedOutFields >= 3 && !state.achievements.includes("Klimabevisst")) {
    newAchievements.push("Klimabevisst");
    console.log("🏆 Klimabevisst unlocked!");
  }

  // TECH-PIONER - 100+ milliarder i tech-investeringer
  if (totalTechInvestment >= 100 && !state.achievements.includes("Tech-Pioner")) {
    newAchievements.push("Tech-Pioner");
    console.log("🏆 Tech-Pioner unlocked!");
  }

  // GRØNN OMSTILLING - 5+ felt faset ut
  if (phasedOutFields >= 5 && !state.achievements.includes("Grønn Omstilling")) {
    newAchievements.push("Grønn Omstilling");
    console.log("🏆 Grønn Omstilling unlocked!");
  }

  // UAVHENGIGHETS-HELT - 80%+ tech-uavhengighet
  if (state.norwayTechRank >= 80 && !state.achievements.includes("Uavhengighets-Helt")) {
    newAchievements.push("Uavhengighets-Helt");
    console.log("🏆 Uavhengighets-Helt unlocked!");
  }

  // PLANET-REDDER - 500+ Mt CO₂ hindret (justert ned for testing)
  if (totalEmissionsSaved >= 50 && !state.achievements.includes("Planet-Redder")) {
    newAchievements.push("Planet-Redder");
    console.log("🏆 Planet-Redder unlocked!");
  }

  // ØKONOMI-GENI - 1000+ mrd i budsjett og 10+ felt faset ut
  if (state.budget >= 1000 && phasedOutFields >= 10 && !state.achievements.includes("Økonomi-Geni")) {
    newAchievements.push("Økonomi-Geni");
    console.log("🏆 Økonomi-Geni unlocked!");
  }

  // NEGATIVE ACHIEVEMENTS (konsekvenser)
  if (state.globalTemperature > 2.0 && !state.achievements.includes("Klimakatastrofe")) {
    newAchievements.push("Klimakatastrofe");
    console.log("💀 Klimakatastrofe unlocked!");
  }

  if (state.foreignDependency > 75 && !state.achievements.includes("Tech-Avhengig")) {
    newAchievements.push("Tech-Avhengig");
    console.log("💀 Tech-Avhengig unlocked!");
  }

  if (state.badChoiceCount >= 5 && !state.achievements.includes("Kortsiktig")) {
    newAchievements.push("Kortsiktig");
    console.log("💀 Kortsiktig unlocked!");
  }

  return newAchievements;
};

// Enhanced environmental impact calculation
const calculateClimateConsequences = (state: GameState) => {
  const activeFields = state.gameFields.filter((f) => f.status === "active");
  const totalActiveEmissions = activeFields.reduce(
    (sum, f) => sum + f.emissions[0],
    0,
  );

  // More realistic temperature calculation based on emissions
  const baseTemperature = 1.1;
  const emissionFactor = totalActiveEmissions * 0.001; // Much smaller factor - each Mt adds only 0.001°C
  const newTemperature = baseTemperature + emissionFactor;

  // Calculate year-over-year consequences
  const yearsPassed = state.year - INITIAL_YEAR;
  const temperatureIncrease = newTemperature - 1.1;

  // Economic consequences of climate change
  const climateDamagePercent = Math.pow(temperatureIncrease, 2) * 2; // Exponential damage
  const climateCost = state.budget * (climateDamagePercent / 100);

  return {
    newTemperature,
    climateCost,
    temperatureIncrease,
    activeFieldCount: activeFields.length,
  };
};

// --- Reducer with restart functionality ---
const gameReducer = (state: GameState, action: GameAction): GameState => {
  let newState: GameState;

  switch (action.type) {
    case "RESTART_GAME":
      return createFreshGameState();

    case "RESET_TUTORIAL":
      return { ...state, tutorialStep: 0 };

    case "LOAD_GAME_STATE":
      return { ...state, ...action.payload };

    case "PHASE_OUT_FIELD": {
      const fieldName = action.payload;
      const field = state.gameFields.find((f) => f.name === fieldName);

      if (!field || field.status === "closed" || state.budget < field.phaseOutCost) {
        return state;
      }

      // Calculate climate consequences BEFORE phasing out field
      const climateData = calculateClimateConsequences(state);

      newState = {
        ...state,
        budget: state.budget - field.phaseOutCost,
        score: state.score + Math.floor(field.totalLifetimeEmissions / 1000),
        // Fix temperature calculation - phasing out should REDUCE temperature
        globalTemperature: Math.max(1.1, state.globalTemperature - (field.emissions[0] * 0.001)),
        gameFields: state.gameFields.map((f) => f.name === fieldName ? { ...f, status: "closed" as const, production: 0 } : f),
        playerChoices: [...state.playerChoices, `Faset ut ${fieldName} - Hindret ${(field.totalLifetimeEmissions / 1000).toFixed(0)} Mt CO2`],
        year: state.year + 1,
        goodChoiceStreak: state.goodChoiceStreak + 1,
        badChoiceCount: Math.max(0, state.badChoiceCount - 1),
        shutdowns: { ...state.shutdowns, [fieldName]: state.year },
        showFieldModal: false,
        selectedField: null,
      };

      // Immediately check for achievements after phase out
      const immediateAchievements = checkAndAwardAchievements(newState);
      if (immediateAchievements.length > 0) {
        newState.achievements = [...newState.achievements, ...immediateAchievements];
      }
      break;
    }

    case "SET_SELECTED_FIELD":
      return { ...state, selectedField: action.payload };
    case "TOGGLE_FIELD_MODAL":
      return { ...state, showFieldModal: action.payload };
    case "UPDATE_EMISSIONS_PRODUCTION": {
      const emissions = state.gameFields.reduce(
        (sum, field) =>
          field.status === "active" ? sum + field.emissions[0] : sum,
        0,
      );
      const production = state.gameFields.reduce(
        (sum, field) =>
          field.status === "active" ? sum + field.production : sum,
        0,
      );

      // Check for achievements after updating
      const newAchievements = checkAndAwardAchievements(state);
      const allAchievements = [...state.achievements, ...newAchievements];

      // Calculate environmental state and update saturation
      const envState = calculateEnvironmentalState({
        ...state,
        achievements: allAchievements,
      });

      return {
        ...state,
        totalEmissions: emissions,
        totalProduction: production,
        achievements: allAchievements,
        saturationLevel: envState.saturation,
        gamePhase: envState.phase as any,
        // Update data layer based on progress
        dataLayerUnlocked:
          state.score > 500
            ? "expert"
            : state.score > 300
              ? "advanced"
              : state.score > 100
                ? "intermediate"
                : "basic",
      };
    }
    case "ADVANCE_YEAR": {
      // Automatic year progression with consequences
      const climateData = calculateClimateConsequences(state);

      // Apply climate damage to budget
      const budgetAfterDamage = Math.max(
        0,
        state.budget - climateData.climateCost,
      );

      newState = {
        ...state,
        year: state.year + (action.payload || 1),
        budget: budgetAfterDamage,
        globalTemperature: climateData.newTemperature,
        climateDamage: state.climateDamage + climateData.climateCost,
      };
      break;
    }
    case "ADD_ACHIEVEMENT":
      if (!state.achievements.includes(action.payload)) {
        return {
          ...state,
          achievements: [...state.achievements, action.payload],
        };
      }
      return state;
    case "SET_VIEW_MODE":
      return { ...state, currentView: action.payload };
    case "MAKE_INVESTMENT": {
      const { type, amount } = action.payload;
      if (state.budget < amount) return state;

      const isBadChoice = type === "foreign_cloud";

      newState = {
        ...state,
        budget: state.budget - amount,
        badChoiceCount: isBadChoice ? state.badChoiceCount + 1 : state.badChoiceCount,
        goodChoiceStreak: isBadChoice ? 0 : state.goodChoiceStreak + 1,
        norwayTechRank: isBadChoice ? Math.max(0, state.norwayTechRank - 3) : Math.min(100, state.norwayTechRank + (type === "ai_research" ? 8 : 5)),
        sustainabilityScore: isBadChoice ? Math.max(0, state.sustainabilityScore - 10) : Math.min(100, state.sustainabilityScore + 10),
        foreignDependency: isBadChoice ? Math.min(100, state.foreignDependency + 15) : Math.max(0, state.foreignDependency - 10),
        playerChoices: [...state.playerChoices, `Investerte ${amount} mrd i ${type === "foreign_cloud" ? "utenlandsk cloud" : type === "ai_research" ? "AI-forskning" : "grønn teknologi"}`],
        investments: { ...state.investments, [type]: state.investments[type] + amount },
      };

      // Check achievements after investment
      const immediateAchievements = checkAndAwardAchievements(newState);
      if (immediateAchievements.length > 0) {
        newState.achievements = [...newState.achievements, ...immediateAchievements];
      }
      break;
    }
    case "UPDATE_CLIMATE_METRICS": {
      // Calculate climate damage costs
      const tempIncrease = state.globalTemperature - 1.1; // Above pre-industrial
      const climateCost = tempIncrease * 100; // 100 billion per degree

      return {
        ...state,
        climateDamage: climateCost,
        sustainabilityScore: Math.max(0, 100 - tempIncrease * 50),
      };
    }
    case "ADVANCE_TUTORIAL":
      return { ...state, tutorialStep: state.tutorialStep + 1 };
    case "SKIP_TUTORIAL":
      return { ...state, tutorialStep: 7 }; // Updated to match new tutorial length
    default:
      return state;
  }

  // Always check and update achievements for any new state
  if (newState) {
    const finalAchievements = checkAndAwardAchievements(newState);
    if (finalAchievements.length > 0) {
      newState = { ...newState, achievements: [...newState.achievements, ...finalAchievements] };
    }

    // Update environmental state
    const envState = calculateEnvironmentalState(newState);
    newState = {
      ...newState,
      saturationLevel: envState.saturation,
      gamePhase: envState.phase as any,
      dataLayerUnlocked: newState.score > 500 ? "expert" : newState.score > 300 ? "advanced" : newState.score > 100 ? "intermediate" : "basic",
    };

    // Save to localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
    return newState;
  }

  return state;
};

// --- Field Modal Component ---
interface FieldModalProps {
  selectedField: Field | null;
  budget: number;
  onPhaseOut: (fieldName: string) => void;
  onClose: () => void;
}

const FieldModal: React.FC<FieldModalProps> = ({
  selectedField,
  budget,
  onPhaseOut,
  onClose,
}) => {
  if (!selectedField) return null;

  const canPhaseOut =
    selectedField.status === "active" && budget >= selectedField.phaseOutCost;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">🛢️ {selectedField.name}</h3>

        {selectedField.status === "active" ? (
          <>
            <div className="modal-stats">
              <div className="modal-stat-row">
                <span>Årlig utslipp (produksjon):</span>
                <span className="modal-stat-value" style={{ color: "#F59E0B" }}>
                  {selectedField.emissions[0].toFixed(1)} Mt/år
                </span>
              </div>
              <div className="modal-stat-row">
                <span>💥 Totalt fra forbrenning:</span>
                <span className="modal-stat-value" style={{ color: "#DC2626" }}>
                  {(selectedField.totalLifetimeEmissions / 1000).toFixed(0)} Mt
                  livstid
                </span>
              </div>
              <div className="modal-stat-row">
                <span>💰 Kostnad å fase ut:</span>
                <span className="modal-stat-value" style={{ color: "#2563EB" }}>
                  {selectedField.phaseOutCost} mrd NOK
                </span>
              </div>
              <div className="modal-stat-row">
                <span>Overgangs-potensial:</span>
                <span className="modal-stat-value" style={{ color: "#10B981" }}>
                  {selectedField.transitionPotential === "wind"
                    ? "🌬️ Vindkraft"
                    : selectedField.transitionPotential === "data_center"
                      ? "💻 Datasenter"
                      : selectedField.transitionPotential === "research_hub"
                        ? "🧠 Forskningshub"
                        : "☀️ Solkraft"}
                </span>
              </div>
            </div>

            <div className="climate-warning">
              <p>
                ⚠️ Hver dag dette feltet er aktivt, brennes mer olje og slipper
                ut CO₂!
              </p>
              <p>🌡️ Hindre forbrenning = redd klimaet</p>
              {budget < selectedField.phaseOutCost && (
                <p style={{ color: "#DC2626", fontWeight: "bold" }}>
                  💸 Du mangler {selectedField.phaseOutCost - budget} mrd NOK!
                </p>
              )}
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => onPhaseOut(selectedField.name)}
                disabled={!canPhaseOut}
                className={`button-phase-out ${canPhaseOut ? "button-phase-out-enabled" : "button-phase-out-disabled"}`}
              >
                {!canPhaseOut && budget < selectedField.phaseOutCost
                  ? `💰 IKKE RÅD (${selectedField.phaseOutCost} mrd)`
                  : `🌱 FASE UT (${selectedField.phaseOutCost} mrd)`}
              </button>
              <button onClick={onClose} className="button-cancel">
                AVBRYT
              </button>
            </div>
          </>
        ) : (
          // Show transition success - this field is already closed
          <div className="transition-success">
            <div className="closed-emoji">🌱</div>
            <p className="closed-text">Dette feltet er allerede faset ut!</p>
            <p className="closed-subtext">
              Hindret {(selectedField.totalLifetimeEmissions / 1000).toFixed(0)}{" "}
              Mt CO₂ fra å bli brent! 🎉
            </p>
            <button onClick={onClose} className="button-ok">
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Investment Panel Component ---
const InvestmentPanel: React.FC<{
  gameState: GameState;
  dispatch: Function;
}> = ({ gameState, dispatch }) => {
  const budget = gameState.budget ?? 0;

  return (
    <div className="investment-panel">
      <h3>🏦 Invester Norges Fremtid</h3>
      <div className="investment-options">
        <button
          onClick={() =>
            dispatch({
              type: "MAKE_INVESTMENT",
              payload: { type: "ai_research", amount: 50 },
            })
          }
          disabled={budget < 50}
          className="investment-button good-choice"
        >
          🧠 AI-Forskning (50 mrd)
          <br />
          <small>Bygg lokal kompetanse</small>
        </button>
        <button
          onClick={() =>
            dispatch({
              type: "MAKE_INVESTMENT",
              payload: { type: "green_tech", amount: 30 },
            })
          }
          disabled={budget < 30}
          className="investment-button good-choice"
        >
          ⚡ Grønn Tech (30 mrd)
          <br />
          <small>Fornybar energi</small>
        </button>
        <button
          onClick={() =>
            dispatch({
              type: "MAKE_INVESTMENT",
              payload: { type: "foreign_cloud", amount: 20 },
            })
          }
          disabled={budget < 20}
          className="investment-button bad-choice"
        >
          ☁️ Utenlandsk Cloud (20 mrd)
          <br />
          <small>⚠️ Øker avhengighet</small>
        </button>
      </div>
    </div>
  );
};

// --- Climate Dashboard Component ---
const ClimateDashboard: React.FC<{ gameState: GameState }> = ({
  gameState,
}) => {
  // Ensure we have valid values with fallbacks
  const temperature = gameState.globalTemperature ?? 1.1;
  const techRank = gameState.norwayTechRank ?? 0;
  const phasedOutCount = Object.keys(gameState.shutdowns).length;
  const totalSaved =
    gameState.gameFields
      .filter((f) => f.status === "closed")
      .reduce((sum, f) => sum + f.totalLifetimeEmissions, 0) / 1000;

  return (
    <div className="climate-dashboard">
      <div className="climate-metric">
        <h4>🌡️ Global Temperatur</h4>
        <div
          className={`temp-display ${temperature > 2.0 ? "danger" : temperature > 1.5 ? "warning" : "safe"}`}
        >
          +{temperature.toFixed(1)}°C
        </div>
        {temperature > 2.0 && (
          <p className="climate-warning">⚠️ FARLIG NIVÅ!</p>
        )}
        {temperature > 1.5 && temperature <= 2.0 && (
          <p className="climate-warning">⚠️ VÆR FORSIKTIG!</p>
        )}
      </div>

      <div className="climate-metric">
        <h4>🇳🇴 Tech-Uavhengighet</h4>
        <div className="progress-bar-small">
          <div
            className="progress-fill-tech"
            style={{ width: `${Math.min(100, Math.max(0, techRank))}%` }}
          />
        </div>
        <span>{techRank}%</span>
      </div>

      <div className="climate-metric">
        <h4>🌱 Fremgang</h4>
        <p>Felt faset ut: {phasedOutCount}</p>
        <p>CO₂ hindret: {totalSaved.toFixed(0)} Mt</p>
        {gameState.climateDamage > 0 && (
          <p className="climate-damage">
            💸 Klimaskade: {gameState.climateDamage.toFixed(0)} mrd
          </p>
        )}
      </div>
    </div>
  );
};

// Enhanced Achievement notification
const AchievementNotification: React.FC<{ achievements: string[] }> = ({
  achievements,
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (achievements.length > 0) {
      const latest = achievements[achievements.length - 1];
      setCurrentAchievement(latest);
      setShowNotification(true);

      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievements]);

  if (!showNotification || !currentAchievement) return null;

  const badge = Object.values(ACHIEVEMENT_BADGES).find(
    (b) => b.title === currentAchievement,
  );

  return (
    <div className="achievement-notification">
      <div className="notification-content">
        <div className="notification-emoji">{badge?.emoji || "🏆"}</div>
        <div className="notification-text">
          <h4>Prestasjon låst opp!</h4>
          <p>{badge?.title || currentAchievement}</p>
          <small>{badge?.desc}</small>
        </div>
      </div>
    </div>
  );
};

// Debug Achievement Display
const AchievementDebugPanel: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const phasedOutFields = Object.keys(gameState.shutdowns).length;
  const totalTechInvestment = Object.values(gameState.investments).reduce((sum, inv) => sum + inv, 0);

  return (
    <div style={{ background: "#f0f0f0", padding: "10px", margin: "10px", fontSize: "12px" }}>
      <h4>🐛 Achievement Debug</h4>
      <p>Felt faset ut: {phasedOutFields}</p>
      <p>Tech-investeringer: {totalTechInvestment} mrd</p>
      <p>Global temperatur: {gameState.globalTemperature.toFixed(1)}°C</p>
      <p>Tech-rang: {gameState.norwayTechRank}%</p>
      <p>Utenlandsavhengighet: {gameState.foreignDependency}%</p>
      <p>Achievements: {gameState.achievements.join(", ") || "Ingen ennå"}</p>
    </div>
  );
};

// Updated main component with achievement notifications
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
  const mapInstanceRef = useRef<Map | null>(null);

  // Update totals
  useEffect(() => {
    dispatch({ type: "UPDATE_EMISSIONS_PRODUCTION" });
  }, [gameFields]);

  // Initialize map only when in map view
  useEffect(() => {
    if (!mapRef.current || currentView !== "map") return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new Map({
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

      mapInstanceRef.current.on("singleclick", function (evt) {
        mapInstanceRef.current?.forEachFeatureAtPixel(
          evt.pixel,
          function (feature) {
            const fieldData = feature.get("fieldData");
            if (fieldData) {
              dispatch({ type: "SET_SELECTED_FIELD", payload: fieldData });
              dispatch({ type: "TOGGLE_FIELD_MODAL", payload: true });
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

    const vectorSource = new VectorSource({
      features: gameFields.map((field) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([field.lon, field.lat])),
          name: field.name,
          fieldData: field,
        });

        const color = getColorForIntensity(field.intensity, field.status);
        const size =
          field.status === "closed"
            ? 8
            : Math.max(8, Math.min(16, field.production * 0.5));

        feature.setStyle(
          new Style({
            image: new Circle({
              radius: size,
              fill: new Fill({ color: color }),
              stroke: new Stroke({ color: "#FFFFFF", width: 2 }),
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
  }, [gameFields, currentView]);

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
            {/* Removed inline style height: "400px" to use CSS class .map-div */}
            <div ref={mapRef} className="map-div" />
            <div className="map-hint">
              Klikk på et oljefelt for å fase det ut! 🛢️ → 🌱
            </div>
          </div>
        );
    }
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

      {/* Debug panel - remove in production */}
      <AchievementDebugPanel gameState={gameState} />

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
          <h3 className="achievement-title">🏆 Dine Prestasjoner ({achievements.length})</h3>
          {achievements.length === 0 ? (
            <div className="no-achievements">
              <p>Ingen prestasjoner ennå. Fase ut ditt første oljefelt for å få "Første Skritt"!</p>
            </div>
          ) : (
            <div className="achievement-list">
              {achievements.map((achievement, index) => {
                const badge = Object.values(ACHIEVEMENT_BADGES).find((b) => b.title === achievement);
                return (
                  <div key={index} className="achievement-badge enhanced" title={badge?.desc}>
                    {badge?.emoji} {badge?.title || achievement}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Game Control Panel */}
        <GameControlPanel gameState={gameState} dispatch={dispatch} />

        {/* Climate Dashboard */}
        <ClimateDashboard gameState={gameState} />

        {/* Investment Panel */}
        <InvestmentPanel gameState={gameState} dispatch={dispatch} />
      </div>

      {/* Progressive data panel */}
      <ProgressiveDataPanel gameState={gameState} layer={gameState.dataLayerUnlocked} />

      {/* Field Modal */}
      {showFieldModal && (
        <FieldModal
          selectedField={selectedField}
          budget={budget}
          onPhaseOut={phaseOutField}
          onClose={() => dispatch({ type: "TOGGLE_FIELD_MODAL", payload: false })}
        />
      )}
    </div>
  );
};

export default PhaseOutMapPage;
