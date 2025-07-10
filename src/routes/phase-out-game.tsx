import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import PhaseOutMapPage from "../pages/MapPage/MapPage";

export const Route = createFileRoute("/phase-out-game")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PhaseOutMapPage />;
}
