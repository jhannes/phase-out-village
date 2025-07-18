import React from "react";
import { GameState } from "../../interfaces/GameState";
import { Investment } from "../../types/types";

const InvestmentPanel: React.FC<{
  gameState: GameState;
  dispatch: Function;
}> = ({ gameState, dispatch }) => {
  const investments: { type: Investment; label: string; color: string }[] = [
    { type: "green_tech", label: "Grønn Teknologi", color: "#22C55E" },
    { type: "ai_research", label: "AI Forskning", color: "#6366F1" },
    { type: "renewable_energy", label: "Fornybar Energi", color: "#F59E0B" },
    { type: "carbon_capture", label: "Karbonfangst", color: "#0EA5E9" },
    { type: "foreign_cloud", label: "Utenlandsk Sky", color: "#EF4444" },
  ];

  const handleInvest = (type: Investment, amount: number) => {
    dispatch({ type: "MAKE_INVESTMENT", payload: { type, amount } });
  };

  return (
    <div className="investment-panel">
      <h4>Investeringer</h4>
      <div className="investment-buttons">
        {investments.map((inv) => (
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
            }}
            disabled={gameState.budget < 100}
            onClick={() => handleInvest(inv.type, 100)}
            title={`Invester 100 mrd i ${inv.label}`}
          >
            +100 mrd {inv.label}
          </button>
        ))}
      </div>
      <div className="investment-summary">
        <h5>Din portefølje:</h5>
        <ul>
          {investments.map((inv) => (
            <li key={inv.type}>
              <span style={{ color: inv.color }}>{inv.label}:</span>{" "}
              {(gameState.investments[inv.type] || 0).toLocaleString()} mrd NOK
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default InvestmentPanel;
