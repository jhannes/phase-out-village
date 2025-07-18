// Safe math utilities to prevent NaN and Infinity values

export function safeAdd(a: number, b: number): number {
  const result = a + b;
  return isFinite(result) ? result : 0;
}

export function safeSubtract(a: number, b: number): number {
  const result = a - b;
  return isFinite(result) ? result : 0;
}

export function safeMultiply(a: number, b: number): number {
  const result = a * b;
  return isFinite(result) ? result : 0;
}

export function safeDivide(a: number, b: number): number {
  if (b === 0) return 0;
  const result = a / b;
  return isFinite(result) ? result : 0;
}

export function safeRound(value: number, decimals: number = 0): number {
  if (!isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function clamp(value: number, min: number, max: number): number {
  if (!isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function safePercentage(value: number, total: number): number {
  if (total === 0 || !isFinite(value) || !isFinite(total)) return 0;
  return clamp((value / total) * 100, 0, 100);
}

export function safeAverage(values: number[]): number {
  if (!values.length) return 0;
  const validValues = values.filter((v) => isFinite(v));
  if (!validValues.length) return 0;
  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
}

export function safeSum(values: number[]): number {
  return values.reduce((sum, val) => safeAdd(sum, val), 0);
}

export function safeMax(values: number[]): number {
  if (!values.length) return 0;
  const validValues = values.filter((v) => isFinite(v));
  return validValues.length ? Math.max(...validValues) : 0;
}

export function safeMin(values: number[]): number {
  if (!values.length) return 0;
  const validValues = values.filter((v) => isFinite(v));
  return validValues.length ? Math.min(...validValues) : 0;
}
