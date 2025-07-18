import React from "react";
import "./TutorialModal.css";

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  icon: string;
  highlight?: string;
}

const TutorialModal: React.FC<{
  isOpen: boolean;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
}> = ({ isOpen, currentStep, onNext, onPrevious, onSkip, onClose }) => {
  const tutorialSteps: TutorialStep[] = [
    {
      id: 0,
      title: "Velkommen til Phase Out Village! 🌍",
      content:
        "Du skal hjelpe Norge med å fase ut olje og bygge en bærekraftig fremtid. Du har 15.000 milliarder NOK (Oljefondet) til disposisjon. Mål: Fase ut 80% av feltene før 2040!",
      icon: "🌍",
    },
    {
      id: 1,
      title: "Forstå tallene 📊",
      content:
        "BOE = Barrel Oil Equivalent (fat oljeekvivalent). Mt = Millioner tonn CO₂. mrd = milliarder NOK. Disse enhetene hjelper deg å måle produksjon, utslipp og kostnader.",
      icon: "📊",
    },
    {
      id: 2,
      title: "Se oljefeltene 🛢️",
      content:
        "Røde felt har høy utslippsintensitet (kg CO₂ per BOE). Grønne er 'renere'. Men husk: 98% av utslippene kommer fra FORBRENNING av oljen senere!",
      icon: "🛢️",
    },
    {
      id: 3,
      title: "Klikk for å fase ut 🌱",
      content:
        "Hver gang du faser ut et felt, hindrer du LIVSTID med CO₂-utslipp fra forbrenning! Kostnaden er i milliarder NOK, men klimagevinsten er enorm.",
      icon: "🌱",
    },
    {
      id: 4,
      title: "Multi-Select Mode 📋",
      content:
        "Aktiver Multi-Select Mode for å fase ut flere felt samtidig! Dette er nøkkelen til å nå målet - du kan fase ut opptil 8 felt per år senere i spillet.",
      icon: "📋",
    },
    {
      id: 5,
      title: "Invester i fremtiden 🚀",
      content:
        "Bruk pengene på norsk teknologi og grønn omstilling, ikke utenlandske sky-tjenester som øker avhengighet! Investeringer øker din kapasitet til å fase ut felt.",
      icon: "🚀",
    },
    {
      id: 6,
      title: "Følg med på konsekvensene 🌡️",
      content:
        "Temperaturen måles i grader over førindustriell tid. Over 1.5°C er farlig, over 2°C er katastrofalt. Dårlige valg fører til visuell 'fade out'.",
      icon: "🌡️",
    },
    {
      id: 7,
      title: "Gå til neste år ⏰",
      content:
        "Bruk 'Gå til neste år' knappen for å simulere tid som går. Dette gir deg mer oljeinntekter, men også økte klimakostnader. Strategisk timing er viktig!",
      icon: "⏰",
    },
    {
      id: 8,
      title: "Fakta om Norge 🇳🇴",
      content:
        "Norge er verdens 7. største oljeprodusent. Vi har Oljefondet på 15.000 mrd NOK - verdens største suverene fond. Men vi må lede omstillingen!",
      icon: "🇳🇴",
    },
    {
      id: 9,
      title: "Klimamålene 🎯",
      content:
        "Paris-avtalen sier maks 1.5°C oppvarming. Vi er allerede på 1.1°C. Hver grad over 1.5°C øker klimakatastrofer dramatisk. Norge må vise vei!",
      icon: "🎯",
    },
    {
      id: 10,
      title: "Forstå klimapoeng 🌱",
      content:
        "Du får klimapoeng basert på hvor mye CO₂-utslipp du hindrer. 1 klimapoeng = 1000 tonn CO₂ hindret. Dette viser din reelle klimapåvirkning!",
      icon: "🌱",
    },
  ];

  if (!isOpen) return null;

  const currentTutorial = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div className="tutorial-modal-overlay">
      <div className="tutorial-modal">
        {/* Header */}
        <div className="tutorial-modal-header">
          <div className="tutorial-progress">
            <div className="tutorial-progress-bar">
              <div
                className="tutorial-progress-fill"
                style={{
                  width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                }}
              />
            </div>
            <span className="tutorial-progress-text">
              {currentStep + 1} av {tutorialSteps.length}
            </span>
          </div>
          <button className="tutorial-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="tutorial-modal-content">
          <div className="tutorial-icon">{currentTutorial.icon}</div>
          <h2 className="tutorial-title">{currentTutorial.title}</h2>
          <p className="tutorial-text">{currentTutorial.content}</p>
        </div>

        {/* Footer */}
        <div className="tutorial-modal-footer">
          <div className="tutorial-actions">
            <button className="tutorial-btn tutorial-skip-btn" onClick={onSkip}>
              Hopp over
            </button>

            <div className="tutorial-nav-buttons">
              <button
                className="tutorial-btn tutorial-prev-btn"
                onClick={onPrevious}
                disabled={isFirstStep}
              >
                ← Forrige
              </button>

              <button
                className="tutorial-btn tutorial-next-btn"
                onClick={onNext}
              >
                {isLastStep ? "Start spillet! 🚀" : "Neste →"}
              </button>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="tutorial-step-indicators">
          {tutorialSteps.map((step, index) => (
            <button
              key={step.id}
              className={`tutorial-step-dot ${index === currentStep ? "active" : ""} ${index < currentStep ? "completed" : ""}`}
              onClick={() => {
                // Allow jumping to completed steps or current step
                if (index <= currentStep) {
                  // This would need a new action to jump to specific step
                  // For now, we'll just allow navigation within current bounds
                }
              }}
              disabled={index > currentStep}
            >
              {index < currentStep ? "✓" : index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
