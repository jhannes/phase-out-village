import React from "react";

// Types (inline for now, should be imported from your types file)
type Field = {
  name: string;
  // ...other properties
};
type Investment =
  | "green_tech"
  | "ai_research"
  | "renewable_energy"
  | "carbon_capture"
  | "foreign_cloud";
type GameState = {
  selectedFields: Field[];
  multiPhaseOutMode: boolean;
  investments: Record<Investment, number>;
  norwayTechRank: number;
  budget: number;
  // ...other properties
};

type MultiSelectControlsProps = {
  gameState: GameState;
  dispatch: Function;
};

// Calculate phase out capacity (should be moved to a shared util)
const calculatePhaseOutCapacity = (state: GameState): number => {
  const baseCapacity = 3;
  const techBonus = Math.floor(state.norwayTechRank / 20);
  const investmentBonus = Math.floor(
    (state.investments.green_tech +
      state.investments.renewable_energy +
      state.investments.ai_research) /
      100,
  );
  return Math.min(8, baseCapacity + techBonus + investmentBonus);
};

const MultiSelectControls: React.FC<MultiSelectControlsProps> = ({
  gameState,
  dispatch,
}) => {
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

export default MultiSelectControls;
