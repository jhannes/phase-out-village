import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import CompactMapPage from "../pages/CompactMapPage/CompactMapPage";

export const Route = createFileRoute("/phase-out-game")({
  component: RouteComponent,
});

function RouteComponent() {
  // return <PhaseOutMapPage />;
  return <CompactMapPage />;
}
