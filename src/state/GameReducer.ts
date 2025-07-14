import { GameState, GameAction } from "../interfaces/GameState";

// Local utility functions
const calculateYearlyConsequences = (state: GameState) => {
  const yearsPassed = state.year - 2025;
  const timeLeft = 2040 - state.year;

  const activeFields = state.gameFields.filter((f) => f.status === "active");
  const yearlyOilRevenue = activeFields.reduce(
    (sum, f) => sum + f.yearlyRevenue,
    0,
  );

  const urgencyMultiplier = Math.max(1, (15 - timeLeft) / 5);
  const climateCostIncrease =
    Math.pow(state.globalTemperature - 1.1, 2) * 500 * urgencyMultiplier;

  return {
    yearlyOilRevenue,
    climateCostIncrease,
    urgencyMultiplier,
    timeLeft,
  };
};

const getRandomEvent = (state: GameState) => {
  // Simplified random event logic
  return null;
};

const checkAndAwardAchievements = (state: GameState): string[] => {
  // Simplified achievement logic
  return [];
};

const calculatePhaseOutCapacity = (state: GameState): number => {
  // Allow more fields to be phased out per year as the game progresses
  const baseCapacity = 3; // Start with 3 fields per year
  const yearProgress = Math.max(0, state.year - 2025);
  const additionalCapacity = Math.floor(yearProgress / 5); // +1 capacity every 5 years
  const maxCapacity = 8; // Cap at 8 fields per year

  return Math.min(baseCapacity + additionalCapacity, maxCapacity);
};

const LOCAL_STORAGE_KEY = "phaseOutVillageGameState";

// Create a fresh game state locally
const createFreshGameState = (): GameState => {
  return {
    gameFields: [],
    budget: 15000,
    score: 0,
    year: 2025,
    selectedField: null,
    showFieldModal: false,
    achievements: [],
    totalEmissions: 0,
    totalProduction: 0,
    shutdowns: {},
    realData: {},
    currentView: "map",
    investments: {
      green_tech: 0,
      ai_research: 0,
      renewable_energy: 0,
      carbon_capture: 0,
      foreign_cloud: 0,
    },
    globalTemperature: 1.1,
    norwayTechRank: 0,
    foreignDependency: 0,
    climateDamage: 0,
    sustainabilityScore: 100,
    playerChoices: [],
    dataLayerUnlocked: "basic",
    saturationLevel: 100,
    gamePhase: "learning",
    tutorialStep: 0,
    shownFacts: [],
    badChoiceCount: 0,
    goodChoiceStreak: 0,
    selectedFields: [],
    currentEvent: undefined,
    showEventModal: false,
    showAchievementModal: false,
    showGameOverModal: false,
    newAchievements: [],
    nextPhaseOutDiscount: undefined,
    multiPhaseOutMode: false,
    yearlyPhaseOutCapacity: 0,
  };
};

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
        // Don't advance year for single field phase-out - only for batch operations
        year: state.year,
        goodChoiceStreak: state.goodChoiceStreak + 1,
        badChoiceCount: Math.max(0, state.badChoiceCount - 1),
        shutdowns: { ...state.shutdowns, [fieldName]: state.year + 1 },
        showFieldModal: false,
        selectedField: null,
        nextPhaseOutDiscount: undefined,
      };
      const yearlyConsequences = calculateYearlyConsequences(newState);
      if (yearlyConsequences) {
        newState.budget += yearlyConsequences.yearlyOilRevenue;
        newState.budget = Math.max(
          0,
          newState.budget - yearlyConsequences.climateCostIncrease,
        );
        newState.climateDamage += yearlyConsequences.climateCostIncrease;
      }

      const randomEvent = getRandomEvent(newState);
      if (randomEvent) {
        newState.currentEvent = randomEvent;
        newState.showEventModal = true;
      }

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

      const immediateAchievements = checkAndAwardAchievements(newState);
      if (immediateAchievements.length > 0) {
        newState.achievements = [
          ...newState.achievements,
          ...immediateAchievements,
        ];
        newState.newAchievements = immediateAchievements;
        newState.showAchievementModal = true;
      }
      break;
    }

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
        year: state.year + (actualFields.length > 1 ? 1 : 0), // Only advance year for batch operations
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
        yearlyPhaseOutCapacity: 1,
      };

      const yearlyConsequences = calculateYearlyConsequences(newState);
      if (yearlyConsequences) {
        newState.budget += yearlyConsequences.yearlyOilRevenue;
        newState.budget = Math.max(
          0,
          newState.budget - yearlyConsequences.climateCostIncrease,
        );
        newState.climateDamage += yearlyConsequences.climateCostIncrease;
      }

      const randomEvent = getRandomEvent(newState);
      if (randomEvent) {
        newState.currentEvent = randomEvent;
        newState.showEventModal = true;
      }

      const immediateAchievements = checkAndAwardAchievements(newState);
      if (immediateAchievements.length > 0) {
        newState.achievements = [
          ...newState.achievements,
          ...immediateAchievements,
        ];
        newState.newAchievements = immediateAchievements;
        newState.showAchievementModal = true;
      }

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

      return newState;
    }

    case "TOGGLE_MULTI_SELECT":
      newState = {
        ...state,
        multiPhaseOutMode: !state.multiPhaseOutMode,
        selectedFields: [],
        selectedField: null,
        showFieldModal: false,
      };
      break;

    case "SELECT_FIELD_FOR_MULTI":
      if (state.selectedFields.some((f) => f.name === action.payload.name)) {
        return state;
      }
      newState = {
        ...state,
        selectedFields: [...state.selectedFields, action.payload],
      };
      break;

    case "DESELECT_FIELD_FROM_MULTI":
      newState = {
        ...state,
        selectedFields: state.selectedFields.filter(
          (f) => f.name !== action.payload,
        ),
      };
      break;

    case "CLEAR_SELECTED_FIELDS":
      newState = {
        ...state,
        selectedFields: [],
        multiPhaseOutMode: false,
      };
      break;

    case "ADVANCE_YEAR_MANUALLY": {
      const yearlyConsequences = calculateYearlyConsequences(state);

      newState = {
        ...state,
        year: state.year + 1,
        budget:
          state.budget +
          (yearlyConsequences?.yearlyOilRevenue || 0) -
          (yearlyConsequences?.climateCostIncrease || 0),
        climateDamage:
          state.climateDamage + (yearlyConsequences?.climateCostIncrease || 0),
        globalTemperature: Math.min(3.0, state.globalTemperature + 0.02),
        badChoiceCount: state.badChoiceCount + 1,
        goodChoiceStreak: 0,
      };

      const randomEvent = getRandomEvent(newState);
      if (randomEvent) {
        newState.currentEvent = randomEvent;
        newState.showEventModal = true;
      }
      break;
    }

    case "CLOSE_ACHIEVEMENT_MODAL":
      newState = { ...state, showAchievementModal: false };
      break;

    case "CLOSE_EVENT_MODAL":
      newState = { ...state, showEventModal: false };
      break;

    case "CLOSE_GAME_OVER_MODAL":
      newState = { ...state, showGameOverModal: false };
      break;

    case "SET_SELECTED_FIELD":
      newState = { ...state, selectedField: action.payload };
      break;

    case "TOGGLE_FIELD_MODAL":
      newState = { ...state, showFieldModal: action.payload };
      break;

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
      newState = { ...state, totalEmissions, totalProduction };
      break;

    case "SET_VIEW_MODE":
      newState = { ...state, currentView: action.payload };
      break;

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

      const totalGoodInvestments =
        newState.investments.green_tech +
        newState.investments.ai_research +
        newState.investments.renewable_energy;
      const totalBadInvestments = newState.investments.foreign_cloud;

      newState.norwayTechRank = Math.min(
        100,
        Math.max(0, (totalGoodInvestments - totalBadInvestments) / 10),
      );
      break;

    case "ADVANCE_TUTORIAL":
      newState = { ...state, tutorialStep: state.tutorialStep + 1 };
      break;

    case "SKIP_TUTORIAL":
      newState = { ...state, tutorialStep: 10 };
      break;

    default:
      return state;
  }

  if (newState) {
    console.log("Saving state for action:", action.type);
    try {
      const stateToSave = {
        gameFields: newState.gameFields.map((field) => ({
          name: field.name,
          status: field.status,
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
        lastSaved: new Date().toISOString(),
      };

      const serializedState = JSON.stringify(stateToSave);
      localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);

      const closedFieldsCount = stateToSave.gameFields.filter(
        (f) => f.status === "closed",
      ).length;
      console.log(
        `✅ Saved game state - Action: ${action.type}, Closed fields: ${closedFieldsCount}, Shutdowns: ${Object.keys(stateToSave.shutdowns).length}`,
      );

      const verification = localStorage.getItem(LOCAL_STORAGE_KEY);
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
          LOCAL_STORAGE_KEY + "_backup",
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
