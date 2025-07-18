// Security utilities for input validation and sanitization

export interface ValidatedGameState {
  gameFields?: Array<{
    name: string;
    status: "active" | "closed" | "transitioning";
    phaseOutCost?: number;
    production?: number;
  }>;
  budget?: number;
  score?: number;
  year?: number;
  achievements?: string[];
  shutdowns?: Record<string, number>;
  investments?: Record<string, number>;
  globalTemperature?: number;
  norwayTechRank?: number;
  foreignDependency?: number;
  climateDamage?: number;
  sustainabilityScore?: number;
  playerChoices?: string[];
  dataLayerUnlocked?: string;
  saturationLevel?: number;
  gamePhase?: string;
  tutorialStep?: number;
  shownFacts?: string[];
  badChoiceCount?: number;
  goodChoiceStreak?: number;
  selectedFields?: Array<{ name: string; status: string }>;
  currentView?: string;
  multiPhaseOutMode?: boolean;
  yearlyPhaseOutCapacity?: number;
  showAchievementModal?: boolean;
  showGameOverModal?: boolean;
  showTutorialModal?: boolean;
  newAchievements?: string[];
}

export function validateGameState(data: unknown): ValidatedGameState | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const obj = data as Record<string, unknown>;

  // Validate and sanitize each field
  const validated: ValidatedGameState = {};

  // Validate numbers
  if (
    typeof obj.budget === "number" &&
    obj.budget >= 0 &&
    obj.budget <= 100000
  ) {
    validated.budget = obj.budget;
  }

  if (typeof obj.score === "number" && obj.score >= 0 && obj.score <= 1000000) {
    validated.score = obj.score;
  }

  if (typeof obj.year === "number" && obj.year >= 2020 && obj.year <= 2050) {
    validated.year = obj.year;
  }

  if (
    typeof obj.globalTemperature === "number" &&
    obj.globalTemperature >= 1.0 &&
    obj.globalTemperature <= 5.0
  ) {
    validated.globalTemperature = obj.globalTemperature;
  }

  // Validate arrays
  if (Array.isArray(obj.achievements)) {
    validated.achievements = obj.achievements.filter(
      (item) => typeof item === "string" && item.length <= 100,
    );
  }

  if (Array.isArray(obj.playerChoices)) {
    validated.playerChoices = obj.playerChoices.filter(
      (item) => typeof item === "string" && item.length <= 200,
    );
  }

  // Validate gameFields array
  if (Array.isArray(obj.gameFields)) {
    validated.gameFields = obj.gameFields
      .filter(
        (field) =>
          field &&
          typeof field === "object" &&
          typeof field.name === "string" &&
          field.name.length <= 50 &&
          ["active", "closed", "transitioning"].includes(field.status),
      )
      .map((field) => ({
        name: field.name,
        status: field.status,
        phaseOutCost:
          typeof field.phaseOutCost === "number"
            ? field.phaseOutCost
            : undefined,
        production:
          typeof field.production === "number" ? field.production : undefined,
      }));
  }

  // Validate objects
  if (obj.shutdowns && typeof obj.shutdowns === "object") {
    const shutdowns: Record<string, number> = {};
    for (const [key, value] of Object.entries(obj.shutdowns)) {
      if (
        typeof key === "string" &&
        key.length <= 50 &&
        typeof value === "number" &&
        value >= 2020 &&
        value <= 2050
      ) {
        shutdowns[key] = value;
      }
    }
    validated.shutdowns = shutdowns;
  }

  if (obj.investments && typeof obj.investments === "object") {
    const investments: Record<string, number> = {};
    for (const [key, value] of Object.entries(obj.investments)) {
      if (
        typeof key === "string" &&
        key.length <= 30 &&
        typeof value === "number" &&
        value >= 0 &&
        value <= 100000
      ) {
        investments[key] = value;
      }
    }
    validated.investments = investments;
  }

  // Validate strings
  if (
    typeof obj.dataLayerUnlocked === "string" &&
    ["basic", "advanced", "expert"].includes(obj.dataLayerUnlocked)
  ) {
    validated.dataLayerUnlocked = obj.dataLayerUnlocked;
  }

  if (
    typeof obj.currentView === "string" &&
    ["map", "stats", "investments"].includes(obj.currentView)
  ) {
    validated.currentView = obj.currentView;
  }

  if (
    typeof obj.gamePhase === "string" &&
    [
      "learning",
      "action",
      "crisis",
      "victory",
      "defeat",
      "partial_success",
    ].includes(obj.gamePhase)
  ) {
    validated.gamePhase = obj.gamePhase;
  }

  // Validate booleans
  if (typeof obj.multiPhaseOutMode === "boolean") {
    validated.multiPhaseOutMode = obj.multiPhaseOutMode;
  }

  if (typeof obj.showAchievementModal === "boolean") {
    validated.showAchievementModal = obj.showAchievementModal;
  }

  if (typeof obj.showGameOverModal === "boolean") {
    validated.showGameOverModal = obj.showGameOverModal;
  }

  if (typeof obj.showTutorialModal === "boolean") {
    validated.showTutorialModal = obj.showTutorialModal;
  }

  return validated;
}

export function safeJsonParse<T>(
  jsonString: string,
  validator?: (data: unknown) => T | null,
): T | null {
  try {
    const parsed = JSON.parse(jsonString);
    return validator ? validator(parsed) : parsed;
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return null;
  }
}

export function sanitizeString(input: string): string {
  // Remove potentially dangerous characters and limit length
  return input
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .substring(0, 1000); // Limit length
}
