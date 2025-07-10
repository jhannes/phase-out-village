import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import React from "react";

export const Route = createRootRoute({
  component: () => (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          padding: 20,
        }}
      >
        {/* TODO: Add the others pages/components over to the TanStack-router */}
        {/* TODO: Add my game components and logic from chakra-ui over to TanStack-router */}
        {/* TODO: Move the "navbar" over to a bottom bar for mobile view and maybe a side-bar for the desktop view? */}
        <Link to="/" className="&.active:font-bold">
          Home
        </Link>
        <Link to="/phase-out-game" className="&.active:font-bold">
          Phase Out Game
        </Link>
        <Link to="/test" className="&.active:font-bold">
          Test Page
        </Link>
        <Link to="/productiontable" className="&.active:font-bold">
          Production Table
        </Link>
        {/* Example of a TanStack Router dynamic route: */}
        <Link to="/$dynamic" className="&.active:font-bold" params={{ dynamic: "001" }}>
          Dynamic
        </Link>
      </div>
      <hr />
      <Outlet />
    </>
  ),
});
