// -- src/routes/$dynamic.tsx --
// Example of a TanStack router dynamic route component

import React from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/$dynamic")({
  component: RouteComponent,
});

function RouteComponent() {
  const { dynamic } = useParams({ from: "/$dynamic" });
  return (
    <>
      <p>Hello "/{dynamic}"</p>
      <p>This is a dynamic route example for dynamic: {dynamic}.</p>
    </>
  );
}
