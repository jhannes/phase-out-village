import { data } from "../../generated/data";
import React from "react";

export function OilProductionTable() {
  const oilFields = Object.keys(data);
  const years = new Set<string>();
  for (const oilField of oilFields) {
    Object.keys(data[oilField]).forEach((y) => years.add(y));
  }

  return (
    <table>
      <thead>
        <tr>
          <th>År</th>
          {oilFields.map((oilField) => (
            <th>{oilField}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...years].toSorted().map((y) => (
          <tr>
            <td>{y}</td>
            {oilFields.map((f) => (
              <td>{data[f][y]?.productionOil}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
