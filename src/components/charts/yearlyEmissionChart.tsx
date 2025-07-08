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
import { YearlyEmission } from "../../types/interface";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface YearlyEmissionProps {
  data: YearlyEmission[];
}

export function YearlyEmissionChart({ data }: YearlyEmissionProps) {
  const chartData = {
    labels: data.map((entry) => entry.year),
    datasets: [
      {
        label: "Totalt utslipp (Tonn CO2)",
        data: data.map((entry) => entry.totalEmission),
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
        text: "Årlig utslipp fra norske oljefelt",
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
        max: 25_000_000,
        ticks: {
          callback: function (value: any) {
            return `${(value / 1_000_000).toFixed(1)}M Tonn CO2`;
          },
        },
      },
    },
  };

  return <Line options={options} data={chartData} />;
}
