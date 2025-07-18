import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { gameReducer } from "../state/GameReducer";
import { GameState, GameAction } from "../interfaces/GameState";
import { createFreshGameState } from "../utils/gameLogic";
import { LOCAL_STORAGE_KEY } from "../constants";
import { SafeStorage } from "../utils/storage";
import { safeJsonParse, validateGameState } from "../utils/security";
import { logger } from "../utils/logger";

interface GameStateContextType {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Computed values for easy access
  computedStats: {
    totalEmissionsReduced: number;
    totalBudgetSpent: number;
    fieldsPhased: number;
    totalFields: number;
    averageIntensity: number;
    projectedSavings: number;
    completionPercentage: number;
    co2PerBOE: number;
    fieldsRemaining: number;
    selectedFieldsCount: number;
  };
  // Actions
  actions: {
    phaseOutField: (fieldName: string) => void;
    selectField: (fieldName: string) => void;
    deselectField: (fieldName: string) => void;
    multiPhaseOut: (fieldNames: string[]) => void;
    resetGame: () => void;
    updateBudget: (amount: number) => void;
  };
}

const GameStateContext = createContext<GameStateContextType | undefined>(
  undefined,
);

interface GameStateProviderProps {
  children: ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({
  children,
}) => {
  logger.debug("GameStateProvider initializing");

  const [gameState, dispatch] = useReducer(gameReducer, createFreshGameState());
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const hasLoadedRef = useRef(false);

  // Debug: Check field status after state creation
  React.useEffect(() => {
    logger.debug("GameStateProvider useEffect triggered");
    const johanCastberg = gameState.gameFields.find(
      (f) => f.name === "Johan Castberg",
    );
    const njord = gameState.gameFields.find((f) => f.name === "Njord");
    const ormenLange = gameState.gameFields.find(
      (f) => f.name === "Ormen Lange",
    );

    logger.debug("Field status in GameStateProvider:", {
      johanCastberg: {
        status: johanCastberg?.status,
        production: johanCastberg?.production,
      },
      njord: { status: njord?.status, production: njord?.production },
      ormenLange: {
        status: ormenLange?.status,
        production: ormenLange?.production,
      },
      totalFields: gameState.gameFields.length,
      activeFields: gameState.gameFields.filter((f) => f.status === "active")
        .length,
      closedFields: gameState.gameFields.filter((f) => f.status === "closed")
        .length,
    });
  }, [gameState.gameFields]);

  // Computed statistics
  const computedStats = React.useMemo(() => {
    const activeFields = gameState.gameFields.filter(
      (field) => field.status === "active",
    );
    const phasedFields = gameState.gameFields.filter(
      (field) => field.status === "closed",
    );

    // Calculate total emissions reduced (from phased out fields)
    const totalEmissionsReduced = phasedFields.reduce((total, field) => {
      return total + (field.emissions?.[0] || 0);
    }, 0); // Already in Mt from field creation

    // Calculate total budget spent
    const totalBudgetSpent = phasedFields.reduce((total, field) => {
      return total + (field.phaseOutCost || 0);
    }, 0);

    // Calculate average intensity of remaining fields
    const averageIntensity =
      activeFields.length > 0
        ? activeFields.reduce(
            (total, field) => total + (field.intensity || 0),
            0,
          ) / activeFields.length
        : 0;

    // Projected carbon savings (rough estimate based on carbon price)
    const carbonPricePerTon = 800; // NOK per ton CO2
    const projectedSavings =
      totalEmissionsReduced * 1000000 * carbonPricePerTon * 20; // 20 years

    // Completion percentage
    const completionPercentage =
      (phasedFields.length / gameState.gameFields.length) * 100;

    return {
      totalEmissionsReduced,
      totalBudgetSpent,
      fieldsPhased: phasedFields.length,
      totalFields: gameState.gameFields.length,
      averageIntensity,
      projectedSavings,
      completionPercentage,
      co2PerBOE: averageIntensity,
      fieldsRemaining: activeFields.length,
      selectedFieldsCount: gameState.selectedFields?.length || 0,
    };
  }, [gameState.gameFields, gameState.selectedFields]);

  // Action creators
  const actions = React.useMemo(
    () => ({
      phaseOutField: (fieldName: string) => {
        dispatch({ type: "PHASE_OUT_FIELD", payload: fieldName });
      },

      selectField: (fieldName: string) => {
        dispatch({ type: "SELECT_FIELD", payload: fieldName });
      },

      deselectField: (fieldName: string) => {
        dispatch({ type: "DESELECT_FIELD", payload: fieldName });
      },

      multiPhaseOut: (fieldNames: string[]) => {
        dispatch({ type: "MULTI_PHASE_OUT", payload: fieldNames });
      },

      resetGame: () => {
        dispatch({ type: "RESTART_GAME" });
      },

      updateBudget: (amount: number) => {
        dispatch({ type: "UPDATE_BUDGET", payload: amount });
      },
    }),
    [],
  );

  // Reactivate: Auto-save to localStorage
  useEffect(() => {
    const saveGameState = () => {
      const success = SafeStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(gameState),
      );
      if (!success) {
        console.warn("Failed to save game state to localStorage");
      }
    };

    const timeoutId = setTimeout(saveGameState, 1000); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [gameState]);

  // Reactivate: Load from localStorage on mount
  useEffect(() => {
    // Only load from localStorage once on mount
    if (hasLoadedRef.current) {
      return;
    }

    // Don't load from localStorage if we're restarting
    if (gameState.isRestarting) {
      logger.debug("Skipping localStorage load due to restart");
      setHasLoadedFromStorage(true);
      hasLoadedRef.current = true;
      return;
    }

    const savedState = SafeStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState && savedState !== "null" && savedState !== "undefined") {
      logger.debug("Found saved state, dispatching LOAD_GAME_STATE");
      // For now, use the original approach without validation to avoid type issues
      const parsedState = safeJsonParse(savedState) as GameState;
      if (parsedState) {
        dispatch({ type: "LOAD_GAME_STATE", payload: parsedState });
      } else {
        logger.warn("Invalid saved state, using fresh state");
      }
    } else {
      logger.debug("No saved state found, using initial fresh state");
    }
    setHasLoadedFromStorage(true);
    hasLoadedRef.current = true;
    // If no saved state, don't dispatch anything - use the initial fresh state
  }, [gameState.isRestarting]);

  // Reset the loaded ref when restarting
  useEffect(() => {
    if (gameState.isRestarting) {
      hasLoadedRef.current = false;
    }
  }, [gameState.isRestarting]);

  // Force fresh start - always use initial state
  useEffect(() => {
    logger.debug("FORCING FRESH START - localStorage loading disabled");
    setHasLoadedFromStorage(true);
    hasLoadedRef.current = true;
  }, []);

  const contextValue: GameStateContextType = {
    gameState,
    dispatch,
    computedStats,
    actions,
  };

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

// Custom hook for using game state
export const useGameState = (): GameStateContextType => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};

// Selector hooks for specific data
export const useGameStats = () => {
  const { computedStats } = useGameState();
  return computedStats;
};

export const useGameActions = () => {
  const { actions } = useGameState();
  return actions;
};

export const useSelectedFields = () => {
  const { gameState } = useGameState();
  return gameState.selectedFields;
};

export const useBudget = () => {
  const { gameState } = useGameState();
  return gameState.budget;
};

export const useFields = () => {
  const { gameState } = useGameState();
  return gameState.gameFields;
};
