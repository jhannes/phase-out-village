import React, { useState, useRef, useEffect } from "react";
import "./CompactMobileLayout.css";

interface Tab {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
  badge?: number;
}

interface CompactMobileLayoutProps {
  tabs: Tab[];
  defaultTab?: string;
  header?: React.ReactNode;
  statusBar?: React.ReactNode;
  floatingActions?: React.ReactNode;
}

const CompactMobileLayout: React.FC<CompactMobileLayoutProps> = ({
  tabs,
  defaultTab,
  header,
  statusBar,
  floatingActions,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | undefined>(undefined);

  // Smart header hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const currentScrollY = contentRef.current.scrollTop;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollThreshold = 50;

      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      // Hide header when scrolling down past threshold
      if (scrollingDown && currentScrollY > scrollThreshold) {
        setHeaderVisible(false);
      } else if (!scrollingDown) {
        setHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);

      // Reset scrolling state after delay
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      return () => {
        contentElement.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [lastScrollY]);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Smooth scroll to top when changing tabs
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="compact-mobile-layout">
      {/* Dynamic Header */}
      <header
        className={`compact-header ${headerVisible ? "visible" : "hidden"} ${isScrolling ? "scrolling" : ""}`}
      >
        {header && <div className="header-content">{header}</div>}

        {/* Horizontal Tab Navigation */}
        <nav className="horizontal-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
              aria-label={tab.title}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-title">{tab.title}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main ref={contentRef} className="compact-content">
        <div className="tab-content-container">
          {activeTabData && (
            <div className={`tab-content tab-${activeTab}`} key={activeTab}>
              {activeTabData.content}
            </div>
          )}
        </div>
      </main>

      {/* Status Bar */}
      {statusBar && <div className="compact-status-bar">{statusBar}</div>}

      {/* Floating Actions */}
      {floatingActions && (
        <div className="floating-actions">{floatingActions}</div>
      )}
    </div>
  );
};

export default CompactMobileLayout;
