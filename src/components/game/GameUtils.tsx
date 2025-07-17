import React from "react";
import { GameState } from "../../interfaces/GameState";

// This function should be moved outside the component to be accessible by the reducer.
export const calculatePhaseOutCapacity = (state: GameState): number => {
  // Base capacity: How many fields can be phased out per year by default.
  const baseCapacity = 3;

  // Tech bonus: Capacity increases with Norway's tech rank.
  // For every 20 points in tech rank, capacity increases by 1.
  const techBonus = Math.floor(state.norwayTechRank / 20);

  // Investment bonus: Capacity increases with total investments in green tech.
  // For every 100 billion NOK invested, capacity increases by 1.
  const totalGoodInvestments =
    state.investments.green_tech +
    state.investments.renewable_energy +
    state.investments.ai_research +
    state.investments.carbon_capture +
    state.investments.hydrogen_tech +
    state.investments.quantum_computing +
    state.investments.battery_tech +
    state.investments.offshore_wind +
    state.investments.geothermal_energy +
    state.investments.space_tech;
  const investmentBonus = Math.floor(totalGoodInvestments / 100);

  // The total capacity is the sum of base capacity and bonuses, with a maximum cap.
  const totalCapacity = baseCapacity + techBonus + investmentBonus;

  // Cap the maximum number of fields that can be phased out in a single year.
  return Math.min(8, totalCapacity);
};

// The following components are not defined in the provided code.
// These are placeholders to resolve compilation errors.

export const AchievementNotification: React.FC<{ achievements: string[] }> = ({
  achievements,
}) => {
  // This is a placeholder. A real implementation would show a temporary notification.
  if (achievements.length > 0) {
    // console.log("New achievement unlocked:", achievements[achievements.length - 1]);
  }
  return null;
};

export const AchievementDebugPanel: React.FC<{ gameState: GameState }> = ({
  gameState,
}) => {
  // This is a placeholder for a debug component.
  return null;
};

export const MultiSelectControls: React.FC<{
  gameState: GameState;
  dispatch: Function;
}> = ({ gameState, dispatch }) => {
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
    </div>
  );
};
