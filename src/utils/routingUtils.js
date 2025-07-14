/**
 * Routing utilities for multi-module navigation
 * Handles hierarchical routing between home, modules, and exercises
 */

/**
 * Navigation state structure for multi-module routing
 */
export const NavigationStates = {
  HOME: 'home',
  MODULE: 'module'
}

/**
 * Creates initial navigation state
 * @returns {Object} Initial navigation state
 */
export function createInitialNavigationState() {
  return {
    currentView: NavigationStates.HOME,
    currentModule: null,
    currentExercise: null
  }
}

/**
 * Navigation state manager class
 */
export class NavigationManager {
  constructor(initialState = null) {
    this.state = initialState || createInitialNavigationState()
    this.history = [{ ...this.state }]
  }

  /**
   * Navigates to home view
   * @returns {Object} Updated navigation state
   */
  navigateToHome() {
    this.state = {
      currentView: NavigationStates.HOME,
      currentModule: null,
      currentExercise: null
    }
    this.addToHistory()
    return this.state
  }

  /**
   * Navigates to a specific module
   * @param {string} moduleId - Module identifier
   * @returns {Object} Updated navigation state
   */
  navigateToModule(moduleId) {
    this.state = {
      currentView: NavigationStates.MODULE,
      currentModule: moduleId,
      currentExercise: null
    }
    this.addToHistory()
    return this.state
  }

  /**
   * Navigates to a specific exercise within a module
   * @param {string} moduleId - Module identifier
   * @param {number} exerciseId - Exercise identifier
   * @returns {Object} Updated navigation state
   */
  navigateToExercise(moduleId, exerciseId) {
    this.state = {
      currentView: NavigationStates.MODULE,
      currentModule: moduleId,
      currentExercise: exerciseId
    }
    this.addToHistory()
    return this.state
  }

  /**
   * Navigates to the next exercise in sequence
   * @param {string} moduleId - Module identifier
   * @param {number} currentExerciseId - Current exercise identifier
   * @param {Array} moduleExercises - Array of all exercises in the module
   * @returns {Object} Updated navigation state or null if no next exercise
   */
  navigateToNextExercise(moduleId, currentExerciseId, moduleExercises = []) {
    const currentIndex = moduleExercises.findIndex(ex => ex.id === currentExerciseId)
    
    if (currentIndex >= 0 && currentIndex < moduleExercises.length - 1) {
      const nextExercise = moduleExercises[currentIndex + 1]
      return this.navigateToExercise(moduleId, nextExercise.id)
    }
    
    // No next exercise, return to module overview
    return this.navigateToModule(moduleId)
  }

  /**
   * Navigates to the previous exercise in sequence
   * @param {string} moduleId - Module identifier
   * @param {number} currentExerciseId - Current exercise identifier
   * @param {Array} moduleExercises - Array of all exercises in the module
   * @returns {Object} Updated navigation state or null if no previous exercise
   */
  navigateToPreviousExercise(moduleId, currentExerciseId, moduleExercises = []) {
    const currentIndex = moduleExercises.findIndex(ex => ex.id === currentExerciseId)
    
    if (currentIndex > 0) {
      const previousExercise = moduleExercises[currentIndex - 1]
      return this.navigateToExercise(moduleId, previousExercise.id)
    }
    
    // No previous exercise, return to module overview
    return this.navigateToModule(moduleId)
  }

  /**
   * Goes back to the previous navigation state
   * @returns {Object} Previous navigation state or current if no history
   */
  goBack() {
    if (this.history.length > 1) {
      this.history.pop() // Remove current state
      this.state = { ...this.history[this.history.length - 1] }
      return this.state
    }
    return this.state
  }

  /**
   * Gets the current navigation state
   * @returns {Object} Current navigation state
   */
  getCurrentState() {
    return { ...this.state }
  }

  /**
   * Checks if currently at home
   * @returns {boolean} True if at home
   */
  isAtHome() {
    return this.state.currentView === NavigationStates.HOME
  }

  /**
   * Checks if currently in a module (but not in an exercise)
   * @returns {boolean} True if in module overview
   */
  isInModule() {
    return this.state.currentView === NavigationStates.MODULE && 
           this.state.currentModule && 
           !this.state.currentExercise
  }

  /**
   * Checks if currently in an exercise
   * @returns {boolean} True if in an exercise
   */
  isInExercise() {
    return this.state.currentView === NavigationStates.MODULE && 
           this.state.currentModule && 
           this.state.currentExercise
  }

  /**
   * Adds current state to history
   * @private
   */
  addToHistory() {
    this.history.push({ ...this.state })
    // Keep history limited to prevent memory issues
    if (this.history.length > 50) {
      this.history = this.history.slice(-25)
    }
  }

  /**
   * Clears navigation history
   */
  clearHistory() {
    this.history = [{ ...this.state }]
  }
}

/**
 * Generates breadcrumb data for current navigation state
 * @param {Object} navigationState - Current navigation state
 * @param {Object} moduleConfig - Module configuration (optional)
 * @returns {Array} Array of breadcrumb items
 */
export function generateBreadcrumbs(navigationState, moduleConfig = null) {
  const breadcrumbs = [
    { label: 'Home', path: 'home', icon: '🏠' }
  ]

  if (navigationState.currentModule) {
    const moduleTitle = moduleConfig?.module?.title || 
                       navigationState.currentModule.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    breadcrumbs.push({
      label: moduleTitle,
      path: `module:${navigationState.currentModule}`,
      icon: '📚'
    })
  }

  if (navigationState.currentExercise) {
    const exerciseTitle = moduleConfig?.module?.exercises?.find(ex => ex.id === navigationState.currentExercise)?.title ||
                         `Exercise ${navigationState.currentExercise}`
    
    breadcrumbs.push({
      label: exerciseTitle,
      path: `exercise:${navigationState.currentModule}:${navigationState.currentExercise}`,
      icon: '📝',
      current: true
    })
  }

  return breadcrumbs
}

/**
 * Migrates legacy navigation state to new format
 * @param {string|number} legacyCurrentView - Legacy currentView value
 * @param {string} defaultModuleId - Default module ID for migration
 * @returns {Object} New navigation state format
 */
export function migrateLegacyNavigation(legacyCurrentView, defaultModuleId = 'story-points') {
  if (legacyCurrentView === 'home') {
    return createInitialNavigationState()
  }
  
  if (typeof legacyCurrentView === 'number') {
    return {
      currentView: NavigationStates.MODULE,
      currentModule: defaultModuleId,
      currentExercise: legacyCurrentView
    }
  }
  
  // Fallback to home
  return createInitialNavigationState()
}
