import React from "react";
import "./BottomNavBar.css";

export interface BottomNavBarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
  onClick: () => void;
  ariaLabel?: string;
}

export interface BottomNavBarProps {
  items: BottomNavBarItem[];
  className?: string;
  style?: React.CSSProperties;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  items,
  className = "",
  style,
}) => {
  return (
    <nav
      className={`bottom-nav-bar ${className}`.trim()}
      style={style}
      role="tablist"
      aria-label="Hovednavigasjon"
    >
      {items.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-bar-item${item.active ? " active" : ""}`}
          onClick={item.onClick}
          aria-label={item.ariaLabel || item.label}
          aria-selected={item.active}
          role="tab"
          tabIndex={item.active ? 0 : -1}
        >
          <span className="bottom-nav-bar-icon">{item.icon}</span>
          <span className="bottom-nav-bar-label">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className="bottom-nav-bar-badge">{item.badge}</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNavBar;
