import React from "react";
import { PriceControlsProps } from "../../types/interface";

const baseOil = 80;
const baseGas = 50;

export function PriceControls({
  price,
  setPrice,
  onPriceUpdate,
}: PriceControlsProps) {
  const handleOilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice((prev) => ({ ...prev, oil: parseFloat(e.target.value) }));
  };

  const handleGasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice((prev) => ({ ...prev, gas: parseFloat(e.target.value) }));
  };

  return (
    <div className="price-controls">
      <div className="slider-group">
        <label>Oljepris: {price.oil.toFixed(2)} USD</label>
        <input
          type="range"
          min={baseOil * 0.9}
          max={baseOil * 1.1}
          step={0.1}
          value={price.oil}
          onChange={handleOilChange}
          onMouseUp={onPriceUpdate}
          onTouchEnd={onPriceUpdate}
        />
      </div>

      <div className="slider-group">
        <label>Gasspris: {price.gas.toFixed(2)} USD</label>
        <input
          type="range"
          min={baseGas * 0.9}
          max={baseGas * 1.1}
          step={0.1}
          value={price.gas}
          onChange={handleGasChange}
          onMouseUp={onPriceUpdate}
          onTouchEnd={onPriceUpdate}
        />
      </div>
    </div>
  );
}
