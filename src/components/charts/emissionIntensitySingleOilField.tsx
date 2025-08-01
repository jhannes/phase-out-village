import React from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import annotationPlugin, { AnnotationOptions } from "chartjs-plugin-annotation";

ChartJS.register(
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  annotationPlugin,
);

type DataPoint = {
  productionOil?: number | null;
  productionGas?: number | null;
  emission?: number | null;
  emissionIntensity?: number | null;
};

type Props = {
  dataPoint: DataPoint;
};

export function EmissionIntensityChartSingleField({ dataPoint }: Props) {
  const totalProduction =
    (dataPoint.productionOil ?? 0) + (dataPoint.productionGas ?? 0);
  const emissionIntensity = dataPoint.emissionIntensity ?? 0;

  const data = {
    datasets: [
      {
        label: "Oljefelt",
        data: [{ x: totalProduction, y: emissionIntensity }],
        backgroundColor: "#3b82f6",
        pointRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Utslippsintensitet mot total produksjon",
      },
      legend: {
        display: false,
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
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Total produksjon (olje + gass)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Utslippsintensitet",
        },
      },
    },
  };

  return <Scatter data={data} options={options} />;
}
