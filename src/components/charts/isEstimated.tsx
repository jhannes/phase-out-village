export function isEstimated(point: object | (object & { raw: unknown })) {
  return (
    ("raw" in point &&
      typeof point.raw === "object" &&
      "estimate" in point.raw! &&
      point.raw.estimate) ||
    ("raw" in point && Array.isArray(point.raw) && point.raw[2])
  );
}
