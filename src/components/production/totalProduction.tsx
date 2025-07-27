import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { ApplicationContext } from "../../applicationContext";
import { Line } from "react-chartjs-2";
import {
  allYears,
  OilfieldName,
  oilProduction,
  Year,
  YearlyDataset,
} from "../../data";

export function TotalProduction() {
  const { data, phaseOut } = useContext(ApplicationContext);

  const dataSeries: Record<OilfieldName, YearlyDataset> = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      oilProduction(value, phaseOut, key),
    ]),
  );

  function sumAllFields(
    dataSeries: Record<OilfieldName, YearlyDataset>,
    year: Year,
  ) {
    let sum = 0;
    for (const dataset of Object.values(dataSeries)) {
      sum += dataset[year]?.value || 0;
    }
    return sum;
  }

  const datasets: Partial<Record<Year, number>> = Object.fromEntries(
    allYears
      .filter((y) => 2014 <= parseInt(y) && parseInt(y) <= 2040)
      .map((year) => [year, sumAllFields(dataSeries, year)]),
  );

  return (
    <div>
      <nav>
        <Link to={"./totalOil"}>Total produksjon olje</Link>
        <Link to={"./oilPerField"}>Oljeproduksjon per felt</Link>
        <Link to={"./old"}>Gamle grafer</Link>
      </nav>
      <Line
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Årlig oljeproduksjon fra norske oljefelt",
            },
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  const value = context.parsed.y;
                  return `Produksjon: ${value.toLocaleString("nb-NO")} millioner SM3`;
                },
              },
            },
          },
          scales: {
            x: {
              min: "2018",
              max: "2040",
            },
            y: {
              beginAtZero: true,
              min: 0,
              max: 200,
              ticks: {
                callback: function (value: any) {
                  return `${value.toFixed(1)}M SM3`;
                },
              },
            },
          },
        }}
        data={{
          labels: Object.keys(datasets),
          datasets: [
            {
              data: Object.values(datasets),
              borderColor: "#4a90e2",
              backgroundColor: "rgba(74, 144, 226, 0.2)",
              tension: 0.3,
              fill: true,
            },
          ],
        }}
      />
    </div>
  );
}
