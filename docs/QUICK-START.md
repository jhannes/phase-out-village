# Phase Out Village - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites

- Node.js 18+ (22.x recommended)
- npm or yarn
- Modern web browser

### 1. Clone & Install

```bash
git clone [repository-url]
cd phase-out-village
npm install
```

### 2. Start Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser

### 3. Explore the Codebase

- **Game Logic**: `src/utils/gameLogic.ts`
- **State Management**: `src/context/GameStateContext.tsx`
- **Main Game**: `src/pages/MapPage/MapPage.tsx`
- **Components**: `src/components/`

## 🎮 Understanding the Game

### Core Concept

Players manage Norwegian oil fields, making decisions to phase them out by 2040 while balancing economic and environmental goals.

### Key Features

- **Interactive Map**: Click oil fields to manage them
- **Investment System**: Invest in green technology
- **Climate Impact**: Track emissions and temperature changes
- **Achievements**: Earn badges for strategic decisions

### Game Flow

1. **Explore**: Click oil fields on the map
2. **Analyze**: Review field data and costs
3. **Invest**: Allocate budget to green technology
4. **Phase Out**: Close fields strategically
5. **Monitor**: Track climate impact and progress

## 🛠️ Development Workflow

### Making Changes

1. **Create Branch**: `git checkout -b feature/your-feature`
2. **Make Changes**: Edit code with TypeScript support
3. **Test**: `npm run test` to check types and formatting
4. **Commit**: `git commit -m "feat: your change description"`
5. **Push**: `git push origin feature/your-feature`

### Code Quality

```bash
# Check types and formatting
npm run test

# Format code
npx prettier --write .

# Lint code
npx eslint .
```

### Debugging

```typescript
// Use the logger instead of console.log
import { logger } from "../utils/logger";

logger.debug("Debug info:", data);
logger.warn("Warning message");
logger.error("Error occurred:", error);
```

## 📁 Key Files & Directories

### Essential Files

```
src/
├── main.tsx                    # App entry point
├── context/GameStateContext.tsx # Main state management
├── pages/MapPage/MapPage.tsx   # Main game interface
├── utils/gameLogic.ts          # Core game logic
├── state/GameReducer.ts        # State update logic
└── types/types.ts              # TypeScript definitions
```

### Component Structure

```
src/components/
├── game/                       # Game-specific components
├── charts/                     # Data visualization
├── map/                        # Map-related components
├── modals/                     # Dialog boxes
└── Navigation/                 # UI navigation
```

## 🔧 Common Tasks

### Adding a New Feature

1. **Create Component** in appropriate directory
2. **Add TypeScript types** if needed
3. **Update GameState** interface in `src/interfaces/GameState.ts`
4. **Add Reducer Case** in `src/state/GameReducer.ts`
5. **Test** your changes

### Modifying Game Logic

1. **Edit** `src/utils/gameLogic.ts`
2. **Update** related types in `src/types/types.ts`
3. **Test** calculations and edge cases
4. **Update** documentation if needed

### Adding New Data

1. **Download** new data: `npm run data:download`
2. **Process** data: `npm run data:process`
3. **Update** types to match new data structure
4. **Test** data integration

## 🐛 Troubleshooting

### Common Issues

#### "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Game state not loading

```bash
# Clear localStorage in browser dev tools
localStorage.clear();
# Refresh page
```

#### Map not showing

- Check if OpenLayers CSS is imported
- Verify GeoJSON data exists in `public/geojson/`
- Check browser console for errors

#### TypeScript errors

```bash
# Check for type issues
npx tsc --noEmit

# Fix formatting issues
npx prettier --write .
```

### Performance Issues

- Check for memory leaks in `useEffect` cleanup
- Verify components are properly memoized
- Monitor bundle size with `npm run build`

## 🔒 Security Guidelines

### Always Use

- **SafeStorage** instead of direct localStorage
- **safeJsonParse** instead of JSON.parse
- **logger** instead of console.log
- **Input validation** for user data

### Never Use

- `eval()` or `Function()` constructor
- `innerHTML` or `dangerouslySetInnerHTML`
- Direct localStorage access
- Unsanitized user input

## 📚 Learning Resources

### React & TypeScript

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Router](https://tanstack.com/router)

### Game Development

- [OpenLayers Documentation](https://openlayers.org/)
- [Chart.js Documentation](https://www.chartjs.org/)

### Norwegian Context

- [Norwegian Petroleum Directorate](https://www.npd.no/)
- [Norway's Climate Goals](https://www.regjeringen.no/en/topics/climate-and-environment/climate/climate-policy/id2005132/)

## 🤝 Getting Help

### Before Asking

1. Check this documentation
2. Search existing GitHub issues
3. Review the codebase for examples
4. Test your issue in isolation

### When Asking

1. Describe what you're trying to do
2. Show the code you're working with
3. Include error messages
4. Explain what you've already tried

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and ideas
- **Code Reviews**: Feedback on pull requests

## 🎯 Next Steps

### For New Developers

1. **Play the game** to understand the user experience
2. **Read the code** starting with `MapPage.tsx`
3. **Make a small change** to get familiar with the codebase
4. **Ask questions** in GitHub discussions

### For Experienced Developers

1. **Review the architecture** in `DEVELOPMENT.md`
2. **Check the roadmap** for planned features
3. **Pick an issue** from GitHub to work on
4. **Propose improvements** based on your experience

---

**Need more details?** Check out the full [Development Documentation](DEVELOPMENT.md)

**Found a bug?** Create an issue on GitHub

**Have an idea?** Start a discussion on GitHub

---

_Happy coding! 🚀_
