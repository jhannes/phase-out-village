import React, { useEffect, useState } from "react";
import "./PageTransition.css";

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
  direction?: "slide" | "fade" | "scale";
  duration?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionKey,
  direction = "fade",
  duration = 300,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentKey, setCurrentKey] = useState(transitionKey);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  useEffect(() => {
    if (transitionKey !== currentKey) {
      setPendingKey(transitionKey);
      setIsVisible(false);
    }
  }, [transitionKey, currentKey]);

  useEffect(() => {
    if (!isVisible && pendingKey) {
      const timer = setTimeout(() => {
        setCurrentKey(pendingKey);
        setPendingKey(null);
        setIsVisible(true);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, pendingKey, duration]);

  return (
    <div
      className={`page-transition page-transition-${direction} ${
        isVisible ? "visible" : "hidden"
      }`}
      style={{
        "--transition-duration": `${duration}ms`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

export default PageTransition;
