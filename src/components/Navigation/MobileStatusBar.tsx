import React from "react";
import { useGameState, useGameStats } from "../../context/GameStateContext";

const MobileStatusBar: React.FC = () => {
  const { gameState } = useGameState();
  const gameStats = useGameStats();

  return (
    <div className="mobile-status-bar">
      <div className="status-item">
        <span className="status-icon">💰</span>
        <div className="status-value">{gameState?.budget?.toLocaleString() ?? 0}</div>
        <div className="status-label">Budsjett</div>
      </div>
      <div className="status-item">
        <span className="status-icon">🛢️</span>
        <div className="status-value">{gameStats.fieldsRemaining ?? 0}</div>
        <div className="status-label">Felt igjen</div>
      </div>
      <div className="status-item">
        <span className="status-icon">🌱</span>
        <div className="status-value">{gameStats.selectedFieldsCount ?? 0}</div>
        <div className="status-label">Valgte</div>
      </div>
      <div className="status-item">
        <span className="status-icon">💨</span>
        <div className="status-value">{gameStats.totalEmissionsReduced?.toFixed(1) ?? "0.0"}Mt</div>
        <div className="status-label">Redusert</div>
      </div>
    </div>
  );
};

export default MobileStatusBar; 