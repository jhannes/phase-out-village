import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import React from "react";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="&.active:font-bold">
          Home
        </Link>
        <Link to="/test" className="&.active:font-bold">
          Test Page
        </Link>
      </div>
      <hr />
      <Outlet />
    </>
  ),
});
