<<<<<<< Updated upstream
import React from "react";
=======
import React from "react
>>>>>>> Stashed changes
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shop")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/shop"!</div>;
}
