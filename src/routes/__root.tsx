import {
  createRootRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import "./RootLayout.css";
import {
  GameStateProvider,
  useGameStats,
  useGameState,
} from "../context/GameStateContext";

// Mobile Navigation Component
const MobileNavigation: React.FC<{ currentPath: string }> = ({
  currentPath,
}) => {
  // Use try-catch to handle context not being available
  let gameStats;
  let dispatch;
  try {
    gameStats = useGameStats();
    const { dispatch: gameDispatch } = useGameState();
    dispatch = gameDispatch;
  } catch {
    // Fallback values when context is not available
    gameStats = {
      totalBudgetSpent: 0,
      fieldsRemaining: 50,
      selectedFieldsCount: 0,
      totalEmissionsReduced: 0,
    };
    dispatch = () => {};
  }

  const navItems = [
    {
      id: "game",
      icon: "🎮",
      label: "Spill",
      path: "/phase-out-game",
      active: currentPath === "/phase-out-game",
    },
    {
      id: "investments",
      icon: "💰",
      label: "Investering",
      path: "/investments",
      active: currentPath === "/investments",
    },
    {
      id: "stats",
      icon: "📊",
      label: "Statistikk",
      path: "/stats",
      active: currentPath === "/stats",
    },
    // {
    //   id: "table",
    //   icon: "📋",
    //   label: "Data",
    //   path: "/productiontable",
    //   active: currentPath === "/productiontable",
    // },

    {
      id: "about",
      icon: "ℹ️",
      label: "Om",
      path: "/about",
      active: currentPath === "/about",
    },
  ];

  const handleRestart = () => {
    if (
      window.confirm(
        "Er du sikker på at du vil starte spillet på nytt? All fremgang vil gå tapt.",
      )
    ) {
      localStorage.removeItem("phaseOutVillage_gameState");
      dispatch({ type: "RESTART_GAME" });
    }
  };

  return (
    <>
      {/* Game Status Bar - Always visible on mobile */}
      <div className="mobile-status-bar">
        <div className="status-item">
          <span className="status-icon">💰</span>
          <span className="status-value">
            {((100000000 - gameStats.totalBudgetSpent) / 1000000).toFixed(1)}M
            kr
          </span>
        </div>
        <div className="status-item">
          <span className="status-icon">🛢️</span>
          <span className="status-value">{gameStats.fieldsRemaining}</span>
        </div>
        <div className="status-item">
          <span className="status-icon">🌱</span>
          <span className="status-value">{gameStats.selectedFieldsCount}</span>
        </div>
        <div className="status-item">
          <span className="status-icon">💨</span>
          <span className="status-value">
            {gameStats.totalEmissionsReduced.toFixed(1)}Mt
          </span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`nav-item ${item.active ? "active" : ""}`}
          >
            <div className="nav-icon-container">
              <span className="nav-icon">{item.icon}</span>
            </div>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
        {/* Restart button */}
        <div className="mobile-restart-container">
          <button
            onClick={handleRestart}
            className="mobile-restart-button"
            title="Start på nytt"
          >
            🔄
          </button>
        </div>
      </nav>
    </>
  );
};

// Desktop Navigation Component
const DesktopNavigation: React.FC<{ currentPath: string }> = ({
  currentPath,
}) => {
  // Use try-catch to handle context not being available
  let dispatch;
  try {
    const { dispatch: gameDispatch } = useGameState();
    dispatch = gameDispatch;
  } catch {
    dispatch = () => {};
  }

  const navItems = [
    { label: "Hjem", path: "/" },
    { label: "Spill", path: "/phase-out-game" },
    { label: "Investeringer", path: "/investments" },
    { label: "Statistikk", path: "/stats" },
    // { label: "Produksjonstabell", path: "/productiontable" },
    { label: "Om", path: "/about" },
  ];

  const handleRestart = () => {
    if (
      window.confirm(
        "Er du sikker på at du vil starte spillet på nytt? All fremgang vil gå tapt.",
      )
    ) {
      localStorage.removeItem("phaseOutVillage_gameState");
      dispatch({ type: "RESTART_GAME" });
    }
  };

  return (
    <nav className="desktop-nav">
      <div className="desktop-nav-content">
        <div className="nav-brand">
          <span className="brand-icon">🛢️</span>
          <span className="brand-text">Phase Out Village</span>
        </div>

        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${currentPath === item.path ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleRestart}
            className="desktop-restart-button"
            title="Start på nytt"
          >
            🔄 Start på nytt
          </button>
        </div>
      </div>
    </nav>
  );
};

// Root Layout Component
const RootLayout: React.FC = () => {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/desktop
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <div className="root-layout">
      {/* Desktop Navigation */}
      {!isMobile && <DesktopNavigation currentPath={currentPath} />}

      {/* Main Content */}
      <main className={`main-content ${isMobile ? "mobile" : "desktop"}`}>
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation currentPath={currentPath} />}
    </div>
  );
};

// Wrapper component that provides game state context
const RootLayoutWithContext: React.FC = () => {
  return (
    <GameStateProvider>
      <RootLayout />
    </GameStateProvider>
  );
};

export const Route = createRootRoute({
  component: RootLayoutWithContext,
});
