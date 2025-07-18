import {
  FIELD_COORDINATES,
  INITIAL_BUDGET,
  INITIAL_SCORE,
  INITIAL_YEAR,
  LOCAL_STORAGE_KEY,
} from "../constants";
import { generateCompleteData } from "./projections";
import { data } from "../generated/data";
import { GameState } from "../interfaces/GameState";
import { Field, OilFieldDataset } from "../types/types";
import { logger } from "./logger";

export const createFieldFromRealData = (
  fieldName: string,
  realData: OilFieldDataset,
): Field => {
  logger.debug(`createFieldFromRealData called for: ${fieldName}`);

  const yearlyData = realData[fieldName];
  const latestYear = Math.max(...Object.keys(yearlyData).map(Number));
  const latestData = yearlyData[latestYear.toString()];

  const coordinates = FIELD_COORDINATES[fieldName] || { lon: 5, lat: 62 };

  // Calculate emissions history (last 5 years)
  const emissionsHistory = Object.keys(yearlyData)
    .map(Number)
    .sort((a, b) => b - a)
    .slice(0, 5)
    .map((year) => (yearlyData[year.toString()]?.emission || 0) / 1000); // Convert to Mt

  const currentProduction =
    (latestData?.productionOil || 0) + (latestData?.productionGas || 0);

  // Debug specific fields
  if (
    fieldName === "Johan Castberg" ||
    fieldName === "Njord" ||
    fieldName === "Ormen Lange"
  ) {
    logger.debug(`Creating field ${fieldName}:`, {
      latestYear,
      latestData,
      currentProduction,
      hasProductionData:
        !!latestData?.productionOil || !!latestData?.productionGas,
      hasEmissionData: !!latestData?.emission,
    });
  }

  // Calculate more realistic lifetime emissions based on actual data
  const yearlyEmissionMt = (latestData?.emission || 0) / 1000;
  const estimatedLifetimeYears = 15; // Average field lifetime
  // Use actual emission intensity from data instead of arbitrary multiplier
  const totalLifetimeEmissions = yearlyEmissionMt * estimatedLifetimeYears;

  // Calculate more realistic phase-out cost based on production and field size
  // Base cost on production volume, with minimum cost for smaller fields
  const baseCostPerBoe = 15; // More realistic cost estimate (15 billion per million boe)
  const phaseOutCost = Math.max(
    5,
    Math.floor(currentProduction * baseCostPerBoe),
  );

  // More realistic revenue calculation based on actual oil prices
  // Current oil price ~80 USD/barrel, ~6.3 barrels per boe
  const oilPriceUSD = 80;
  const exchangeRate = 10; // USD to NOK
  const revenuePerBoe = oilPriceUSD * 6.3 * exchangeRate; // NOK per boe
  const yearlyRevenue = Math.floor(currentProduction * revenuePerBoe); // Total yearly revenue in NOK

  // Assign transition potential based on location and field type
  let transitionPotential: "wind" | "solar" | "data_center" | "research_hub" =
    "wind";
  if (coordinates.lat > 70)
    transitionPotential = "wind"; // Northern fields good for wind
  else if (coordinates.lat < 58)
    transitionPotential = "solar"; // Southern fields good for solar
  else if (currentProduction > 5)
    transitionPotential = "data_center"; // Large fields for data centers
  else transitionPotential = "research_hub"; // Smaller fields for research

  return {
    name: fieldName,
    lon: coordinates.lon,
    lat: coordinates.lat,
    emissions: emissionsHistory.length > 0 ? emissionsHistory : [0],
    intensity: latestData?.emissionIntensity || 0,
    status: "active", // Always start as active, let user phase out
    production: currentProduction,
    workers: Math.floor(currentProduction * 50), // More realistic worker estimate
    phaseOutCost,
    productionOil: latestData?.productionOil,
    productionGas: latestData?.productionGas,
    realEmission: latestData?.emission,
    realEmissionIntensity: latestData?.emissionIntensity,
    yearlyRevenue,
    totalLifetimeEmissions,
    transitionPotential,
  };
};

export const loadGameState = (): GameState => {
  // Check if localStorage is available
  if (typeof window === "undefined" || !window.localStorage) {
    console.warn("localStorage not available");
    // Fallback to default state
    const realData = generateCompleteData(data);
    const gameFields = Object.keys(realData).map((fieldName) =>
      createFieldFromRealData(fieldName, realData),
    );

    return {
      gameFields,
      budget: INITIAL_BUDGET,
      score: INITIAL_SCORE,
      year: INITIAL_YEAR,
      selectedField: null,
      showFieldModal: false,
      achievements: [],
      totalEmissions: gameFields.reduce((sum, f) => sum + f.emissions[0], 0),
      totalProduction: gameFields.reduce((sum, f) => sum + f.production, 0),
      shutdowns: {},
      realData,
      currentView: "map",
      investments: {
        green_tech: 0,
        ai_research: 0,
        renewable_energy: 0,
        carbon_capture: 0,
        foreign_cloud: 0,
        hydrogen_tech: 0,
        quantum_computing: 0,
        battery_tech: 0,
        offshore_wind: 0,
        geothermal_energy: 0,
        space_tech: 0,
        fossil_subsidies: 0,
        crypto_mining: 0,
        fast_fashion: 0,
      },
      globalTemperature: 1.1,
      norwayTechRank: 0,
      foreignDependency: 0,
      climateDamage: 0,
      sustainabilityScore: 0,
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
      showTutorialModal: false, // Don't show tutorial if localStorage is not available
      newAchievements: [],
      nextPhaseOutDiscount: undefined,
      multiPhaseOutMode: false,
      yearlyPhaseOutCapacity: 3,
    };
  }

  const realData = generateCompleteData(data);
  const gameFields = Object.keys(realData).map((fieldName) =>
    createFieldFromRealData(fieldName, realData),
  );

  const defaultState: GameState = {
    gameFields,
    budget: INITIAL_BUDGET,
    score: INITIAL_SCORE,
    year: INITIAL_YEAR,
    selectedField: null,
    showFieldModal: false,
    achievements: [],
    totalEmissions: gameFields.reduce((sum, f) => sum + f.emissions[0], 0),
    totalProduction: gameFields.reduce((sum, f) => sum + f.production, 0),
    shutdowns: {},
    realData,
    currentView: "map",
    investments: {
      green_tech: 0,
      ai_research: 0,
      renewable_energy: 0,
      carbon_capture: 0,
      foreign_cloud: 0,
      hydrogen_tech: 0,
      quantum_computing: 0,
      battery_tech: 0,
      offshore_wind: 0,
      geothermal_energy: 0,
      space_tech: 0,
      fossil_subsidies: 0,
      crypto_mining: 0,
      fast_fashion: 0,
    },
    globalTemperature: 1.1,
    norwayTechRank: 0,
    foreignDependency: 0,
    climateDamage: 0,
    sustainabilityScore: 0, // Start at 0 since no fields are phased out initially
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
    showTutorialModal: false, // Will be set to true only for new games
    newAchievements: [],
    nextPhaseOutDiscount: undefined,
    multiPhaseOutMode: false,
    yearlyPhaseOutCapacity: 3, // Base capacity for initial state
  };

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    console.log(
      "Loading game state from localStorage:",
      saved ? "found" : "not found",
    );
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("Parsed saved state:", {
        hasGameFields: !!parsed.gameFields,
        gameFieldsCount: parsed.gameFields?.length,
        hasShutdowns: !!parsed.shutdowns,
        shutdownsCount: Object.keys(parsed.shutdowns || {}).length,
        savedFieldStatuses: parsed.gameFields?.map((f: any) => ({
          name: f.name,
          status: f.status,
        })),
      });

      if (parsed && typeof parsed === "object") {
        // Build field status map from saved data
        const savedFieldStatuses = new Map<
          string,
          "active" | "closed" | "transitioning"
        >();

        // Extract field statuses from saved gameFields array
        if (parsed.gameFields && Array.isArray(parsed.gameFields)) {
          parsed.gameFields.forEach((savedField: any) => {
            if (savedField && savedField.name && savedField.status) {
              const status = savedField.status as
                | "active"
                | "closed"
                | "transitioning";
              if (["active", "closed", "transitioning"].includes(status)) {
                savedFieldStatuses.set(savedField.name, status);
                console.log(
                  `Found saved field: ${savedField.name} = ${status}`,
                );
              }
            }
          });
        }

        // Also extract from shutdowns object (backup method)
        if (parsed.shutdowns && typeof parsed.shutdowns === "object") {
          Object.keys(parsed.shutdowns).forEach((fieldName) => {
            if (!savedFieldStatuses.has(fieldName)) {
              savedFieldStatuses.set(fieldName, "closed");
              console.log(`Found field in shutdowns: ${fieldName} = closed`);
            }
          });
        }

        console.log("Total saved field statuses:", savedFieldStatuses.size);

        // Create merged state with proper field statuses
        const mergedState: GameState = {
          ...defaultState,
          // Restore all saved values
          budget:
            typeof parsed.budget === "number"
              ? parsed.budget
              : defaultState.budget,
          score:
            typeof parsed.score === "number"
              ? parsed.score
              : defaultState.score,
          year:
            typeof parsed.year === "number" ? parsed.year : defaultState.year,
          totalEmissions:
            typeof parsed.totalEmissions === "number"
              ? parsed.totalEmissions
              : defaultState.totalEmissions,
          totalProduction:
            typeof parsed.totalProduction === "number"
              ? parsed.totalProduction
              : defaultState.totalProduction,
          achievements: Array.isArray(parsed.achievements)
            ? parsed.achievements
            : defaultState.achievements,
          shutdowns:
            parsed.shutdowns && typeof parsed.shutdowns === "object"
              ? parsed.shutdowns
              : defaultState.shutdowns,
          investments:
            parsed.investments && typeof parsed.investments === "object"
              ? { ...defaultState.investments, ...parsed.investments }
              : defaultState.investments,
          globalTemperature:
            typeof parsed.globalTemperature === "number"
              ? parsed.globalTemperature
              : defaultState.globalTemperature,
          norwayTechRank:
            typeof parsed.norwayTechRank === "number"
              ? parsed.norwayTechRank
              : defaultState.norwayTechRank,
          foreignDependency:
            typeof parsed.foreignDependency === "number"
              ? parsed.foreignDependency
              : defaultState.foreignDependency,
          climateDamage:
            typeof parsed.climateDamage === "number"
              ? parsed.climateDamage
              : defaultState.climateDamage,
          sustainabilityScore:
            typeof parsed.sustainabilityScore === "number"
              ? parsed.sustainabilityScore
              : defaultState.sustainabilityScore,
          playerChoices: Array.isArray(parsed.playerChoices)
            ? parsed.playerChoices
            : defaultState.playerChoices,
          dataLayerUnlocked:
            parsed.dataLayerUnlocked || defaultState.dataLayerUnlocked,
          saturationLevel:
            typeof parsed.saturationLevel === "number"
              ? parsed.saturationLevel
              : defaultState.saturationLevel,
          gamePhase: parsed.gamePhase || defaultState.gamePhase,
          tutorialStep:
            typeof parsed.tutorialStep === "number"
              ? parsed.tutorialStep
              : defaultState.tutorialStep,
          shownFacts: Array.isArray(parsed.shownFacts)
            ? parsed.shownFacts
            : defaultState.shownFacts,
          badChoiceCount:
            typeof parsed.badChoiceCount === "number"
              ? parsed.badChoiceCount
              : defaultState.badChoiceCount,
          goodChoiceStreak:
            typeof parsed.goodChoiceStreak === "number"
              ? parsed.goodChoiceStreak
              : defaultState.goodChoiceStreak,
          currentView: parsed.currentView || defaultState.currentView,
          multiPhaseOutMode:
            typeof parsed.multiPhaseOutMode === "boolean"
              ? parsed.multiPhaseOutMode
              : defaultState.multiPhaseOutMode,
          yearlyPhaseOutCapacity:
            typeof parsed.yearlyPhaseOutCapacity === "number"
              ? parsed.yearlyPhaseOutCapacity
              : defaultState.yearlyPhaseOutCapacity,

          // Apply saved field statuses to fresh field data
          gameFields: gameFields.map((field) => {
            const savedStatus = savedFieldStatuses.get(field.name);
            if (savedStatus) {
              console.log(
                `Applying saved status to ${field.name}: ${savedStatus}`,
              );
              return { ...field, status: savedStatus };
            }
            return field;
          }),

          // Restore selected fields with proper status
          selectedFields: Array.isArray(parsed.selectedFields)
            ? parsed.selectedFields
                .map((savedField: any) => {
                  const baseField = gameFields.find(
                    (f) => f.name === savedField.name,
                  );
                  if (baseField) {
                    const savedStatus =
                      savedFieldStatuses.get(savedField.name) ||
                      savedField.status;
                    return { ...baseField, status: savedStatus };
                  }
                  return null;
                })
                .filter(Boolean)
            : defaultState.selectedFields,
          showAchievementModal:
            typeof parsed.showAchievementModal === "boolean"
              ? parsed.showAchievementModal
              : defaultState.showAchievementModal,
          showGameOverModal:
            typeof parsed.showGameOverModal === "boolean"
              ? parsed.showGameOverModal
              : defaultState.showGameOverModal,
          showTutorialModal:
            typeof parsed.showTutorialModal === "boolean"
              ? parsed.showTutorialModal
              : parsed.tutorialStep && parsed.tutorialStep >= 10
                ? false // Don't show if tutorial is completed
                : defaultState.showTutorialModal,
          newAchievements: Array.isArray(parsed.newAchievements)
            ? parsed.newAchievements
            : defaultState.newAchievements,
        };

        console.log("Final merged state:", {
          totalFields: mergedState.gameFields.length,
          closedFields: mergedState.gameFields.filter(
            (f: Field) => f.status === "closed",
          ).length,
          activeFields: mergedState.gameFields.filter(
            (f: Field) => f.status === "active",
          ).length,
          shutdownsCount: Object.keys(mergedState.shutdowns).length,
          year: mergedState.year,
          budget: mergedState.budget,
          achievements: mergedState.achievements.length,
        });

        return mergedState;
      }
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
    // If there's any error loading the saved state, clear it and start fresh
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  console.log("Using default state - new game, no tutorial");
  return {
    ...defaultState,
    showTutorialModal: false, // Don't show tutorial for new games by default
  };
};

// Game restart utility
export const createFreshGameState = (): GameState => {
  console.log("🔍 DEBUG - createFreshGameState called");

  const realData = generateCompleteData(data);
  const gameFields = Object.keys(realData).map((fieldName) =>
    createFieldFromRealData(fieldName, realData),
  );

  // Debug: Check specific fields
  const johanCastberg = gameFields.find((f) => f.name === "Johan Castberg");
  const njord = gameFields.find((f) => f.name === "Njord");
  const ormenLange = gameFields.find((f) => f.name === "Ormen Lange");

  console.log("🔍 DEBUG - Field status in createFreshGameState:");
  console.log(
    "Johan Castberg:",
    johanCastberg?.status,
    johanCastberg?.production,
  );
  console.log("Njord:", njord?.status, njord?.production);
  console.log("Ormen Lange:", ormenLange?.status, ormenLange?.production);
  console.log("Total fields:", gameFields.length);
  console.log(
    "Active fields:",
    gameFields.filter((f) => f.status === "active").length,
  );
  console.log(
    "Closed fields:",
    gameFields.filter((f) => f.status === "closed").length,
  );

  return {
    gameFields,
    budget: INITIAL_BUDGET,
    score: INITIAL_SCORE,
    year: INITIAL_YEAR,
    selectedField: null,
    showFieldModal: false,
    achievements: [],
    totalEmissions: gameFields.reduce((sum, f) => sum + f.emissions[0], 0),
    totalProduction: gameFields.reduce((sum, f) => sum + f.production, 0),
    shutdowns: {},
    realData,
    currentView: "map",
    investments: {
      green_tech: 0,
      ai_research: 0,
      renewable_energy: 0,
      carbon_capture: 0,
      foreign_cloud: 0,
      hydrogen_tech: 0,
      quantum_computing: 0,
      battery_tech: 0,
      offshore_wind: 0,
      geothermal_energy: 0,
      space_tech: 0,
      fossil_subsidies: 0,
      crypto_mining: 0,
      fast_fashion: 0,
    },
    globalTemperature: 1.1,
    norwayTechRank: 0,
    foreignDependency: 0,
    climateDamage: 0,
    sustainabilityScore: 0, // Start at 0 since no fields are phased out initially
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
    showTutorialModal: false, // Don't show tutorial by default on page load
    newAchievements: [],
    nextPhaseOutDiscount: undefined,
    multiPhaseOutMode: false,
    yearlyPhaseOutCapacity: 3, // Base capacity for initial state
    isRestarting: false, // Not restarting by default
  };
};

export const getColorForIntensity = (
  intensity: number,
  status: Field["status"],
): string => {
  if (status === "closed") return "#10B981";
  if (status === "transitioning") return "#F59E0B";
  if (intensity > 15) return "#EF4444";
  if (intensity > 8) return "#F97316";
  if (intensity > 3) return "#EAB308";
  return "#22C55E";
};

// Add time pressure and economic constraints
export const calculateYearlyConsequences = (state: GameState) => {
  const yearsPassed = state.year - INITIAL_YEAR;
  const timeLeft = 2040 - state.year;

  // Yearly oil revenue (temptation to keep fields open)
  const activeFields = state.gameFields.filter((f) => f.status === "active");
  const yearlyOilRevenue = activeFields.reduce(
    (sum, f) => sum + f.yearlyRevenue,
    0,
  );

  // Pressure increases as we approach 2040
  const urgencyMultiplier = Math.max(1, timeLeft > 0 ? (15 - timeLeft) / 5 : 3);

  // Climate damage costs increase exponentially
  const climateCostIncrease =
    Math.pow(state.globalTemperature - 1.1, 2) * 500 * urgencyMultiplier;

  // International pressure (Norway must lead by example)
  const internationalPressure = timeLeft < 10 ? (10 - timeLeft) * 100 : 0;

  return {
    yearlyOilRevenue,
    climateCostIncrease,
    internationalPressure,
    urgencyMultiplier,
    timeLeft,
  };
};

// Add random events and challenges
export const getRandomEvent = (state: GameState) => {
  const events = [
    {
      id: "oil_price_spike",
      condition: () => Math.random() < 0.3,
      title: "🛢️ Oljepris-sjokk!",
      description:
        "Oljeprisen har steget dramatisk! Regjeringen presser på for å holde felt åpne.",
      effect: "Får 2000 mrd ekstra, men mister 20 klimapoeng",
      action: (state: GameState) => ({
        ...state,
        budget: state.budget + 2000,
        score: Math.max(0, state.score - 20),
        badChoiceCount: state.badChoiceCount + 1,
      }),
    },
    {
      id: "climate_protests",
      condition: () => state.globalTemperature > 1.3 && Math.random() < 0.4,
      title: "🌍 Klimaprotester!",
      description:
        "Ungdom demonstrerer! Du må fase ut 2 felt GRATIS eller miste legitimitet.",
      effect: "Velg 2 felt å fase ut gratis, eller mist 1000 mrd i støtte",
      action: (state: GameState) => state, // Handle in modal
    },
    {
      id: "tech_breakthrough",
      condition: () => state.norwayTechRank > 50 && Math.random() < 0.25,
      title: "🚀 Teknologisk gjennombrudd!",
      description: "Norsk forskning lykkes! Får rabatt på neste utfasing.",
      effect: "50% rabatt på neste felt du faser ut",
      action: (state: GameState) => ({
        ...state,
        // Add a temporary discount flag
        nextPhaseOutDiscount: 0.5,
      }),
    },
  ];

  return events.find((event) => event.condition());
};
