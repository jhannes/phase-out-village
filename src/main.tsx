import React from "react";
import { createRoot } from "react-dom/client";
import { data } from "./generated/data";

function Application() {
  return (
    <div>
      <h1>Chill, baby! Chill!</h1>

      <table>
        <thead>
          <tr>
            <th>År</th>
            {Object.keys(data).map((oilField) => (
              <th>{oilField}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(data["Aasta Hansteen"]).map((y) => (
            <tr>
              <td>{y}</td>
              {data["Aasta Hansteen"][y].productionOil}
            </tr>
          ))}
        </tbody>
      </table>
      <pre>{JSON.stringify(Object.keys(data["Draugen"]), null, 2)}</pre>
    </div>
  );
}

createRoot(document.getElementById("app")!).render(<Application />);
