# Multi-Module Architecture Implementation Plan

## 📋 Overview

This document outlines the comprehensive plan to transform Story Point Master from a single-purpose story point estimation app into a scalable multi-module agile learning platform.

### **Transformation Goals**
- **From**: Single-purpose story point app
- **To**: Extensible agile learning hub supporting multiple independent modules
- **Preserve**: All existing functionality during migration
- **Add**: Story Hierarchy & Breakdown module as proof of concept

## 🏗️ New Architecture Design

### **Application Structure**
```
src/
├── components/
│   ├── common/                    # Shared components
│   │   ├── Navigation.jsx         # Multi-module navigation
│   │   ├── ProgressTracker.jsx    # Module progress tracking
│   │   └── ModuleCard.jsx         # Module selection cards
│   ├── modules/                   # Module-specific components
│   │   ├── story-points/          # Current story point module
│   │   │   ├── StoryPointModule.jsx
│   │   │   ├── Exercise1.jsx      # Moved from root components/
│   │   │   ├── Exercise2.jsx
│   │   │   └── Exercise3.jsx
│   │   └── story-hierarchy/       # New module (future)
│   │       ├── StoryHierarchyModule.jsx
│   │       ├── EpicVsStoryExercise.jsx
│   │       └── DecompositionExercise.jsx
│   ├── Home.jsx                   # Restructured as module hub
│   └── ModuleRouter.jsx           # Handles module-level routing
├── data/
│   ├── modules/                   # Module-specific data
│   │   ├── story-points/          # Current exercise data moved here
│   │   │   ├── module-config.json
│   │   │   ├── exercise1-items.json
│   │   │   ├── exercise2-stories.json
│   │   │   └── exercise3-questions.json
│   │   └── story-hierarchy/       # New module data
│   │       ├── module-config.json
│   │       └── exercises/
│   └── platform-config.json      # Platform-wide configuration
└── utils/
    ├── moduleLoader.js            # Module data loading
    ├── progressManager.js         # Cross-module progress tracking
    └── routingUtils.js            # Routing utilities
```

### **Routing System**
**Current**: `currentView: 'home' | 1 | 2 | 3`

**New**: Hierarchical routing structure
```javascript
{
  currentView: 'home' | 'module',
  currentModule: 'story-points' | 'story-hierarchy' | null,
  currentExercise: 1 | 2 | 3 | null
}
```

### **Progress Tracking**
**Current**: Flat structure per exercise
```javascript
exerciseProgress: {
  1: { completed: false, started: false },
  2: { completed: false, started: false },
  3: { completed: false, started: false }
}
```

**New**: Hierarchical structure per module
```javascript
moduleProgress: {
  'story-points': {
    moduleCompleted: false,
    moduleStarted: true,
    exercises: {
      1: { completed: true, started: true },
      2: { completed: false, started: true },
      3: { completed: false, started: false }
    }
  },
  'story-hierarchy': {
    moduleCompleted: false,
    moduleStarted: false,
    exercises: {
      1: { completed: false, started: false },
      2: { completed: false, started: false }
    }
  }
}
```

## 📊 Data Structure Changes

### **Platform Configuration** (`src/data/platform-config.json`)
```json
{
  "metadata": {
    "version": "2.0.0",
    "lastUpdated": "2025-01-14",
    "description": "Agile Learning Platform Configuration"
  },
  "platform": {
    "name": "Agile Mastery Hub",
    "subtitle": "Master agile practices through interactive learning",
    "modules": [
      {
        "id": "story-points",
        "title": "Story Point Estimation Mastery",
        "description": "Master the art of relative sizing in agile development",
        "icon": "🎯",
        "difficulty": "Beginner",
        "estimatedTime": "30-45 minutes",
        "prerequisites": [],
        "status": "available"
      },
      {
        "id": "story-hierarchy",
        "title": "Story Hierarchy & Breakdown",
        "description": "Learn to structure and decompose user stories effectively",
        "icon": "📋",
        "difficulty": "Intermediate", 
        "estimatedTime": "45-60 minutes",
        "prerequisites": ["story-points"],
        "status": "coming-soon"
      }
    ]
  }
}
```

### **Module Configuration** (`src/data/modules/story-points/module-config.json`)
```json
{
  "metadata": {
    "moduleId": "story-points",
    "version": "2.0.0",
    "lastUpdated": "2025-01-14",
    "description": "Story Point Estimation Module Configuration"
  },
  "module": {
    "title": "Story Point Estimation Mastery",
    "description": "Master the art of relative sizing in agile development",
    "learningObjectives": [
      "Understand relative sizing fundamentals",
      "Apply Fibonacci sequence in estimation",
      "Distinguish complexity vs. effort factors",
      "Build team estimation consistency"
    ],
    "exercises": [
      {
        "id": 1,
        "title": "Abstract Comparisons",
        "description": "Learn relative sizing with abstract items",
        "details": "Start with simple abstract concepts to understand relative effort without real-world bias.",
        "type": "sorting_and_pointing",
        "dataFile": "exercise1-items.json",
        "config": {
          "allowShuffle": true,
          "showMindsetReminder": true,
          "pointScale": [1, 2, 3, 5, 8, 13]
        },
        "ui": {
          "startScreen": {
            "instructions": "You'll be presented with abstract items like \"a grain of sand,\" \"a pebble,\" \"a boulder,\" and \"a mountain.\" Your task is to arrange them by relative effort to move, then assign story points.",
            "buttonText": "Start Exercise"
          },
          "mindsetReminder": "Remember: Story points are about relative effort, not absolute time. A '3' is roughly three times the effort of a '1'."
        }
      }
      // ... other exercises
    ]
  }
}
```

## 🧭 Navigation Flow

### **Navigation Hierarchy**
```
Home (Module Hub)
├── Story Point Estimation Module
│   ├── Exercise 1: Abstract Comparisons
│   ├── Exercise 2: User Stories  
│   └── Exercise 3: Core Principles
└── Story Hierarchy Module
    ├── Exercise 1: Epic vs Feature vs Story
    └── Exercise 2: Story Decomposition
```

### **Breadcrumb Navigation**
```javascript
function Breadcrumbs({ currentModule, currentExercise, onNavigateHome, onNavigateToModule }) {
  return (
    <nav className="breadcrumbs">
      <button onClick={onNavigateHome}>🏠 Home</button>
      {currentModule && (
        <>
          <span className="separator">›</span>
          <button onClick={() => onNavigateToModule(currentModule)}>
            {getModuleTitle(currentModule)}
          </button>
        </>
      )}
      {currentExercise && (
        <>
          <span className="separator">›</span>
          <span className="current">Exercise {currentExercise}</span>
        </>
      )}
    </nav>
  )
}
```

## 🔧 Component Restructuring

### **Home Component Transformation**
**Current**: Exercise launcher for story points
**New**: Multi-module learning hub

Key changes:
- Load platform configuration instead of exercise metadata
- Display ModuleCard components instead of exercise cards
- Track overall progress across all modules
- Support module prerequisites and status

### **New ModuleCard Component**
```javascript
function ModuleCard({ module, status, progress, onNavigate }) {
  const getProgressPercentage = () => {
    if (!progress?.exercises) return 0
    const completed = Object.values(progress.exercises)
      .filter(ex => ex.completed).length
    const total = Object.keys(progress.exercises).length
    return Math.round((completed / total) * 100)
  }

  return (
    <div className={`module-card ${status}`}>
      <div className="module-icon">{module.icon}</div>
      <div className="module-content">
        <h3 className="module-title">{module.title}</h3>
        <p className="module-description">{module.description}</p>
        
        <div className="module-meta">
          <span className="difficulty">{module.difficulty}</span>
          <span className="time">{module.estimatedTime}</span>
        </div>

        {progress && (
          <div className="module-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${getProgressPercentage()}%` }} />
            </div>
            <span>{getProgressPercentage()}% complete</span>
          </div>
        )}
      </div>
    </div>
  )
}
```

### **Enhanced Navigation Component**
**Current**: Single-module exercise navigation
**New**: Multi-level navigation with module and exercise contexts

- Context-aware navigation (exercise vs module level)
- Breadcrumb support
- Module switching capabilities
- Enhanced progress visualization

## 🚀 Implementation Roadmap

### **Phase 1: Foundation Setup (No Breaking Changes)**
**Goal**: Establish new architecture without disrupting existing functionality

**Steps**:
1. Create new directory structure
2. Create platform configuration with story-points module only
3. Implement new utility classes with backward compatibility
4. Create new common components
5. Keep existing components unchanged

**Validation**: Existing functionality works exactly as before

### **Phase 2: Data Migration (Backward Compatible)**
**Goal**: Move to new data structure while maintaining existing API

**Steps**:
1. Migrate exercise data to new module structure
2. Create module configuration files
3. Update data loading utilities with fallbacks
4. Test data migration thoroughly

**Validation**: All existing data loading works with new structure

### **Phase 3: Component Migration (Gradual)**
**Goal**: Move existing components to new module structure

**Steps**:
1. Create module wrapper components
2. Move existing Exercise components to module directories
3. Create ModuleRouter component
4. Update App.jsx gradually with new state alongside existing

**Validation**: Can navigate to story-points module and exercises work

### **Phase 4: Navigation Enhancement**
**Goal**: Implement multi-module navigation

**Steps**:
1. Enhance Navigation component for multi-module support
2. Transform Home component to module hub
3. Add ModuleCard components
4. Integrate hierarchical progress tracking

**Validation**: Can navigate between home, module overview, and exercises

### **Phase 5: New Module Addition**
**Goal**: Add story-hierarchy module to validate architecture

**Steps**:
1. Create story-hierarchy module structure
2. Implement new exercise types (categorization, decomposition)
3. Update platform configuration
4. Test multi-module functionality

**Validation**: Both modules work independently with shared navigation

### **Phase 6: Cleanup & Optimization**
**Goal**: Remove legacy code and optimize performance

**Steps**:
1. Remove legacy components and unused code
2. Implement lazy loading and code splitting
3. Optimize data loading with caching
4. Update documentation

**Validation**: Clean codebase with optimal performance

## 🛠️ Technical Implementation Details

### **New Utility Classes**

#### **Module Loader** (`src/utils/moduleLoader.js`)
```javascript
// Dynamic imports for modules
const moduleConfigs = {
  'story-points': () => import('../data/modules/story-points/module-config.json'),
  'story-hierarchy': () => import('../data/modules/story-hierarchy/module-config.json')
}

export async function loadPlatformConfig() {
  const config = await import('../data/platform-config.json')
  return config.default
}

export async function loadModuleConfig(moduleId) {
  if (!moduleConfigs[moduleId]) {
    throw new Error(`Module ${moduleId} not found`)
  }
  const config = await moduleConfigs[moduleId]()
  return config.default
}

export async function loadExerciseData(moduleId, exerciseId) {
  const loaders = {
    'story-points': {
      1: () => import('../data/modules/story-points/exercise1-items.json'),
      2: () => import('../data/modules/story-points/exercise2-stories.json'),
      3: () => import('../data/modules/story-points/exercise3-questions.json')
    }
  }

  if (!loaders[moduleId] || !loaders[moduleId][exerciseId]) {
    throw new Error(`Exercise data for ${moduleId}/exercise/${exerciseId} not found`)
  }
  const data = await loaders[moduleId][exerciseId]()
  return data.default
}
```

#### **Progress Manager** (`src/utils/progressManager.js`)
```javascript
export class ProgressManager {
  constructor(initialProgress = {}) {
    this.progress = initialProgress
  }

  startModule(moduleId) {
    if (!this.progress[moduleId]) {
      this.progress[moduleId] = {
        moduleStarted: true,
        moduleCompleted: false,
        exercises: {}
      }
    } else {
      this.progress[moduleId].moduleStarted = true
    }
    return this.progress
  }

  completeExercise(moduleId, exerciseId) {
    this.ensureModuleExists(moduleId)
    if (this.progress[moduleId].exercises[exerciseId]) {
      this.progress[moduleId].exercises[exerciseId].completed = true
    }

    // Check if all exercises in module are completed
    const moduleConfig = getModuleConfig(moduleId)
    const allCompleted = moduleConfig.exercises.every(ex =>
      this.progress[moduleId].exercises[ex.id]?.completed
    )

    if (allCompleted) {
      this.progress[moduleId].moduleCompleted = true
    }

    return this.progress
  }

  getOverallProgress() {
    const modules = Object.keys(this.progress)
    const completedModules = modules.filter(id =>
      this.progress[id]?.moduleCompleted
    ).length
    return modules.length > 0 ? (completedModules / modules.length) * 100 : 0
  }
}
```

### **Migration Strategy**

#### **Backward Compatibility Approach**
```javascript
// Enhanced dataLoader with fallbacks
export function getExerciseConfig(exerciseId) {
  try {
    // Try new module-based loading
    return loadModuleExerciseConfig('story-points', exerciseId)
  } catch (error) {
    // Fall back to legacy loading
    console.warn('Falling back to legacy exercise loading')
    return legacyLoadExerciseConfig(exerciseId)
  }
}
```

#### **Progressive State Migration**
```javascript
// App.jsx during transition
function App() {
  // Legacy state (maintained during transition)
  const [currentView, setCurrentView] = useState('home')
  const [exerciseProgress, setExerciseProgress] = useState({})

  // New state (added gradually)
  const [currentModule, setCurrentModule] = useState(null)
  const [moduleProgress, setModuleProgress] = useState({})

  // Migration helper
  const migrateToModuleProgress = () => {
    if (Object.keys(moduleProgress).length === 0 && Object.keys(exerciseProgress).length > 0) {
      setModuleProgress({
        'story-points': {
          moduleStarted: Object.values(exerciseProgress).some(p => p.started),
          moduleCompleted: Object.values(exerciseProgress).every(p => p.completed),
          exercises: exerciseProgress
        }
      })
    }
  }
}
```

## 🧪 Testing Strategy

### **Testing Phases**
1. **Unit Tests**: Test each new component and utility in isolation
2. **Integration Tests**: Verify module loading and navigation work together
3. **Regression Tests**: Ensure existing story-point exercises work unchanged
4. **User Journey Tests**: Test complete user flows through both modules
5. **Performance Tests**: Verify lazy loading and code splitting work correctly

### **Rollback Plan**
- Keep legacy components and data structure until Phase 6
- Maintain feature flags for new vs old navigation
- Document rollback procedures for each phase
- Create automated tests to verify legacy functionality

## 📚 New Story Hierarchy Module

### **Learning Objectives**
- Distinguish between Epics, Features, and Stories
- Master story decomposition techniques
- Identify appropriate granularity levels
- Write effective acceptance criteria

### **Exercise Types**
1. **Epic vs Feature vs Story**: Categorization exercise with drag-and-drop
2. **Story Decomposition**: Interactive story splitting scenarios
3. **Acceptance Criteria Workshop**: Writing and evaluating criteria
4. **Granularity Assessment**: Identifying too-large and too-small stories

### **Module Configuration** (`src/data/modules/story-hierarchy/module-config.json`)
```json
{
  "metadata": {
    "moduleId": "story-hierarchy",
    "version": "1.0.0"
  },
  "module": {
    "title": "Story Hierarchy & Breakdown",
    "description": "Learn to structure and decompose user stories effectively",
    "exercises": [
      {
        "id": 1,
        "title": "Epic vs Feature vs Story",
        "description": "Learn the hierarchy and distinctions",
        "type": "categorization",
        "dataFile": "hierarchy-examples.json"
      },
      {
        "id": 2,
        "title": "Story Decomposition",
        "description": "Break down large stories effectively",
        "type": "decomposition",
        "dataFile": "decomposition-scenarios.json"
      }
    ]
  }
}
```

## 🎯 Success Metrics

### **Architecture Success**
- ✅ Existing functionality preserved during migration
- ✅ New modules can be added without modifying core components
- ✅ Independent progress tracking per module
- ✅ Scalable data structure supports future modules

### **User Experience Success**
- ✅ Intuitive navigation between modules and exercises
- ✅ Clear progress visualization across all modules
- ✅ Consistent UI/UX patterns across different module types
- ✅ Smooth transitions and performance

### **Developer Experience Success**
- ✅ Clear module development guidelines
- ✅ Reusable components for common exercise patterns
- ✅ Easy data configuration through JSON files
- ✅ Comprehensive testing and documentation

