import { ShutdownControlsProps } from "../../types/interface";
import React from "react";

export function ShutdownControls({
  data,
  shutdowns,
  onShutdownChange,
}: ShutdownControlsProps) {
  return (
    <div className="shutdown-controls">
      <h3>Velge hvilke år oljefeltene skal stenge</h3>
      {Object.keys(data).map((fieldName) => (
        <div key={fieldName} className="shutdown-row">
          <label>{fieldName}</label>
          <select
            value={shutdowns[fieldName] ?? 2040}
            onChange={(e) => {
              const year = parseInt(e.target.value);
              if (!isNaN(year) && year >= 2023 && year <= 2040) {
                onShutdownChange(fieldName, year);
              }
            }}
          >
            {Array.from({ length: 2040 - 2023 + 1 }, (_, i) => 2023 + i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ),
            )}
          </select>
        </div>
      ))}
    </div>
  );
}
