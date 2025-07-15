import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import CompactStatsPage from "../pages/StatsPage/CompactStatsPage";

export const Route = createFileRoute("/stats")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CompactStatsPage />;
}
