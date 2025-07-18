import React from "react";
import { GameState } from "../../interfaces/GameState";
import { sanitizeString } from "../../utils/security";

// Environmental consequences system
export const calculateEnvironmentalState = (gameState: GameState) => {
  const temp = gameState.globalTemperature;
  const activeFields = gameState.gameFields.filter(
    (f) => f.status === "active",
  ).length;
  const totalFields = gameState.gameFields.length;

  if (temp > 2.5)
    return {
      phase: "crisis",
      saturation: 20,
      message: sanitizeString("🔥 KLIMAKATASTROFE! Verden brenner!"),
    };
  if (temp > 2.0)
    return {
      phase: "danger",
      saturation: 40,
      message: sanitizeString("⚠️ KRITISK! Temperaturen stiger farlig!"),
    };
  if (temp > 1.5)
    return {
      phase: "warning",
      saturation: 70,
      message: sanitizeString("⚡ ADVARSEL! Klimamålene er i fare!"),
    };
  if (activeFields / totalFields < 0.3)
    return {
      phase: "victory",
      saturation: 100,
      message: sanitizeString("🌟 FANTASTISK! Du redder verden!"),
    };

  return {
    phase: "normal",
    saturation: 85,
    message: sanitizeString("🎯 Fortsett arbeidet for klimaet!"),
  };
};

// Gamification feedback system
const GameFeedback: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const envState = calculateEnvironmentalState(gameState);

  return (
    <div className={`game-feedback ${envState.phase}`}>
      <div className="feedback-message">{envState.message}</div>
      {gameState.goodChoiceStreak > 3 && (
        <div className="streak-bonus">
          🔥 {gameState.goodChoiceStreak} gode valg på rad!
        </div>
      )}
      {gameState.badChoiceCount > 2 && (
        <div className="warning-streak">
          ⚠️ {gameState.badChoiceCount} dårlige valg - vær forsiktig!
        </div>
      )}
    </div>
  );
};

export default GameFeedback;
