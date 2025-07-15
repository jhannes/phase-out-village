import React, { useState } from "react";
import CompactMobileLayout from "../../components/Layout/CompactMobileLayout";
import { useGameStats, useGameState } from "../../context/GameStateContext";
import "./CompactStatsPage.css";

const CompactStatsPage: React.FC = () => {
  const gameStats = useGameStats();
  const { gameState } = useGameState();

  const formatNumber = (num: number, suffix: string = ""): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M${suffix}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K${suffix}`;
    }
    return `${num.toFixed(1)}${suffix}`;
  };

  // Overview Tab Content
  const OverviewContent = () => (
    <div className="overview-content">
      {/* Key Stats Grid */}
      <div className="compact-stats-grid">
        <div className="compact-stat green">
          <span className="compact-stat-icon">🌱</span>
          <div className="compact-stat-value">{gameStats.fieldsPhased}</div>
          <div className="compact-stat-label">Felt faset ut</div>
        </div>
        <div className="compact-stat blue">
          <span className="compact-stat-icon">💨</span>
          <div className="compact-stat-value">
            {gameStats.totalEmissionsReduced.toFixed(1)}Mt
          </div>
          <div className="compact-stat-label">CO₂ redusert</div>
        </div>
        <div className="compact-stat orange">
          <span className="compact-stat-icon">💰</span>
          <div className="compact-stat-value">
            {formatNumber(gameStats.totalBudgetSpent)}
          </div>
          <div className="compact-stat-label">Investert</div>
        </div>
        <div className="compact-stat purple">
          <span className="compact-stat-icon">🎯</span>
          <div className="compact-stat-value">
            {gameStats.completionPercentage.toFixed(0)}%
          </div>
          <div className="compact-stat-label">Fullført</div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="compact-card">
        <div className="compact-card-header">
          <h3 className="compact-card-title">🎯 Fremgang</h3>
        </div>
        <div className="progress-items">
          <div className="progress-item">
            <div className="progress-info">
              <span>Utfasing</span>
              <span>
                {gameStats.fieldsPhased}/{gameStats.totalFields}
              </span>
            </div>
            {/*   <div className="progress-bar"> */}
            {/*     <div */}
            {/*       className="progress-fill green" */}
            {/*       style={{ width: `${(gameStats.fieldsPhased / gameStats.totalFields) * 100}%` }} */}
            {/*     /> */}
            {/*   </div> */}
            {/* </div> */}
            {/* <div className="progress-item"> */}
            {/*   <div className="progress-info"> */}
            {/*     <span>CO₂ reduksjon</span> */}
            {/*     <span>{gameStats.totalEmissionsReduced.toFixed(1)}/50Mt</span> */}
            {/*   </div> */}
            <div className="progress-bar">
              <div
                className="progress-fill blue"
                style={{
                  width: `${Math.min((gameStats.totalEmissionsReduced / 50) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="progress-item">
            <div className="progress-info">
              <span>Budsjett</span>
              <span>{formatNumber(gameStats.totalBudgetSpent)}/100M</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill orange"
                style={{
                  width: `${(gameStats.totalBudgetSpent / 100000000) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="compact-card">
        <div className="compact-card-header">
          <h3 className="compact-card-title">🏆 Prestasjoner</h3>
        </div>
        <div className="achievements-grid">
          <div
            className={`achievement-badge ${gameStats.fieldsPhased >= 1 ? "unlocked" : "locked"}`}
          >
            <span className="achievement-icon">🌱</span>
            <span className="achievement-name">Første utfasing</span>
          </div>
          <div
            className={`achievement-badge ${gameStats.totalEmissionsReduced >= 10 ? "unlocked" : "locked"}`}
          >
            <span className="achievement-icon">💚</span>
            <span className="achievement-name">Miljøvennlig</span>
          </div>
          <div
            className={`achievement-badge ${gameStats.fieldsPhased >= 25 ? "unlocked" : "locked"}`}
          >
            <span className="achievement-icon">🎯</span>
            <span className="achievement-name">Målfokusert</span>
          </div>
          <div
            className={`achievement-badge ${gameStats.completionPercentage >= 50 ? "unlocked" : "locked"}`}
          >
            <span className="achievement-icon">⭐</span>
            <span className="achievement-name">Halvveis</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Economics Tab Content
  const EconomicsContent = () => (
    <div className="economics-content">
      <div className="compact-card">
        <div className="compact-card-header">
          <h3 className="compact-card-title">💼 Økonomi</h3>
        </div>
        <div className="economics-grid">
          <div className="economics-item">
            <span className="economics-label">Totalt investert</span>
            <span className="economics-value">
              {formatNumber(gameStats.totalBudgetSpent, " kr")}
            </span>
          </div>
          <div className="economics-item">
            <span className="economics-label">Per felt</span>
            <span className="economics-value">
              {gameStats.fieldsPhased > 0
                ? formatNumber(
                    gameStats.totalBudgetSpent / gameStats.fieldsPhased,
                    " kr",
                  )
                : "0 kr"}
            </span>
          </div>
          <div className="economics-item">
            <span className="economics-label">Gjenværende</span>
            <span className="economics-value">
              {formatNumber(gameState.budget, " kr")}
            </span>
          </div>
          <div className="economics-item">
            <span className="economics-label">Estimert besparelse</span>
            <span className="economics-value green">
              {formatNumber(gameStats.projectedSavings, " kr")}
            </span>
          </div>
        </div>
      </div>

      <div className="compact-card">
        <div className="compact-card-header">
          <h3 className="compact-card-title">📈 Kost-Nytte</h3>
        </div>
        <div className="cost-benefit-items">
          <div className="benefit-item positive">
            <span className="benefit-icon">✅</span>
            <span>
              CO₂ reduksjon: {gameStats.totalEmissionsReduced.toFixed(1)} Mt/år
            </span>
          </div>
          <div className="benefit-item positive">
            <span className="benefit-icon">✅</span>
            <span>
              Karbonbesparelse:{" "}
              {formatNumber(gameStats.projectedSavings, " kr")}
            </span>
          </div>
          <div className="benefit-item neutral">
            <span className="benefit-icon">📋</span>
            <span>
              Jobber i transisjon: ~
              {(gameStats.fieldsPhased * 150).toLocaleString()}
            </span>
          </div>
          <div className="benefit-item positive">
            <span className="benefit-icon">✅</span>
            <span>
              Nye grønne jobber: ~
              {(gameStats.fieldsPhased * 200).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Climate Tab Content
  const ClimateContent = () => (
    <div className="climate-content">
      <div className="compact-card">
        <div className="compact-card-header">
          <h3 className="compact-card-title">🌍 Klimapåvirkning</h3>
        </div>
        <div className="climate-stats">
          <div className="climate-stat">
            <span className="climate-icon">🌡️</span>
            <div className="climate-info">
              <div className="climate-value">
                +1.
                {(1 + Math.max(0, 5 - gameStats.totalEmissionsReduced * 0.1))
                  .toFixed(1)
                  .slice(-1)}
                °C
              </div>
              <div className="climate-label">Global temperatur</div>
            </div>
          </div>
          <div className="climate-stat">
            <span className="climate-icon">💨</span>
            <div className="climate-info">
              <div className="climate-value">
                {gameStats.totalEmissionsReduced.toFixed(1)} Mt
              </div>
              <div className="climate-label">CO₂ unngått årlig</div>
            </div>
          </div>
          <div className="climate-stat">
            <span className="climate-icon">🌱</span>
            <div className="climate-info">
              <div className="climate-value">
                {(gameStats.totalEmissionsReduced * 20).toFixed(0)} Mt
              </div>
              <div className="climate-label">Total besparelse (20 år)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="compact-card">
        <div className="compact-card-header">
          <h3 className="compact-card-title">📊 Intensitet</h3>
        </div>
        <div className="intensity-info">
          <div className="intensity-current">
            <span className="intensity-value">
              {gameStats.averageIntensity.toFixed(1)}
            </span>
            <span className="intensity-unit">kg CO₂e/BOE</span>
            <span className="intensity-label">Gjennomsnittlig intensitet</span>
          </div>
          <div className="intensity-comparison">
            <div className="comparison-item">
              <span className="comparison-label">Globalt snitt</span>
              <span className="comparison-value">18.5 kg</span>
            </div>
            <div className="comparison-item">
              <span className="comparison-label">Norsk mål</span>
              <span className="comparison-value">8.0 kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    {
      id: "overview",
      title: "Oversikt",
      icon: "📊",
      content: <OverviewContent />,
      badge: gameStats.fieldsPhased,
    },
    {
      id: "economics",
      title: "Økonomi",
      icon: "💰",
      content: <EconomicsContent />,
    },
    {
      id: "climate",
      title: "Klima",
      icon: "🌍",
      content: <ClimateContent />,
    },
  ];

  const statusBar = (
    <>
      <div className="status-item">
        <span className="status-icon">💰</span>
        <div className="status-value">{formatNumber(gameState.budget)}</div>
        <div className="status-label">Budsjett</div>
      </div>
      <div className="status-item">
        <span className="status-icon">🛢️</span>
        <div className="status-value">{gameStats.fieldsRemaining}</div>
        <div className="status-label">Felt igjen</div>
      </div>
      <div className="status-item">
        <span className="status-icon">🌱</span>
        <div className="status-value">{gameStats.selectedFieldsCount}</div>
        <div className="status-label">Valgte</div>
      </div>
      <div className="status-item">
        <span className="status-icon">💨</span>
        <div className="status-value">
          {gameStats.totalEmissionsReduced.toFixed(1)}Mt
        </div>
        <div className="status-label">Redusert</div>
      </div>
    </>
  );

  const floatingActions = (
    <>
      <button className="fab primary" title="Multi-utfasing">
        🎯
      </button>
      <button className="fab secondary" title="Oppdater data">
        🔄
      </button>
    </>
  );

  const header = (
    <div className="stats-header">
      <h1 className="page-title">
        <span className="title-icon">📊</span>
        Statistikk
      </h1>
    </div>
  );

  return (
    <CompactMobileLayout
      tabs={tabs}
      defaultTab="overview"
      header={header}
      statusBar={statusBar}
      floatingActions={floatingActions}
    />
  );
};

export default CompactStatsPage;
