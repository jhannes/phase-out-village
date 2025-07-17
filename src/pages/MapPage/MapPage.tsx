import React, {
  useEffect,
  useRef,
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

import { getColorForIntensity } from "../../utils/gameLogic";
import { GameState, Field } from "../../interfaces/GameState";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "../../constants";
import { useGameState } from "../../context/GameStateContext";

import { EmissionsView } from "../../components/charts/EmissionsView";
import FieldModal from "../../components/modals/FieldModal";
import AchievementModal from "../../components/modals/AchievementModal";
import GameOverModal from "../../components/modals/GameOverModal";
import GameControlPanel from "../../components/game/GameControlPanel";
import TutorialModal from "../../components/modals/TutorialModal";
import GameFeedback from "../../components/game/GameFeedback";
import InvestmentPanel from "../../components/game/InvestmentPanel";
import {
  AchievementDebugPanel,
  AchievementNotification,
  calculatePhaseOutCapacity,
  MultiSelectControls,
} from "../../components/game/GameUtils";
import ProgressiveDataPanel from "../../components/game/ProgressiveDataPanel";
import { ACHIEVEMENT_BADGES } from "../../achievements";
import { BadgeComponents } from "../../components/modals/AchievementModal";
import TopTabBar from "../../components/Navigation/TopTabBar";

const MapPage: React.FC = () => {
  const { gameState, dispatch } = useGameState();

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

  useEffect(() => {
    dispatch({ type: "UPDATE_EMISSIONS_PRODUCTION" });
  }, []);

  // Debug tutorial state
  useEffect(() => {
    console.log(
      "🎯 Tutorial modal should show:",
      gameState.showTutorialModal,
      "tutorialStep:",
      gameState.tutorialStep,
    );
  }, [gameState.showTutorialModal, gameState.tutorialStep]);

  // Debug multi-select state
  useEffect(() => {
    console.log(
      "📋 Multi-select mode:",
      gameState.multiPhaseOutMode,
      "selectedFields:",
      gameState.selectedFields.map((f) => f.name),
    );
  }, [gameState.multiPhaseOutMode, gameState.selectedFields]);

  const handleFieldClick = useCallback(
    (field: Field) => {
      console.log(
        "🎯 Field clicked:",
        field.name,
        "multiPhaseOutMode:",
        gameState.multiPhaseOutMode,
        "field.status:",
        field.status,
      );

      if (gameState.multiPhaseOutMode) {
        if (field.status !== "active") {
          console.log("❌ Field not active, cannot select");
          return;
        }

        const isSelected = gameState.selectedFields.some(
          (f) => f.name === field.name,
        );

        console.log(
          "🎯 Field selection status:",
          isSelected,
          "current selectedFields:",
          gameState.selectedFields.map((f) => f.name),
        );

        if (isSelected) {
          console.log("🗑️ Deselecting field:", field.name);
          dispatch({ type: "DESELECT_FIELD_FROM_MULTI", payload: field.name });
        } else {
          const capacity = calculatePhaseOutCapacity(gameState);
          console.log(
            "📊 Capacity check:",
            gameState.selectedFields.length,
            "/",
            capacity,
          );
          if (gameState.selectedFields.length < capacity) {
            console.log("✅ Selecting field:", field.name);
            dispatch({ type: "SELECT_FIELD_FOR_MULTI", payload: field });
          } else {
            console.log("❌ At capacity, cannot select more fields");
          }
        }
      } else {
        console.log("📋 Single field mode, opening modal");
        dispatch({ type: "SET_SELECTED_FIELD", payload: field });
        dispatch({ type: "TOGGLE_FIELD_MODAL", payload: true });
      }
    },
    [gameState.multiPhaseOutMode, gameState.selectedFields, dispatch],
  );

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

      // Set up the click handler
      const clickHandler = (evt: any) => {
        mapInstanceRef.current?.forEachFeatureAtPixel(
          evt.pixel,
          (feature: any) => {
            const fieldData = feature.get("fieldData");
            if (fieldData) {
              handleFieldClick(fieldData);
            }
          },
        );
      };

      mapInstanceRef.current.on("singleclick", clickHandler);

      // Store the handler reference for cleanup
      mapInstanceRef.current.set("clickHandler", clickHandler);
    }

    setTimeout(() => {
      mapInstanceRef.current?.updateSize();
    }, 100);

    const map = mapInstanceRef.current;
    let vectorLayer = map
      .getLayers()
      .getArray()
      .find((layer) => layer instanceof VectorLayer) as
      | VectorLayer<VectorSource>
      | undefined;

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

        if (gameState.multiPhaseOutMode) {
          const isSelected = gameState.selectedFields.some(
            (f) => f.name === field.name,
          );
          if (isSelected) {
            strokeColor = "#FFD700";
            strokeWidth = 4;
          } else if (field.status === "active") {
            strokeColor = "#00FF00";
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
              fill: new Fill({ color }),
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

  // Update click handler when handleFieldClick changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove old click handler
    const oldHandler = mapInstanceRef.current.get("clickHandler");
    if (oldHandler) {
      mapInstanceRef.current.un("singleclick", oldHandler);
    }

    // Add new click handler
    const newClickHandler = (evt: any) => {
      mapInstanceRef.current?.forEachFeatureAtPixel(
        evt.pixel,
        (feature: any) => {
          const fieldData = feature.get("fieldData");
          if (fieldData) {
            handleFieldClick(fieldData);
          }
        },
      );
    };

    mapInstanceRef.current.on("singleclick", newClickHandler);
    mapInstanceRef.current.set("clickHandler", newClickHandler);
  }, [handleFieldClick]);

  const phaseOutField = useCallback((fieldName: string) => {
    dispatch({ type: "PHASE_OUT_FIELD", payload: fieldName });
  }, []);

  const emissionsData = useMemo(() => {
    const years = Array.from({ length: year - 2020 + 1 }, (_, i) => 2020 + i);
    return gameFields.map((field) => ({
      name: field.name,
      data: years.map((y) => {
        const shutdownYear = gameState.shutdowns[field.name];
        if (shutdownYear && y >= shutdownYear) {
          return 0;
        }
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
                ? `⚡ Multi-utfasing: Klikk på opptil ${calculatePhaseOutCapacity(
                    gameState,
                  )} felt å fase ut samtidig!`
                : "Klikk på et oljefelt for å fase det ut! 🛢️ → 🌱"}
            </div>
          </div>
        );
    }
  };

  const tabs = [
    {
      id: "map",
      title: "🗺️ Kart",
      icon: "🗺️",
      content: renderCurrentView(),
      badge: undefined,
    },
    {
      id: "emissions",
      title: "📊 Utslipp",
      icon: "📊",
      content: renderCurrentView(),
      badge: undefined,
    },
  ];

  return (
    <>
      <TopTabBar
        items={tabs.map((tab) => ({
          id: tab.id,
          icon: tab.icon,
          label: tab.title,
          badge: tab.badge,
          active: currentView === tab.id,
          onClick: () =>
            dispatch({ type: "SET_VIEW_MODE", payload: tab.id as any }),
          ariaLabel: tab.title,
        }))}
      />

      <div
        className="page-content"
        style={{
          filter: `saturate(${gameState.saturationLevel}%) brightness(${
            gameState.saturationLevel > 60 ? 100 : 80
          }%)`,
          transition: "filter 1s ease-in-out",
        }}
      >
        <AchievementNotification achievements={gameState.achievements} />

        {gameState.showTutorialModal && (
          <TutorialModal
            isOpen={gameState.showTutorialModal}
            currentStep={gameState.tutorialStep}
            onNext={() => dispatch({ type: "ADVANCE_TUTORIAL" })}
            onPrevious={() => dispatch({ type: "PREVIOUS_TUTORIAL" })}
            onSkip={() => dispatch({ type: "SKIP_TUTORIAL" })}
            onClose={() => dispatch({ type: "CLOSE_TUTORIAL_MODAL" })}
          />
        )}

        <GameFeedback gameState={gameState} />
        <AchievementDebugPanel gameState={gameState} />
        <MultiSelectControls gameState={gameState} dispatch={dispatch} />

        <div className="header">
          <div className="header-top">
            <h1 className="title">🌍 PHASE OUT VILLAGE</h1>
            <div className="year-badge">TIL 2040!</div>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((gameFields.length -
                    gameFields.filter((f) => f.status === "active").length) /
                    gameFields.length) *
                  100
                }%`,
              }}
            />
          </div>

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
        </div>

        {renderCurrentView()}

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

        <GameControlPanel gameState={gameState} dispatch={dispatch} />
        <InvestmentPanel gameState={gameState} dispatch={dispatch} />
        <ProgressiveDataPanel
          gameState={gameState}
          layer={gameState.dataLayerUnlocked}
        />

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

        {gameState.showAchievementModal && (
          <AchievementModal
            achievements={gameState.newAchievements || []}
            onClose={() => dispatch({ type: "CLOSE_ACHIEVEMENT_MODAL" })}
          />
        )}

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
                color:
                  gameState.globalTemperature > 1.5 ? "#EF4444" : "#22C55E",
              }}
            >
              {gameState.globalTemperature > 1.5
                ? "⚠️ Over Paris-avtalen!"
                : "✅ Under mål"}
            </small>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>💰 Budsjett:</strong> {gameState.budget.toLocaleString()}{" "}
            mrd NOK
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
            <strong>📈 Kapasitet:</strong>{" "}
            {calculatePhaseOutCapacity(gameState)} felt/år
            <br />
            <small>Investeringer øker kapasitet!</small>
          </div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            💡 <strong>Fakta:</strong> 90 til 95% av CO₂ kommer fra forbrenning,
            ikke produksjon!
          </div>
        </div>

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
    </>
  );
};

export default MapPage;
