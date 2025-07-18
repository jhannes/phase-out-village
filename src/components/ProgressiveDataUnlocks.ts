// ProgressiveDataUnlocks.ts

// Logic for unlocking progressive data layers based on game state
// Adjust thresholds and logic as needed for game balance and pacing.

import { DataLayer } from "./ProgressiveDataLayers";
import { GameState } from "../interfaces/GameState";
import { getPhasedOutFieldsCount } from "./game/GameUtils";

// Thresholds for unlocking layers
const INTERMEDIATE_FIELDS = 4; // Number of fields to phase out for intermediate
const ADVANCED_SCORE = 2000; // Minimum score for advanced
const ADVANCED_YEAR = 2035; // Minimum year for advanced
const EXPERT_ACHIEVEMENTS = ["expert-achievement", "legendary-achievement"]; // Both required for expert

/**
 * Returns an array of unlocked data layers based on the current game state.
 *
 * - 'basic' is always unlocked.
 * - 'intermediate' unlocks after 4 fields are phased out.
 * - 'advanced' unlocks after BOTH 2000 score AND year >= 2035.
 * - 'expert' unlocks after earning BOTH 'expert-achievement' AND 'legendary-achievement'.
 *
 * @param gameState The current game state
 * @returns Array of unlocked layer names in order
 */
export function getUnlockedLayers(gameState: GameState): DataLayer[] {
  const unlocked: DataLayer[] = ["basic"];

  // Intermediate: Unlock after 4 fields phased out
  const phasedOutFields = getPhasedOutFieldsCount(gameState);
  if (phasedOutFields >= INTERMEDIATE_FIELDS) {
    unlocked.push("intermediate");
  }

  // Advanced: Unlock after BOTH score and year thresholds
  if (gameState.score >= ADVANCED_SCORE && gameState.year >= ADVANCED_YEAR) {
    unlocked.push("advanced");
  }

  // Expert: Unlock after BOTH required achievements
  if (EXPERT_ACHIEVEMENTS.every((a) => gameState.achievements.includes(a))) {
    unlocked.push("expert");
  }

  return unlocked;
}
