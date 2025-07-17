import React, { useEffect, useRef } from "react";
import { Field } from "../../types/types";

// Placeholder for FieldModal to resolve import error
const FieldModal: React.FC<{
  selectedField: Field | null;
  budget: number;
  onPhaseOut: (fieldName: string) => void;
  onClose: () => void;
}> = ({ selectedField, budget, onPhaseOut, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!selectedField) {
    return null;
  }

  const canAfford = budget >= selectedField.phaseOutCost;

  // Handle background click to close modal
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Auto-scroll to modal when it opens
  useEffect(() => {
    if (modalRef.current) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        modalRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedField?.name]); // Re-run when field changes

  return (
    <div
      className="modal field-modal"
      ref={modalRef}
      onClick={handleBackgroundClick}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="modal-close-button"
          aria-label="Lukk modal"
        >
          &times;
        </button>

        <h2
          style={{
            marginTop: "8px",
            marginBottom: "20px",
            color: selectedField.status === "closed" ? "#10B981" : "#1F2937",
          }}
        >
          {selectedField.status === "closed" ? "🌱" : "🛢️"} {selectedField.name}
        </h2>

        <div className="field-details">
          <p>
            <strong>Status:</strong>
            <span className={`status-${selectedField.status}`}>
              {selectedField.status === "active"
                ? "Aktiv"
                : selectedField.status === "closed"
                  ? "Faset ut"
                  : "Overgangsfase"}
            </span>
          </p>

          {selectedField.status === "active" ? (
            <>
              <p>
                <strong>Årlig produksjon:</strong>
                <span>{selectedField.production.toFixed(1)} mill. boe</span>
              </p>
              <p>
                <strong>Årlige utslipp:</strong>
                <span style={{ color: "#DC2626", fontWeight: "bold" }}>
                  {selectedField.emissions[0].toFixed(1)} Mt CO₂
                </span>
              </p>
              <p>
                <strong>Utslippsintensitet:</strong>
                <span>{selectedField.intensity.toFixed(1)} kg CO₂/boe</span>
              </p>
              <p>
                <strong>Arbeidsplasser:</strong>
                <span>~{selectedField.workers.toLocaleString()}</span>
              </p>
              <p>
                <strong>Omstillingspotensial:</strong>
                <span style={{ color: "#059669", fontWeight: "bold" }}>
                  {selectedField.transitionPotential.replace("_", " ")}
                </span>
              </p>

              <hr />

              <div className="cost">
                <strong>💥 Totalt livstidsutslipp ved forbrenning:</strong>
                <div
                  style={{
                    fontSize: "1.2em",
                    color: "#DC2626",
                    marginTop: "8px",
                  }}
                >
                  {(selectedField.totalLifetimeEmissions / 1000).toFixed(0)} Mt
                  CO₂
                </div>
                <small style={{ opacity: 0.8 }}>
                  Dette er CO₂ som slippes ut når oljen brennes av forbrukere
                </small>
              </div>

              <div className="cost">
                <strong>💰 Kostnad for utfasing:</strong>
                <div style={{ fontSize: "1.2em", marginTop: "8px" }}>
                  {selectedField.phaseOutCost.toLocaleString()} mrd NOK
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "3em", marginBottom: "16px" }}>🌱</div>
              <p
                style={{
                  color: "#10B981",
                  fontSize: "1.2em",
                  fontWeight: "bold",
                }}
              >
                Dette feltet er allerede faset ut!
              </p>
              <p style={{ color: "#6B7280", marginTop: "8px" }}>
                Du hindrer nå{" "}
                {(selectedField.totalLifetimeEmissions / 1000).toFixed(0)} Mt
                CO₂ fra å bli sluppet ut i atmosfæren.
              </p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {selectedField.status === "active" ? (
            <>
              <button
                onClick={() => onPhaseOut(selectedField.name)}
                disabled={!canAfford}
                className="phase-out-button"
              >
                {canAfford
                  ? `🌱 Fase ut feltet (${selectedField.phaseOutCost.toLocaleString()} mrd NOK)`
                  : `💰 Ikke nok penger (${selectedField.phaseOutCost.toLocaleString()} mrd NOK)`}
              </button>
              {!canAfford && (
                <div className="budget-warning">
                  Du mangler{" "}
                  {(selectedField.phaseOutCost - budget).toLocaleString()} mrd
                  NOK
                </div>
              )}
            </>
          ) : (
            <button
              onClick={onClose}
              className="phase-out-button"
              style={{ background: "#10B981" }}
            >
              ✅ Forstått
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default FieldModal;
