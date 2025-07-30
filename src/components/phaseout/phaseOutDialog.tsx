import React, { FormEvent, useContext, useState } from "react";
import { ApplicationContext } from "../../applicationContext";
import { OilfieldName, PhaseOutSchedule } from "../../data";
import { EmissionIntensityChartSingleField } from "../charts/emissionIntensitySingleOilField";

type Oilfield = {
  productionOil: number | null;
  productionGas: number | null;
  emission: number | null;
  emissionIntensity: number | null;
};

export function PhaseOutDialog({ close }: { close: () => void }) {
  const { year, nextYear, fullData, phaseOut, setPhaseOut } =
    useContext(ApplicationContext);

  const [draft, setDraft] = useState<PhaseOutSchedule>({});
  const [latestSelectedField, setLatestSelectedField] =
    useState<OilfieldName | null>(null);
  const [fieldForChart, setFieldForChart] = useState<Oilfield | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPhaseOut((phaseOut) => ({ ...phaseOut, ...draft }));
    nextYear();
    close();
  }

  function toggle(field: OilfieldName, checked: boolean) {
    if (!checked) {
      setDraft((d) =>
        Object.fromEntries(Object.entries(d).filter(([f, _]) => f !== field)),
      );
      if (latestSelectedField === field) {
        setLatestSelectedField(null);
      }
    } else {
      setDraft((d) => ({ ...d, [field]: year }));
      setLatestSelectedField(field);
      const data = fullData[field]?.[year];
      if (data) {
        const fieldData: Oilfield = {
          productionOil: data.productionOil ?? null,
          productionGas: data.productionGas ?? null,
          emission: data.emission ?? null,
          emissionIntensity: data.emissionIntensity ?? null,
        };
        setFieldForChart(fieldData);
      } else {
        setFieldForChart(null);
      }
    }
  }

  const totalOilProduction =
    Math.round(
      Object.keys(draft).reduce((sum, field) => {
        const oil = fullData[field]?.[year]?.productionOil ?? 0;
        return sum + oil;
      }, 0) * 100,
    ) / 100;

  const totalGasProduction =
    Math.round(
      Object.keys(draft).reduce((sum, field) => {
        const gas = fullData[field]?.[year]?.productionGas ?? 0;
        return sum + gas;
      }, 0) * 100,
    ) / 100;

  const totalEmission =
    Math.round(
      Object.keys(draft).reduce((sum, field) => {
        const emission = fullData[field]?.[year]?.emission ?? 0;
        return sum + emission;
      }, 0) * 100,
    ) / 100;

  return (
    <div className="phaseout-dialog">
      <form className="phaseout-checkboxes" onSubmit={handleSubmit}>
        <h2>Velg felter for avvikling i {year}</h2>
        <ul>
          {Object.keys(fullData).map((k) => (
            <li key={k}>
              <label>
                <input
                  disabled={k in phaseOut}
                  type="checkbox"
                  onChange={(e) => {
                    console.log("checkbox changed", k, e.target.checked);
                    toggle(k, e.target.checked);
                  }}
                  checked={!!draft[k]}
                />
                {k}
              </label>
            </li>
          ))}
        </ul>

        <button type="submit">Lagre</button>
      </form>
      <div className="dialog-information-container">
        {latestSelectedField && fullData[latestSelectedField] && (
          <div className="phaseout-latest-oilfield">
            <h3>Sist valgt oljefelt: {latestSelectedField}</h3>
            <p>
              Oljeproduksjon i {year}:{" "}
              {fullData[latestSelectedField]?.[year]?.productionOil ?? "0"} fat
            </p>
            <p>
              Gassproduksjon i {year}:{" "}
              {fullData[latestSelectedField]?.[year]?.productionGas ?? "0"} o.e.
            </p>
            <p>
              Utslipp i {year}:{" "}
              {fullData[latestSelectedField]?.[year]?.emission ?? "0"} Tonn Co2
              o.e.
            </p>
            {fieldForChart && (
              <EmissionIntensityChartSingleField dataPoint={fieldForChart!} />
            )}
          </div>
        )}

        {Object.keys(draft).length > 0 && (
          <div className="phaseout-total-production">
            <strong>Total produksjon som reduseres:</strong>
            <p>{totalOilProduction} fat olje</p>
            <p>{totalGasProduction} gass o.e.</p>
            <strong>Totalt utslipp som reduseres:</strong> {totalEmission} Tonn
            Co2 o.e.
          </div>
        )}

        {Object.keys(draft).length > 0 && (
          <div className="phaseout-fieldnames-selected">
            <h4>Felter som avvikles:</h4>
            <ul>
              {Object.keys(draft).map((k) => (
                <li key={k}>
                  <label>{k}</label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
