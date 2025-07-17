import React from "react";

// Enhanced tutorial system
const TutorialOverlay: React.FC<{
  step: number;
  onNext: () => void;
  onSkip: () => void;
}> = ({ step, onNext, onSkip }) => {
  const tutorials = [
    {
      title: "Velkommen til Phase Out Village! 🌍",
      text: "Du skal hjelpe Norge med å fase ut olje og bygge en bærekraftig fremtid. Du har 15.000 milliarder NOK (Oljefondet) til disposisjon. Mål: Fase ut 80% av feltene før 2040!",
    },
    {
      title: "Forstå tallene 📊",
      text: "BOE = Barrel Oil Equivalent (fat oljeekvivalent). Mt = Millioner tonn CO₂. mrd = milliarder NOK. Disse enhetene hjelper deg å måle produksjon, utslipp og kostnader.",
    },
    {
      title: "Se oljefeltene 🛢️",
      text: "Røde felt har høy utslippsintensitet (kg CO₂ per BOE). Grønne er 'renere'. Men husk: 98% av utslippene kommer fra FORBRENNING av oljen senere!",
    },
    {
      title: "Klikk for å fase ut 🌱",
      text: "Hver gang du faser ut et felt, hindrer du LIVSTID med CO₂-utslipp fra forbrenning! Kostnaden er i milliarder NOK, men klimagevinsten er enorm.",
    },
    {
      title: "Multi-Select Mode 📋",
      text: "Aktiver Multi-Select Mode for å fase ut flere felt samtidig! Dette er nøkkelen til å nå målet - du kan fase ut opptil 8 felt per år senere i spillet.",
    },
    {
      title: "Invester i fremtiden 🚀",
      text: "Bruk pengene på norsk teknologi og grønn omstilling, ikke utenlandske sky-tjenester som øker avhengighet! Investeringer øker din kapasitet til å fase ut felt.",
    },
    {
      title: "Følg med på konsekvensene 🌡️",
      text: "Temperaturen måles i grader over førindustriell tid. Over 1.5°C er farlig, over 2°C er katastrofalt. Dårlige valg fører til visuell 'fade out'.",
    },
    {
      title: "Gå til neste år ⏰",
      text: "Bruk 'Gå til neste år' knappen for å simulere tid som går. Dette gir deg mer oljeinntekter, men også økte klimakostnader. Strategisk timing er viktig!",
    },
    {
      title: "Fakta om Norge 🇳🇴",
      text: "Norge er verdens 7. største oljeprodusent. Vi har Oljefondet på 15.000 mrd NOK - verdens største suverene fond. Men vi må lede omstillingen!",
    },
    {
      title: "Klimamålene 🎯",
      text: "Paris-avtalen sier maks 1.5°C oppvarming. Vi er allerede på 1.1°C. Hver grad over 1.5°C øker klimakatastrofer dramatisk. Norge må vise vei!",
    },
    {
      title: "Forstå klimapoeng 🌱",
      text: "Du får klimapoeng basert på hvor mye CO₂-utslipp du hindrer. 1 klimapoeng = 1000 tonn CO₂ hindret. Dette viser din reelle klimapåvirkning!",
    },
  ];

  if (step >= tutorials.length) return null;

  const current = tutorials[step];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-popup">
        <div className="tutorial-progress">
          Steg {step + 1} av {tutorials.length}
        </div>
        <h3>{current.title}</h3>
        <p>{current.text}</p>
        <div className="tutorial-buttons">
          <button onClick={onNext} className="tutorial-next">
            {step < tutorials.length - 1 ? "Neste" : "Start spillet!"}
          </button>
          <button onClick={onSkip} className="tutorial-skip">
            Hopp over
          </button>
        </div>
      </div>
    </div>
  );
};
export default TutorialOverlay;
