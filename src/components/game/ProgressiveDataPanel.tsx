import React from "react";
import { GameState } from "../../interfaces/GameState";
import { DataLayer } from "../../types/types";

// TODO: Refactor data panel to support dynamic layer updates based on game state
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
export default ProgressiveDataPanel; 