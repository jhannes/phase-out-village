import { GameState } from "./interfaces/GameState";

export const achievementRules: {
  name: string;
  condition: (state: GameState) => boolean;
}[] = [
  {
    name: "Første Skritt",
    condition: (state) => Object.keys(state.shutdowns).length >= 1,
  },
  {
    name: "Speedrunner",
    condition: (state) =>
      Object.keys(state.shutdowns).length >= 10 && state.year - 2025 <= 5,
  },
  {
    name: "Under Press",
    condition: (state) => {
      const phasedOutFields = Object.keys(state.shutdowns).length;
      const totalFields = state.gameFields.length;
      const progressPercent = (phasedOutFields / totalFields) * 100;
      const timeLeft = 2040 - state.year;
      return progressPercent >= 50 && timeLeft <= 5;
    },
  },
  {
    name: "Klimabevisst",
    condition: (state) =>
      state.globalTemperature <= 1.2 &&
      Object.keys(state.shutdowns).length >= 5,
  },
  {
    name: "Tech-Pioner",
    condition: (state) => state.norwayTechRank >= 100,
  },
  {
    name: "Grønn Omstilling",
    condition: (state) => Object.keys(state.shutdowns).length >= 15,
  },
  {
    name: "Perfekt Timing",
    condition: (state) => {
      const phasedOutFields = Object.keys(state.shutdowns).length;
      const totalFields = state.gameFields.length;
      return phasedOutFields === totalFields && state.year === 2040;
    },
  },
  {
    name: "Planet-Redder",
    condition: (state) => {
      const totalEmissionsSaved =
        state.gameFields
          .filter((f) => f.status === "closed")
          .reduce((sum, f) => sum + f.totalLifetimeEmissions, 0) / 1000;
      return totalEmissionsSaved >= 100;
    },
  },
  {
    name: "For Sent",
    condition: (state) => {
      const phasedOutFields = Object.keys(state.shutdowns).length;
      const totalFields = state.gameFields.length;
      return state.year >= 2040 && phasedOutFields < totalFields * 0.8;
    },
  },
  {
    name: "Klimakatastrofe",
    condition: (state) => state.globalTemperature > 1.8,
  },
];

export const checkAndAwardAchievements = (state: GameState): string[] => {
  return achievementRules
    .filter(
      (rule) =>
        !state.achievements.includes(rule.name) && rule.condition(state),
    )
    .map((rule) => rule.name);
};
