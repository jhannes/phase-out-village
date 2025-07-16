import React, { useState, useRef, useEffect, useCallback, useMemo, useReducer } from "react";
import OlMap from "ol/Map";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import "./MapPage.css";
import { EmissionsView } from "../../components/charts/EmissionsView";
import { gameReducer, initialGameState } from "../../state/GameReducer";
import { GameState, Field } from "../../interfaces/GameState";
import TopTabBar from "../../components/Navigation/TopTabBar";
import { data } from "../../generated/data";
import MobileTabsLayout from "../../components/Layout/CompactMobileLayout";

// Constants
const LOCAL_STORAGE_KEY = "phaseOutVillageGameState";
const DEFAULT_MAP_CENTER = [5.5, 62.0];
const DEFAULT_MAP_ZOOM = 5;

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

const getColorForIntensity = (intensity: number, status: "active" | "closed" | "transitioning"): string => {
  if (status === "closed") return "#10B981";
  if (status === "transitioning") return "#F59E0B";
  if (intensity > 15) return "#DC2626";
  if (intensity > 8) return "#EF4444";
  if (intensity > 3) return "#F97316";
  return "#64748B";
};

// Field Modal Component with auto-scroll
const FieldModal: React.FC<{
  selectedField: Field | null;
  budget: number;
  onPhaseOut: (fieldName: string) => void;
  onClose: () => void;
}> = ({ selectedField, budget, onPhaseOut, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!selectedField) return null;

  const canAfford = budget >= (selectedField.phaseOutCost || 0);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Auto-scroll to modal when it opens
  useEffect(() => {
    if (modalRef.current) {
      const timer = setTimeout(() => {
        modalRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedField?.name]);

  return (
    <div className="modal field-modal" ref={modalRef} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-button" aria-label="Lukk modal">
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
            <span className={`status-${selectedField.status}`}>{selectedField.status === "active" ? "Aktiv" : selectedField.status === "closed" ? "Faset ut" : "Overgangsfase"}</span>
          </p>

          {selectedField.status === "active" ? (
            <>
              <p>
                <strong>Årlig produksjon:</strong>
                <span>{(selectedField.production || 0).toFixed(1)} mill. boe</span>
              </p>
              <p>
                <strong>Årlige utslipp:</strong>
                <span style={{ color: "#DC2626", fontWeight: "bold" }}>
                  {(() => {
                    const emissions = selectedField.emissions && Array.isArray(selectedField.emissions) ? selectedField.emissions[0] : 0;
                    return (emissions || 0).toFixed(1);
                  })()}{" "}
                  Mt CO₂
                </span>
              </p>
              <p>
                <strong>Utslippsintensitet:</strong>
                <span>{(selectedField.intensity || 0).toFixed(1)} kg CO₂/boe</span>
              </p>
              <p>
                <strong>Arbeidsplasser:</strong>
                <span>~{(selectedField.workers || 0).toLocaleString()}</span>
              </p>
              <p>
                <strong>Omstillingspotensial:</strong>
                <span style={{ color: "#059669", fontWeight: "bold" }}>{(selectedField.transitionPotential || "unknown").replace("_", " ")}</span>
              </p>

              <hr />

              <div className="cost">
                <strong>💥 Totalt livstidsutslipp ved forbrenning:</strong>
                <div style={{ fontSize: "1.2em", color: "#DC2626", marginTop: "8px" }}>{((selectedField.totalLifetimeEmissions || 0) / 1000).toFixed(0)} Mt CO₂</div>
                <small style={{ opacity: 0.8 }}>Dette er CO₂ som slippes ut når oljen brennes av forbrukere</small>
              </div>

              <div className="cost">
                <strong>💰 Kostnad for utfasing:</strong>
                <div style={{ fontSize: "1.2em", marginTop: "8px" }}>{(selectedField.phaseOutCost || 0).toLocaleString()} mrd NOK</div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "3em", marginBottom: "16px" }}>🌱</div>
              <p style={{ color: "#10B981", fontSize: "1.2em", fontWeight: "bold" }}>Dette feltet er allerede faset ut!</p>
              <p style={{ color: "#6B7280", marginTop: "8px" }}>Du hindrer nå {((selectedField.totalLifetimeEmissions || 0) / 1000).toFixed(0)} Mt CO₂ fra å bli sluppet ut i atmosfæren.</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {selectedField.status === "active" ? (
            <>
              <button onClick={() => onPhaseOut(selectedField.name)} disabled={!canAfford} className="phase-out-button">
                {canAfford ? `🌱 Fase ut feltet (${(selectedField.phaseOutCost || 0).toLocaleString()} mrd NOK)` : `💰 Ikke nok penger (${(selectedField.phaseOutCost || 0).toLocaleString()} mrd NOK)`}
              </button>
              {!canAfford && <div className="budget-warning">Du mangler {((selectedField.phaseOutCost || 0) - budget).toLocaleString()} mrd NOK</div>}
            </>
          ) : (
            <button onClick={onClose} className="phase-out-button" style={{ background: "#10B981" }}>
              ✅ Forstått
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Tab Content Components ---
// (Define all tab content functions here, with all required props)

// MapContent
const MapContent: React.FC<{
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapInstanceRef: React.RefObject<any>;
  gameFields: Field[];
  handleFieldClick: (field: Field) => void;
  getFieldAbbreviation: (fieldName: string) => string;
  getColorForIntensity: (intensity: number, status: "active" | "closed" | "transitioning") => string;
  showFieldModal: boolean;
  selectedField: Field | null;
  budget: number;
  phaseOutField: (fieldName: string) => void;
  dispatch: React.Dispatch<any>;
}> = ({
  mapRef,
  mapInstanceRef,
  gameFields,
  handleFieldClick,
  getFieldAbbreviation,
  getColorForIntensity,
  showFieldModal,
  selectedField,
  budget,
  phaseOutField,
  dispatch,
}) => {
  // Map initialization
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

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
        }),
        controls: [],
      });

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.updateSize();
        }
      }, 100);
    } catch (error) {
      console.error("Failed to create map:", error);
    }
  }, []);

  // Update map with field overlays
  useEffect(() => {
    if (!mapInstanceRef.current || gameFields.length === 0) return;

    const map = mapInstanceRef.current;
    map.getOverlays().clear();

    gameFields.forEach((field) => {
      const coordinates = fromLonLat([field.lon, field.lat]);
      const element = document.createElement("div");
      const abbrev = getFieldAbbreviation(field.name);
      const color = getColorForIntensity(field.intensity || 0, field.status);

      element.style.cssText = `
        font-size: 12px;
        font-weight: bold;
        color: ${field.status === "closed" ? "#FFFFFF" : "#1F2937"};
        border: 2px solid #FFFFFF;
        padding: 2px 4px;
        border-radius: 3px;
        background-color: ${color};
        pointer-events: auto;
        cursor: pointer;
      `;
      element.textContent = abbrev;

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
    });
  }, [gameFields]);

  return (
    <div className="map-container">
      <h2 className="map-title">🗺️ Norske Oljeområder</h2>
      <div ref={mapRef} className="map-div" />
      <div className="map-hint">Klikk på et oljefelt for å fase det ut! 🛢️ → 🌱</div>
    </div>
  );
};

// SelectionContent
const SelectionContent: React.FC<{
  gameFields: Field[];
  handleFieldClick: (field: Field) => void;
  getFieldAbbreviation: (fieldName: string) => string;
  getColorForIntensity: (intensity: number, status: "active" | "closed" | "transitioning") => string;
  showFieldModal: boolean;
  selectedField: Field | null;
  budget: number;
  phaseOutField: (fieldName: string) => void;
  dispatch: React.Dispatch<any>;
}> = ({
  gameFields,
  handleFieldClick,
  getFieldAbbreviation,
  getColorForIntensity,
  showFieldModal,
  selectedField,
  budget,
  phaseOutField,
  dispatch,
}) => {
  return (
    <div className="selection-content">
      <h3>🛢️ Oljefelt for fasering</h3>
      <div className="field-list">
        {gameFields.map((field) => (
          <div
            key={field.name}
            className="field-item"
            onClick={() => handleFieldClick(field)}
            style={{
              backgroundColor: getColorForIntensity(field.intensity || 0, field.status),
              cursor: "pointer",
            }}
          >
            <span>{getFieldAbbreviation(field.name)}</span>
            <span>{field.name}</span>
            <span>{field.status === "active" ? "Aktiv" : field.status === "closed" ? "Faset ut" : "Overgangsfase"}</span>
          </div>
        ))}
      </div>
      {showFieldModal && <FieldModal selectedField={selectedField} budget={budget} onPhaseOut={phaseOutField} onClose={() => dispatch({ type: "TOGGLE_FIELD_MODAL", payload: false })} />}
    </div>
  );
};

// EmissionsContent
const EmissionsContent: React.FC<{
  emissionsData: any[];
  totalEmissions: number;
  totalProduction: number;
  year: number;
  shutdowns: { [key: string]: number };
}> = ({ emissionsData, totalEmissions, totalProduction, year, shutdowns }) => {
  return (
    <div className="view-container">
      <EmissionsView data={emissionsData} />
      <div className="game-impact-summary">
        <h3>🎮 Din påvirkning</h3>
        <p>Totale utslipp redusert: {Object.keys(shutdowns).length * 2.5}Mt CO₂</p>
        <p>Felt faset ut: {Object.keys(shutdowns).length}</p>
      </div>
    </div>
  );
};

// AchievementsContent
const AchievementsContent: React.FC<{
  achievements: string[];
}> = ({ achievements }) => {
  return (
    <div className="achievement-card">
      <h3 className="achievement-title">🏆 Dine Prestasjoner ({achievements.length})</h3>
      {achievements.length === 0 ? (
        <div className="no-achievements">
          <p>Ingen prestasjoner ennå. Fase ut ditt første oljefelt for å få "Første Skritt"!</p>
        </div>
      ) : (
        <div className="achievement-list">
          {achievements.map((achievement, index) => (
            <div key={index} className="achievement-badge">
              {achievement}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// DashboardContent
const DashboardContent: React.FC<{
  totalEmissions: number;
  totalProduction: number;
  year: number;
}> = ({ totalEmissions, totalProduction, year }) => {
  return (
    <div className="dashboard-grid">
      <div className="dashboard-card">
        <h3 className="dashboard-title">📊 Utslipp</h3>
        <div className="dashboard-value">{totalEmissions.toFixed(1)} Mt</div>
        <div className="dashboard-label">CO₂ per år</div>
      </div>
      <div className="dashboard-card">
        <h3 className="dashboard-title">⚡ Produksjon</h3>
        <div className="dashboard-value-orange">{totalProduction.toFixed(1)} mill. boe</div>
        <div className="dashboard-label">per år</div>
      </div>
    </div>
  );
};

// --- Main MapPage Component ---
const MapPage: React.FC = () => {
  // --- All hooks at the top ---
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [isInitialized, setIsInitialized] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Aggregate total emissions per year across all fields
  const emissionsDataMap: Record<string, number> = {};
  Object.values(data).forEach(fieldData => {
    Object.entries(fieldData).forEach(([year, { emission }]) => {
      if (emission) {
        emissionsDataMap[year] = (emissionsDataMap[year] || 0) + emission;
      }
    });
  });
  const emissionsData = Object.entries(emissionsDataMap)
    .map(([year, emission]) => ({ year, emission }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  // Initialize game state
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

  // Safe game state access
  const { gameFields = [], budget = 0, score = 0, year = 2025, selectedField = null, showFieldModal = false, achievements = [], totalEmissions = 0, totalProduction = 0, shutdowns = {} } = gameState || {};

  const handleFieldClick = (field: Field) => {
    dispatch({ type: "SET_SELECTED_FIELD", payload: field });
    dispatch({ type: "TOGGLE_FIELD_MODAL", payload: true });
  };

  const phaseOutField = useCallback((fieldName: string) => {
    dispatch({ type: "PHASE_OUT_FIELD", payload: fieldName });
  }, []);

  // --- Early return for loading state ---
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

  // --- Tab state ---
  const tabs = [
    {
      id: "map",
      title: "🗺️ Kart",
      icon: "🗺️",
      content: <MapContent mapRef={mapRef} mapInstanceRef={mapInstanceRef} gameFields={gameFields} handleFieldClick={handleFieldClick} getFieldAbbreviation={getFieldAbbreviation} getColorForIntensity={getColorForIntensity} showFieldModal={showFieldModal} selectedField={selectedField} budget={budget} phaseOutField={phaseOutField} dispatch={dispatch} />,
      badge: undefined,
    },
    {
      id: "emissions",
      title: "📊 Utslipp",
      icon: "📊",
      content: <EmissionsContent emissionsData={emissionsData} totalEmissions={totalEmissions} totalProduction={totalProduction} year={year} shutdowns={shutdowns} />,
      badge: undefined,
    },
    {
      id: "achievements",
      title: "🏆 Prestasjoner",
      icon: "🏆",
      content: <AchievementsContent achievements={achievements} />,
      badge: undefined,
    },
    {
      id: "dashboard",
      title: "📊 Dashboard",
      icon: "📊",
      content: <DashboardContent totalEmissions={totalEmissions} totalProduction={totalProduction} year={year} />,
      badge: undefined,
    },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // --- Layout ---
  if (isMobile) {
    return (
      <MobileTabsLayout
        tabs={tabs}
        defaultTab={tabs[0].id}
        header={<></>}
        floatingActions={<></>}
      />
    );
  }

  // --- Desktop Layout ---
  return (
    <div className="desktop-map-content" style={{ padding: "0 0 68px 0" }}>
      <TopTabBar
        items={tabs.map(tab => ({
          id: tab.id,
          icon: tab.icon,
          label: tab.title,
          badge: tab.badge,
          active: activeTab === tab.id,
          onClick: () => setActiveTab(tab.id),
          ariaLabel: tab.title,
        }))}
        fixed={false}
      />
      <div className={`tab-content tab-${activeTab}`} style={{ padding: 24 }}>
        {activeTabData?.content}
      </div>
    </div>
  );
};

export default MapPage;
