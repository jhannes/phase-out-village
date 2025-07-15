import React from "react";
import { Field } from "../../interfaces/GameState";
import "./MultiPhaseOutSummary.css";

interface Props {
  selectedFields: Field[];
  budget: number;
}

// Estimering av grønt teknologi-potensial
const estimateGreenPotential = (fields: Field[]) => {
  let totalNewJobs = 0;
  let totalNewRevenue = 0;
  let breakdown: Record<string, { jobs: number; revenue: number }> = {};

  fields.forEach((field) => {
    let jobs = 0;
    let revenue = 0;
    switch (field.transitionPotential) {
      case "wind":
        jobs = Math.floor(field.workers * 1.2);
        revenue = Math.floor(field.yearlyRevenue * 0.8);
        break;
      case "solar":
        jobs = Math.floor(field.workers * 0.7);
        revenue = Math.floor(field.yearlyRevenue * 0.6);
        break;
      case "data_center":
        jobs = Math.floor(field.workers * 0.4);
        revenue = Math.floor(field.yearlyRevenue * 1.1);
        break;
      case "research_hub":
        jobs = Math.floor(field.workers * 0.5);
        revenue = Math.floor(field.yearlyRevenue * 0.4);
        break;
    }
    totalNewJobs += jobs;
    totalNewRevenue += revenue;
    breakdown[field.transitionPotential] = breakdown[field.transitionPotential] || { jobs: 0, revenue: 0 };
    breakdown[field.transitionPotential].jobs += jobs;
    breakdown[field.transitionPotential].revenue += revenue;
  });

  return { totalNewJobs, totalNewRevenue, breakdown };
};

const getTransitionLabel = (transition: string) => {
  const labels = {
    wind: "🌪️ Havvind",
    solar: "☀️ Solenergi",
    data_center: "💻 Datasenter",
    research_hub: "🔬 Forskningssenter",
  };
  return labels[transition as keyof typeof labels] || transition;
};

const formatNumber = (n: number, decimals = 0) =>
  n.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });

const MultiPhaseOutSummary: React.FC<Props> = ({ selectedFields, budget }) => {
  if (selectedFields.length === 0) return null;

  // Beregninger
  const totalCost = selectedFields.reduce((sum, f) => sum + f.phaseOutCost, 0);
  const totalAnnualEmissions = selectedFields.reduce((sum, f) => sum + (f.emissions[0] || 0), 0);
  const totalLifetimeEmissions = selectedFields.reduce((sum, f) => sum + (f.totalLifetimeEmissions || 0), 0);
  const totalWorkers = selectedFields.reduce((sum, f) => sum + f.workers, 0);
  const totalProduction = selectedFields.reduce((sum, f) => sum + f.production, 0);
  const totalRevenue = selectedFields.reduce((sum, f) => sum + f.yearlyRevenue, 0);
  const averageIntensity = selectedFields.reduce((sum, f) => sum + f.intensity, 0) / selectedFields.length;

  const { totalNewJobs, totalNewRevenue, breakdown } = estimateGreenPotential(selectedFields);
  const jobsNetChange = totalNewJobs - totalWorkers;
  const revenueNetChange = totalNewRevenue - totalRevenue;
  const canAfford = budget >= totalCost;
  const shortfall = totalCost - budget;

  return (
    <section className="multi-phaseout-summary minimal">
      <header className="mpo-header">
        <h2 className="mpo-title">📋 Sammendrag for utfasing</h2>
        <div className={canAfford ? "mpo-afford" : "mpo-shortfall"}>
          {canAfford ? "Kan gjennomføres" : `Mangler ${formatNumber(shortfall, 0)} mrd NOK`}
        </div>
      </header>
      <div className="mpo-grid">
        {/* Felt valgt */}
        <div>
          <div className="mpo-label">Felt valgt</div>
          <div className="mpo-value mpo-value-large">{selectedFields.length}</div>
        </div>
        {/* Produksjon & Utslipp */}
        <div>
          <div className="mpo-label">Årlig produksjon</div>
          <div className="mpo-value">{formatNumber(totalProduction, 1)} mill. boe</div>
          <div className="mpo-label mpo-label-small">Snitt intensitet: {averageIntensity.toFixed(1)} kg CO₂/boe</div>
        </div>
        {/* Arbeidsplasser */}
        <div className="mpo-section">
          <div className="mpo-label">Arbeidsplasser</div>
          <div className="mpo-workers-row">
            <span className="mpo-value">{formatNumber(totalWorkers)}</span>
            <span className="mpo-arrow">→</span>
            <span className="mpo-value">{formatNumber(totalNewJobs)}</span>
            <span className={jobsNetChange >= 0 ? "mpo-positive" : "mpo-negative"}>
              {jobsNetChange >= 0 ? '+' : ''}{formatNumber(jobsNetChange)}
            </span>
          </div>
          {/* Erstatningsplan */}
          <div className="mpo-label mpo-label-small" style={{ marginTop: 8 }}>Erstatningsplan:</div>
          <ul className="mpo-breakdown">
            {Object.entries(breakdown).map(([tech, { jobs }]) => (
              <li key={tech}>{getTransitionLabel(tech)}: {formatNumber(jobs)}</li>
            ))}
          </ul>
        </div>
        {/* Økonomi */}
        <div className="mpo-section">
          <div className="mpo-label">Økonomi</div>
          <div className="mpo-label mpo-label-small">Tapt årlig inntekt</div>
          <div className="mpo-value">{formatNumber(totalRevenue)} mill NOK</div>
          <div className="mpo-label mpo-label-small" style={{ marginTop: 8 }}>Ny inntekt</div>
          <div className="mpo-value">{formatNumber(totalNewRevenue)} mill NOK</div>
          <div className={revenueNetChange >= 0 ? "mpo-positive" : "mpo-negative"} style={{ marginTop: 8 }}>
            Netto: {revenueNetChange >= 0 ? '+' : ''}{formatNumber(revenueNetChange)} mill NOK
          </div>
        </div>
        {/* Klima */}
        <div className="mpo-section">
          <div className="mpo-label">Klima</div>
          <div className="mpo-label mpo-label-small">Årlig CO₂-reduksjon</div>
          <div className="mpo-value">{totalAnnualEmissions.toFixed(1)} Mt</div>
          <div className="mpo-label mpo-label-small" style={{ marginTop: 8 }}>Livstid spart</div>
          <div className="mpo-value">{(totalLifetimeEmissions / 1000).toFixed(0)} Mt</div>
        </div>
      </div>
      <div className="mpo-footer">
        <button
          className="phase-out-button"
          disabled={!canAfford}
          style={{
            background: canAfford ? 'var(--color-accent-2)' : 'var(--color-text-muted)',
            color: 'white',
            cursor: canAfford ? 'pointer' : 'not-allowed',
          }}
        >
          Bekreft utfasing
        </button>
      </div>
    </section>
  );
};

export default MultiPhaseOutSummary;
