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
import { productionProjections } from "../../utils/projections";
import { ApplicationContext } from "../../applicationContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export function ProductionPerFieldChart() {
  const { fullData } = useContext(ApplicationContext);
  const data = productionProjections(fullData);
  const fields = Array.from(new Set(data.map((d) => d.oilFieldName)));

  const datasets = fields.map((field) => {
    const fieldData = data
      .filter((d) => d.oilFieldName === field)
      .sort((a, b) => a.year - b.year);

    return {
      label: field,
      data: fieldData.map((d) => ({
        x: d.year,
        y: d.productionOil,
      })),
      fill: false,
      borderColor: randomColor(),
      tension: 0.3,
    };
  });

  return (
    <Line
      options={{
        responsive: true,
        plugins: {
          legend: { position: "top" },
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
            title: { display: true, text: "År" },
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
      }}
      data={{ datasets }}
    />
  );
}

function randomColor() {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgb(${r},${g},${b})`;
}
