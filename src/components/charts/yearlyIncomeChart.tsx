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
import { YearlyIncome } from "../../types/interface";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface IncomeChartProps {
  data: YearlyIncome[];
}

export function IncomeChart({ data }: IncomeChartProps) {
  const chartData = {
    labels: data.map((entry) => entry.year),
    datasets: [
      {
        label: "Total Inntekt (USD)",
        data: data.map((entry) => entry.totalIncome),
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
        text: "Årlig Inntekt fra Olje og Gass",
      },
    },
    scales: {
      // if chart should start earlier, change the min value
      x: {
        min: "2015",
        max: "2040",
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 100_000_000_000,
        ticks: {
          callback: function (value: any) {
            return `$${(value / 1_000_000).toFixed(1)}M`;
          },
        },
      },
    },
  };

  return <Line options={options} data={chartData} />;
}
