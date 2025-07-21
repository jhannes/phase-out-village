import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  YearlyGasProduction,
  YearlyOilProduction,
} from "../../types/interface";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function buildStackedProductionData(
  oil: YearlyOilProduction[],
  gas: YearlyGasProduction[],
) {
  const years = Array.from(
    new Set([...oil.map((d) => d.year), ...gas.map((d) => d.year)]),
  ).sort();

  const oilMap = Object.fromEntries(
    oil.map((d) => [d.year, d.totalOilProduction]),
  );
  const gasMap = Object.fromEntries(
    gas.map((d) => [d.year, d.totalGasProduction]),
  );

  const oilValues = years.map((y) => oilMap[y] ?? 0);
  const gasValues = years.map((y) => gasMap[y] ?? 0);

  return { years, oilValues, gasValues };
}

interface Props {
  oilData: YearlyOilProduction[];
  gasData: YearlyGasProduction[];
}

export function YearlyTotalProductionChart({ oilData, gasData }: Props) {
  const { years, oilValues, gasValues } = buildStackedProductionData(
    oilData,
    gasData,
  );

  const data = {
    labels: years,
    datasets: [
      {
        label: "Oljeproduksjon",
        data: oilValues,
        backgroundColor: "rgba(255,99,132,0.6)",
        stack: "production",
      },
      {
        label: "Gassproduksjon",
        data: gasValues,
        backgroundColor: "rgba(54,162,235,0.6)",
        stack: "production",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      title: { display: true, text: "Produksjon av olje og gass" },
      tooltip: { mode: "index", intersect: false },
      legend: { position: "top" },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: { stacked: true, title: { display: true, text: "År" } },
      y: {
        stacked: true,
        title: { display: true, text: "Produksjon (mill. Sm³ o.e.)" },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
