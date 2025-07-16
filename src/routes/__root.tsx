import {
  createRootRoute,
  Link,
  Outlet,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import "./RootLayout.css";
import {
  GameStateProvider,
  useGameStats,
  useGameState,
} from "../context/GameStateContext";
import BottomNavBar from "../components/Navigation/BottomNavBar";
import MobileStatusBar from "../components/Navigation/MobileStatusBar";
import DesktopStatusBar from "../components/Navigation/DesktopStatusBar";

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
              className={`nav-link${currentPath === item.path ? " active" : ""}`}
              // No onClick or preventDefault, let router handle navigation
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
  const { dispatch } = useGameState();
  const navigate = useNavigate();

  // Detect mobile/desktop
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // BottomNavBar items for mobile
  const mobileNavItems = [
    {
      id: "game",
      icon: "🎮",
      label: "Spill",
      active: currentPath === "/phase-out-game",
      onClick: () => navigate({ to: "/phase-out-game" }),
    },
    {
      id: "investments",
      icon: "💰",
      label: "Investering",
      active: currentPath === "/investments",
      onClick: () => navigate({ to: "/investments" }),
    },
    {
      id: "stats",
      icon: "📊",
      label: "Statistikk",
      active: currentPath === "/stats",
      onClick: () => navigate({ to: "/stats" }),
    },
    {
      id: "about",
      icon: "ℹ️",
      label: "Om",
      active: currentPath === "/about",
      onClick: () => navigate({ to: "/about" }),
    },
    {
      id: "restart",
      icon: "🔄",
      label: "Start på nytt",
      active: false,
      onClick: () => {
        if (
          window.confirm(
            "Er du sikker på at du vil starte spillet på nytt? All fremgang vil gå tapt.",
          )
        ) {
          localStorage.removeItem("phaseOutVillage_gameState");
          dispatch({ type: "RESTART_GAME" });
        }
      },
      ariaLabel: "Start på nytt",
    },
  ];

  return (
    <div className="root-layout">
      {/* Desktop Navigation */}
      {!isMobile && <DesktopNavigation currentPath={currentPath} />}

      {/* Desktop Status Bar */}
      {!isMobile && <DesktopStatusBar />}

      {/* Main Content */}
      <main className={`main-content ${isMobile ? "mobile" : "desktop"}`}>
        <Outlet />
      </main>

      {/* Mobile Status Bar */}
      {isMobile && <MobileStatusBar />}

      {/* Mobile Navigation */}
      {isMobile && <BottomNavBar items={mobileNavItems} />}
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
