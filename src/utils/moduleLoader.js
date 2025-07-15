/**
 * Module loading utilities for multi-module architecture
 * Handles dynamic loading of platform and module configurations
 */

// Dynamic imports for modules
const moduleConfigs = {
  'story-points': () => import('../data/modules/story-points/module-config.json'),
  'story-hierarchy': () => import('../data/modules/story-hierarchy/module-config.json'),
  'sprint-planning': () => import('../data/modules/sprint-planning/module-config.json'),
  'definition-of-done': () => import('../data/modules/definition-of-done/module-config.json'),
  'agile-metrics': () => import('../data/modules/agile-metrics/module-config.json')
}

const exerciseDataLoaders = {
  'story-points': {
    1: () => import('../data/modules/story-points/exercise1-items.json'),
    2: () => import('../data/modules/story-points/exercise2-stories.json'),
    3: () => import('../data/modules/story-points/exercise3-questions.json')
  },
  'definition-of-done': {
    1: () => import('../data/modules/definition-of-done/dod-scenarios.json'),
    2: () => import('../data/modules/definition-of-done/ac-scenarios.json'),
    3: () => import('../data/modules/definition-of-done/quality-gate-scenarios.json')
  },
  'agile-metrics': {
    1: () => import('../data/modules/agile-metrics/velocity-scenarios.json'),
    2: () => import('../data/modules/agile-metrics/burndown-scenarios.json'),
    3: () => import('../data/modules/agile-metrics/cycle-time-scenarios.json'),
    4: () => import('../data/modules/agile-metrics/team-health-scenarios.json')
  }
  // Future modules will be added here
}

/**
 * Loads platform configuration
 * @returns {Promise<Object>} Platform configuration
 * @throws {Error} If loading fails
 */
export async function loadPlatformConfig() {
  try {
    const config = await import('../data/platform-config.json')
    return config.default
  } catch (error) {
    console.error('Failed to load platform config:', error)
    throw new Error(`Platform configuration loading failed: ${error.message}`)
  }
}

/**
 * Loads module configuration by ID
 * @param {string} moduleId - Module identifier
 * @returns {Promise<Object>} Module configuration
 * @throws {Error} If module not found or loading fails
 */
export async function loadModuleConfig(moduleId) {
  try {
    if (!moduleConfigs[moduleId]) {
      throw new Error(`Module ${moduleId} not found`)
    }
    const config = await moduleConfigs[moduleId]()
    return config.default
  } catch (error) {
    console.error(`Failed to load module config for ${moduleId}:`, error)
    throw new Error(`Module ${moduleId} configuration loading failed: ${error.message}`)
  }
}

/**
 * Loads exercise data for a specific module and exercise
 * @param {string} moduleId - Module identifier
 * @param {number} exerciseId - Exercise identifier
 * @returns {Promise<Object>} Exercise data
 * @throws {Error} If exercise data not found or loading fails
 */
export async function loadExerciseData(moduleId, exerciseId) {
  try {
    if (!exerciseDataLoaders[moduleId] || !exerciseDataLoaders[moduleId][exerciseId]) {
      throw new Error(`Exercise data for ${moduleId}/exercise/${exerciseId} not found`)
    }
    const data = await exerciseDataLoaders[moduleId][exerciseId]()
    return data.default
  } catch (error) {
    console.error(`Failed to load exercise data for ${moduleId}/${exerciseId}:`, error)
    throw new Error(`Exercise data loading failed: ${error.message}`)
  }
}

/**
 * Gets exercise configuration from module config
 * @param {string} moduleId - Module identifier
 * @param {number} exerciseId - Exercise identifier
 * @returns {Promise<Object>} Exercise configuration
 * @throws {Error} If exercise not found
 */
export async function getModuleExerciseConfig(moduleId, exerciseId) {
  try {
    const moduleConfig = await loadModuleConfig(moduleId)
    const exercise = moduleConfig.module.exercises.find(ex => ex.id === exerciseId)
    
    if (!exercise) {
      throw new Error(`Exercise ${exerciseId} not found in module ${moduleId}`)
    }
    
    return exercise
  } catch (error) {
    console.error(`Failed to get exercise config for ${moduleId}/${exerciseId}:`, error)
    throw error
  }
}

/**
 * Loads all available modules from platform config
 * @returns {Promise<Array>} Array of module configurations
 */
export async function loadAvailableModules() {
  try {
    const platformConfig = await loadPlatformConfig()
    return platformConfig.platform.modules || []
  } catch (error) {
    console.error('Failed to load available modules:', error)
    throw error
  }
}

/**
 * Checks if a module is available
 * @param {string} moduleId - Module identifier
 * @returns {Promise<boolean>} True if module is available
 */
export async function isModuleAvailable(moduleId) {
  try {
    const modules = await loadAvailableModules()
    return modules.some(module => module.id === moduleId && module.status === 'available')
  } catch (error) {
    console.error(`Failed to check availability for module ${moduleId}:`, error)
    return false
  }
}
