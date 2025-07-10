import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProductionTable } from "../components/tables/productionTable";

export const Route = createFileRoute("/productiontable")({
  component: RouteComponent,
});

function RouteComponent() {
  // return <div>Hello "/productiontable"!</div>;
  return <ProductionTable />;
}
