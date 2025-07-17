import React from "react";
import { GameState } from "../../interfaces/GameState";
import { LOCAL_STORAGE_KEY } from "../../constants";

// Game Control Panel Component
const GameControlPanel: React.FC<{
  gameState: GameState;
  dispatch: Function;
}> = ({ gameState, dispatch }) => {
  const handleRestart = () => {
    if (
      window.confirm(
        "Er du sikker på at du vil starte spillet på nytt? All fremgang vil gå tapt.",
      )
    ) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      dispatch({ type: "RESTART_GAME" });
    }
  };

  const handleResetTutorial = () => {
    dispatch({ type: "RESET_TUTORIAL" });
  };

  const handleClearStorage = () => {
    if (window.confirm("Er du sikker på at du vil slette all lagret data?")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  };

  const handleTestStorage = () => {
    console.log("=== localStorage Test ===");

    // Test 1: Basic localStorage functionality
    try {
      localStorage.setItem("test-basic", "hello");
      const basicTest = localStorage.getItem("test-basic");
      console.log("Basic test:", basicTest === "hello" ? "PASS" : "FAIL");
    } catch (e) {
      console.log("Basic test: FAIL -", e);
    }

    // Test 2: JSON functionality
    try {
      const testData = { test: "data", timestamp: Date.now() };
      localStorage.setItem("test-json", JSON.stringify(testData));
      const retrieved = localStorage.getItem("test-json");
      const parsed = JSON.parse(retrieved || "{}");
      console.log(
        "JSON test:",
        JSON.stringify(parsed) === JSON.stringify(testData) ? "PASS" : "FAIL",
      );
    } catch (e) {
      console.log("JSON test: FAIL -", e);
    }

    // Test 3: Check current game state
    try {
      const currentGameState = localStorage.getItem(LOCAL_STORAGE_KEY);
      console.log(
        "Current game state:",
        currentGameState ? "EXISTS" : "NOT FOUND",
      );
      if (currentGameState) {
        const parsed = JSON.parse(currentGameState);
        console.log("Game state details:", {
          hasGameFields: !!parsed.gameFields,
          gameFieldsCount: parsed.gameFields?.length,
          closedFields: parsed.gameFields?.filter(
            (f: any) => f.status === "closed",
          )?.length,
        });
      }
    } catch (e) {
      console.log("Game state check: FAIL -", e);
    }

    // Test 4: Try to save a simple game state
    try {
      const simpleState = {
        gameFields: [{ name: "Test Field", status: "closed" }],
        budget: 1000,
        year: 2025,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(simpleState));
      console.log("Save test: PASS");
    } catch (e) {
      console.log("Save test: FAIL -", e);
    }

    alert("Check console for detailed localStorage test results");
  };

  const handleManualSave = () => {
    console.log("=== Manual Save Test ===");
    try {
      const simpleState = {
        gameFields: [{ name: "Test Field", status: "closed" }],
        budget: 1000,
        year: 2025,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(simpleState));
      console.log("Manual save: SUCCESS");
      alert("Manual save completed - refresh to test loading");
    } catch (e) {
      console.log("Manual save: FAIL -", e);
      alert("Manual save failed: " + e);
    }
  };

  const handleTestPhaseOut = () => {
    console.log("=== Testing Phase Out ===");
    // Dispatch a test phase out action
    dispatch({ type: "PHASE_OUT_FIELD", payload: "Ekofisk" });
    console.log("Dispatched PHASE_OUT_FIELD action");
  };

  return (
    <div className="game-control-panel">
      <h3>⚙️ Spillinnstillinger</h3>
      <div className="control-buttons">
        <button
          onClick={handleRestart}
          className="control-button restart-button"
        >
          🔄 Start på nytt
        </button>
        <button
          onClick={handleResetTutorial}
          className="control-button tutorial-button"
        >
          📚 Vis tutorial igjen
        </button>
        <button
          onClick={handleClearStorage}
          className="control-button clear-storage-button"
        >
          🗑️ Slett lagret data
        </button>
        <button
          onClick={handleTestStorage}
          className="control-button test-storage-button"
        >
          🧪 Test localStorage
        </button>
        <button
          onClick={handleManualSave}
          className="control-button manual-save-button"
        >
          💾 Manual Save
        </button>
        <button
          onClick={handleTestPhaseOut}
          className="control-button test-phaseout-button"
        >
          🧪 Test Phase Out
        </button>
        <button
          onClick={() => {
            console.log(
              "Toggling multi-select mode. Current:",
              gameState.multiPhaseOutMode,
            );
            dispatch({ type: "TOGGLE_MULTI_SELECT" });
          }}
          className="control-button multi-select-button"
          style={{
            background: gameState.multiPhaseOutMode ? "#22C55E" : "#6B7280",
          }}
        >
          {gameState.multiPhaseOutMode ? "✅" : "📋"} Multi-Select Mode
        </button>
        <button
          onClick={() => {
            console.log("Advancing year. Current year:", gameState.year);
            dispatch({ type: "ADVANCE_YEAR_MANUALLY" });
          }}
          className="control-button advance-year-button"
        >
          ⏰ Gå til neste år ({gameState.year})
        </button>
        <div className="game-info">
          <small>Spillfremgang lagres automatisk</small>
          <small>
            Environment: {typeof window !== "undefined" ? "Browser" : "Server"}
          </small>
          <small>
            localStorage:{" "}
            {typeof window !== "undefined" && window.localStorage
              ? "Available"
              : "Not Available"}
          </small>
        </div>
      </div>
    </div>
  );
};

export default GameControlPanel;
