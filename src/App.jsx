import { useState, useEffect, Suspense, lazy } from 'react'
import './App.css'

// Import common components
import Home from './components/Home'
import Breadcrumbs from './components/common/Breadcrumbs'

// Lazy load module components for better performance
const StoryPointModule = lazy(() => import('./components/modules/story-points/StoryPointModule'))
const StoryHierarchyModule = lazy(() => import('./components/modules/story-hierarchy/StoryHierarchyModule'))
const SprintPlanningModule = lazy(() => import('./components/modules/sprint-planning/SprintPlanningModule'))

// Import utilities
import { NavigationManager, createInitialNavigationState, generateBreadcrumbs } from './utils/routingUtils'
import { ProgressManager, migrateLegacyProgress } from './utils/progressManager'
import { loadModuleConfig } from './utils/moduleLoader'

function App() {
  // Multi-module navigation state
  const [navigationState, setNavigationState] = useState(createInitialNavigationState())
  const [moduleProgress, setModuleProgress] = useState({})
  const [moduleConfigs, setModuleConfigs] = useState({})

  // Initialize managers
  const [navigationManager] = useState(() => new NavigationManager(navigationState))
  const [progressManager] = useState(() => new ProgressManager(moduleProgress))

  // Load and migrate progress from localStorage on app start
  useEffect(() => {
    const loadInitialProgress = () => {
      try {
        // Check for legacy progress first
        const legacyProgress = localStorage.getItem('exerciseProgress')
        const newProgress = localStorage.getItem('moduleProgress')

        if (newProgress) {
          // Use existing new progress format
          const parsed = JSON.parse(newProgress)
          setModuleProgress(parsed)
          progressManager.setProgress(parsed)
        } else if (legacyProgress) {
          // Migrate legacy progress to new format
          const parsed = JSON.parse(legacyProgress)
          const migrated = migrateLegacyProgress(parsed, 'story-points')
          setModuleProgress(migrated)
          progressManager.setProgress(migrated)

          // Save migrated progress and remove legacy
          localStorage.setItem('moduleProgress', JSON.stringify(migrated))
          localStorage.removeItem('exerciseProgress')
        }
      } catch (error) {
        console.error('Failed to load progress from localStorage:', error)
      }
    }

    loadInitialProgress()
  }, [progressManager])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(moduleProgress).length > 0) {
      localStorage.setItem('moduleProgress', JSON.stringify(moduleProgress))
    }
  }, [moduleProgress])

  // Load module configurations as needed
  const loadModuleConfigIfNeeded = async (moduleId) => {
    if (!moduleConfigs[moduleId]) {
      try {
        const config = await loadModuleConfig(moduleId)
        setModuleConfigs(prev => ({
          ...prev,
          [moduleId]: config
        }))
        return config
      } catch (error) {
        console.error(`Failed to load config for module ${moduleId}:`, error)
        return null
      }
    }
    return moduleConfigs[moduleId]
  }

  // Navigation handlers
  const handleNavigation = (type, moduleId, exerciseId) => {
    let newNavState

    switch (type) {
      case 'home':
        newNavState = navigationManager.navigateToHome()
        break
      case 'module':
        newNavState = navigationManager.navigateToModule(moduleId)
        break
      case 'exercise':
        newNavState = navigationManager.navigateToExercise(moduleId, exerciseId)
        break
      default:
        return
    }

    setNavigationState(newNavState)
  }

  const handleExerciseStart = (moduleId, exerciseId) => {
    const newProgress = progressManager.startExercise(moduleId, exerciseId)
    setModuleProgress({ ...newProgress })
  }

  const handleExerciseComplete = async (moduleId, exerciseId) => {
    try {
      // Load module configuration to get exercise list
      const moduleConfig = await loadModuleConfigIfNeeded(moduleId)
      const moduleExercises = moduleConfig?.module?.exercises || []

      const newProgress = progressManager.completeExercise(moduleId, exerciseId, moduleExercises)
      setModuleProgress({ ...newProgress })

      // Auto-advance to next exercise or return to module overview
      const currentIndex = moduleExercises.findIndex(ex => ex.id === exerciseId)
      if (currentIndex >= 0 && currentIndex < moduleExercises.length - 1) {
        const nextExercise = moduleExercises[currentIndex + 1]
        handleNavigation('exercise', moduleId, nextExercise.id)
      } else {
        // Last exercise completed, return to module overview
        handleNavigation('module', moduleId)
      }
    } catch (error) {
      console.error('Failed to complete exercise:', error)
      // Fallback: just mark as complete without auto-advance
      const newProgress = progressManager.completeExercise(moduleId, exerciseId, [])
      setModuleProgress({ ...newProgress })
    }
  }

  const startFresh = () => {
    const newNavState = navigationManager.navigateToHome()
    setNavigationState(newNavState)
    progressManager.resetAll()
    setModuleProgress({})
  }

  const renderCurrentView = () => {
    if (navigationState.currentView === 'home') {
      return (
        <Home
          moduleProgress={moduleProgress}
          onNavigate={handleNavigation}
          onStartFresh={startFresh}
        />
      )
    }

    if (navigationState.currentView === 'module') {
      const currentModule = navigationState.currentModule
      const currentModuleProgress = moduleProgress[currentModule] || { exercises: {} }

      if (currentModule === 'story-points') {
        return (
          <Suspense fallback={<div className="module-loading">Loading Story Points module...</div>}>
            <StoryPointModule
              currentExercise={navigationState.currentExercise}
              moduleProgress={currentModuleProgress}
              onExerciseComplete={handleExerciseComplete}
              onExerciseStart={handleExerciseStart}
              onNavigate={handleNavigation}
            />
          </Suspense>
        )
      }

      if (currentModule === 'story-hierarchy') {
        return (
          <Suspense fallback={<div className="module-loading">Loading Story Hierarchy module...</div>}>
            <StoryHierarchyModule
              currentExercise={navigationState.currentExercise}
              moduleProgress={currentModuleProgress}
              onExerciseComplete={handleExerciseComplete}
              onExerciseStart={handleExerciseStart}
              onNavigate={handleNavigation}
            />
          </Suspense>
        )
      }

      if (currentModule === 'sprint-planning') {
        return (
          <Suspense fallback={<div className="module-loading">Loading Sprint Planning module...</div>}>
            <SprintPlanningModule
              currentExercise={navigationState.currentExercise}
              moduleProgress={currentModuleProgress}
              onExerciseComplete={handleExerciseComplete}
              onExerciseStart={handleExerciseStart}
              onNavigate={handleNavigation}
            />
          </Suspense>
        )
      }

      // Fallback for unknown modules
      return (
        <div className="error">
          <h2>Module not found</h2>
          <p>The module "{currentModule}" is not implemented yet.</p>
          <button onClick={() => handleNavigation('home')}>Return to Home</button>
        </div>
      )
    }

    return null
  }

  // Generate breadcrumbs for navigation
  const breadcrumbs = generateBreadcrumbs(navigationState)

  return (
    <div className="app">
      {breadcrumbs.length > 1 && (
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          onNavigate={handleNavigation}
        />
      )}
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </div>
  )
}

export default App
