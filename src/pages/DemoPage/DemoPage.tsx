import React, { useState } from "react";
import "./DemoPage.css";
import PageTransition from "../../components/Transitions/PageTransition";

interface DemoPageProps {}

const DemoPage: React.FC<DemoPageProps> = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>("overview");

  const demos = [
    {
      id: "overview",
      title: "📱 Mobile-First Overview",
      description: "Se hvordan appen er optimalisert for mobile enheter",
      content: (
        <div className="demo-content">
          <h3>🎯 Hovedfunksjoner</h3>
          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">🗺️</span>
              <h4>Interaktivt kart</h4>
              <p>Touch-optimalisert kart med zoom og pan gestures</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h4>Live statistikk</h4>
              <p>Sanntidsoppdatering av spillets fremgang</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <h4>Budsjetttyring</h4>
              <p>Smart økonomistyring med visuell feedback</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🏆</span>
              <h4>Prestasjonssystem</h4>
              <p>Gamification med badges og belønninger</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "navigation",
      title: "🧭 Navigation System",
      description: "Bottom navigation med status bar",
      content: (
        <div className="demo-content">
          <h3>📱 Mobile Navigation</h3>
          <div className="nav-demo">
            <div className="phone-mockup">
              <div className="phone-content">
                <div className="demo-header">
                  <h4>🛢️ Phase Out Village</h4>
                  <button className="demo-btn">🎯 Multi-utfasing</button>
                </div>
                <div className="demo-main">
                  <p>Hovedinnhold vises her...</p>
                  <div className="demo-cards">
                    <div className="demo-card">📊 Statistikk</div>
                    <div className="demo-card">💰 Budsjett</div>
                    <div className="demo-card">🌱 Fremgang</div>
                  </div>
                </div>
                <div className="demo-status-bar">
                  <div className="status-item">
                    <span>💰</span>
                    <span>50.2 mrd NOK</span>
                  </div>
                  <div className="status-item">
                    <span>🛢️</span>
                    <span>42</span>
                  </div>
                  <div className="status-item">
                    <span>🌱</span>
                    <span>3</span>
                  </div>
                  <div className="status-item">
                    <span>💨</span>
                    <span>12.5Mt</span>
                  </div>
                </div>
                <div className="demo-bottom-nav">
                  <div className="nav-item active">
                    <span>🗺️</span>
                    <span>Kart</span>
                  </div>
                  <div className="nav-item">
                    <span>📊</span>
                    <span>Statistikk</span>
                  </div>
                  <div className="nav-item">
                    <span>💰</span>
                    <span>Budsjett</span>
                  </div>
                  <div className="nav-item">
                    <span>🏆</span>
                    <span>Prestasjon</span>
                  </div>
                  <div className="nav-item">
                    <span>⚙️</span>
                    <span>Innstillinger</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "responsive",
      title: "📱 Responsive Design",
      description: "Tilpasning til forskjellige skjermstørrelser",
      content: (
        <div className="demo-content">
          <h3>📏 Responsive Breakpoints</h3>
          <div className="responsive-demo">
            <div className="device-showcase">
              <div className="device mobile">
                <div className="device-header">📱 Mobile (&lt; 768px)</div>
                <div className="device-content">
                  <div className="mobile-layout">
                    <div className="mobile-header">Header</div>
                    <div className="mobile-main">Main Content</div>
                    <div className="mobile-status">Status Bar</div>
                    <div className="mobile-nav">Bottom Nav</div>
                  </div>
                </div>
              </div>
              <div className="device tablet">
                <div className="device-header">📱 Tablet (768px - 1024px)</div>
                <div className="device-content">
                  <div className="tablet-layout">
                    <div className="tablet-nav">Side Nav</div>
                    <div className="tablet-main">
                      <div className="tablet-header">Header</div>
                      <div className="tablet-content">Content</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="device desktop">
                <div className="device-header">🖥️ Desktop (&gt; 1024px)</div>
                <div className="device-content">
                  <div className="desktop-layout">
                    <div className="desktop-header">Top Navigation</div>
                    <div className="desktop-main">
                      <div className="desktop-sidebar">Sidebar</div>
                      <div className="desktop-content">Main Content</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "performance",
      title: "⚡ Performance Features",
      description: "Optimaliseringer for bedre ytelse",
      content: (
        <div className="demo-content">
          <h3>🚀 Performance Optimizations</h3>
          <div className="performance-grid">
            <div className="performance-card">
              <span className="perf-icon">⚡</span>
              <h4>Lazy Loading</h4>
              <p>Komponenter lastes kun når de trengs</p>
              <div className="perf-details">
                <code>React.lazy() + Suspense</code>
              </div>
            </div>
            <div className="performance-card">
              <span className="perf-icon">🎯</span>
              <h4>Code Splitting</h4>
              <p>Hver rute har sin egen bundle</p>
              <div className="perf-details">
                <code>TanStack Router + Vite</code>
              </div>
            </div>
            <div className="performance-card">
              <span className="perf-icon">💾</span>
              <h4>Caching</h4>
              <p>Smart caching av spilldata</p>
              <div className="perf-details">
                <code>localStorage + Context</code>
              </div>
            </div>
            <div className="performance-card">
              <span className="perf-icon">🎨</span>
              <h4>CSS Optimizations</h4>
              <p>Hardware-akselererte animasjoner</p>
              <div className="perf-details">
                <code>transform3d + will-change</code>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "accessibility",
      title: "♿ Accessibility",
      description: "Universell utforming og tilgjengelighet",
      content: (
        <div className="demo-content">
          <h3>♿ Accessibility Features</h3>
          <div className="a11y-checklist">
            <div className="a11y-item">
              <span className="a11y-status">✅</span>
              <strong>Keyboard Navigation</strong>
              <p>Full navigasjon med tastatur</p>
            </div>
            <div className="a11y-item">
              <span className="a11y-status">✅</span>
              <strong>Screen Reader Support</strong>
              <p>ARIA labels og semantisk HTML</p>
            </div>
            <div className="a11y-item">
              <span className="a11y-status">✅</span>
              <strong>High Contrast Mode</strong>
              <p>Støtter høykontrast modus</p>
            </div>
            <div className="a11y-item">
              <span className="a11y-status">✅</span>
              <strong>Reduced Motion</strong>
              <p>Respekterer prefers-reduced-motion</p>
            </div>
            <div className="a11y-item">
              <span className="a11y-status">✅</span>
              <strong>Touch Targets</strong>
              <p>Minimum 44px touch targets</p>
            </div>
            <div className="a11y-item">
              <span className="a11y-status">✅</span>
              <strong>Color Contrast</strong>
              <p>WCAG AA kontrast ratio</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentDemo = demos.find((demo) => demo.id === selectedDemo);

  return (
    <div className="demo-page">
      <div className="demo-header">
        <h1 className="demo-title">
          <span className="demo-icon">🚀</span>
          Mobile-First Demo
        </h1>
        <p className="demo-subtitle">
          Utforsk de nye mobile-optimaliserte funksjonene
        </p>
      </div>

      <div className="demo-nav">
        {demos.map((demo) => (
          <button
            key={demo.id}
            className={`demo-nav-btn ${selectedDemo === demo.id ? "active" : ""}`}
            onClick={() => setSelectedDemo(demo.id)}
          >
            <div className="demo-nav-content">
              <div className="demo-nav-title">{demo.title}</div>
              <div className="demo-nav-desc">{demo.description}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="demo-main">
        <PageTransition transitionKey={selectedDemo} direction="fade">
          <div className="demo-section">
            {currentDemo && (
              <>
                <div className="demo-section-header">
                  <h2>{currentDemo.title}</h2>
                  <p>{currentDemo.description}</p>
                </div>
                <div className="demo-section-content">
                  {currentDemo.content}
                </div>
              </>
            )}
          </div>
        </PageTransition>
      </div>

      <div className="demo-footer">
        <div className="tech-stack">
          <h3>🛠️ Tech Stack</h3>
          <div className="tech-badges">
            <span className="tech-badge">React 18</span>
            <span className="tech-badge">TypeScript</span>
            <span className="tech-badge">TanStack Router</span>
            <span className="tech-badge">OpenLayers</span>
            <span className="tech-badge">CSS3</span>
            <span className="tech-badge">Vite</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
