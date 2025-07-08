import React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shop")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/shop"!</div>;
}
