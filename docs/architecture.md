# Multi-Module Architecture Documentation

## Overview

The Agile Mastery Hub uses a scalable multi-module architecture that allows for easy addition of new learning modules while maintaining performance and code organization.

## Architecture Principles

### 1. Module Independence
- Each module is self-contained with its own components, data, and configuration
- Modules can be developed, tested, and deployed independently
- No direct dependencies between modules

### 2. Lazy Loading
- Modules and exercises are loaded on-demand using React.Suspense
- Improves initial page load performance
- Reduces bundle size for unused modules

### 3. Hierarchical Progress Tracking
- Independent progress tracking per module
- Cross-module prerequisites support
- Persistent progress storage in localStorage

### 4. Data-Driven Configuration
- JSON-based configuration for easy content management
- No code changes required for content updates
- Structured data schema for consistency

## Core Components

### Platform Level
- **App.jsx**: Main application with lazy loading and routing
- **Home.jsx**: Module hub displaying available modules
- **platform-config.json**: Central configuration for all modules

### Module Level
- **ModuleRouter.jsx**: Handles module-specific routing and exercise loading
- **[Module]Module.jsx**: Module wrapper components
- **module-config.json**: Module-specific configuration

### Exercise Level
- **Exercise[N].jsx**: Individual exercise components
- **exercise[N]-data.json**: Exercise-specific data files

## Data Flow

```
Platform Config → Module Selection → Module Config → Exercise Data
     ↓                    ↓               ↓              ↓
  Home.jsx         ModuleRouter.jsx   Exercise.jsx   Data Loading
```

## Progress Tracking

### Structure
```javascript
moduleProgress: {
  'story-points': {
    moduleStarted: true,
    moduleCompleted: false,
    exercises: {
      1: { started: true, completed: true },
      2: { started: true, completed: false },
      3: { started: false, completed: false }
    }
  },
  'story-hierarchy': {
    moduleStarted: false,
    moduleCompleted: false,
    exercises: {}
  }
}
```

### Features
- **Automatic Persistence**: Progress saved to localStorage
- **Migration Support**: Legacy progress format migration
- **Prerequisite Enforcement**: Modules locked until prerequisites met
- **Cross-Module Tracking**: Overall platform progress calculation

## Module Development Guide

### 1. Directory Structure
```
src/components/modules/[module-id]/
├── [Module]Module.jsx          # Module wrapper
├── Exercise1.jsx               # Exercise components
├── Exercise2.jsx
└── Exercise.css                # Module-specific styles

src/data/modules/[module-id]/
├── module-config.json          # Module configuration
├── exercise1-data.json         # Exercise data files
└── exercise2-data.json
```

### 2. Module Configuration
```json
{
  "metadata": {
    "moduleId": "module-id",
    "version": "1.0.0",
    "lastUpdated": "2025-01-14"
  },
  "module": {
    "title": "Module Title",
    "description": "Module description",
    "learningObjectives": ["Objective 1", "Objective 2"],
    "exercises": [
      {
        "id": 1,
        "title": "Exercise Title",
        "description": "Exercise description",
        "type": "exercise-type",
        "dataFile": "exercise1-data.json"
      }
    ]
  }
}
```

### 3. Platform Registration
Add module to `src/data/platform-config.json`:
```json
{
  "id": "module-id",
  "title": "Module Title",
  "description": "Module description",
  "icon": "📋",
  "difficulty": "Beginner|Intermediate|Advanced",
  "estimatedTime": "30-45 minutes",
  "prerequisites": ["prerequisite-module-id"],
  "status": "available"
}
```

### 4. Module Loader Registration
Add to `src/utils/moduleLoader.js`:
```javascript
const moduleConfigs = {
  'module-id': () => import('../data/modules/module-id/module-config.json')
}
```

### 5. Router Integration
Add to `src/components/common/ModuleRouter.jsx`:
```javascript
const ModuleExercise1 = lazy(() => import('../modules/module-id/Exercise1'))

// In renderExercise function:
if (moduleId === 'module-id') {
  switch (currentExercise) {
    case 1:
      return (
        <Suspense fallback={<div className="exercise-loading">Loading...</div>}>
          <ModuleExercise1 {...exerciseProps} />
        </Suspense>
      )
  }
}
```

### 6. App Integration
Add to `src/App.jsx`:
```javascript
const ModuleComponent = lazy(() => import('./components/modules/module-id/ModuleModule'))

// In renderCurrentView function:
if (currentModule === 'module-id') {
  return (
    <Suspense fallback={<div className="module-loading">Loading...</div>}>
      <ModuleComponent {...moduleProps} />
    </Suspense>
  )
}
```

## Performance Optimizations

### 1. Code Splitting
- Module components loaded lazily
- Exercise components loaded on-demand
- Shared components loaded upfront

### 2. Bundle Analysis
- Each module creates separate chunks
- Shared dependencies optimized by Vite
- Dynamic imports for data files

### 3. Caching Strategy
- Module configurations cached after first load
- Exercise data cached per session
- Progress data persisted locally

## Testing Strategy

### 1. Unit Tests
- Individual component testing
- Utility function testing
- Data validation testing

### 2. Integration Tests
- Module loading and navigation
- Progress tracking across modules
- Prerequisites enforcement

### 3. Performance Tests
- Bundle size analysis
- Loading time measurement
- Memory usage monitoring

## Migration Guide

### From Single Module to Multi-Module
1. **Preserve Existing Functionality**: Ensure all current features work
2. **Create Module Structure**: Move components to module directories
3. **Update Data Loading**: Migrate to new module-based data system
4. **Implement Progress Migration**: Convert legacy progress format
5. **Add New Modules**: Implement additional learning modules
6. **Cleanup**: Remove legacy code and optimize performance

### Backward Compatibility
- Legacy progress format automatically migrated
- Fallback data loading for missing modules
- Graceful error handling for configuration issues

## Future Enhancements

### Planned Features
- **Module Marketplace**: Community-contributed modules
- **Advanced Prerequisites**: Complex dependency graphs
- **Adaptive Learning**: Personalized learning paths
- **Analytics**: Detailed learning analytics and insights
- **Collaboration**: Team-based learning features

### Technical Improvements
- **Server-Side Rendering**: Improved SEO and initial load
- **Progressive Web App**: Offline capability
- **Real-time Sync**: Cloud-based progress synchronization
- **A/B Testing**: Experiment framework for learning optimization
