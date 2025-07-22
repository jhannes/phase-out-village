import React, { useContext } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ApplicationContext } from "../../applicationContext";
import { OilFieldDataset, ShutdownMap } from "../../types/types";
import { calculateTotalYearlyOilProduction } from "../../utils/calculations";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function totalYearlyProduction(fullData: OilFieldDataset) {
  return [];
}

export function YearlyTotalOilProductionChart() {
  const { fullData } = useContext(ApplicationContext);
  const shutdowns: ShutdownMap = {};
  const data = calculateTotalYearlyOilProduction(fullData, shutdowns);
  const chartData = {
    labels: data.map((entry) => entry.year),
    datasets: [
      {
        label: "Total oljeproduksjon (millioner SM3)",
        data: data.map((entry) => entry.totalOilProduction),
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
      // if chart should start earlier, change the min value
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
  };

  return <Line options={options} data={chartData} />;
}
