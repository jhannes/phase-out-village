import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
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
import Overlay from "ol/Overlay";
import Style from "ol/style/Style";
import { Fill, Stroke } from "ol/style";
import "ol/ol.css";
import CompactMobileLayout from "../../components/Layout/CompactMobileLayout";
import { EmissionsView } from "../../components/charts/EmissionsView";
import { generateCompleteData } from "../../utils/projections";
import { data } from "../../generated/data";
import {
  gameReducer,
  createFreshGameState,
  initialGameState,
} from "../../state/GameReducer";
import { GameState, GameAction, Field } from "../../interfaces/GameState";
import "./CompactMapPage.css";

// Types are imported from interfaces

// Constants
const LOCAL_STORAGE_KEY = "phaseOutVillageGameState";
const DEFAULT_MAP_CENTER = [5.5, 62.0];
const DEFAULT_MAP_ZOOM = 5;

const FIELD_COORDINATES: Record<string, [number, number]> = {
  "Johan Sverdrup": [2.9, 58.9],
  Ekofisk: [3.2, 56.5],
  Troll: [3.7, 60.6],
  Oseberg: [2.8, 60.5],
  Gullfaks: [2.3, 61.2],
  Statfjord: [1.8, 61.2],
  Snorre: [2.1, 61.4],
  Kvitebjørn: [2.5, 61.1],
  Heidrun: [6.5, 65.3],
  Åsgard: [6.8, 65.2],
};

// Helper functions
const getFieldAbbreviation = (fieldName: string): string => {
  const abbreviations: Record<string, string> = {
    "Johan Sverdrup": "JS",
    Ekofisk: "EK",
    Troll: "TR",
    Oseberg: "OS",
    Gullfaks: "GF",
    Statfjord: "ST",
    Snorre: "SN",
    Kvitebjørn: "KB",
    Heidrun: "HD",
    Åsgard: "ÅS",
  };
  return abbreviations[fieldName] || fieldName.substring(0, 2).toUpperCase();
};

// These functions are imported from GameReducer

const getColorForIntensity = (
  intensity: number,
  status: "active" | "closed" | "transitioning",
): string => {
  if (status === "closed") return "#10B981";
  if (status === "transitioning") return "#F59E0B";
  if (intensity > 15) return "#DC2626";
  if (intensity > 8) return "#EF4444";
  if (intensity > 3) return "#F97316";
  return "#64748B";
};

// Field Modal Component
const FieldModal: React.FC<{
  selectedField: Field | null;
  budget: number;
  onPhaseOut: (fieldName: string) => void;
  onClose: () => void;
}> = ({ selectedField, budget, onPhaseOut, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!selectedField) return null;

  const canAfford = budget >= (selectedField.phaseOutCost || 0);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="modal field-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-button">
          ×
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
                <strong>Årlig produksjon:</strong>{" "}
                {(selectedField.production || 0).toFixed(1)} mill. boe
              </p>
              <p>
                <strong>Årlige utslipp:</strong>{" "}
                <span style={{ color: "#DC2626", fontWeight: "bold" }}>
                  {(() => {
                    const emissions =
                      selectedField.emissions &&
                      Array.isArray(selectedField.emissions)
                        ? selectedField.emissions[0]
                        : 0;
                    return (emissions || 0).toFixed(1);
                  })()}{" "}
                  Mt CO₂
                </span>
              </p>
              <p>
                <strong>Utslippsintensitet:</strong>{" "}
                {(selectedField.intensity || 0).toFixed(1)} kg CO₂/boe
              </p>
              <p>
                <strong>Arbeidsplasser:</strong> ~
                {(selectedField.workers || 0).toLocaleString()}
              </p>
              <p>
                <strong>Omstillingspotensial:</strong>{" "}
                <span style={{ color: "#059669", fontWeight: "bold" }}>
                  {(selectedField.transitionPotential || "unknown").replace(
                    "_",
                    " ",
                  )}
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
                  {((selectedField.totalLifetimeEmissions || 0) / 1000).toFixed(
                    0,
                  )}{" "}
                  Mt CO₂
                </div>
                <small style={{ opacity: 0.8 }}>
                  Dette er CO₂ som slippes ut når oljen brennes av forbrukere
                </small>
              </div>

              <div className="cost">
                <strong>💰 Kostnad for utfasing:</strong>
                <div style={{ fontSize: "1.2em", marginTop: "8px" }}>
                  {(selectedField.phaseOutCost || 0).toLocaleString()} mrd NOK
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
                {((selectedField.totalLifetimeEmissions || 0) / 1000).toFixed(
                  0,
                )}{" "}
                Mt CO₂ fra å bli sluppet ut i atmosfæren.
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
                  ? `🌱 Fase ut feltet (${(selectedField.phaseOutCost || 0).toLocaleString()} mrd NOK)`
                  : `💰 Ikke nok penger (${(selectedField.phaseOutCost || 0).toLocaleString()} mrd NOK)`}
              </button>
              {!canAfford && (
                <div className="budget-warning">
                  Du mangler{" "}
                  {(
                    (selectedField.phaseOutCost || 0) - budget
                  ).toLocaleString()}{" "}
                  mrd NOK
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
      </div>
      <div className="game-info">
        <small>Spillfremgang lagres automatisk</small>
      </div>
    </div>
  );
};

// Main Component
const CompactMapPage: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [isInitialized, setIsInitialized] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<OlMap | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Lytt på fullscreen-endring for å oppdatere ikon
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Initialize game state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: "LOAD_GAME_STATE", payload: parsed });
      }
    } catch (e) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setIsInitialized(true);
  }, []);

  // Ensure all fields have proper emissions arrays and handle undefined gameState
  const safeGameFields = useMemo(
    () =>
      (gameState?.gameFields || []).map((field) => ({
        ...field,
        name: field.name || "Unknown Field",
        status: field.status || "active",
        emissions:
          field.emissions && Array.isArray(field.emissions)
            ? field.emissions
            : [0],
        intensity: field.intensity || 0,
        production: field.production || 0,
        phaseOutCost: field.phaseOutCost || 0,
        totalLifetimeEmissions: field.totalLifetimeEmissions || 0,
        workers: field.workers || 0,
        lon: field.lon || 0,
        lat: field.lat || 0,
        transitionPotential: field.transitionPotential || "wind",
      })),
    [gameState?.gameFields],
  );

  const {
    budget = 0,
    score = 0,
    year = 2025,
    selectedField = null,
    showFieldModal = false,
    achievements = [],
    totalEmissions = 0,
    totalProduction = 0,
    currentView = "map",
    selectedFields = [],
    multiPhaseOutMode = false,
    shutdowns = {},
  } = gameState || {};

  const gameFields = safeGameFields;

  // Update totals when fields change - only when field count or statuses change
  useEffect(() => {
    if (gameFields.length > 0) {
      dispatch({ type: "UPDATE_EMISSIONS_PRODUCTION" });
    }
  }, [gameFields.length, gameFields.map((f) => f.status).join(",")]);

  // Helper functions
  const formatNumber = (
    num: number | null | undefined,
    suffix: string = "",
  ): string => {
    const safeNum = num || 0;
    if (safeNum >= 1000000)
      return `${(safeNum / 1000000).toFixed(1)}M${suffix}`;
    if (safeNum >= 1000) return `${(safeNum / 1000).toFixed(1)}K${suffix}`;
    return `${safeNum.toFixed(1)}${suffix}`;
  };

  const calculatePhaseOutCapacity = (): number => {
    const baseCapacity = 3;
    const techBonus = Math.floor((gameState?.norwayTechRank || 0) / 20);
    const investmentBonus = Math.floor(
      Object.values(gameState?.investments || {}).reduce(
        (sum, val) => sum + (val || 0),
        0,
      ) / 100,
    );
    return Math.min(8, baseCapacity + techBonus + investmentBonus);
  };

  const getTotalCost = (): number => {
    return selectedFields.reduce(
      (sum, field) => sum + (field.phaseOutCost || 0),
      0,
    );
  };

  const getTotalEmissions = (): number => {
    return (
      selectedFields.reduce((sum, field) => {
        const emissions =
          field.emissions && Array.isArray(field.emissions)
            ? field.emissions[0]
            : 0;
        return sum + (emissions || 0);
      }, 0) / 1000000
    );
  };

  // Field interaction handlers
  const handleFieldClick = (field: Field) => {
    if (multiPhaseOutMode) {
      if (field.status !== "active") return;

      const isSelected = selectedFields.some((f) => f.name === field.name);
      if (isSelected) {
        dispatch({ type: "DESELECT_FIELD_FROM_MULTI", payload: field.name ?? "" });
      } else {
        const capacity = calculatePhaseOutCapacity();
        if (selectedFields.length < capacity) {
          dispatch({ type: "SELECT_FIELD_FOR_MULTI", payload: field });
        }
      }
    } else {
      dispatch({ type: "SET_SELECTED_FIELD", payload: field });
      dispatch({ type: "TOGGLE_FIELD_MODAL", payload: true });
    }
  };

  const phaseOutField = useCallback((fieldName: string) => {
    dispatch({ type: "PHASE_OUT_FIELD", payload: fieldName });
  }, []);

  const handleMultiPhaseOut = () => {
    if (selectedFields.length > 0 && getTotalCost() <= budget) {
      dispatch({
        type: "MULTI_PHASE_OUT",
        payload: selectedFields.map((f) => f.name),
      });
    }
  };

  const navigateToField = useCallback(
    (fieldName: string) => {
      dispatch({ type: "SET_VIEW_MODE", payload: "map" });
      const field = gameFields.find((f) => f.name === fieldName);
      if (field) {
        setTimeout(() => {
          dispatch({ type: "SET_SELECTED_FIELD", payload: field });
          dispatch({ type: "TOGGLE_FIELD_MODAL", payload: true });
        }, 500);
      }
    },
    [gameFields],
  );

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log("Initializing map...");

    try {
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
        }),
        controls: [],
      });

      console.log("Map created successfully");

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.updateSize();
          mapInstanceRef.current.renderSync();
          console.log("Map updated and rendered");
        }
      }, 100);
    } catch (error) {
      console.error("Failed to create map:", error);
    }
  }, []);

  // Update map size when tab becomes visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (mapInstanceRef.current && mapRef.current) {
        if (mapRef.current.offsetParent !== null) {
          mapInstanceRef.current.updateSize();
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Update map with field overlays
  useEffect(() => {
    if (!mapInstanceRef.current || gameFields.length === 0) return;

    const map = mapInstanceRef.current;
    map.getOverlays().clear();

    console.log("Creating map overlays for", gameFields.length, "fields");
    console.log(
      "Map container size:",
      mapRef.current?.offsetWidth,
      "x",
      mapRef.current?.offsetHeight,
    );
    console.log("Map is visible:", mapRef.current?.offsetParent !== null);

    gameFields.forEach((field) => {
      const coordinates = fromLonLat([field.lon, field.lat]);
      const element = document.createElement("div");

      let color = getColorForIntensity(field.intensity || 0, field.status);
      let strokeColor = "#FFFFFF";
      let strokeWidth = 2;

      if (multiPhaseOutMode) {
        const isSelected = selectedFields.some((f) => f.name === field.name);
        if (isSelected) {
          strokeColor = "#FFD700";
          strokeWidth = 4;
        } else if (field.status === "active") {
          strokeColor = "#00FF00";
          strokeWidth = 3;
        }
      }

      element.style.cssText = `
        font-size: 12px;
        font-weight: bold;
        color: ${field.status === "closed" ? "#FFFFFF" : "#1F2937"};
        border: ${strokeWidth}px solid ${strokeColor};
        padding: 2px 4px;
        border-radius: 3px;
        background-color: ${color};
        pointer-events: auto;
        white-space: nowrap;
        user-select: none;
        cursor: pointer;
      `;
      element.textContent = getFieldAbbreviation(field.name);

      element.addEventListener("click", (event) => {
        event.stopPropagation();
        handleFieldClick(field);
      });

      const overlay = new Overlay({
        position: coordinates,
        element: element,
        positioning: "center-center",
      });

      map.addOverlay(overlay);
      console.log("Added overlay for", field.name, "at", coordinates);
    });

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateSize();
        mapInstanceRef.current.renderSync();
      }
    }, 50);
  }, [gameFields, multiPhaseOutMode, selectedFields]);

  // Emissions data for chart
  const emissionsData = useMemo(() => {
    const safeYear = year || 2025;
    const years = Array.from(
      { length: safeYear - 2020 + 1 },
      (_, i) => 2020 + i,
    );
    return gameFields.map((field) => ({
      name: field.name || "Unknown",
      data: years.map((y) => {
        const shutdownYear = shutdowns?.[field.name];
        if (shutdownYear && y >= shutdownYear) return 0;
        const emissions =
          field.emissions && Array.isArray(field.emissions)
            ? field.emissions[0]
            : 0;
        return emissions || 0;
      }),
    }));
  }, [gameFields, year, shutdowns]);

  // Loading state - moved after all hooks
  if (
    !isInitialized ||
    !gameState ||
    !gameState.gameFields ||
    gameState.gameFields.length === 0
  ) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "48px" }}>🔄</div>
        <div>Loading game data...</div>
      </div>
    );
  }

  // Fullscreen handlers
  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Tab Contents
  const MapContent = () => (
    <div className="map-content">
      <div className="map-container">
        <div
          ref={mapRef}
          className="map-display"
          style={{
            height: "400px",
            width: "100%",
            position: "relative",
            display: "block",
            border: "2px solid red",
            background: "#f0f8ff",
          }}
        >
          {!mapInstanceRef.current && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(255,255,255,0.9)",
                padding: "20px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🗺️</div>
              <div>Initializing map...</div>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              zIndex: 1000,
              background: "white",
              padding: "4px",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            Map: {mapInstanceRef.current ? "✅" : "❌"} | Fields:{" "}
            {gameFields.length}
          </div>
        </div>

        {/* Map Legend */}
        <div
          className="map-legend"
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h4
            style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#374151" }}
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
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
        </div>

        <div
          className="map-hint"
          style={{
            marginTop: "12px",
            padding: "8px",
            backgroundColor: "#e3f2fd",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          {multiPhaseOutMode
            ? `⚡ Multi-utfasing: Klikk på opptil ${calculatePhaseOutCapacity()} felt å fase ut samtidig!`
            : "Klikk på et oljefelt for å fase det ut! 🛢️ → 🌱"}
        </div>
      </div>

      {/* Quick Field List */}
      <div className="quick-fields" style={{ marginTop: "16px" }}>
        <h4>
          🛢️ Aktive felt (
          {gameFields.filter((f) => f.status === "active").length})
        </h4>
        <div
          className="field-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          {gameFields
            .filter((f) => f.status === "active")
            .slice(0, 6)
            .map((field) => (
              <div
                key={field.name}
                className="field-item"
                style={{
                  padding: "8px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: selectedFields.some(
                    (f) => f.name === field.name,
                  )
                    ? "#fef3c7"
                    : "#fff",
                }}
                onClick={() => handleFieldClick(field)}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span>{field.status === "closed" ? "🌱" : "🛢️"}</span>
                  <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                    {getFieldAbbreviation(field.name)}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>
                  {(field.intensity || 0).toFixed(1)} kg CO₂/boe
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const SelectionContent = () => (
    <div className="selection-content">
      <div className="selection-header" style={{ marginBottom: "16px" }}>
        <h3>🎯 Multi-utfasing</h3>
        <p>Velg opptil {calculatePhaseOutCapacity()} felt</p>
        <button
          onClick={() => dispatch({ type: "TOGGLE_MULTI_SELECT" })}
          style={{
            padding: "8px 16px",
            backgroundColor: multiPhaseOutMode ? "#dc2626" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {multiPhaseOutMode ? "Avslutt multi-modus" : "Start multi-modus"}
        </button>
      </div>

      {selectedFields.length > 0 && (
        <div
          className="selected-summary"
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#f0f9ff",
            borderRadius: "8px",
          }}
        >
          <div
            className="summary-stats"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {selectedFields.length}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Valgte felt
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {formatNumber(getTotalCost(), " kr")}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Total kostnad
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {getTotalEmissions().toFixed(1)} Mt
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                CO₂ reduksjon
              </div>
            </div>
          </div>

          <div className="selected-fields" style={{ marginBottom: "12px" }}>
            {selectedFields.map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 0",
                }}
              >
                <span style={{ fontSize: "14px" }}>{field.name}</span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    {formatNumber(field.phaseOutCost || 0, " kr")}
                  </span>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "DESELECT_FIELD_FROM_MULTI",
                        payload: field.name,
                      })
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "#dc2626",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleMultiPhaseOut}
            disabled={getTotalCost() > budget}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: getTotalCost() <= budget ? "#10b981" : "#9ca3af",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: getTotalCost() <= budget ? "pointer" : "not-allowed",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            🌱 Fase ut {selectedFields.length} felt
          </button>
        </div>
      )}

      <div className="available-fields">
        <h4>Tilgjengelige felt</h4>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {gameFields
            .filter(
              (field) =>
                field.status === "active" &&
                !selectedFields.some((f) => f.name === field.name),
            )
            .map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px",
                  margin: "4px 0",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                    {field.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {(field.intensity || 0).toFixed(1)} kg CO₂e/BOE
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "12px" }}>
                    {formatNumber(field.phaseOutCost || 0, " kr")}
                  </span>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "SELECT_FIELD_FOR_MULTI",
                        payload: field,
                      })
                    }
                    disabled={
                      selectedFields.length >= calculatePhaseOutCapacity()
                    }
                    style={{
                      padding: "4px 8px",
                      backgroundColor:
                        selectedFields.length < calculatePhaseOutCapacity()
                          ? "#10b981"
                          : "#9ca3af",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor:
                        selectedFields.length < calculatePhaseOutCapacity()
                          ? "pointer"
                          : "not-allowed",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const EmissionsContent = () => (
    <div className="emissions-content">
      <EmissionsView data={emissionsData} onFieldClick={navigateToField} />
      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <h3>🎮 Din påvirkning</h3>
        <p>
          Totale utslipp redusert: {Object.keys(shutdowns).length * 2.5}Mt CO₂
        </p>
        <p>Felt faset ut: {Object.keys(shutdowns).length}</p>
      </div>
    </div>
  );

  const tabs = [
    {
      id: "map",
      title: "Kart",
      icon: "🗺️",
      content: <MapContent />,
      badge: gameFields.filter((f) => f.status === "active").length,
    },
    {
      id: "selection",
      title: "Utfasing",
      icon: "🎯",
      content: <SelectionContent />,
      badge: selectedFields.length,
    },
    {
      id: "emissions",
      title: "Utslipp",
      icon: "📊",
      content: <EmissionsContent />,
    },
    {
      id: "controls",
      title: "Innstillinger",
      icon: "⚙️",
      content: <GameControlPanel gameState={gameState} dispatch={dispatch} />,
    },
  ];

  const statusBar = (
    <>
      <div className="status-item">
        <span className="status-icon">💰</span>
        <div className="status-value">{formatNumber(budget)}</div>
        <div className="status-label">Budsjett</div>
      </div>
      <div className="status-item">
        <span className="status-icon">🛢️</span>
        <div className="status-value">
          {gameFields.filter((f) => f.status === "active").length}
        </div>
        <div className="status-label">Aktive</div>
      </div>
      <div className="status-item">
        <span className="status-icon">🌱</span>
        <div className="status-value">{selectedFields.length}</div>
        <div className="status-label">Valgte</div>
      </div>
      <div className="status-item">
        <span className="status-icon">💨</span>
        <div className="status-value">{(totalEmissions || 0).toFixed(1)}Mt</div>
        <div className="status-label">Utslipp</div>
      </div>
    </>
  );

  const floatingActions = (
    <>
      {selectedFields.length > 0 && (
        <button
          className="fab primary"
          title={`Fase ut ${selectedFields.length} felt`}
          onClick={handleMultiPhaseOut}
          disabled={getTotalCost() > budget}
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: getTotalCost() <= budget ? "#10b981" : "#9ca3af",
            color: "white",
            border: "none",
            fontSize: "24px",
            cursor: getTotalCost() <= budget ? "pointer" : "not-allowed",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          🌱
        </button>
      )}
      <button
        className="fab secondary"
        title="Multi-modus"
        onClick={() => dispatch({ type: "TOGGLE_MULTI_SELECT" })}
        style={{
          position: "fixed",
          bottom: selectedFields.length > 0 ? "150px" : "80px",
          right: "20px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: multiPhaseOutMode ? "#dc2626" : "#6b7280",
          color: "white",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
        }}
      >
        🎯
      </button>
    </>
  );

  const header = (
    <div className="map-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="title-icon">🗺️</span>
          Norske Oljeområder
        </h1>
        <div style={{ fontSize: "14px", color: "#6b7280" }}>
          År: {year || 2025} | Poeng: {score || 0} | Felt faset ut: {Object.keys(shutdowns || {}).length}
        </div>
      </div>
      <button
        onClick={handleFullscreen}
        aria-label={isFullscreen ? "Avslutt fullskjerm" : "Fullskjerm"}
        style={{
          background: "none",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
          color: "#64748b",
          marginLeft: 16,
        }}
        title={isFullscreen ? "Avslutt fullskjerm" : "Fullskjerm"}
      >
        {isFullscreen ? "❎" : "⛶"}
      </button>
    </div>
  );

  return (
    <>
      <CompactMobileLayout
        tabs={tabs}
        defaultTab="map"
        header={header}
        statusBar={statusBar}
        floatingActions={floatingActions}
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
    </>
  );
};

export default CompactMapPage;
