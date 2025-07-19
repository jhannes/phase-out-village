import { Link, Outlet } from "@tanstack/react-router";
import React, { useState } from "react";

export function Application() {
  const [year, setYear] = useState(2025);

  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/map">Map</Link>
        <Link to="/emissions">Utslipp</Link>
        <Link to="/production">Produksjon</Link>
      </nav>
      <header>
        <div>
          År: {year}
          <div>
            <button onClick={() => setYear((y) => y + 1)}>Neste</button>
          </div>
        </div>
        <div>Oljefelter avviklet: 0</div>
        <div>Utslipp til 2040: 200 (0% redusjon)</div>
        <div>Produksjon til 2040: 200 (0% redusjon)</div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
