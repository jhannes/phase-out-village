import React, { useState, useEffect } from "react";
import BottomNavBar, { BottomNavBarItem } from "../Navigation/BottomNavBar";
import "./MobileGameLayout.css";

interface MobileGameLayoutProps {
  children: React.ReactNode;
  gameState: {
    budget: number;
    totalEmissions: number;
    fieldsRemaining: number;
    selectedFields: string[];
  };
  currentView?: string;
  onViewChange?: (view: string) => void;
}

const navItemsConfig = (
  activeView: string,
  onViewChange: (view: string) => void
): BottomNavBarItem[] => [
  {
    id: "map",
    icon: "🗺️",
    label: "Kart",
    active: activeView === "map",
    onClick: () => onViewChange("map"),
  },
  {
    id: "stats",
    icon: "📊",
    label: "Statistikk",
    active: activeView === "stats",
    onClick: () => onViewChange("stats"),
  },
  {
    id: "budget",
    icon: "💰",
    label: "Budsjett",
    active: activeView === "budget",
    onClick: () => onViewChange("budget"),
  },
  {
    id: "achievements",
    icon: "🏆",
    label: "Prestasjon",
    active: activeView === "achievements",
    onClick: () => onViewChange("achievements"),
  },
  {
    id: "settings",
    icon: "⚙️",
    label: "Innstillinger",
    active: activeView === "settings",
    onClick: () => onViewChange("settings"),
  },
];

const MobileGameLayout: React.FC<MobileGameLayoutProps> = ({
  children,
  gameState,
  currentView = "map",
  onViewChange,
}) => {
  const [activeView, setActiveView] = useState(currentView);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle view changes
  const handleViewChange = (view: string) => {
    setActiveView(view);
    onViewChange?.(view);
  };

  // Track scroll for dynamic UI
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when modal is open (for mobile optimization)
  useEffect(() => {
    const body = document.body;
    const scrollY = window.scrollY;

    if (activeView === "modal") {
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
    } else {
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    }

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
    };
  }, [activeView]);

  return (
    <div className="mobile-game-layout">
      {/* Header - compact for mobile */}
      <header className={`game-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="header-content">
          <h1 className="game-title">
            <span className="title-icon">🛢️</span>
            Phase Out Village
          </h1>

          {/* Quick actions for current view */}
          <div className="header-actions">
            {activeView === "map" && gameState.selectedFields.length > 0 && (
              <button className="quick-action-btn phase-out-btn">
                <span>🌱</span>
                Fase ut ({gameState.selectedFields.length})
              </button>
            )}

            {activeView === "stats" && (
              <button className="quick-action-btn refresh-btn">
                <span>🔄</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="game-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.max(0, 100 - (gameState.fieldsRemaining / 50) * 100)}%`,
              }}
            />
          </div>
          <span className="progress-text">
            {50 - gameState.fieldsRemaining} / 50 felt faset ut
          </span>
        </div>
      </header>

      {/* Main content area */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* View-specific content */}
          <div className={`view-container view-${activeView}`}>{children}</div>

          {/* Floating Action Button for primary action */}
          {activeView === "map" && (
            <button className="fab primary-fab">
              <span className="fab-icon">🎯</span>
              <span className="fab-label">Multi-utfasing</span>
            </button>
          )}
        </div>
      </main>

      {/* Game Status Bar - Above nav bar */}
      <div className="game-status-bar">
        <div className="status-item">
          <span className="status-icon">💰</span>
          <span className="status-value">
            {gameState?.budget
              ? `${(gameState.budget / 1000000).toFixed(1)}M kr`
              : "0M kr"}
          </span>
        </div>
        <div className="status-item">
          <span className="status-icon">🛢️</span>
          <span className="status-value">
            {gameState?.fieldsRemaining || 0}
          </span>
        </div>
        <div className="status-item">
          <span className="status-icon">🌱</span>
          <span className="status-value">
            {gameState?.selectedFields?.length || 0}
          </span>
        </div>
        <div className="status-item">
          <span className="status-icon">💨</span>
          <span className="status-value">
            {gameState?.totalEmissions
              ? `${(gameState.totalEmissions / 1000000).toFixed(1)}Mt`
              : "0Mt"}
          </span>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        items={navItemsConfig(activeView, handleViewChange)}
      />
    </div>
  );
};

export default MobileGameLayout;
