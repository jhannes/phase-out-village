import React from "react";
import { useGameState } from "../../context/GameStateContext";
import "./InvestmentsPage.css";

type Investment =
  | "green_tech"
  | "ai_research"
  | "renewable_energy"
  | "carbon_capture"
  | "hydrogen_tech"
  | "quantum_computing"
  | "battery_tech"
  | "offshore_wind"
  | "foreign_cloud"
  | "fossil_subsidies"
  | "crypto_mining"
  | "fast_fashion";

const InvestmentsPage: React.FC = () => {
  const { gameState, dispatch } = useGameState();

  const investments: {
    type: Investment;
    label: string;
    color: string;
    description: string;
    category: "good" | "bad";
  }[] = [
    {
      type: "green_tech",
      label: "Grønn Teknologi",
      color: "#22C55E",
      description: "Generell grønn innovasjon og cleantech",
      category: "good",
    },
    {
      type: "ai_research",
      label: "AI Forskning",
      color: "#6366F1",
      description: "Kunstig intelligens for klimaløsninger",
      category: "good",
    },
    {
      type: "renewable_energy",
      label: "Fornybar Energi",
      color: "#F59E0B",
      description: "Sol, vind og vannkraft",
      category: "good",
    },
    {
      type: "carbon_capture",
      label: "Karbonfangst",
      color: "#0EA5E9",
      description: "CCS og direkte luftfangst",
      category: "good",
    },
    {
      type: "hydrogen_tech",
      label: "Hydrogen Teknologi",
      color: "#10B981",
      description: "Grønt hydrogen og brenselsceller",
      category: "good",
    },
    {
      type: "quantum_computing",
      label: "Kvante Databehandling",
      color: "#8B5CF6",
      description: "Kvante-teknologi for energioptimering",
      category: "good",
    },
    {
      type: "battery_tech",
      label: "Batteriteknologi",
      color: "#F97316",
      description: "Energilagring og batterier",
      category: "good",
    },
    {
      type: "offshore_wind",
      label: "Havvind",
      color: "#06B6D4",
      description: "Flytende havvindteknologi",
      category: "good",
    },
    {
      type: "foreign_cloud",
      label: "Utenlandsk Sky",
      color: "#EF4444",
      description: "Importerer datacenter-tjenester",
      category: "bad",
    },
    {
      type: "fossil_subsidies",
      label: "Fossil Subsidier",
      color: "#DC2626",
      description: "Støtter olje- og gassindustrien",
      category: "bad",
    },
    {
      type: "crypto_mining",
      label: "Kryptovaluta Mining",
      color: "#991B1B",
      description: "Energikrevende kryptovaluta",
      category: "bad",
    },
    {
      type: "fast_fashion",
      label: "Fast Fashion",
      color: "#7F1D1D",
      description: "Støtter hurtigmote-industrien",
      category: "bad",
    },
  ];

  const handleInvest = (type: Investment, amount: number) => {
    dispatch({ type: "MAKE_INVESTMENT", payload: { type, amount } });
  };

  const goodInvestments = investments.filter((inv) => inv.category === "good");
  const badInvestments = investments.filter((inv) => inv.category === "bad");

  const totalGoodInvestments = goodInvestments.reduce(
    (sum, inv) => sum + (gameState.investments[inv.type] || 0),
    0,
  );
  const totalBadInvestments = badInvestments.reduce(
    (sum, inv) => sum + (gameState.investments[inv.type] || 0),
    0,
  );

  return (
    <div className="investments-page">
      <div className="investments-header">
        <h1>💰 Investeringer</h1>
        <p>
          Gjør strategiske investeringer for å påvirke Norges teknologiske
          utvikling og klimamål
        </p>
      </div>

      <div className="investments-overview">
        <div className="overview-card">
          <h3>📊 Portefølje Oversikt</h3>
          <div className="overview-stats">
            <div className="stat-item good">
              <span className="stat-label">Gode investeringer:</span>
              <span className="stat-value">{totalGoodInvestments} mrd NOK</span>
            </div>
            <div className="stat-item bad">
              <span className="stat-label">Dårlige investeringer:</span>
              <span className="stat-value">{totalBadInvestments} mrd NOK</span>
            </div>
            <div className="stat-item neutral">
              <span className="stat-label">Tilgjengelig budsjett:</span>
              <span className="stat-value">{gameState.budget} mrd NOK</span>
            </div>
            <div className="stat-item neutral">
              <span className="stat-label">Norge Tech-Rank:</span>
              <span className="stat-value">{gameState.norwayTechRank}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="investments-content">
        {/* Gode investeringer */}
        <div className="investment-section good">
          <h2>
            <span className="section-icon">🌱</span>
            Gode Investeringer
            <span className="section-subtitle">Øker Tech-Rank</span>
          </h2>
          <div className="investment-grid">
            {goodInvestments.map((inv) => (
              <div key={inv.type} className="investment-card">
                <div className="investment-card-header">
                  <h3 style={{ color: inv.color }}>{inv.label}</h3>
                  <span className="investment-amount">
                    {gameState.investments[inv.type] || 0} mrd NOK
                  </span>
                </div>
                <p className="investment-description">{inv.description}</p>
                <div className="investment-actions">
                  <button
                    className="invest-button"
                    style={{
                      backgroundColor: inv.color,
                      opacity: gameState.budget >= 10 ? 1 : 0.5,
                    }}
                    disabled={gameState.budget < 10}
                    onClick={() => handleInvest(inv.type, 10)}
                  >
                    +10 mrd
                  </button>
                  <button
                    className="invest-button"
                    style={{
                      backgroundColor: inv.color,
                      opacity: gameState.budget >= 50 ? 1 : 0.5,
                    }}
                    disabled={gameState.budget < 50}
                    onClick={() => handleInvest(inv.type, 50)}
                  >
                    +50 mrd
                  </button>
                  <button
                    className="invest-button"
                    style={{
                      backgroundColor: inv.color,
                      opacity: gameState.budget >= 100 ? 1 : 0.5,
                    }}
                    disabled={gameState.budget < 100}
                    onClick={() => handleInvest(inv.type, 100)}
                  >
                    +100 mrd
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dårlige investeringer */}
        <div className="investment-section bad">
          <h2>
            <span className="section-icon">⚠️</span>
            Dårlige Investeringer
            <span className="section-subtitle">Reduserer Tech-Rank</span>
          </h2>
          <div className="investment-grid">
            {badInvestments.map((inv) => (
              <div key={inv.type} className="investment-card">
                <div className="investment-card-header">
                  <h3 style={{ color: inv.color }}>{inv.label}</h3>
                  <span className="investment-amount">
                    {gameState.investments[inv.type] || 0} mrd NOK
                  </span>
                </div>
                <p className="investment-description">{inv.description}</p>
                <div className="investment-actions">
                  <button
                    className="invest-button bad"
                    style={{
                      backgroundColor: inv.color,
                      opacity: gameState.budget >= 10 ? 1 : 0.5,
                    }}
                    disabled={gameState.budget < 10}
                    onClick={() => handleInvest(inv.type, 10)}
                  >
                    +10 mrd
                  </button>
                  <button
                    className="invest-button bad"
                    style={{
                      backgroundColor: inv.color,
                      opacity: gameState.budget >= 50 ? 1 : 0.5,
                    }}
                    disabled={gameState.budget < 50}
                    onClick={() => handleInvest(inv.type, 50)}
                  >
                    +50 mrd
                  </button>
                  <button
                    className="invest-button bad"
                    style={{
                      backgroundColor: inv.color,
                      opacity: gameState.budget >= 100 ? 1 : 0.5,
                    }}
                    disabled={gameState.budget < 100}
                    onClick={() => handleInvest(inv.type, 100)}
                  >
                    +100 mrd
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="investments-info">
        <div className="info-card">
          <h3>💡 Investeringstips</h3>
          <ul>
            <li>Gode investeringer øker Norges teknologiske uavhengighet</li>
            <li>Høyere Tech-Rank gir større kapasitet til å fase ut oljefelt</li>
            <li>Dårlige investeringer reduserer Tech-Rank og bremser fremgangen</li>
            <li>Balanser investeringene for optimal utvikling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InvestmentsPage;
