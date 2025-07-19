import { Link, Outlet } from "@tanstack/react-router";
import React from "react";

export function Application() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> |<Link to="/map">Map</Link>
      </nav>
      <Outlet />
    </div>
  );
}
