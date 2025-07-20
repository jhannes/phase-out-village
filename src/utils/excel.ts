import { OilFieldDataset } from "../types/types";
import * as XLSX from "xlsx";

export function exportDataSet(data: OilFieldDataset) {
  const rows = Object.entries(data).flatMap(([fieldName, yearlyData]) =>
    Object.entries(yearlyData).map(([year, values]) => ({
      fieldName,
      year,
      productionOil: values.productionOil ?? null,
      productionGas: values.productionGas ?? null,
      emission: values.emission ?? null,
      emissionIntensity: values.emissionIntensity ?? null,
    })),
  );

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "OilFieldData");

  XLSX.writeFile(workbook, "oil-field-data.xlsx");
}
