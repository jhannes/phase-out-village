import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";

import "./application.css";
import { ProductionTable } from "./components/tables/productionTable";
import { OilFieldMap } from "./components/map/oilFieldMap";
import { useState } from "react";
import { data } from "./generated/data";
import { PriceControls } from "./components/sliders/priceControlSliders";
import { YearlyIncome } from "./types/interface";
import {
  calculateTotalYearlyIncome,
  generateCompleteData,
} from "./utils/projections";
import { IncomeChart } from "./components/charts/yearlyIncomeChart";

function MainApp() {
  const [price, setPrice] = useState({ oil: 80, gas: 50 });
  const [incomeByYear, setIncomeByYear] = useState<YearlyIncome[]>([]);

  const fullData = generateCompleteData(data);

  const handlePriceUpdate = () => {
    const income = calculateTotalYearlyIncome(fullData, price.oil, price.gas);
    setIncomeByYear(income);
  };

  useEffect(() => {
    handlePriceUpdate();
  }, []);

  return (
    <div>
      <h1>Chill, baby! Chill!</h1>
      <OilFieldMap />
      <div>
        <h1>Inntektsberegning</h1>
        <PriceControls
          price={price}
          setPrice={setPrice}
          onPriceUpdate={handlePriceUpdate}
        />
        <div className="income-display">
          <ul>
            <h3>Total inntekt</h3>
            {incomeByYear.map(({ year, totalIncome }) => (
              <li key={year}>
                {year}: ${totalIncome.toLocaleString("en-US")}
              </li>
            ))}
          </ul>
          <IncomeChart data={incomeByYear} />
        </div>
      </div>
      <ProductionTable />
    </div>
  );
}

createRoot(document.getElementById("app")!).render(<MainApp />);
