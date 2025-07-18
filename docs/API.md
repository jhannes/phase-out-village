# Phase Out Village - API Documentation

## Overview

This document describes the internal APIs, data structures, and interfaces used in the Phase Out Village application. Since this is a client-side application, these are primarily internal APIs for component communication and data management.

## Core Interfaces

### GameState Interface

The main state interface that represents the entire game state:

```typescript
interface GameState {
  // Core game data
  gameFields: Field[];
  budget: number;
  year: number;
  score: number;
  totalEmissions: number;
  totalProduction: number;

  // Player progress
  achievements: string[];
  shutdowns: Record<string, boolean>;
  investments: Record<Investment, number>;
  playerChoices: string[];

  // Climate impact
  globalTemperature: number;
  climateDamage: number;
  sustainabilityScore: number;
  norwayTechRank: number;
  foreignDependency: number;

  // UI state
  selectedField: Field | null;
  selectedFields: Field[];
  showFieldModal: boolean;
  showAchievementModal: boolean;
  showGameOverModal: boolean;
  showTutorialModal: boolean;
  multiPhaseOutMode: boolean;

  // Game progression
  tutorialStep: number;
  shownFacts: string[];
  dataLayerUnlocked: DataLayer;
  saturationLevel: number;
  gamePhase: GamePhase;

  // Statistics
  badChoiceCount: number;
  goodChoiceStreak: number;
  yearlyPhaseOutCapacity: number;
  isRestarting: boolean;
}
```

### Field Interface

Represents an individual oil field:

```typescript
interface Field {
  name: string;
  lat: number;
  lon: number;
  status: "active" | "closed" | "transitioning";
  production: number; // Current yearly production
  emissions: number[]; // Yearly emissions data
  intensity: number; // CO2 per barrel
  phaseOutCost: number; // Cost to phase out
  yearlyRevenue: number; // Yearly income from field
  totalLifetimeEmissions: number; // Total emissions if kept open
  discoveryYear: number;
  operator: string;
}
```

### Investment Interface

Represents investment types and their values:

```typescript
type Investment =
  | "green_tech"
  | "ai_research"
  | "renewable_energy"
  | "carbon_capture"
  | "foreign_cloud"
  | "hydrogen_tech"
  | "quantum_computing"
  | "battery_tech"
  | "offshore_wind"
  | "geothermal_energy"
  | "space_tech"
  | "fossil_subsidies"
  | "crypto_mining"
  | "fast_fashion";
```

## State Management API

### GameStateContext

The main context provider for game state:

```typescript
interface GameStateContextType {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  computedStats: {
    totalEmissionsReduced: number;
    totalBudgetSpent: number;
    fieldsPhased: number;
    totalFields: number;
    averageIntensity: number;
    projectedSavings: number;
    completionPercentage: number;
    co2PerBOE: number;
    fieldsRemaining: number;
    selectedFieldsCount: number;
  };
  actions: {
    phaseOutField: (fieldName: string) => void;
    selectField: (fieldName: string) => void;
    deselectField: (fieldName: string) => void;
    multiPhaseOut: (fieldNames: string[]) => void;
    resetGame: () => void;
    updateBudget: (amount: number) => void;
  };
}
```

### Game Actions

All state changes go through these actions:

```typescript
type GameAction =
  | { type: "PHASE_OUT_FIELD"; payload: string }
  | { type: "SELECT_FIELD"; payload: string }
  | { type: "DESELECT_FIELD"; payload: string }
  | { type: "MULTI_PHASE_OUT"; payload: string[] }
  | { type: "UPDATE_BUDGET"; payload: number }
  | { type: "ADVANCE_YEAR" }
  | { type: "RESTART_GAME" }
  | { type: "LOAD_GAME_STATE"; payload: GameState }
  | { type: "TOGGLE_MULTI_SELECT" }
  | { type: "SELECT_FIELD_FOR_MULTI"; payload: Field }
  | { type: "DESELECT_FIELD_FROM_MULTI"; payload: string }
  | { type: "PHASE_OUT_SELECTED_FIELDS" }
  | { type: "CLEAR_SELECTED_FIELDS" }
  | { type: "SET_SELECTED_FIELD"; payload: Field }
  | { type: "TOGGLE_FIELD_MODAL"; payload: boolean }
  | { type: "SHOW_TUTORIAL_MODAL" }
  | { type: "HIDE_TUTORIAL_MODAL" }
  | { type: "RESET_TUTORIAL" }
  | { type: "UPDATE_TUTORIAL_STEP"; payload: number }
  | { type: "SHOW_ACHIEVEMENT_MODAL" }
  | { type: "HIDE_ACHIEVEMENT_MODAL" }
  | { type: "ADD_ACHIEVEMENT"; payload: string }
  | { type: "SHOW_GAME_OVER_MODAL" }
  | { type: "HIDE_GAME_OVER_MODAL" }
  | { type: "UPDATE_EMISSIONS_PRODUCTION" }
  | { type: "ADVANCE_YEAR_MANUALLY" }
  | { type: "HANDLE_EVENT"; payload: { eventId: string; choice: string } }
  | { type: "CLOSE_ACHIEVEMENT_MODAL" }
  | { type: "CLOSE_EVENT_MODAL" }
  | { type: "CLOSE_GAME_OVER_MODAL" }
  | { type: "CLEAR_BUDGET_WARNING" }
  | { type: "TRANSITION_FIELD"; payload: { fieldName: string } };
```

## Utility APIs

### SafeStorage API

Secure wrapper around localStorage:

```typescript
class SafeStorage {
  static setItem(key: string, value: string): boolean;
  static getItem(key: string): string | null;
  static removeItem(key: string): boolean;
  static clear(): boolean;
  static getSize(): number;
  static checkQuota(): boolean;
}
```

### Security API

Security utilities for safe data handling:

```typescript
// Safe JSON parsing with validation
function safeJsonParse<T>(jsonString: string): T | null;

// Game state validation
function validateGameState(data: unknown): ValidatedGameState | null;

// String sanitization
function sanitizeString(input: string): string;

// Rate limiting
function checkRateLimit(action: string, userId?: string): boolean;
function getRemainingCalls(action: string, userId?: string): number;
```

### Math API

Safe mathematical operations:

```typescript
// Safe arithmetic operations
function safeAdd(a: number, b: number): number;
function safeSubtract(a: number, b: number): number;
function safeMultiply(a: number, b: number): number;
function safeDivide(a: number, b: number): number;

// Utility functions
function safeRound(value: number, decimals?: number): number;
function clamp(value: number, min: number, max: number): number;
function safePercentage(value: number, total: number): number;
function safeAverage(values: number[]): number;
function safeSum(values: number[]): number;
function safeMax(values: number[]): number;
function safeMin(values: number[]): number;
```

### Logger API

Environment-aware logging:

```typescript
const logger = {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  critical(message: string, ...args: any[]): void;
};
```

## Game Logic API

### Core Game Functions

```typescript
// Field management
function createFieldFromRealData(
  fieldName: string,
  realData: OilFieldDataset,
): Field;

// Game state management
function loadGameState(): GameState;
function createFreshGameState(): GameState;

// Calculations
function calculatePhaseOutCapacity(state: GameState): number;
function calculateTotalGoodInvestments(
  investments: Record<Investment, number>,
): number;
function calculateTotalBadInvestments(
  investments: Record<Investment, number>,
): number;
function calculateEmissionsSaved(fields: Field[]): number;
function calculateEmissionsReduction(fields: Field[]): number;
function calculateScore(totalLifetimeEmissions: number): number;
function calculateTemperatureReduction(yearlyEmissions: number): number;
function calculateClimateDamage(totalEmissions: number): number;

// Visual utilities
function getColorForIntensity(
  intensity: number,
  status: Field["status"],
): string;

// Game progression
function calculateYearlyConsequences(state: GameState): {
  yearlyOilRevenue: number;
  climateCostIncrease: number;
  internationalPressure: number;
  urgencyMultiplier: number;
  timeLeft: number;
};

// Random events
function getRandomEvent(state: GameState): GameEvent | undefined;
```

### Achievement System

```typescript
// Achievement checking
function checkAndAwardAchievements(state: GameState): string[];

// Achievement definitions
const ACHIEVEMENT_BADGES: Record<
  string,
  {
    emoji: string;
    title: string;
    desc: string;
  }
>;
```

## Component APIs

### Map Component API

```typescript
// Map initialization
const map = new OlMap({
  target: mapRef.current,
  layers: [
    /* layers */
  ],
  view: new View({ center: [10, 65], zoom: 6 }),
});

// Field click handler
function handleFieldClick(field: Field): void;

// Map event handlers
map.on("singleclick", (evt) => {
  // Handle field selection
});
```

### Chart Component APIs

```typescript
// Emission chart
interface YearlyEmissionProps {
  data: {
    year: number;
    emissions: number;
  }[];
}

// Income chart
interface IncomeChartProps {
  data: {
    year: number;
    income: number;
  }[];
}

// Scatter chart
interface Props {
  data: {
    intensity: number;
    efficiency: number;
    name: string;
  }[];
}
```

## Data Structures

### Oil Field Dataset

```typescript
interface OilFieldDataset {
  [fieldName: string]: {
    [year: string]: {
      productionOil?: number;
      productionGas?: number;
      emission?: number;
      // ... other production data
    };
  };
}
```

### Projection Data

```typescript
interface Projection {
  year: number;
  production: number;
  emissions: number;
  isProjected: boolean;
}
```

### Game Event

```typescript
interface GameEvent {
  id: string;
  condition: () => boolean;
  title: string;
  description: string;
  effect: string;
  action: (state: GameState) => GameState;
}
```

## Error Handling

### Error Boundary API

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// Error boundary component catches React errors
class ErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState;
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
}
```

### Error Types

```typescript
// Common error scenarios
type GameError =
  | "STORAGE_QUOTA_EXCEEDED"
  | "INVALID_GAME_STATE"
  | "MAP_INITIALIZATION_FAILED"
  | "DATA_LOADING_FAILED"
  | "COMPONENT_RENDER_ERROR";
```

## Performance APIs

### Memoization

```typescript
// Computed values with useMemo
const computedStats = React.useMemo(() => {
  // Expensive calculations
  return {
    totalEmissionsReduced,
    totalBudgetSpent,
    // ... other computed values
  };
}, [gameState.gameFields, gameState.selectedFields]);

// Callback memoization
const handleFieldClick = useCallback(
  (field: Field) => {
    // Field click logic
  },
  [gameState.multiPhaseOutMode, gameState.selectedFields, dispatch],
);
```

### Optimization Hooks

```typescript
// Custom hooks for performance
function useGameStats() {
  const { computedStats } = useGameState();
  return computedStats;
}

function useSelectedFields() {
  const { gameState } = useGameState();
  return gameState.selectedFields;
}
```

## Constants

### Game Constants

```typescript
const INITIAL_BUDGET = 5000; // billion NOK
const INITIAL_SCORE = 0;
const INITIAL_YEAR = 2025;
const TARGET_YEAR = 2040;
const LOCAL_STORAGE_KEY = "phase-out-village-state";
const DEFAULT_MAP_CENTER = [10, 65];
const DEFAULT_MAP_ZOOM = 6;
```

### Achievement Constants

```typescript
const ACHIEVEMENT_THRESHOLDS = {
  FIRST_FIELD: 1,
  SPEEDRUNNER: 10,
  UNDER_PRESSURE: 50,
  CLIMATE_AWARE: 5,
  TECH_PIONEER: 200,
  GREEN_TRANSITION: 15,
  PERFECT_TIMING: 2040,
  PLANET_SAVER: 100,
} as const;
```

## Usage Examples

### Basic State Management

```typescript
import { useGameState } from '../context/GameStateContext';

function MyComponent() {
  const { gameState, dispatch, actions } = useGameState();

  const handlePhaseOut = (fieldName: string) => {
    actions.phaseOutField(fieldName);
  };

  return (
    <div>
      <p>Budget: {gameState.budget} billion NOK</p>
      <p>Year: {gameState.year}</p>
      <button onClick={() => handlePhaseOut("Ekofisk")}>
        Phase Out Ekofisk
      </button>
    </div>
  );
}
```

### Safe Data Handling

```typescript
import { SafeStorage, safeJsonParse } from "../utils/security";

// Safe data storage
const saveData = (data: GameState) => {
  const success = SafeStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  return success;
};

// Safe data loading
const loadData = (): GameState | null => {
  const saved = SafeStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) return null;

  return safeJsonParse(saved) as GameState;
};
```

### Error Handling

```typescript
import { logger } from "../utils/logger";

try {
  // Risky operation
  const result = performRiskyOperation();
  logger.debug("Operation successful:", result);
} catch (error) {
  logger.error("Operation failed:", error);
  // Handle error gracefully
}
```

---

## Version History

- **v1.0.0**: Initial API documentation
- **v1.1.0**: Added security utilities documentation
- **v1.2.0**: Added performance optimization APIs

## Contributing

When adding new APIs:

1. **Document the interface** with TypeScript types
2. **Provide usage examples** for common scenarios
3. **Include error handling** information
4. **Update this documentation** when APIs change
5. **Add JSDoc comments** to the actual code

---

_For implementation details, see the source code in the `src/` directory._
