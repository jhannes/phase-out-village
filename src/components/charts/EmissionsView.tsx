import React from "react";
import "./EmissionsView.css";

interface EmissionsData {
  name: string;
  data: number[];
}

interface EmissionsViewProps {
  data: EmissionsData[];
  onFieldClick?: (fieldName: string) => void;
}

export const EmissionsView: React.FC<EmissionsViewProps> = ({
  data,
  onFieldClick,
}) => {
  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);
  const maxEmission = Math.max(...data.flatMap((field) => field.data));

  const totalByYear = years.map((year) => {
    const yearIndex = year - 2020;
    return data.reduce((sum, field) => sum + (field.data[yearIndex] || 0), 0);
  });

  return (
    <div className="emissions-view">
      <h2 className="emissions-title">📊 CO₂ Utslipp Over Tid</h2>

      {/* Total Emissions Chart */}
      <div className="emissions-chart">
        <div className="chart-header">
          <h3>Totale Utslipp (Mt CO₂/år)</h3>
        </div>
        <div className="chart-bars">
          {totalByYear.map((total, index) => (
            <div key={years[index]} className="chart-bar-container">
              <div
                className="chart-bar"
                style={{
                  height: `${Math.max(5, (total / Math.max(...totalByYear)) * 200)}px`,
                  backgroundColor: total > 0 ? "#EF4444" : "#10B981",
                }}
              />
              <div className="chart-value">{total.toFixed(1)}</div>
              <div className="chart-label">{years[index]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Field List */}
      <div className="emissions-fields">
        <h3>
          Felt Status{" "}
          {onFieldClick && (
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              - Klikk for å gå til kartet
            </span>
          )}
        </h3>
        <div className="field-grid">
          {data.map((field) => {
            const currentEmission = field.data[field.data.length - 1] || 0;
            const isActive = currentEmission > 0;

            return (
              <div
                key={field.name}
                className={`field-item ${isActive ? "active" : "closed"} ${onFieldClick ? "clickable" : ""}`}
                onClick={() => onFieldClick?.(field.name)}
                style={{ cursor: onFieldClick ? "pointer" : "default" }}
                title={
                  onFieldClick
                    ? `Klikk for å gå til ${field.name} på kartet`
                    : undefined
                }
              >
                <div className="field-name">
                  {field.name}
                  {onFieldClick && (
                    <span style={{ marginLeft: "8px", fontSize: "10px" }}>
                      🗺️
                    </span>
                  )}
                </div>
                <div className="field-emission">
                  {isActive
                    ? `${currentEmission.toFixed(1)} Mt`
                    : "🌱 Faset ut"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
