import React from "react";
import "./BottomNavBar.css";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
  active?: boolean;
  onClick: () => void;
}

interface BottomNavBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  gameState?: {
    budget: number;
    totalEmissions: number;
    fieldsRemaining: number;
    selectedFields: string[];
  };
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeView,
  onViewChange,
  gameState,
}) => {
  const navItems: NavItem[] = [
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

  return (
    <>
      {/* Game Status Bar - Above bottom nav */}
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

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${item.active ? "active" : ""}`}
            onClick={item.onClick}
            aria-label={item.label}
          >
            <div className="nav-icon-container">
              <span className="nav-icon">{item.icon}</span>
              {item.badge && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default BottomNavBar;
