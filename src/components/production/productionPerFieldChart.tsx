import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import {
  CategoryScale,
  Chart,
  Chart as ChartJS,
  Legend,
  LegendItem,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { ApplicationContext } from "../../applicationContext";
import { OilfieldName } from "../../data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Year = `19${Digit}${Digit}` | `20${Digit}${Digit}`;

function measuredOilProduction(
  data: Record<Year, { productionOil?: number }>,
): Partial<Record<Year, { value: number }>> {
  const result: Partial<Record<Year, { value: number }>> = {};
  for (let y = 1990; y < 2040; y++) {
    const year = y.toString() as Year;
    const { productionOil } = data[year] || {};
    if (productionOil) result[year] = { value: productionOil };
  }
  return result;
}

const allYears = Array.from({ length: 200 }, (_, i) =>
  String(1900 + i),
) as Year[];

function estimatedOilProduction(
  data: Record<Year, { productionOil?: number }>,
): Partial<Record<Year, { value: number; estimate: true; average: number }>> {
  const values = (
    allYears.toReversed().map((y) => [y, data[y]?.productionOil]) as [
      Year,
      number?,
    ][]
  )
    .filter(([_, v]) => v && v > 0)
    .slice(0, 5) as [Year, number][];
  if (values.length == 0) return {};
  const sum = values.map(([_, v]) => v).reduce((a, b) => a + b, 0);
  const average = sum / values.length;

  const result: Partial<
    Record<Year, { value: number; estimate: true; average: number }>
  > = {};
  let current = average;
  for (let y = parseInt(values[0][0]) + 1; y < 2040; y++) {
    current *= 0.9;
    result[y.toString() as Year] = {
      value: current,
      estimate: true,
      average,
    };
  }
  return result;
}

function isEstimated(point: object | (object & { raw: unknown })) {
  return (
    "raw" in point &&
    typeof point.raw === "object" &&
    "estimate" in point.raw! &&
    point.raw.estimate
  );
}

function focusOnClicked(
  legendItem: LegendItem,
  chart: Chart<"line">,
  setVisibleField: Dispatch<SetStateAction<string | undefined>>,
) {
  const index = legendItem.datasetIndex!;
  const allVisible = chart.data.datasets.every(
    (_, i) => !chart.getDatasetMeta(i).hidden,
  );
  if (allVisible || chart.getDatasetMeta(index).hidden) {
    chart.data.datasets.forEach((_, i) => {
      chart.getDatasetMeta(i).hidden = i !== index;
    });
    setVisibleField(legendItem.text);
  } else {
    chart.data.datasets.forEach((d, i) => {
      chart.getDatasetMeta(i).hidden = false;
    });
    setVisibleField(undefined);
  }
  chart.update();
}

function ProductionTable({
  field,
  dataseries,
}: {
  field: string;
  dataseries: Partial<
    Record<
      Year,
      {
        value: number;
        estimate?: boolean;
        average?: number;
      }
    >
  >;
}) {
  return (
    <>
      <p>Produksjon for {field}</p>
      <table>
        <thead>
          <tr>
            <th>År</th>
            <th>Produksjon</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(dataseries).map(([year, value]) => (
            <tr>
              <td>{year}</td>
              <td className={value.estimate ? "projected" : ""}>
                {value.value.toFixed(2)}
              </td>
              <td>{value.average}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function ProductionPerFieldChart() {
  const [visibleField, setVisibleField] = useState<string | undefined>();

  const { data } = useContext(ApplicationContext);
  const dataSeries: Record<
    OilfieldName,
    Partial<Record<Year, { value: number; estimate?: boolean }>>
  > = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      {
        ...estimatedOilProduction(value),
        ...measuredOilProduction(value),
      },
    ]),
  );

  const values = (
    allYears.toReversed().map((y) => [y, data["Troll"]![y]?.productionOil]) as [
      Year,
      number?,
    ][]
  )
    .filter(([_, v]) => v && v > 0)
    .slice(0, 5) as [Year, number][];

  console.log(values);

  const datasets = Object.entries(
    Object.fromEntries(
      Object.entries(dataSeries).map(([key, value]) => [
        key,
        Object.entries(value).map(([year, { value, estimate }]) => ({
          x: year,
          y: value,
          estimate,
        })),
      ]),
    ),
  );
  return (
    <>
      <Line
        options={{
          responsive: true,
          plugins: {
            title: { display: true, text: "Produksjon per oljefelt" },
            legend: {
              position: "top",
              onClick: (_, legendItem, { chart }) =>
                focusOnClicked(legendItem, chart, setVisibleField),
            },
            tooltip: {
              callbacks: {
                title: (context) => `${context[0].parsed.x}`,
                label: (context) => {
                  const {
                    dataset: { label },
                    parsed,
                  } = context;
                  const type = isEstimated(context) ? "Estimert" : "Målt";
                  return `${label} – ${parsed.x}: ${parsed.y} BOE (${type})`;
                },
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: "År" },
              type: "linear" as const,
              min: 2000,
              max: 2040,
              ticks: {
                stepSize: 1,
                callback: (value: number | string) => `${value}`,
              },
            },
            y: {
              title: { display: true, text: "Produksjon (BOE)" },
              beginAtZero: true,
            },
          },
        }}
        data={{
          datasets: datasets.map(([label, data]) => ({
            label,
            data,
            hidden: !!visibleField && label !== visibleField,
            borderColor: colorFromLabel(label),
            backgroundColor: colorFromLabel(label),
            tension: 0.3,
            spanGaps: true,
            segment: {
              borderDash: (ctx) => (isEstimated(ctx.p1) ? [5, 5] : undefined),
            },
            pointStyle: (ctx) => (isEstimated(ctx) ? "star" : "circle"),
            pointRadius: (ctx) => (isEstimated(ctx) ? 5 : 4),
            pointBackgroundColor: (_) => colorFromLabel(label),
          })),
        }}
      />
      {visibleField && (
        <ProductionTable
          field={visibleField}
          dataseries={dataSeries[visibleField]}
        />
      )}
    </>
  );
}

function colorFromLabel(label: string): string {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use hash to get hue (0–360), keep saturation and lightness constant
  const hue = Math.abs(hash) % 360;
  const saturation = 65; // %
  const lightness = 50; // %

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
