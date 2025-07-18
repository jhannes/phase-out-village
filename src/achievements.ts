import { GameState } from "./interfaces/GameState";
import { INITIAL_YEAR } from "./constants";
import { calculateTotalGoodTechInvestment } from "./components/game/GameUtils";
import { logger } from "./utils/logger";

// Enhanced badge system with educational messages
export const ACHIEVEMENT_BADGES = {
  FIRST_STEPS: {
    emoji: "👶",
    title: "Første Skritt",
    desc: "Faset ut ditt første oljefelt",
  },
  CLIMATE_AWARE: {
    emoji: "🌡️",
    title: "Klimabevisst",
    desc: "Holdt temperaturstigningen under 1.5°C",
  },
  TECH_PIONEER: {
    emoji: "🚀",
    title: "Tech-Pioner",
    desc: "Investerte 200+ mrd i norsk teknologi",
  },
  GREEN_TRANSITION: {
    emoji: "🌱",
    title: "Grønn Omstilling",
    desc: "Konverterte 5+ felt til fornybar energi",
  },
  INDEPENDENCE_HERO: {
    emoji: "🇳🇴",
    title: "Uavhengighets-Helt",
    desc: "Nådde 80%+ teknologisk selvstendighet",
  },
  PLANET_SAVER: {
    emoji: "🌍",
    title: "Planet-Redder",
    desc: "Hindret 500+ Mt CO₂ fra å bli brent",
  },
  ECONOMIC_GENIUS: {
    emoji: "💰",
    title: "Økonomi-Geni",
    desc: "Opprettholdt 1000+ mrd i budsjett",
  },
  FUTURE_BUILDER: {
    emoji: "🏗️",
    title: "Fremtidsbygger",
    desc: "Vant spillet med perfekt balanse",
  },
  CLIMATE_FAILURE: {
    emoji: "🔥",
    title: "Klimakatastrofe",
    desc: "Lot temperaturen stige over 2°C",
  },
  TECH_DEPENDENT: {
    emoji: "🔗",
    title: "Tech-Avhengig",
    desc: "Ble for avhengig av utenlandsk teknologi",
  },
  SHORT_SIGHTED: {
    emoji: "💸",
    title: "Kortsiktig",
    desc: "Prioriterte profitt over planet",
  },
};

// Enhanced achievement checking system
export const checkAndAwardAchievements = (state: GameState): string[] => {
  const newAchievements: string[] = [];
  const phasedOutFields = Object.keys(state.shutdowns).length;
  const totalTechInvestment = Object.values(state.investments).reduce(
    (sum, inv) => sum + inv,
    0,
  );
  const totalEmissionsSaved =
    state.gameFields
      .filter((f) => f.status === "closed")
      .reduce((sum, f) => sum + f.totalLifetimeEmissions, 0) / 1000;
  const timeLeft = 2040 - state.year;
  const totalFields = state.gameFields.length;
  const progressPercent = (phasedOutFields / totalFields) * 100;

  logger.debug("Checking achievements:", {
    phasedOutFields,
    totalTechInvestment,
    totalEmissionsSaved,
    currentTemp: state.globalTemperature,
    timeLeft,
    progressPercent,
  });

  // FØRSTE SKRITT - Umiddelbart når du faser ut første felt
  if (phasedOutFields >= 1 && !state.achievements.includes("Første Skritt")) {
    newAchievements.push("Første Skritt");
  }

  // SPEEDRUNNER - Faset ut 10+ felt på under 5 år
  if (
    phasedOutFields >= 10 &&
    state.year - INITIAL_YEAR <= 5 &&
    !state.achievements.includes("Speedrunner")
  ) {
    newAchievements.push("Speedrunner");
  }

  // UNDER PRESS - Faset ut 50%+ av felt med mindre enn 5 år igjen
  if (
    progressPercent >= 50 &&
    timeLeft <= 5 &&
    !state.achievements.includes("Under Press")
  ) {
    newAchievements.push("Under Press");
  }

  // KLIMABEVISST - Holdt temperatur under 1.5°C og faset ut 5+ felt
  if (
    state.globalTemperature <= 1.5 &&
    phasedOutFields >= 5 &&
    !state.achievements.includes("Klimabevisst")
  ) {
    newAchievements.push("Klimabevisst");
  }

  // TECH-PIONER - 200+ milliarder i tech-investeringer (økt krav)
  const totalGoodTechInvestment = calculateTotalGoodTechInvestment(
    state.investments,
  );
  if (
    totalGoodTechInvestment >= 200 &&
    !state.achievements.includes("Tech-Pioner")
  ) {
    newAchievements.push("Tech-Pioner");
  }

  // GRØNN OMSTILLING - 15+ felt faset ut (økt krav)
  if (
    phasedOutFields >= 15 &&
    !state.achievements.includes("Grønn Omstilling")
  ) {
    newAchievements.push("Grønn Omstilling");
  }

  // PERFEKT TIMING - Faset ut alle felt akkurat på 2040
  if (
    phasedOutFields === totalFields &&
    state.year === 2040 &&
    !state.achievements.includes("Perfekt Timing")
  ) {
    newAchievements.push("Perfekt Timing");
  }

  // PLANET-REDDER - 100+ Mt CO₂ hindret (økt krav)
  if (
    totalEmissionsSaved >= 100 &&
    !state.achievements.includes("Planet-Redder")
  ) {
    newAchievements.push("Planet-Redder");
  }

  // NEGATIVE ACHIEVEMENTS - nå strengere
  if (
    state.year >= 2040 &&
    phasedOutFields < totalFields * 0.8 &&
    !state.achievements.includes("For Sent")
  ) {
    newAchievements.push("For Sent");
  }

  if (
    state.globalTemperature > 1.8 &&
    !state.achievements.includes("Klimakatastrofe")
  ) {
    newAchievements.push("Klimakatastrofe");
  }

  return newAchievements;
};
