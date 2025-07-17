import React from "react";

// Game Over Modal
const GameOverModal: React.FC<{
  gamePhase: string;
  stats: any;
  onRestart: () => void;
  onClose: () => void;
}> = ({ gamePhase, stats, onRestart, onClose }) => {
  const getGameOverContent = () => {
    switch (gamePhase) {
      case "victory":
        return {
          title: "🌟 PERFEKT! Norge er karbonnøytral!",
          message:
            "Du klarte å fase ut olje-industrien i tide! Verden ser til Norge som et forbilde.",
          color: "#10B981",
        };
      case "partial_success":
        return {
          title: "⚡ Delvis suksess",
          message:
            "Du kom langt, men ikke helt i mål. Norge må fortsette arbeidet.",
          color: "#F59E0B",
        };
      case "defeat":
        return {
          title: "💥 Klimakatastrofe",
          message: "Tiden løp ut. Norge klarte ikke omstillingen i tide.",
          color: "#EF4444",
        };
      default:
        return { title: "Spill over", message: "", color: "#6B7280" };
    }
  };

  const content = getGameOverContent();

  return (
    <div className="modal game-over-modal">
      <div
        className="modal-content game-over-content"
        style={{ borderTop: `4px solid ${content.color}` }}
      >
        <h2 style={{ color: content.color }}>{content.title}</h2>
        <p className="game-over-message">{content.message}</p>

        <div className="game-over-stats">
          <h3>📊 Dine resultater:</h3>
          <div className="stat-row">
            <span>Felt faset ut:</span>
            <span>
              {stats.phasedOut}/{stats.total} (
              {Math.round((stats.phasedOut / stats.total) * 100)}%)
            </span>
          </div>
          <div className="stat-row">
            <span>CO₂ hindret:</span>
            <span>{stats.co2Saved} Mt</span>
          </div>
          <div className="stat-row">
            <span>Sluttår:</span>
            <span>{stats.finalYear}</span>
          </div>
          <div className="stat-row">
            <span>Prestasjoner:</span>
            <span>{stats.achievements}</span>
          </div>
        </div>

        <div className="game-over-buttons">
          <button onClick={onRestart} className="restart-button">
            🔄 Spill igjen
          </button>
          <button onClick={onClose} className="close-button">
            ❌ Lukk
          </button>
        </div>
      </div>
    </div>
  );
};
export default GameOverModal;
