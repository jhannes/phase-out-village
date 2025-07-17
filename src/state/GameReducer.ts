import { GameState, GameAction } from "../interfaces/GameState";
import {
  createFreshGameState,
  calculateYearlyConsequences,
  getRandomEvent,
} from "../utils/gameLogic";
import { checkAndAwardAchievements } from "../achievements";
import { calculatePhaseOutCapacity } from "../components/game/GameUtils";

export const gameReducer = (
  state: GameState,
  action: GameAction,
): GameState => {
  let newState: GameState;

  // Handle actions that should not trigger localStorage saves
  if (action.type === "RESTART_GAME") {
    return createFreshGameState();
  }

  if (action.type === "LOAD_GAME_STATE") {
    return { ...state, ...action.payload };
  }

  // Process all other actions
  switch (action.type) {
    case "RESET_TUTORIAL":
      newState = { ...state, tutorialStep: 0 };
      break;

    case "PHASE_OUT_FIELD": {
      const fieldName = action.payload;
      const field = state.gameFields.find((f) => f.name === fieldName);

      if (
        !field ||
        field.status === "closed" ||
        state.budget < field.phaseOutCost
      ) {
        return state;
      }

      // Apply discount if available
      const actualCost = state.nextPhaseOutDiscount
        ? field.phaseOutCost * (1 - state.nextPhaseOutDiscount)
        : field.phaseOutCost;

      newState = {
        ...state,
        budget: state.budget - actualCost,
        score: state.score + Math.floor(field.totalLifetimeEmissions / 1000),
        globalTemperature: Math.max(
          1.1,
          state.globalTemperature - field.emissions[0] * 0.001,
        ),
        gameFields: state.gameFields.map((f) =>
          f.name === fieldName
            ? { ...f, status: "closed" as const, production: 0 }
            : f,
        ),
        playerChoices: [
          ...state.playerChoices,
          `Faset ut ${fieldName} - Hindret ${(field.totalLifetimeEmissions / 1000).toFixed(0)} Mt CO2`,
        ],
        year: state.year + 1, // Each phase-out takes 1 year
        goodChoiceStreak: state.goodChoiceStreak + 1,
        badChoiceCount: Math.max(0, state.badChoiceCount - 1),
        shutdowns: { ...state.shutdowns, [fieldName]: state.year + 1 },
        showFieldModal: false,
        selectedField: null,
        nextPhaseOutDiscount: undefined, // Remove discount after use
      };

      // Apply yearly consequences
      const yearlyConsequences = calculateYearlyConsequences(newState);

      // Add oil revenue temptation
      newState.budget += yearlyConsequences.yearlyOilRevenue;

      // Apply climate costs
      newState.budget = Math.max(
        0,
        newState.budget - yearlyConsequences.climateCostIncrease,
      );
      newState.climateDamage += yearlyConsequences.climateCostIncrease;

      // Check for random events
      const randomEvent = getRandomEvent(newState);
      if (randomEvent) {
        newState.currentEvent = randomEvent;
        newState.showEventModal = true;
      }

      // Check for game over conditions
      if (newState.year >= 2040) {
        const totalFields = newState.gameFields.length;
        const phasedOutCount = Object.keys(newState.shutdowns).length;
        const successRate = phasedOutCount / totalFields;

        if (successRate >= 0.8) {
          newState.gamePhase = "victory";
          newState.showGameOverModal = true;
        } else if (successRate >= 0.5) {
          newState.gamePhase = "partial_success";
          newState.showGameOverModal = true;
        } else {
          newState.gamePhase = "defeat";
          newState.showGameOverModal = true;
        }
      }

      // Immediately check for achievements after phase out
      const immediateAchievements = checkAndAwardAchievements(newState);
      if (immediateAchievements.length > 0) {
        newState.achievements = [
          ...newState.achievements,
          ...immediateAchievements,
        ];
        newState.newAchievements = immediateAchievements; // Show modal
        newState.showAchievementModal = true;
      }

      // Update emissions and production statistics
      const activeFields = newState.gameFields.filter(
        (f) => f.status === "active",
      );
      newState.totalEmissions = activeFields.reduce(
        (sum, f) => sum + f.emissions[0],
        0,
      );
      newState.totalProduction = activeFields.reduce(
        (sum, f) => sum + f.production,
        0,
      );

      // Update climate metrics
      const phasedFields = newState.gameFields.filter(
        (f) => f.status === "closed",
      );
      const totalFields = newState.gameFields.length;
      const phasedPercentage = (phasedFields.length / totalFields) * 100;
      newState.sustainabilityScore = Math.min(
        100,
        Math.max(0, phasedPercentage),
      );

      break;
    }

    // Enhanced phase out system - can handle multiple fields per year
    // TODO: Add multi-select capability to field selection UI
    // TODO: Track selected fields in game state (e.g., selectedFields: number[])
    // TODO: Enable "Phase Out" button only when one or more fields are selected
    // TODO: Update phase-out logic to handle multiple fields at once
    // TODO: Show feedback/animation for multi-field phase-out
    // TODO: Reset selection after phase-out
    case "PHASE_OUT_SELECTED_FIELDS": {
      const fieldsToPhaseOut = state.selectedFields.filter(
        (field) =>
          field.status === "active" && state.budget >= field.phaseOutCost,
      );

      const capacity = calculatePhaseOutCapacity(state);
      const actualFields = fieldsToPhaseOut.slice(0, capacity);

      if (actualFields.length === 0) return state;

      const totalCost = actualFields.reduce((sum, field) => {
        const actualCost = state.nextPhaseOutDiscount
          ? field.phaseOutCost * (1 - state.nextPhaseOutDiscount)
          : field.phaseOutCost;
        return sum + actualCost;
      }, 0);

      if (state.budget < totalCost) {
        // Show warning - not enough budget
        return {
          ...state,
          showBudgetWarning: true,
          budgetWarningMessage: `Du mangler ${Math.round(totalCost - state.budget)} mrd NOK for å fase ut ${actualFields.length} felt.`,
        };
      }

      const totalEmissionsSaved = actualFields.reduce(
        (sum, field) => sum + field.totalLifetimeEmissions,
        0,
      );
      const totalEmissionsReduction = actualFields.reduce(
        (sum, field) => sum + field.emissions[0],
        0,
      );

      newState = {
        ...state,
        budget: state.budget - totalCost,
        score: state.score + Math.floor(totalEmissionsSaved / 1000),
        globalTemperature: Math.max(
          1.1,
          state.globalTemperature - totalEmissionsReduction * 0.001,
        ),
        gameFields: state.gameFields.map((field) => {
          const isBeingPhasedOut = actualFields.some(
            (f) => f.name === field.name,
          );
          return isBeingPhasedOut
            ? { ...field, status: "closed" as const, production: 0 }
            : field;
        }),
        playerChoices: [
          ...state.playerChoices,
          `År ${state.year + 1}: Faset ut ${actualFields.length} felt - Hindret ${Math.round(totalEmissionsSaved / 1000)} Mt CO2`,
        ],
        year: state.year + 1,
        goodChoiceStreak: state.goodChoiceStreak + actualFields.length,
        badChoiceCount: Math.max(
          0,
          state.badChoiceCount - Math.floor(actualFields.length / 2),
        ),
        shutdowns: {
          ...state.shutdowns,
          ...actualFields.reduce(
            (acc, field) => ({ ...acc, [field.name]: state.year + 1 }),
            {},
          ),
        },
        selectedFields: [],
        multiPhaseOutMode: false,
        nextPhaseOutDiscount: undefined,
        yearlyPhaseOutCapacity: 1, // Set to a default value or calculate inline if needed
      };

      // Apply yearly consequences
      const yearlyConsequences = calculateYearlyConsequences(newState);
      newState.budget += yearlyConsequences.yearlyOilRevenue;
      newState.budget = Math.max(
        0,
        newState.budget - yearlyConsequences.climateCostIncrease,
      );
      newState.climateDamage += yearlyConsequences.climateCostIncrease;

      // Check for random events
      const randomEvent = getRandomEvent(newState);
      if (randomEvent) {
        newState.currentEvent = randomEvent;
        newState.showEventModal = true;
      }

      // Check achievements
      const immediateAchievements = checkAndAwardAchievements(newState);
      if (immediateAchievements.length > 0) {
        newState.achievements = [
          ...newState.achievements,
          ...immediateAchievements,
        ];
        newState.newAchievements = immediateAchievements;
        newState.showAchievementModal = true;
      }

      // Check for game over
      if (newState.year >= 2040) {
        const totalFields = newState.gameFields.length;
        const phasedOutCount = Object.keys(newState.shutdowns).length;
        const successRate = phasedOutCount / totalFields;

        if (successRate >= 0.8) {
          newState.gamePhase = "victory";
        } else if (successRate >= 0.5) {
          newState.gamePhase = "partial_success";
        } else {
          newState.gamePhase = "defeat";
        }
        newState.showGameOverModal = true;
      }

      // Update emissions and production statistics
      const activeFields = newState.gameFields.filter(
        (f) => f.status === "active",
      );
      newState.totalEmissions = activeFields.reduce(
        (sum, f) => sum + f.emissions[0],
        0,
      );
      newState.totalProduction = activeFields.reduce(
        (sum, f) => sum + f.production,
        0,
      );

      // Update climate metrics
      const phasedFields = newState.gameFields.filter(
        (f) => f.status === "closed",
      );
      const totalFields = newState.gameFields.length;
      const phasedPercentage = (phasedFields.length / totalFields) * 100;
      newState.sustainabilityScore = Math.min(
        100,
        Math.max(0, phasedPercentage),
      );

      return newState;
    }

    case "TOGGLE_MULTI_SELECT":
      return {
        ...state,
        multiPhaseOutMode: !state.multiPhaseOutMode,
        selectedFields: [],
        selectedField: null,
        showFieldModal: false,
      };

    case "SELECT_FIELD_FOR_MULTI":
      if (state.selectedFields.some((f) => f.name === action.payload.name)) {
        return state; // Already selected
      }
      return {
        ...state,
        selectedFields: [...state.selectedFields, action.payload],
      };

    case "DESELECT_FIELD_FROM_MULTI":
      return {
        ...state,
        selectedFields: state.selectedFields.filter(
          (f) => f.name !== action.payload,
        ),
      };

    case "CLEAR_SELECTED_FIELDS":
      return {
        ...state,
        selectedFields: [],
        multiPhaseOutMode: false,
      };

    case "ADVANCE_YEAR_MANUALLY": {
      // Allow players to skip a year if they want
      const yearlyConsequences = calculateYearlyConsequences(state);

      newState = {
        ...state,
        year: state.year + 1,
        budget:
          state.budget +
          yearlyConsequences.yearlyOilRevenue -
          yearlyConsequences.climateCostIncrease,
        climateDamage:
          state.climateDamage + yearlyConsequences.climateCostIncrease,
        globalTemperature: Math.min(3.0, state.globalTemperature + 0.02), // Slight temperature increase for inaction
        badChoiceCount: state.badChoiceCount + 1,
        goodChoiceStreak: 0,
      };

      // Random event chance
      const randomEvent = getRandomEvent(newState);
      if (randomEvent) {
        newState.currentEvent = randomEvent;
        newState.showEventModal = true;
      }

      return newState;
    }

    case "CLOSE_ACHIEVEMENT_MODAL":
      return { ...state, showAchievementModal: false };

    case "CLOSE_EVENT_MODAL":
      return { ...state, showEventModal: false };

    case "CLOSE_GAME_OVER_MODAL":
      return { ...state, showGameOverModal: false };

    case "SET_SELECTED_FIELD":
      return { ...state, selectedField: action.payload };

    case "TOGGLE_FIELD_MODAL":
      return { ...state, showFieldModal: action.payload };

    case "UPDATE_EMISSIONS_PRODUCTION":
      const activeFields = state.gameFields.filter(
        (f) => f.status === "active",
      );
      const totalEmissions = activeFields.reduce(
        (sum, f) => sum + f.emissions[0],
        0,
      );
      const totalProduction = activeFields.reduce(
        (sum, f) => sum + f.production,
        0,
      );
      return { ...state, totalEmissions, totalProduction };

    case "UPDATE_CLIMATE_METRICS": {
      const activeFields = state.gameFields.filter(
        (f) => f.status === "active",
      );
      const phasedFields = state.gameFields.filter(
        (f) => f.status === "closed",
      );

      // Calculate sustainability score based on phased out fields
      const totalFields = state.gameFields.length;
      const phasedPercentage = (phasedFields.length / totalFields) * 100;
      const sustainabilityScore = Math.min(100, Math.max(0, phasedPercentage));

      // Calculate climate damage based on remaining emissions
      const totalEmissions = activeFields.reduce(
        (sum, f) => sum + f.emissions[0],
        0,
      );
      const climateDamage = Math.max(
        0,
        state.climateDamage + totalEmissions / 1000000,
      );

      return {
        ...state,
        sustainabilityScore,
        climateDamage,
        totalEmissions,
      };
    }

    case "SET_VIEW_MODE":
      return { ...state, currentView: action.payload };

    case "MAKE_INVESTMENT":
      const { type: investmentType, amount } = action.payload;
      if (state.budget < amount) return state;

      newState = {
        ...state,
        budget: state.budget - amount,
        investments: {
          ...state.investments,
          [investmentType]: state.investments[investmentType] + amount,
        },
        norwayTechRank: Math.min(
          100,
          Math.max(
            0,
            (state.investments.green_tech +
              state.investments.ai_research +
              state.investments.renewable_energy +
              (investmentType === "green_tech" ? amount : 0) +
              (investmentType === "ai_research" ? amount : 0) +
              (investmentType === "renewable_energy" ? amount : 0) -
              state.investments.foreign_cloud -
              (investmentType === "foreign_cloud" ? amount : 0)) /
              10,
          ),
        ),
      };

      // Update tech rank based on investments
      const totalGoodInvestments =
        newState.investments.green_tech +
        newState.investments.ai_research +
        newState.investments.renewable_energy;
      const totalBadInvestments = newState.investments.foreign_cloud;

      newState.norwayTechRank = Math.min(
        100,
        Math.max(0, (totalGoodInvestments - totalBadInvestments) / 10),
      );

      return newState;

    case "ADVANCE_TUTORIAL":
      return { ...state, tutorialStep: state.tutorialStep + 1 };

    case "SKIP_TUTORIAL":
      return { ...state, tutorialStep: 10 }; // Skip all tutorial steps

    default:
      return state;
  }
  // Save to localStorage - improved saving logic
  if (newState) {
    console.log("Saving state for action:", action.type);
    try {
      // Create a complete state object for saving that preserves field statuses
      const stateToSave = {
        // Save complete field data with status
        gameFields: newState.gameFields.map((field) => ({
          name: field.name,
          status: field.status,
          // Include other essential field properties that might have changed
          phaseOutCost: field.phaseOutCost,
          production: field.production,
        })),
        budget: newState.budget,
        score: newState.score,
        year: newState.year,
        achievements: newState.achievements,
        shutdowns: newState.shutdowns,
        investments: newState.investments,
        globalTemperature: newState.globalTemperature,
        norwayTechRank: newState.norwayTechRank,
        foreignDependency: newState.foreignDependency,
        climateDamage: newState.climateDamage,
        sustainabilityScore: newState.sustainabilityScore,
        playerChoices: newState.playerChoices,
        dataLayerUnlocked: newState.dataLayerUnlocked,
        saturationLevel: newState.saturationLevel,
        gamePhase: newState.gamePhase,
        tutorialStep: newState.tutorialStep,
        shownFacts: newState.shownFacts,
        badChoiceCount: newState.badChoiceCount,
        goodChoiceStreak: newState.goodChoiceStreak,
        selectedFields: newState.selectedFields.map((field) => ({
          name: field.name,
          status: field.status,
        })),
        currentView: newState.currentView,
        multiPhaseOutMode: newState.multiPhaseOutMode,
        yearlyPhaseOutCapacity: newState.yearlyPhaseOutCapacity,
        // Include timestamp for debugging
        lastSaved: new Date().toISOString(),
      };

      const serializedState = JSON.stringify(stateToSave);
      localStorage.setItem("phaseOutVillageGameState", serializedState);

      const closedFieldsCount = stateToSave.gameFields.filter(
        (f) => f.status === "closed",
      ).length;
      console.log(
        `✅ Saved game state - Action: ${action.type}, Closed fields: ${closedFieldsCount}, Shutdowns: ${Object.keys(stateToSave.shutdowns).length}`,
      );

      // Verify the save worked by reading it back
      const verification = localStorage.getItem("phaseOutVillageGameState");
      if (verification) {
        const parsed = JSON.parse(verification);
        const verifyClosedFields =
          parsed.gameFields?.filter((f: any) => f.status === "closed")
            ?.length || 0;
        console.log(
          `✅ Verification: ${verifyClosedFields} closed fields saved correctly`,
        );
      }
    } catch (error) {
      console.error("❌ Failed to save game state:", error);

      // Try a simpler save as fallback
      try {
        const simplifiedState = {
          gameFields: newState.gameFields.map((f) => ({
            name: f.name,
            status: f.status,
          })),
          shutdowns: newState.shutdowns,
          budget: newState.budget,
          score: newState.score,
          year: newState.year,
          achievements: newState.achievements,
        };
        localStorage.setItem(
          "phaseOutVillageGameState" + "_backup",
          JSON.stringify(simplifiedState),
        );
        console.log("✅ Fallback save completed");
      } catch (fallbackError) {
        console.error("❌ Even fallback save failed:", fallbackError);
      }
    }

    return newState;
  }

  return state;
};
