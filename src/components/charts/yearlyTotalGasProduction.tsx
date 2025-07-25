import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { YearlyGasProduction } from "../../types/interface";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface YearlyGasProductionProps {
  data: YearlyGasProduction[];
}

export function YearlyTotalGasProductionChart({
  data,
}: YearlyGasProductionProps) {
  const chartData = {
    labels: data.map((entry) => entry.year),
    datasets: [
      {
        label: "Total produksjon av gass (millioner SM3)",
        data: data.map((entry) => entry.totalGasProduction),
        borderColor: "#4a90e2",
        backgroundColor: "rgba(74, 144, 226, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Årlig produksjon av gass fra norske oljefelt",
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
      // if chart should start earlier, change the min value
      x: {
        min: "2018",
        max: "2040",
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          callback: function (value: any) {
            return `${value.toFixed(1)}Millioner SM3`;
          },
        },
      },
    },
  };

  return <Line options={options} data={chartData} />;
}
