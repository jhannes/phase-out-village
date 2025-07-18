# Phase Out Village - Development Documentation

## Project Overview

**Phase Out Village** is an educational web-based simulation game that teaches players about Norway's transition from fossil fuels to renewable energy. Players manage oil fields, make investment decisions, and work towards Norway's 2040 climate goals.

### Main Goals

- **Educational**: Teach players about Norway's energy transition challenges
- **Interactive**: Provide hands-on experience with real-world data
- **Engaging**: Make complex climate policy accessible through gamification
- **Realistic**: Use actual Norwegian oil field data and realistic constraints

## Technical Stack

### Frontend

- **React 19** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development with strict mode enabled
- **TanStack Router** - Modern routing solution with type safety
- **OpenLayers** - Interactive map visualization for oil fields
- **Chart.js** - Data visualization for emissions and production charts

### Build & Development

- **Vite** - Fast build tool and development server
- **ESLint** - Code linting with security rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for code quality

### Data & Storage

- **localStorage** - Client-side game state persistence
- **GeoJSON** - Geographic data for oil field locations
- **Real Norwegian Data** - Actual oil field production and emission data

### Security

- **Custom Security Utilities** - SafeStorage, safeJsonParse, input validation
- **Error Boundaries** - Graceful error handling
- **Rate Limiting** - Protection against abuse
- **Content Security Policy** - XSS prevention

## Architecture & Structure

### Application Architecture

```
Phase Out Village
├── Frontend (React SPA)
│   ├── Game State Management (Context + Reducer)
│   ├── Interactive Map (OpenLayers)
│   ├── Data Visualization (Charts)
│   └── UI Components (Modals, Panels, Navigation)
└── Data Layer
    ├── Real Norwegian Oil Field Data
    ├── Game State Persistence
    └── Progressive Data Unlocks
```

### Directory Structure

```
src/
├── components/          # React components
│   ├── charts/         # Data visualization components
│   ├── game/           # Game-specific components
│   ├── map/            # Map-related components
│   ├── modals/         # Modal dialogs
│   ├── Navigation/     # Navigation components
│   └── ui/             # Reusable UI components
├── context/            # React context providers
├── pages/              # Page components
├── routes/             # Route definitions
├── state/              # State management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── security.ts     # Security utilities
│   ├── storage.ts      # Safe storage wrapper
│   ├── math.ts         # Safe math operations
│   └── logger.ts       # Secure logging
└── interfaces/         # Game state interfaces
```

## Core Features

### 1. Interactive Oil Field Management

- **Real Data**: Uses actual Norwegian oil field production and emission data
- **Field Status**: Active, transitioning, or closed states
- **Cost Management**: Realistic phase-out costs based on field characteristics
- **Capacity Limits**: Yearly limits on how many fields can be phased out

### 2. Investment System

- **Green Technology**: Renewable energy, carbon capture, hydrogen tech
- **AI & Research**: Quantum computing, battery technology, space tech
- **Economic Impact**: Investments affect Norway's tech ranking and capacity
- **Strategic Choices**: Balance between short-term profits and long-term sustainability

### 3. Climate Impact Simulation

- **Temperature Tracking**: Global temperature changes based on emissions
- **Emission Calculations**: Real-time emission tracking and reduction
- **Climate Damage**: Economic costs of climate change
- **Sustainability Scoring**: Overall environmental performance

### 4. Achievement System

- **Educational Badges**: Reward learning and strategic thinking
- **Progress Tracking**: Multiple achievement categories
- **Negative Achievements**: Consequences of poor decisions
- **Motivation**: Gamification to encourage continued play

### 5. Progressive Data Unlocks

- **Learning Curve**: Data layers unlock as players progress
- **Educational Content**: Facts and information about energy transition
- **Engagement**: Keeps content fresh and interesting

## Development Setup

### Prerequisites

- **Node.js** 18+ (recommended: 22.x)
- **npm** or **yarn**
- Modern web browser with ES2020 support

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd phase-out-village

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

```bash
# Development
NODE_ENV=development
VITE_APP_TITLE=Phase Out Village
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run TypeScript check and formatting
npm run data:download # Download latest oil field data
npm run data:process  # Process data for the application
```

## Key Components

### Game State Management

The application uses a combination of React Context and Reducer pattern for state management:

```typescript
// GameStateContext.tsx - Main state provider
const GameStateProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Computed values, actions, and state persistence
  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};
```

### Map Component

Interactive map using OpenLayers with Norwegian oil fields:

```typescript
// OilFieldMap.tsx - Interactive map visualization
const MapPage: React.FC = () => {
  const { gameState, dispatch } = useGameState();

  // Map initialization, field rendering, click handling
  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
      {/* Game controls and UI overlays */}
    </div>
  );
};
```

### Data Visualization

Chart components for emissions, production, and financial data:

```typescript
// EmissionsView.tsx - Multi-chart dashboard
export const EmissionsView: React.FC = () => {
  return (
    <div className="emissions-dashboard">
      <YearlyEmissionChart data={emissionData} />
      <EmissionEfficiencyScatter data={efficiencyData} />
      <YearlyIncomeChart data={incomeData} />
    </div>
  );
};
```

## State Management

### Game State Structure

```typescript
interface GameState {
  // Core game data
  gameFields: Field[];
  budget: number;
  year: number;
  score: number;

  // Player progress
  achievements: string[];
  shutdowns: Record<string, boolean>;
  investments: Record<Investment, number>;

  // Climate impact
  globalTemperature: number;
  totalEmissions: number;
  sustainabilityScore: number;

  // UI state
  selectedField: Field | null;
  showFieldModal: boolean;
  multiPhaseOutMode: boolean;
  selectedFields: Field[];
}
```

### State Persistence

- **SafeStorage**: Wrapper around localStorage with error handling
- **Auto-save**: Game state automatically saved on changes
- **Validation**: State validation before loading from storage
- **Fallback**: Fresh start if saved state is corrupted

### State Updates

All state changes go through the reducer:

```typescript
// GameReducer.ts - Centralized state logic
export const gameReducer = (
  state: GameState,
  action: GameAction,
): GameState => {
  switch (action.type) {
    case "PHASE_OUT_FIELD":
      return handlePhaseOutField(state, action.payload);
    case "UPDATE_BUDGET":
      return { ...state, budget: action.payload };
    // ... other actions
  }
};
```

## Security Implementation

### Security Measures

1. **SafeStorage**: Wrapper around localStorage with quota management
2. **Input Validation**: All user inputs validated and sanitized
3. **JSON Security**: Safe JSON parsing with validation
4. **Error Boundaries**: Graceful error handling throughout the app
5. **Rate Limiting**: Protection against rapid-fire actions
6. **Secure Logging**: Environment-aware logging without sensitive data exposure

### Security Utilities

```typescript
// security.ts - Core security functions
export const safeJsonParse = <T>(jsonString: string): T | null => {
  try {
    const parsed = JSON.parse(jsonString);
    return validateGameState(parsed) ? parsed : null;
  } catch (error) {
    logger.warn("Failed to parse JSON:", error);
    return null;
  }
};

export const sanitizeString = (input: string): string => {
  // Remove potentially dangerous characters
  return input.replace(/[<>]/g, "");
};
```

## Performance Considerations

### Optimization Strategies

1. **React.memo**: Memoized components to prevent unnecessary re-renders
2. **useCallback/useMemo**: Optimized function and value caching
3. **Lazy Loading**: Route-based code splitting
4. **Image Optimization**: Optimized badge and UI images
5. **Bundle Analysis**: Regular bundle size monitoring

### Caching

- **Game State**: Cached in localStorage with validation
- **Map Data**: GeoJSON data cached after initial load
- **Chart Data**: Computed values cached with useMemo

## Testing Strategy

### Current Testing

- **TypeScript**: Static type checking with strict mode
- **ESLint**: Code quality and security rule enforcement
- **Prettier**: Consistent code formatting
- **Manual Testing**: Comprehensive feature testing

### Recommended Testing Additions

```bash
# Unit Testing
npm install --save-dev jest @testing-library/react
npm install --save-dev @testing-library/jest-dom

# E2E Testing
npm install --save-dev cypress

# Performance Testing
npm install --save-dev lighthouse
```

### Test Structure

```
tests/
├── unit/              # Unit tests for utilities
├── integration/       # Component integration tests
├── e2e/              # End-to-end user flow tests
└── performance/      # Performance benchmarks
```

## Deployment & DevOps

### Build Process

```bash
# Production build
npm run build

# Build artifacts
dist/
├── index.html
├── assets/
│   ├── js/
│   ├── css/
│   └── images/
└── geojson/
    └── oilfields.geojson
```

### Deployment

- **GitHub Pages**: Static site hosting
- **Vercel**: Alternative deployment option
- **CDN**: Static assets served via CDN

### CI/CD Pipeline

```yaml
# .github/workflows/publish.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
      - uses: actions/deploy-pages@v4
```

## Common Development Tasks

### Adding New Features

1. **Create Component**: Add new component in appropriate directory
2. **Update Types**: Add TypeScript interfaces if needed
3. **Update State**: Modify GameState interface and reducer
4. **Add Routes**: Update routing configuration
5. **Test**: Manual testing and type checking

### Debugging Issues

```typescript
// Enable debug logging
import { logger } from "../utils/logger";

logger.debug("Debug information:", { data });
logger.warn("Warning message");
logger.error("Error occurred:", error);
```

### Modifying Existing Components

1. **Check Dependencies**: Review component dependencies
2. **Update Types**: Ensure TypeScript types are updated
3. **Test Changes**: Verify functionality still works
4. **Update Documentation**: Keep docs in sync

## Troubleshooting

### Common Issues

#### Game State Not Loading

```bash
# Clear localStorage
localStorage.clear();

# Check browser console for errors
# Verify SafeStorage implementation
```

#### Map Not Rendering

```bash
# Check OpenLayers CSS import
# Verify GeoJSON data format
# Check map container dimensions
```

#### Performance Issues

```bash
# Check bundle size
npm run build

# Analyze with browser dev tools
# Look for memory leaks in useEffect cleanup
```

### Environment-Specific Problems

#### Development vs Production

- **Debug Logging**: Only enabled in development
- **Error Boundaries**: More verbose in development
- **Hot Reloading**: Development server only

#### Browser Compatibility

- **ES2020 Features**: Modern browser required
- **localStorage**: Check for private browsing mode
- **Canvas API**: Required for map rendering

## Future Roadmap

### Planned Features

1. **Multiplayer Mode**: Collaborative gameplay
2. **Advanced Analytics**: Detailed performance metrics
3. **Mobile App**: Native mobile application
4. **Internationalization**: Multiple language support
5. **Advanced AI**: Smarter NPCs and scenarios

### Technical Debt

1. **Test Coverage**: Increase automated testing
2. **Performance**: Optimize large data sets
3. **Accessibility**: Improve screen reader support
4. **Documentation**: API documentation
5. **Monitoring**: Add error tracking and analytics

### Scalability Considerations

1. **Data Management**: Handle larger datasets efficiently
2. **State Optimization**: Reduce memory usage
3. **Caching Strategy**: Implement more sophisticated caching
4. **Code Splitting**: Further optimize bundle sizes

## Team Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Naming**: Descriptive variable and function names
- **Comments**: JSDoc for complex functions

### Git Workflow

```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request for review
```

### Communication

- **Issues**: Use GitHub issues for bug reports
- **Discussions**: GitHub discussions for feature ideas
- **Documentation**: Keep docs updated with changes
- **Code Reviews**: Required for all changes

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run test             # Run tests and checks

# Data Management
npm run data:download    # Download latest data
npm run data:process     # Process data for app

# Code Quality
npx prettier --write .   # Format all files
npx eslint .             # Lint all files
```

### Useful Scripts

```bash
# Check for security issues
npm audit

# Update dependencies
npm update

# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Debug Commands

```bash
# Enable debug logging
localStorage.setItem('debug', 'true');

# Clear game state
localStorage.removeItem('phase-out-village-state');

# Check browser compatibility
navigator.userAgent
```

### Emergency Procedures

1. **Data Loss**: Check localStorage backup
2. **Build Failures**: Clear node_modules and reinstall
3. **Performance Issues**: Check for memory leaks
4. **Security Issues**: Review security utilities

---

## Contributing

### Getting Started

1. Read this documentation thoroughly
2. Set up the development environment
3. Pick an issue from the GitHub issues
4. Create a feature branch
5. Implement and test your changes
6. Submit a pull request

### Code Review Checklist

- [ ] TypeScript types are correct
- [ ] No console.log statements (use logger)
- [ ] Security measures are followed
- [ ] Performance impact is considered
- [ ] Documentation is updated
- [ ] Tests pass

### Questions?

- Check the GitHub issues for similar questions
- Review the codebase for examples
- Ask in GitHub discussions
- Contact the development team

---

_Last updated: [Current Date]_
_Version: 1.0.0_
