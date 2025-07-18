import React from "react";
import { GameState } from "../../interfaces/GameState";
import { Investment } from "../../types/types";

// This function should be moved outside the component to be accessible by the reducer.
export const calculatePhaseOutCapacity = (state: GameState): number => {
  // Base capacity: How many fields can be phased out per year by default.
  const baseCapacity = 3;

  // Tech bonus: Capacity increases with Norway's tech rank.
  // For every 20 points in tech rank, capacity increases by 1.
  const techBonus = Math.floor(state.norwayTechRank / 20);

  // Investment bonus: Capacity increases with total investments in green tech.
  // For every 100 billion NOK invested, capacity increases by 1.
  const totalGoodInvestments = calculateTotalGoodInvestments(state.investments);
  const investmentBonus = Math.floor(totalGoodInvestments / 100);

  // The total capacity is the sum of base capacity and bonuses, with a maximum cap.
  const totalCapacity = baseCapacity + techBonus + investmentBonus;

  // Cap the maximum number of fields that can be phased out in a single year.
  return Math.min(8, totalCapacity);
};

// Consolidated function to calculate total good investments
export const calculateTotalGoodInvestments = (
  investments: Record<Investment, number>,
): number => {
  return (
    investments.green_tech +
    investments.ai_research +
    investments.renewable_energy +
    investments.carbon_capture +
    investments.hydrogen_tech +
    investments.quantum_computing +
    investments.battery_tech +
    investments.offshore_wind +
    investments.geothermal_energy +
    investments.space_tech
  );
};

// Consolidated function to calculate total bad investments
export const calculateTotalBadInvestments = (
  investments: Record<Investment, number>,
): number => {
  return (
    investments.foreign_cloud +
    investments.fossil_subsidies +
    investments.crypto_mining +
    investments.fast_fashion
  );
};

// Function to calculate emissions saved (lifetime emissions)
export const calculateEmissionsSaved = (fields: any[]): number => {
  return fields.reduce((sum, field) => sum + field.totalLifetimeEmissions, 0);
};

// Function to calculate emissions reduction (current yearly emissions)
export const calculateEmissionsReduction = (fields: any[]): number => {
  return fields.reduce((sum, field) => sum + (field.emissions[0] || 0), 0);
};

// Fix score calculation - use a more reasonable scoring system
export const calculateScore = (totalLifetimeEmissions: number): number => {
  // Score based on emissions prevented, with a more reasonable scale
  // 1 Mt CO2 = 100 points, so a field with 10 Mt lifetime emissions = 1000 points
  return Math.floor(totalLifetimeEmissions * 100);
};

// Fix temperature calculation - use more realistic scale
export const calculateTemperatureReduction = (
  yearlyEmissions: number,
): number => {
  // More realistic temperature reduction: 1 Mt CO2 = 0.01°C reduction
  // This means phasing out a field with 1 Mt emissions reduces temperature by 0.01°C
  return yearlyEmissions * 0.01;
};

// Fix climate damage calculation
export const calculateClimateDamage = (totalEmissions: number): number => {
  // More reasonable climate damage calculation
  // Base damage on current emissions with a realistic scale
  return Math.max(0, totalEmissions * 50); // 1 Mt = 50 damage points
};

// Fix achievement checking for tech investments
export const calculateTotalGoodTechInvestment = (
  investments: Record<Investment, number>,
): number => {
  return (
    investments.green_tech +
    investments.ai_research +
    investments.renewable_energy +
    investments.carbon_capture +
    investments.hydrogen_tech +
    investments.quantum_computing +
    investments.battery_tech +
    investments.offshore_wind +
    investments.geothermal_energy +
    investments.space_tech
  );
};

// Fix progressive data unlocks - use correct property
export const getPhasedOutFieldsCount = (gameState: GameState): number => {
  return Object.keys(gameState.shutdowns).length;
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
