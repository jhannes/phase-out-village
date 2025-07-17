import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { gameReducer } from "../state/GameReducer";
import { GameState, GameAction } from "../interfaces/GameState";
import { createFreshGameState } from "../utils/gameLogic";

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
  const [gameState, dispatch] = useReducer(gameReducer, createFreshGameState());

  // Computed statistics
  const computedStats = React.useMemo(() => {
    const activeFields = gameState.gameFields.filter(
      (field) => field.status === "active",
    );
    const phasedFields = gameState.gameFields.filter(
      (field) => field.status === "closed",
    );

    // Calculate total emissions reduced (from phased out fields)
    const totalEmissionsReduced =
      phasedFields.reduce((total, field) => {
        return total + (field.emissions?.[0] || 0);
      }, 0) / 1000000; // Convert to Mt

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

  // Auto-save to localStorage
  useEffect(() => {
    const saveGameState = () => {
      try {
        localStorage.setItem(
          "phaseOutVillage_gameState",
          JSON.stringify(gameState),
        );
      } catch (error) {
        console.warn("Failed to save game state:", error);
      }
    };

    const timeoutId = setTimeout(saveGameState, 1000); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [gameState]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("phaseOutVillage_gameState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: "LOAD_GAME_STATE", payload: parsedState });
      }
    } catch (error) {
      console.warn("Failed to load saved game state:", error);
    }
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
