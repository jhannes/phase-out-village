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
import { EmissionIntensity } from "../../types/interface";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface Props {
  data: EmissionIntensity[];
}

export function EmissionIntensityChart({ data }: Props) {
  const fields = Array.from(new Set(data.map((d) => d.fieldName)));

  const datasets = fields.map((field) => {
    const fieldData = data
      .filter((d) => d.fieldName === field)
      .sort((a, b) => a.year - b.year);

    return {
      label: field,
      data: fieldData.map((d) => ({
        x: d.year,
        y: d.emissionIntensity,
      })),
      fill: false,
      borderColor: randomColor(),
      tension: 0.3,
    };
  });

  const chartData = {
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Utslippsintensitet per oljefelt (kg CO₂e per BOE)",
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const fieldName = context.dataset.label;
            const year = context.parsed.x;
            const intensity = context.parsed.y.toFixed(2);
            return `${fieldName}  År ${year}: ${intensity} kg CO₂e/BOE`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "År",
        },
        type: "linear" as const,
        min: 2015,
        max: 2040,
        ticks: {
          stepSize: 1,
          callback: (value: number | string) => value.toString(),
        },
      },
      y: {
        title: {
          display: true,
          text: "Utslippsintensitet (kg CO₂e per BOE)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: 500 }}>
      <Line options={options} data={chartData} />
    </div>
  );
}

function randomColor() {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgb(${r},${g},${b})`;
}
