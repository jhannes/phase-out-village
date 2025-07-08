import React, { useState } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  ChartOptions,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Scatter } from "react-chartjs-2";
import { EmissionIntensity } from "../../types/interface";

ChartJS.register(
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  annotationPlugin,
);

interface Props {
  data: EmissionIntensity[];
}

export function EmissionEfficiencyScatterChart({ data }: Props) {
  const [selectedYear, setSelectedYear] = useState<number>(2023);

  const filteredData = data.filter((d) => d.year === selectedYear);

  const datasets = filteredData.map((d) => ({
    label: d.fieldName,
    data: [{ x: d.totalProduction, y: d.emissionIntensity }],
    pointBackgroundColor: "#4a90e2",
    pointRadius: 6,
  }));

  const chartData = { datasets };

  const options: ChartOptions<"scatter"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Utslippsintensitet vs Produksjon",
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(
              2,
            )} kg CO₂e/BOE, ${context.parsed.x.toLocaleString()} BOE`;
          },
        },
      },
      annotation: {
        annotations: {
          avgBox: {
            type: "box",
            yMin: 15,
            yMax: 20,
            backgroundColor: "rgba(255, 165, 0, 0.2)",
            borderColor: "orange",
            borderWidth: 1,
            label: {
              content: "Verdensgjennomsnitt",
              enabled: true,
              position: "center",
              backgroundColor: "orange",
              color: "black",
              font: {
                weight: "bold",
              },
            },
          } as any,
        },
      } as any,
    },
    scales: {
      x: {
        title: { display: true, text: "Total produksjon (BOE)" },
        beginAtZero: true,
        min: 0,
        max: 30,
      },
      y: {
        title: { display: true, text: "Utslippsintensitet (kg CO₂e/BOE)" },
        beginAtZero: true,
        min: 0,
        max: 70,
      },
    },
  };

  return (
    <div>
      <label style={{ fontWeight: "bold" }}>
        Velg år: {selectedYear}
        <input
          type="range"
          min={2018}
          max={2040}
          step={1}
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          style={{ width: "100%", marginTop: 8 }}
        />
      </label>
      <Scatter options={options} data={chartData} />
    </div>
  );
}
