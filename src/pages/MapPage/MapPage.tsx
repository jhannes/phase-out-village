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
};

type ViewMode = "map" | "emissions" | "production" | "economics";

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
};

type GameAction =
  | { type: "PHASE_OUT_FIELD"; payload: string }
  | { type: "SET_SELECTED_FIELD"; payload: Field | null }
  | { type: "TOGGLE_FIELD_MODAL"; payload: boolean }
  | { type: "UPDATE_EMISSIONS_PRODUCTION" }
  | { type: "LOAD_GAME_STATE"; payload: GameState }
  | { type: "ADD_ACHIEVEMENT"; payload: string }
  | { type: "ADVANCE_YEAR"; payload?: number }
  | { type: "SET_VIEW_MODE"; payload: ViewMode };

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

const INITIAL_BUDGET = 500;
const INITIAL_SCORE = 100;
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

  return {
    name: fieldName,
    lon: coordinates.lon,
    lat: coordinates.lat,
    emissions: emissionsHistory.length > 0 ? emissionsHistory : [0],
    intensity: latestData?.emissionIntensity || 0,
    status: currentProduction > 0 ? "active" : "closed",
    production: currentProduction,
    workers: Math.floor(currentProduction * 25), // Estimate workers
    phaseOutCost: Math.floor(currentProduction * 10), // Estimate phase-out cost
    productionOil: latestData?.productionOil,
    productionGas: latestData?.productionGas,
    realEmission: latestData?.emission,
    realEmissionIntensity: latestData?.emissionIntensity,
  };
};

const loadGameState = (): GameState => {
  const realData = generateCompleteData(data);
  const gameFields = Object.keys(realData).map((fieldName) =>
    createFieldFromRealData(fieldName, realData),
  );

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.gameFields) {
        return {
          ...parsed,
          realData,
          gameFields: gameFields.map((field) => {
            const savedField = parsed.gameFields.find(
              (f: Field) => f.name === field.name,
            );
            return savedField ? { ...field, status: savedField.status } : field;
          }),
        };
      }
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
  }

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

// --- Reducer ---
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "LOAD_GAME_STATE":
      return { ...state, ...action.payload };
    case "PHASE_OUT_FIELD": {
      const fieldName = action.payload;
      const field = state.gameFields.find((f) => f.name === fieldName);
      if (!field || state.budget < field.phaseOutCost) return state;

      const newBudget = state.budget - field.phaseOutCost;
      const newScore = state.score + Math.floor(field.emissions[0] * 10);
      const newGameFields = state.gameFields.map((f) => {
        if (f.name === fieldName) {
          return { ...f, status: "closed" as const, production: 0 };
        }
        return f;
      });

      const newShutdowns = { ...state.shutdowns, [fieldName]: state.year };

      let newAchievements = state.achievements;
      if (!newAchievements.includes(ACHIEVEMENT_FIRST_PHASE_OUT)) {
        newAchievements = [...newAchievements, ACHIEVEMENT_FIRST_PHASE_OUT];
      }

      return {
        ...state,
        budget: newBudget,
        score: newScore,
        gameFields: newGameFields,
        shutdowns: newShutdowns,
        showFieldModal: false,
        selectedField: null,
        achievements: newAchievements,
        year: state.year + 1,
      };
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
      return {
        ...state,
        totalEmissions: emissions,
        totalProduction: production,
      };
    }
    case "ADVANCE_YEAR":
      return { ...state, year: state.year + (action.payload || 1) };
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
    default:
      return state;
  }
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

  const canPhaseOut = budget >= selectedField.phaseOutCost;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">🛢️ {selectedField.name}</h3>

        {selectedField.status === "active" ? (
          <>
            <div className="modal-stats">
              <div className="modal-stat-row">
                <span>Utslipp:</span>
                <span className="modal-stat-value" style={{ color: "#DC2626" }}>
                  {selectedField.emissions[0].toFixed(1)} Mt/år
                </span>
              </div>
              <div className="modal-stat-row">
                <span>Olje produksjon:</span>
                <span className="modal-stat-value" style={{ color: "#EA580C" }}>
                  {selectedField.productionOil?.toFixed(1) || 0} mill. Sm³
                </span>
              </div>
              <div className="modal-stat-row">
                <span>Gass produksjon:</span>
                <span className="modal-stat-value" style={{ color: "#EA580C" }}>
                  {selectedField.productionGas?.toFixed(1) || 0} mrd. Sm³
                </span>
              </div>
              <div className="modal-stat-row">
                <span>Utslippsintensitet:</span>
                <span className="modal-stat-value" style={{ color: "#F59E0B" }}>
                  {selectedField.intensity.toFixed(1)} kg CO₂/boe
                </span>
              </div>
              <div className="modal-stat-row">
                <span>Kostnad å fase ut:</span>
                <span className="modal-stat-value" style={{ color: "#2563EB" }}>
                  {selectedField.phaseOutCost} mrd
                </span>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => onPhaseOut(selectedField.name)}
                disabled={!canPhaseOut}
                className={`button-phase-out ${canPhaseOut ? "button-phase-out-enabled" : "button-phase-out-disabled"}`}
              >
                FASE UT
              </button>
              <button onClick={onClose} className="button-cancel">
                AVBRYT
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="closed-message">
              <div className="closed-emoji">🌱</div>
              <p className="closed-text">Dette feltet er faset ut!</p>
              <p className="closed-subtext">
                Null utslipp, null produksjon. Bra jobbet! 🎉
              </p>
            </div>
            <button onClick={onClose} className="button-ok">
              OK
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
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

  // Save game state
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

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
    <div className="container">
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

      {/* View Toggle - Now outside the main header, but still centered */}
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

      {/* Dynamic View Container and Stats Dashboard are grouped here */}
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

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="achievement-card">
            <h3 className="achievement-title">🏆 Prestasjoner</h3>
            <div className="achievement-list">
              {achievements.map((achievement, index) => (
                <span key={index} className="achievement-badge">
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default PhaseOutMapPage;
