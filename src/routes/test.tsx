import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import TestPage from "../pages/TestPage/TestPage";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
});

function RouteComponent() {
  // return <div>Hello "/test"!</div>;
  return <TestPage />;
}
