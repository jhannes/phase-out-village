import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import MapPage from "../pages/MapPage/MapPage";

export const Route = createFileRoute("/phase-out-game")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MapPage />;
}
