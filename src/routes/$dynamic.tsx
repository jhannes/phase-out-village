import React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$dynamic")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$dynamic"!</div>;
}
