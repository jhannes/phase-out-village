import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import DemoPage from "../pages/DemoPage/DemoPage";

export const Route = createFileRoute("/demo")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DemoPage />;
}
