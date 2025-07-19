import React from "react";
import { createRoot } from "react-dom/client";

import "./application.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree";

const basepath = "/phase-out-village";

function Application() {
  return <RouterProvider router={createRouter({ routeTree, basepath })} />;
}

createRoot(document.getElementById("app")!).render(<Application />);

if (window.location.search === "?debug") {
  localStorage.setItem("debug", "true");
  window.location.search = "";
}
