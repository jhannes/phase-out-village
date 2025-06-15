import React from "react";
import { createRoot } from "react-dom/client";
import { data } from "./generated/data";

function Emissions() {
  const oilFields = Object.keys(data);
  const years = new Set<number>(Array.from({ length: 15 }, (_, v) => 2024 + v));

  for (const field of oilFields) {
    Object.keys(data[field])
      .map((s) => parseInt(s))
      .forEach((year) => years.add(year));
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Year</th>
          {oilFields.map((name) => (
            <th key={name}>{name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...years].toSorted().map((y) => (
          <tr key={y}>
            <th>{y}</th>
            {oilFields.map((name) => (
              <td>{JSON.stringify(data[name][y.toString()]?.emission)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GasProduction() {
  const oilFields = Object.keys(data);
  const years = new Set<number>(Array.from({ length: 15 }, (_, v) => 2024 + v));

  for (const field of oilFields) {
    Object.keys(data[field])
      .map((s) => parseInt(s))
      .forEach((year) => years.add(year));
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Year</th>
          {oilFields.map((name) => (
            <th key={name}>{name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...years].toSorted().map((y) => (
          <tr key={y}>
            <th>{y}</th>
            {oilFields.map((name) => (
              <td>{JSON.stringify(data[name][y.toString()]?.productionGas)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function OilProduction() {
  const oilFields = Object.keys(data);
  const years = new Set<number>(Array.from({ length: 15 }, (_, v) => 2024 + v));

  for (const field of oilFields) {
    Object.keys(data[field])
      .map((s) => parseInt(s))
      .forEach((year) => years.add(year));
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Year</th>
          {oilFields.map((name) => (
            <th key={name}>{name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...years].toSorted().map((y) => (
          <tr key={y}>
            <th>{y}</th>
            {oilFields.map((name) => (
              <td>{JSON.stringify(data[name][y.toString()]?.productionOil)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Application() {
  return (
    <>
      <h1>Avviklingsspillet</h1>

      <h2>Chill, baby! Chill!</h2>

      <details>
        <summary>Produksjon (gas)</summary>
        <GasProduction />
      </details>

      <details>
        <summary>Produksjon (olje)</summary>
        <OilProduction />
      </details>

      <details>
        <summary>Utslipp</summary>
        <Emissions />
      </details>
    </>
  );
}

createRoot(document.getElementById("app")!).render(<Application />);
