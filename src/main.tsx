import React, { useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";

import "./application.css";
import { ProductionTable } from "./components/tables/productionTable";
import { OilFieldMap } from "./components/map/oilFieldMap";
import { useState } from "react";
import { data } from "./generated/data";
import { PriceControls } from "./components/sliders/priceControlSliders";
import { YearlyEmission, YearlyIncome } from "./types/interface";
import {
  calculateTotalYearlyEmission,
  calculateTotalYearlyIncome,
  generateCompleteData,
} from "./utils/projections";
import { IncomeChart } from "./components/charts/yearlyIncomeChart";
import { ShutdownMap } from "./types/types";
import { ShutdownControls } from "./components/controls/shutdownControls";
import { YearlyIncomeList } from "./components/lists/yearlyIncomeList";
import { YearlyEmissionChart } from "./components/charts/yearlyEmissionChart";

function MainApp() {
  const [price, setPrice] = useState({ oil: 80, gas: 50 });
  const [incomeByYear, setIncomeByYear] = useState<YearlyIncome[]>([]);
  const [shutdowns, setShutdowns] = useState<ShutdownMap>({});
  const [emission, setEmission] = useState<YearlyEmission[]>([]);

  const fullData = useMemo(() => generateCompleteData(data), [data]);

  const handlePriceUpdate = () => {
    const income = calculateTotalYearlyIncome(
      fullData,
      price.oil,
      price.gas,
      shutdowns,
    );
    setIncomeByYear(income);
  };

  function handleShutdownChange(fieldName: string, year: number) {
    setShutdowns((prev) => {
      const updated = { ...prev, [fieldName]: year };
      const income = calculateTotalYearlyIncome(
        fullData,
        price.oil,
        price.gas,
        updated,
      );
      const newEmission = calculateTotalYearlyEmission(fullData, updated);
      setIncomeByYear(income);
      setEmission(newEmission);
      console.log(newEmission);
      return updated;
    });
  }

  useEffect(() => {
    handlePriceUpdate();
    setEmission(calculateTotalYearlyEmission(fullData, shutdowns));
  }, []);

  return (
    <div>
      <h1>Chill, baby! Chill!</h1>
      <OilFieldMap />
      <div>
        <h2>Inntektsberegning</h2>
        <PriceControls
          price={price}
          setPrice={setPrice}
          onPriceUpdate={handlePriceUpdate}
        />
        <div className="income-display">
          <ShutdownControls
            data={fullData}
            shutdowns={shutdowns}
            onShutdownChange={handleShutdownChange}
          />
          {/*<IncomeChart data={incomeByYear} />*/}
          {/*<YearlyIncomeList data={incomeByYear} /> */}
          <YearlyEmissionChart data={emission} />
        </div>
      </div>
      <ProductionTable />
    </div>
  );
}

createRoot(document.getElementById("app")!).render(<MainApp />);
