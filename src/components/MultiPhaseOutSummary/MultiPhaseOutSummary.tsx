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

  fields.forEach((field) => {
    switch (field.transitionPotential) {
      case "wind":
        // Havvind krever høy kompetanse, kan skape mange jobber
        totalNewJobs += Math.floor(field.workers * 1.2); // 20% flere jobber
        totalNewRevenue += Math.floor(field.yearlyRevenue * 0.8); // 80% av original inntekt
        break;
      case "solar":
        // Solenergi mindre arbeidsintensiv, men stabil
        totalNewJobs += Math.floor(field.workers * 0.7); // 70% av original jobber
        totalNewRevenue += Math.floor(field.yearlyRevenue * 0.6); // 60% av original inntekt
        break;
      case "data_center":
        // Datasentre krever færre, men høykompetent arbeidskraft
        totalNewJobs += Math.floor(field.workers * 0.4); // 40% av original jobber
        totalNewRevenue += Math.floor(field.yearlyRevenue * 1.1); // 110% av original inntekt
        break;
      case "research_hub":
        // Forskning skaper høykompetente jobber, men mindre volum
        totalNewJobs += Math.floor(field.workers * 0.5); // 50% av original jobber
        totalNewRevenue += Math.floor(field.yearlyRevenue * 0.4); // 40% av original inntekt
        break;
    }
  });

  return { totalNewJobs, totalNewRevenue };
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

const MultiPhaseOutSummary: React.FC<Props> = ({ selectedFields, budget }) => {
  if (selectedFields.length === 0) return null;

  // Beregninger som matcher FieldModal
  const totalCost = selectedFields.reduce((sum, f) => sum + f.phaseOutCost, 0);
  const totalAnnualEmissions = selectedFields.reduce(
    (sum, f) => sum + (f.emissions[0] || 0),
    0,
  );
  const totalLifetimeEmissions = selectedFields.reduce(
    (sum, f) => sum + (f.totalLifetimeEmissions || 0),
    0,
  );
  const totalWorkers = selectedFields.reduce((sum, f) => sum + f.workers, 0);
  const totalProduction = selectedFields.reduce(
    (sum, f) => sum + f.production,
    0,
  );
  const totalRevenue = selectedFields.reduce(
    (sum, f) => sum + f.yearlyRevenue,
    0,
  );
  const averageIntensity =
    selectedFields.reduce((sum, f) => sum + f.intensity, 0) /
    selectedFields.length;

  // Grupper etter teknologi-potensial
  const transitionCounts = selectedFields.reduce(
    (acc, field) => {
      acc[field.transitionPotential] =
        (acc[field.transitionPotential] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const greenTechPotential = Object.entries(transitionCounts)
    .map(([tech, count]) => `${getTransitionLabel(tech)}: ${count}`)
    .join(", ");

  const { totalNewJobs, totalNewRevenue } =
    estimateGreenPotential(selectedFields);
  const jobsNetChange = totalNewJobs - totalWorkers;
  const revenueNetChange = totalNewRevenue - totalRevenue;

  const canAfford = budget >= totalCost;
  const shortfall = totalCost - budget;

  return (
    <div
      className={`multi-phaseout-summary ${
        canAfford ? "can-afford" : "cannot-afford"
      }`}
    >
      {/* Header */}
      <div className="multi-phaseout-header">
        <h3 className="multi-phaseout-title">
          📋 Batch Utfasing - {selectedFields.length} felt
        </h3>
        <div
          className={`multi-phaseout-status ${
            canAfford ? "can-afford" : "cannot-afford"
          }`}
        >
          {canAfford ? "✅ Kan gjennomføres" : "❌ For dyrt"}
        </div>
      </div>

      {/* Produksjon og utslipp */}
      <div className="multi-phaseout-grid">
        <div>
          <div className="multi-phaseout-section-title">
            📊 <strong>Produksjon & Utslipp</strong>
          </div>
          <div className="multi-phaseout-section-content">
            <div>
              <strong>Årlig produksjon:</strong>{" "}
              <span className="multi-phaseout-production-value">
                {totalProduction.toFixed(1)} mill. boe
              </span>
            </div>
            <div>
              <strong>Årlige utslipp:</strong>{" "}
              <span className="multi-phaseout-emissions-value">
                {totalAnnualEmissions.toFixed(1)} Mt CO₂
              </span>
            </div>
            <div>
              <strong>Snitt intensitet:</strong>{" "}
              <span>{averageIntensity.toFixed(1)} kg CO₂/boe</span>
            </div>
          </div>
        </div>

        <div>
          <div className="multi-phaseout-section-title">
            👥 <strong>Arbeidsplasser</strong>
          </div>
          <div className="multi-phaseout-section-content">
            <div>
              <strong>Berørte jobber:</strong>{" "}
              <span className="multi-phaseout-jobs-value">
                {totalWorkers.toLocaleString()}
              </span>
            </div>
            <div>
              <strong>Estimerte nye:</strong>{" "}
              <span className="multi-phaseout-new-jobs-value">
                {totalNewJobs.toLocaleString()}
              </span>
            </div>
            <div>
              <strong>Netto endring:</strong>{" "}
              <span
                className={
                  jobsNetChange >= 0
                    ? "multi-phaseout-positive-change"
                    : "multi-phaseout-negative-change"
                }
              >
                {jobsNetChange >= 0 ? "+" : ""}
                {jobsNetChange.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Økonomi */}
      <div className="multi-phaseout-economics">
        <div className="multi-phaseout-economics-title">
          💰 <strong>Økonomisk analyse</strong>
        </div>
        <div className="multi-phaseout-economics-grid">
          <div>
            <div className="multi-phaseout-economics-content">
              <div>
                <strong>Utfasing kostnad:</strong>{" "}
                <span
                  className={
                    canAfford
                      ? "multi-phaseout-cost-affordable"
                      : "multi-phaseout-cost-unaffordable"
                  }
                >
                  {totalCost.toLocaleString()} mrd NOK
                </span>
              </div>
              <div>
                <strong>Tapt årsinntekt:</strong>{" "}
                <span className="multi-phaseout-lost-revenue">
                  {totalRevenue.toLocaleString()} mill NOK
                </span>
              </div>
              {!canAfford && (
                <div className="multi-phaseout-shortfall">
                  <strong>Mangler:</strong> {shortfall.toLocaleString()} mrd NOK
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="multi-phaseout-economics-content">
              <div>
                <strong>Estimert ny inntekt:</strong>{" "}
                <span className="multi-phaseout-new-revenue">
                  {totalNewRevenue.toLocaleString()} mill NOK
                </span>
              </div>
              <div>
                <strong>Netto inntektsendring:</strong>{" "}
                <span
                  className={
                    revenueNetChange >= 0
                      ? "multi-phaseout-positive-change"
                      : "multi-phaseout-negative-change"
                  }
                >
                  {revenueNetChange >= 0 ? "+" : ""}
                  {revenueNetChange.toLocaleString()} mill NOK
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Klimaeffekt */}
      <div className="multi-phaseout-climate">
        <div className="multi-phaseout-climate-title">
          🌍 <strong>Klimaeffekt</strong>
        </div>
        <div className="multi-phaseout-climate-grid">
          <div>
            <div>
              <strong>Årlig reduksjon:</strong>{" "}
              <span className="multi-phaseout-climate-reduction">
                {totalAnnualEmissions.toFixed(1)} Mt CO₂
              </span>
            </div>
          </div>
          <div>
            <div>
              <strong>Livstids CO₂ spart:</strong>{" "}
              <span className="multi-phaseout-climate-lifetime">
                {(totalLifetimeEmissions / 1000).toFixed(0)} Mt CO₂
              </span>
            </div>
          </div>
        </div>
        <div className="multi-phaseout-climate-note">
          💡 Dette er CO₂ som hindres fra å bli sluppet ut når oljen brennes
        </div>
      </div>

      {/* Grønn teknologi potensial */}
      <div className="multi-phaseout-transition">
        <div className="multi-phaseout-transition-title">
          <strong>🚀 Omstillingspotensial:</strong>
        </div>
        <div className="multi-phaseout-transition-content">
          {greenTechPotential}
        </div>
      </div>
    </div>
  );
};

export default MultiPhaseOutSummary;
