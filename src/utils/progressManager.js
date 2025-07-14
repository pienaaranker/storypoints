/**
 * Progress management utilities for multi-module architecture
 * Handles hierarchical progress tracking across modules and exercises
 */

/**
 * Progress Manager class for handling module and exercise progress
 */
export class ProgressManager {
  constructor(initialProgress = {}) {
    this.progress = initialProgress
  }

  /**
   * Starts a module (marks as started)
   * @param {string} moduleId - Module identifier
   * @returns {Object} Updated progress state
   */
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

  /**
   * Starts an exercise within a module
   * @param {string} moduleId - Module identifier
   * @param {number} exerciseId - Exercise identifier
   * @returns {Object} Updated progress state
   */
  startExercise(moduleId, exerciseId) {
    this.ensureModuleExists(moduleId)
    
    if (!this.progress[moduleId].exercises[exerciseId]) {
      this.progress[moduleId].exercises[exerciseId] = {
        started: true,
        completed: false
      }
    } else {
      this.progress[moduleId].exercises[exerciseId].started = true
    }
    
    return this.progress
  }

  /**
   * Completes an exercise and checks for module completion
   * @param {string} moduleId - Module identifier
   * @param {number} exerciseId - Exercise identifier
   * @param {Array} moduleExercises - Array of all exercises in the module
   * @returns {Object} Updated progress state
   */
  completeExercise(moduleId, exerciseId, moduleExercises = []) {
    this.ensureModuleExists(moduleId)
    
    // Mark exercise as completed
    if (!this.progress[moduleId].exercises[exerciseId]) {
      this.progress[moduleId].exercises[exerciseId] = {
        started: true,
        completed: true
      }
    } else {
      this.progress[moduleId].exercises[exerciseId].completed = true
    }

    // Check if all exercises in module are completed
    if (moduleExercises.length > 0) {
      const allCompleted = moduleExercises.every(exercise =>
        this.progress[moduleId].exercises[exercise.id]?.completed
      )

      if (allCompleted) {
        this.progress[moduleId].moduleCompleted = true
      }
    }

    return this.progress
  }

  /**
   * Gets progress for a specific module
   * @param {string} moduleId - Module identifier
   * @returns {Object|null} Module progress or null if not found
   */
  getModuleProgress(moduleId) {
    return this.progress[moduleId] || null
  }

  /**
   * Gets progress for a specific exercise
   * @param {string} moduleId - Module identifier
   * @param {number} exerciseId - Exercise identifier
   * @returns {Object|null} Exercise progress or null if not found
   */
  getExerciseProgress(moduleId, exerciseId) {
    const moduleProgress = this.getModuleProgress(moduleId)
    return moduleProgress?.exercises[exerciseId] || null
  }

  /**
   * Calculates overall progress percentage across all modules
   * @returns {number} Progress percentage (0-100)
   */
  getOverallProgress() {
    const modules = Object.keys(this.progress)
    if (modules.length === 0) return 0
    
    const completedModules = modules.filter(id =>
      this.progress[id]?.moduleCompleted
    ).length
    
    return Math.round((completedModules / modules.length) * 100)
  }

  /**
   * Calculates progress percentage for a specific module
   * @param {string} moduleId - Module identifier
   * @param {Array} moduleExercises - Array of all exercises in the module
   * @returns {number} Module progress percentage (0-100)
   */
  getModuleProgressPercentage(moduleId, moduleExercises = []) {
    const moduleProgress = this.getModuleProgress(moduleId)
    if (!moduleProgress || moduleExercises.length === 0) return 0
    
    const completedExercises = moduleExercises.filter(exercise =>
      moduleProgress.exercises[exercise.id]?.completed
    ).length
    
    return Math.round((completedExercises / moduleExercises.length) * 100)
  }

  /**
   * Resets progress for a specific module
   * @param {string} moduleId - Module identifier
   * @returns {Object} Updated progress state
   */
  resetModule(moduleId) {
    if (this.progress[moduleId]) {
      this.progress[moduleId] = {
        moduleStarted: false,
        moduleCompleted: false,
        exercises: {}
      }
    }
    return this.progress
  }

  /**
   * Resets all progress
   * @returns {Object} Empty progress state
   */
  resetAll() {
    this.progress = {}
    return this.progress
  }

  /**
   * Ensures a module exists in progress state
   * @private
   * @param {string} moduleId - Module identifier
   */
  ensureModuleExists(moduleId) {
    if (!this.progress[moduleId]) {
      this.progress[moduleId] = {
        moduleStarted: false,
        moduleCompleted: false,
        exercises: {}
      }
    }
  }

  /**
   * Gets the current progress state
   * @returns {Object} Current progress state
   */
  getProgress() {
    return this.progress
  }

  /**
   * Sets the entire progress state
   * @param {Object} newProgress - New progress state
   * @returns {Object} Updated progress state
   */
  setProgress(newProgress) {
    this.progress = newProgress || {}
    return this.progress
  }
}

/**
 * Migrates legacy exercise progress to new module structure
 * @param {Object} legacyProgress - Legacy progress format
 * @param {string} moduleId - Target module ID (default: 'story-points')
 * @returns {Object} New module progress format
 */
export function migrateLegacyProgress(legacyProgress, moduleId = 'story-points') {
  if (!legacyProgress || typeof legacyProgress !== 'object') {
    return {}
  }

  const hasStarted = Object.values(legacyProgress).some(p => p.started)
  const hasCompleted = Object.values(legacyProgress).every(p => p.completed)

  return {
    [moduleId]: {
      moduleStarted: hasStarted,
      moduleCompleted: hasCompleted,
      exercises: legacyProgress
    }
  }
}
