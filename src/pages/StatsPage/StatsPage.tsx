import React, { useState, useEffect } from "react";
import "./StatsPage.css";
import { EmissionsView } from "../../components/charts/EmissionsView";
import { useGameStats, useGameState } from "../../context/GameStateContext";

interface StatsPageProps {}

interface GameStats {
  totalEmissionsReduced: number;
  totalBudgetSpent: number;
  fieldsPhased: number;
  totalFields: number;
  averageIntensity: number;
  projectedSavings: number;
  completionPercentage: number;
  co2PerBOE: number;
}

const StatsPage: React.FC<StatsPageProps> = () => {
  const gameStats = useGameStats();
  const { gameState } = useGameState();

  // Use real game data
  const stats: GameStats = {
    totalEmissionsReduced: gameStats.totalEmissionsReduced,
    totalBudgetSpent: gameStats.totalBudgetSpent,
    fieldsPhased: gameStats.fieldsPhased,
    totalFields: gameStats.totalFields,
    averageIntensity: gameStats.averageIntensity,
    projectedSavings: gameStats.projectedSavings / 1000000, // Convert to millions
    completionPercentage: gameStats.completionPercentage,
    co2PerBOE: gameStats.co2PerBOE,
  };

  const [activeTab, setActiveTab] = useState<
    "overview" | "emissions" | "economics"
  >("overview");

  const formatNumber = (num: number, suffix: string = ""): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M${suffix}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K${suffix}`;
    }
    return `${num.toFixed(1)}${suffix}`;
  };

  const StatCard: React.FC<{
    icon: string;
    title: string;
    value: string;
    subtitle?: string;
    trend?: "up" | "down" | "neutral";
    color?: "green" | "blue" | "orange" | "red";
  }> = ({ icon, title, value, subtitle, trend, color = "blue" }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-header">
        <span className="stat-icon">{icon}</span>
        <div className="stat-trend">
          {trend === "up" && <span className="trend-up">↗️</span>}
          {trend === "down" && <span className="trend-down">↘️</span>}
          {trend === "neutral" && <span className="trend-neutral">→</span>}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  const ProgressBar: React.FC<{
    label: string;
    current: number;
    max: number;
    color?: string;
  }> = ({ label, current, max, color = "#22c55e" }) => {
    const percentage = Math.min((current / max) * 100, 100);

    return (
      <div className="progress-item">
        <div className="progress-header">
          <span className="progress-label">{label}</span>
          <span className="progress-values">
            {current} / {max}
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <div className="progress-percentage">{percentage.toFixed(1)}%</div>
      </div>
    );
  };

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1 className="page-title">
          <span className="title-icon">📊</span>
          Spillstatistikk
        </h1>
        <p className="page-subtitle">Oversikt over din fremgang i utfasingen</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span className="tab-icon">📈</span>
          Oversikt
        </button>
        <button
          className={`tab-button ${activeTab === "emissions" ? "active" : ""}`}
          onClick={() => setActiveTab("emissions")}
        >
          <span className="tab-icon">💨</span>
          Utslipp
        </button>
        <button
          className={`tab-button ${activeTab === "economics" ? "active" : ""}`}
          onClick={() => setActiveTab("economics")}
        >
          <span className="tab-icon">💰</span>
          Økonomi
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            {/* Key Stats Grid */}
            <div className="stats-grid">
              <StatCard
                icon="🌱"
                title="Felt faset ut"
                value={`${stats.fieldsPhased}`}
                subtitle={`av ${stats.totalFields} totalt`}
                trend="up"
                color="green"
              />
              <StatCard
                icon="💨"
                title="CO₂ redusert"
                value={`${stats.totalEmissionsReduced} Mt`}
                subtitle="årlig besparelse"
                trend="down"
                color="green"
              />
              <StatCard
                icon="💰"
                title="Budsjett brukt"
                value={formatNumber(stats.totalBudgetSpent, " kr")}
                subtitle="av total ramme"
                trend="up"
                color="orange"
              />
              <StatCard
                icon="⚡"
                title="Intensitet"
                value={`${stats.averageIntensity} kg`}
                subtitle="CO₂e per BOE"
                trend="down"
                color="blue"
              />
            </div>

            {/* Progress Section */}
            <div className="progress-section">
              <h2 className="section-title">
                <span className="section-icon">🎯</span>
                Fremgang
              </h2>
              <div className="progress-container">
                <ProgressBar
                  label="Utfasing av felt"
                  current={stats.fieldsPhased}
                  max={stats.totalFields}
                  color="#22c55e"
                />
                <ProgressBar
                  label="Utslippsreduksjon"
                  current={stats.totalEmissionsReduced}
                  max={50}
                  color="#3b82f6"
                />
                <ProgressBar
                  label="Budsjettbruk"
                  current={stats.totalBudgetSpent}
                  max={gameState.budget + stats.totalBudgetSpent}
                  color="#f59e0b"
                />
              </div>
            </div>

            {/* Achievements Preview */}
            <div className="achievements-preview">
              <h2 className="section-title">
                <span className="section-icon">🏆</span>
                Prestasjoner
              </h2>
              <div className="achievement-items">
                <div
                  className={`achievement-item ${stats.fieldsPhased >= 1 ? "unlocked" : "locked"}`}
                >
                  <span className="achievement-icon">🌱</span>
                  <div className="achievement-content">
                    <div className="achievement-name">Første utfasing</div>
                    <div className="achievement-desc">
                      Fase ut ditt første felt
                    </div>
                  </div>
                </div>
                <div
                  className={`achievement-item ${stats.totalEmissionsReduced >= 10 ? "unlocked" : "locked"}`}
                >
                  <span className="achievement-icon">💚</span>
                  <div className="achievement-content">
                    <div className="achievement-name">Miljøvennlig</div>
                    <div className="achievement-desc">Reduser 10 Mt CO₂</div>
                  </div>
                </div>
                <div
                  className={`achievement-item ${stats.fieldsPhased >= 25 ? "unlocked" : "locked"}`}
                >
                  <span className="achievement-icon">🎯</span>
                  <div className="achievement-content">
                    <div className="achievement-name">Målfokusert</div>
                    <div className="achievement-desc">Fase ut 25 felt</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "emissions" && (
          <div className="emissions-tab">
            <div className="tab-content-wrapper">
              <EmissionsView data={[]} />
            </div>
          </div>
        )}

        {activeTab === "economics" && (
          <div className="economics-tab">
            <div className="economics-summary">
              <h2 className="section-title">
                <span className="section-icon">💼</span>
                Økonomisk sammendrag
              </h2>

              <div className="economics-grid">
                <div className="economics-card">
                  <h3 className="economics-title">💰 Investeringer</h3>
                  <div className="economics-content">
                    <div className="economics-item">
                      <span>Totalt investert:</span>
                      <span className="economics-value">
                        {formatNumber(stats.totalBudgetSpent, " kr")}
                      </span>
                    </div>
                    <div className="economics-item">
                      <span>Gjennomsnittskostnad per felt:</span>
                      <span className="economics-value">
                        {formatNumber(
                          stats.totalBudgetSpent / stats.fieldsPhased,
                          " kr",
                        )}
                      </span>
                    </div>
                    <div className="economics-item">
                      <span>Gjenværende budsjett:</span>
                      <span className="economics-value">
                        {formatNumber(gameState.budget, " kr")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="economics-card">
                  <h3 className="economics-title">📈 Besparelser</h3>
                  <div className="economics-content">
                    <div className="economics-item">
                      <span>Årlig CO₂-besparelse:</span>
                      <span className="economics-value green">
                        {stats.totalEmissionsReduced} Mt
                      </span>
                    </div>
                    <div className="economics-item">
                      <span>Estimert verdi (20 år):</span>
                      <span className="economics-value green">
                        {formatNumber(stats.projectedSavings * 1000000, " kr")}
                      </span>
                    </div>
                    <div className="economics-item">
                      <span>ROI (Return on Investment):</span>
                      <span className="economics-value green">
                        +
                        {(
                          ((stats.projectedSavings * 1000000) /
                            stats.totalBudgetSpent) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost-Benefit Analysis */}
              <div className="cost-benefit">
                <h3 className="analysis-title">📊 Kost-nytte analyse</h3>
                <div className="analysis-content">
                  <div className="analysis-item positive">
                    <span className="analysis-icon">✅</span>
                    <span>
                      Reduserte klimagassutslipp: {stats.totalEmissionsReduced}{" "}
                      Mt CO₂e/år
                    </span>
                  </div>
                  <div className="analysis-item positive">
                    <span className="analysis-icon">✅</span>
                    <span>
                      Fremtidig karbonkostnadsbesparelse:{" "}
                      {formatNumber(stats.projectedSavings * 1000000, " kr")}
                    </span>
                  </div>
                  <div className="analysis-item neutral">
                    <span className="analysis-icon">📋</span>
                    <span>
                      Arbeidsplasser i transisjon: ~
                      {(stats.fieldsPhased * 150).toLocaleString()} jobber
                    </span>
                  </div>
                  <div className="analysis-item positive">
                    <span className="analysis-icon">✅</span>
                    <span>
                      Nye grønne arbeidsplasser: ~
                      {(stats.fieldsPhased * 200).toLocaleString()} jobber
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
