import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import StatsPage from "../pages/StatsPage/StatsPage";

export const Route = createFileRoute("/stats")({
  component: RouteComponent,
});

function RouteComponent() {
  return <StatsPage />;
}
