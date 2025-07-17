import React from "react";
import { YearlyIncome } from "../../types/interface";

interface IncomeListProps {
  data: YearlyIncome[];
}

export function YearlyIncomeList({ data }: IncomeListProps) {
  // if no filtering of data is wanted, remove this line
  const filtered = data.filter(({ year }) => Number(year) >= 2015);
  return (
    <ul>
      <h3>Total inntekt</h3>
      {/*data.map instead of filtered.map*/}
      {filtered.map(({ year, totalIncome }) => (
        <li key={year}>
          {year}: ${totalIncome.toLocaleString("en-US")}
        </li>
      ))}
    </ul>
  );
}
