import React, { useState, useRef, useEffect } from "react";
import TopTabBar, { TopTabBarItem } from "../Navigation/TopTabBar";
import "./CompactMobileLayout.css";

interface Tab {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
  badge?: number;
}

interface MobileTabsLayoutProps {
  tabs: Tab[];
  defaultTab?: string;
  header?: React.ReactNode;
  floatingActions?: React.ReactNode;
}

const MobileTabsLayout: React.FC<MobileTabsLayoutProps> = ({
  tabs,
  defaultTab,
  header,
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
          scrollTimeoutRef.current = undefined;
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

  // Convert tabs to TopTabBarItem[]
  const tabBarItems: TopTabBarItem[] = tabs.map((tab) => ({
    id: tab.id,
    icon: tab.icon,
    label: tab.title,
    badge: tab.badge,
    active: activeTab === tab.id,
    onClick: () => handleTabChange(tab.id),
    ariaLabel: tab.title,
  }));

  return (
    <div className="mobile-tabs-layout">
      {/* Dynamic Header */}
      <header
        className={`mobile-tabs-header ${headerVisible ? "visible" : "hidden"} ${isScrolling ? "scrolling" : ""}`}
      >
        {header && <div className="header-content">{header}</div>}
        {/* Horizontal TopTabBar Navigation */}
        <TopTabBar
          items={tabBarItems}
          fixed={false}
          className="mobile-tabs-bar"
        />
      </header>

      {/* Main Content Area */}
      <main ref={contentRef} className="mobile-tabs-content">
        <div className="tab-content-container">
          {activeTabData && (
            <div className={`tab-content tab-${activeTab}`} key={activeTab}>
              {activeTabData.content}
            </div>
          )}
        </div>
      </main>

      {/* Floating Actions */}
      {floatingActions && (
        <div className="floating-actions">{floatingActions}</div>
      )}
    </div>
  );
};

export default MobileTabsLayout;
