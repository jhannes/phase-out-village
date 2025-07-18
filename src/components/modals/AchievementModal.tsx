import React from "react";
import { ACHIEVEMENT_BADGES } from "../../achievements";
import { logger } from "../../utils/logger";

// Try to import badge components, fallback if they don't exist
export let BadgeComponents: Record<string, React.ComponentType> = {};
try {
  const badges = require("../../components/badges/BadgeShowcase");
  BadgeComponents = {
    "Første Skritt": badges.FirstSteps,
    Klimabevisst: badges.ClimateAware,
    "Tech-Pioner": badges.TechPioneer,
    "Grønn Omstilling": badges.GreenTransition,
    "Uavhengighets-Helt": badges.IndependenceHero,
    "Planet-Redder": badges.PlanetSaver,
    "Økonomi-Geni": badges.EconomicGenius,
    Fremtidsbygger: badges.FutureBuilder,
    Klimakatastrofe: badges.ClimateFailure,
    "Tech-Avhengig": badges.TechDependent,
    Kortsiktig: badges.ShortSighted,
  };
} catch (e) {
  logger.debug("Badge components not found, using fallback display");
}

// Enhanced Achievement Modal with your badge images
const AchievementModal: React.FC<{
  achievements: string[];
  onClose: () => void;
}> = ({ achievements, onClose }) => {
  if (achievements.length === 0) return null;

  return (
    <div className="modal achievement-modal">
      <div className="modal-content achievement-modal-content">
        <h2 className="achievement-modal-title">🎉 Gratulerer!</h2>
        <div className="achievement-modal-grid">
          {achievements.map((achievement, index) => {
            const BadgeComponent = BadgeComponents[achievement];
            const badge = Object.values(ACHIEVEMENT_BADGES).find(
              (b) => b.title === achievement,
            );

            return (
              <div key={index} className="achievement-modal-item">
                <div className="achievement-modal-badge">
                  {BadgeComponent ? (
                    <BadgeComponent />
                  ) : (
                    <div className="fallback-emoji">{badge?.emoji}</div>
                  )}
                </div>
                <h3 className="achievement-modal-name">
                  {badge?.title || achievement}
                </h3>
                <p className="achievement-modal-desc">{badge?.desc}</p>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="achievement-modal-close">
          Fantastisk! 🎊
        </button>
      </div>
    </div>
  );
};

export default AchievementModal;
