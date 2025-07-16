import React from "react";
import "./TopTabBar.css";

export interface TopTabBarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
  onClick: () => void;
  ariaLabel?: string;
}

export interface TopTabBarProps {
  items: TopTabBarItem[];
  className?: string;
  fixed?: boolean; // If true, sticky/fixed at bottom
  style?: React.CSSProperties;
}

const TopTabBar: React.FC<TopTabBarProps> = ({ items, className = "", fixed = true, style }) => {
  return (
    <nav
      className={`tab-bar${fixed ? " tab-bar-fixed" : ""} ${className}`.trim()}
      style={style}
      role="tablist"
      aria-label="Navigasjon"
    >
      {items.map((item) => (
        <button
          key={item.id}
          className={`tab-bar-item${item.active ? " active" : ""}`}
          onClick={item.onClick}
          aria-label={item.ariaLabel || item.label}
          aria-selected={item.active}
          role="tab"
          tabIndex={item.active ? 0 : -1}
        >
          <span className="tab-bar-icon">{item.icon}</span>
          <span className="tab-bar-label">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className="tab-bar-badge">{item.badge}</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default TopTabBar; 