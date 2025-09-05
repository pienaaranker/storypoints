/**
 * Data loading utilities for exercise system
 * Handles loading and validation of exercise data from JSON files
 * Includes backward compatibility with new module system
 */

// Import new module system utilities
import { loadModuleConfig, loadExerciseData } from './moduleLoader.js'

/**
 * Validates that required properties exist on an object
 * @param {Object} obj - Object to validate
 * @param {Array} requiredProps - Array of required property names
 * @param {string} context - Context for error messages
 * @throws {Error} If validation fails
 */
function validateRequiredProperties(obj, requiredProps, context) {
  const missing = requiredProps.filter(prop => !(prop in obj))
  if (missing.length > 0) {
    throw new Error(`${context}: Missing required properties: ${missing.join(', ')}`)
  }
}

/**
 * Validates exercise metadata structure
 * @param {Object} exercise - Exercise object to validate
 * @throws {Error} If validation fails
 */
function validateExercise(exercise) {
  const requiredProps = ['id', 'title', 'description', 'details', 'type', 'config', 'ui']
  validateRequiredProperties(exercise, requiredProps, `Exercise ${exercise.id || 'unknown'}`)

  // Validate config - pointScale is only required for exercises 1 and 2 (not quiz or categorization)
  const configRequiredProps = (exercise.id === 3 || exercise.id === 4) ? [] : ['pointScale']
  if (configRequiredProps.length > 0) {
    validateRequiredProperties(exercise.config, configRequiredProps, `Exercise ${exercise.id} config`)
  }

  // Validate UI
  validateRequiredProperties(exercise.ui, ['startScreen'], `Exercise ${exercise.id} UI`)
  validateRequiredProperties(exercise.ui.startScreen, ['instructions', 'buttonText'], `Exercise ${exercise.id} start screen`)
}

/**
 * Validates abstract item structure
 * @param {Object} item - Item object to validate
 * @throws {Error} If validation fails
 */
function validateAbstractItem(item) {
  const requiredProps = ['id', 'name', 'description', 'correctOrder', 'correctPoints', 'explanation']
  validateRequiredProperties(item, requiredProps, `Abstract item ${item.id || 'unknown'}`)
}

/**
 * Validates user story structure
 * @param {Object} story - Story object to validate
 * @throws {Error} If validation fails
 */
function validateUserStory(story) {
  const requiredProps = ['id', 'title', 'description', 'acceptanceCriteria', 'correctOrder', 'correctPoints', 'factors', 'explanation']
  validateRequiredProperties(story, requiredProps, `User story ${story.id || 'unknown'}`)
  
  // Validate factors
  validateRequiredProperties(story.factors, ['complexity', 'effort', 'uncertainty'], `User story ${story.id} factors`)
  
  // Validate acceptance criteria is array
  if (!Array.isArray(story.acceptanceCriteria)) {
    throw new Error(`User story ${story.id}: acceptanceCriteria must be an array`)
  }
}

/**
 * Validates quiz question structure
 * @param {Object} question - Question object to validate
 * @throws {Error} If validation fails
 */
function validateQuizQuestion(question) {
  const requiredProps = ['id', 'question', 'answer', 'explanation', 'category']
  validateRequiredProperties(question, requiredProps, `Quiz question ${question.id || 'unknown'}`)

  // Validate answer is boolean
  if (typeof question.answer !== 'boolean') {
    throw new Error(`Quiz question ${question.id}: answer must be a boolean`)
  }
}

/**
 * Validates story readiness scenario structure
 * @param {Object} story - Story object to validate
 * @throws {Error} If validation fails
 */
function validateReadinessStory(story) {
  const requiredProps = ['id', 'title', 'description', 'acceptanceCriteria', 'correctCategory', 'explanation', 'reasoning', 'techniques']
  validateRequiredProperties(story, requiredProps, `Readiness story ${story.id || 'unknown'}`)

  // Validate acceptance criteria is array
  if (!Array.isArray(story.acceptanceCriteria)) {
    throw new Error(`Readiness story ${story.id}: acceptanceCriteria must be an array`)
  }

  // Validate techniques is array
  if (!Array.isArray(story.techniques)) {
    throw new Error(`Readiness story ${story.id}: techniques must be an array`)
  }
}

/**
 * Loads and validates exercise metadata from module configuration
 * @param {string} moduleId - Module identifier (default: 'story-points')
 * @returns {Promise<Object>} Exercise metadata
 * @throws {Error} If loading or validation fails
 */
export async function loadExerciseMetadata(moduleId = 'story-points') {
  try {
    const moduleConfig = await loadModuleConfig(moduleId)

    if (!moduleConfig || !moduleConfig.module || !moduleConfig.module.exercises) {
      throw new Error('Invalid module configuration structure')
    }

    // Validate each exercise
    moduleConfig.module.exercises.forEach(validateExercise)

    return {
      exercises: moduleConfig.module.exercises,
      metadata: moduleConfig.metadata,
      module: moduleConfig.module
    }
  } catch (error) {
    console.error('Failed to load exercise metadata:', error)
    throw new Error(`Exercise metadata loading failed: ${error.message}`)
  }
}

/**
 * Loads and validates abstract items for Exercise 1
 * @param {string} moduleId - Module identifier (default: 'story-points')
 * @returns {Promise<Array>} Array of abstract items
 * @throws {Error} If loading or validation fails
 */
export async function loadAbstractItems(moduleId = 'story-points') {
  try {
    const exerciseData = await loadExerciseData(moduleId, 1)

    if (!exerciseData || !exerciseData.items) {
      throw new Error('Invalid exercise 1 data structure')
    }

    // Validate each item
    exerciseData.items.forEach(validateAbstractItem)

    return exerciseData.items
  } catch (error) {
    console.error('Failed to load abstract items:', error)
    throw new Error(`Abstract items loading failed: ${error.message}`)
  }
}

/**
 * Loads and validates user stories for Exercise 2
 * @param {string} moduleId - Module identifier (default: 'story-points')
 * @returns {Promise<Array>} Array of user stories
 * @throws {Error} If loading or validation fails
 */
export async function loadUserStories(moduleId = 'story-points') {
  try {
    const exerciseData = await loadExerciseData(moduleId, 2)

    if (!exerciseData || !exerciseData.stories) {
      throw new Error('Invalid exercise 2 data structure')
    }

    // Validate each story
    exerciseData.stories.forEach(validateUserStory)

    return exerciseData.stories
  } catch (error) {
    console.error('Failed to load user stories:', error)
    throw new Error(`User stories loading failed: ${error.message}`)
  }
}

/**
 * Loads and validates quiz questions for Exercise 3
 * @param {string} moduleId - Module identifier (default: 'story-points')
 * @returns {Promise<Array>} Array of quiz questions
 * @throws {Error} If loading or validation fails
 */
export async function loadQuizQuestions(moduleId = 'story-points') {
  try {
    const exerciseData = await loadExerciseData(moduleId, 3)

    if (!exerciseData || !exerciseData.questions) {
      throw new Error('Invalid exercise 3 data structure')
    }

    // Validate each question
    exerciseData.questions.forEach(validateQuizQuestion)

    return exerciseData.questions
  } catch (error) {
    console.error('Failed to load quiz questions:', error)
    throw new Error(`Quiz questions loading failed: ${error.message}`)
  }
}

/**
 * Loads and validates story readiness scenarios for Exercise 4
 * @param {string} moduleId - Module identifier (default: 'story-points')
 * @returns {Promise<Array>} Array of story readiness scenarios
 * @throws {Error} If loading or validation fails
 */
export async function loadReadinessStories(moduleId = 'story-points') {
  try {
    const exerciseData = await loadExerciseData(moduleId, 4)

    if (!exerciseData || !exerciseData.stories) {
      throw new Error('Invalid exercise 4 data structure')
    }

    // Validate each story
    exerciseData.stories.forEach(validateReadinessStory)

    return exerciseData.stories
  } catch (error) {
    console.error('Failed to load readiness stories:', error)
    throw new Error(`Readiness stories loading failed: ${error.message}`)
  }
}

/**
 * Gets exercise configuration by ID using new module system
 * @param {number} exerciseId - Exercise ID
 * @param {string} moduleId - Module ID (default: 'story-points')
 * @returns {Promise<Object>} Exercise configuration
 * @throws {Error} If exercise not found
 */
export async function getExerciseConfig(exerciseId, moduleId = 'story-points') {
  try {
    const moduleConfig = await loadModuleConfig(moduleId)
    const exercise = moduleConfig.module.exercises.find(ex => ex.id === exerciseId)

    if (!exercise) {
      throw new Error(`Exercise ${exerciseId} not found in module ${moduleId}`)
    }

    return exercise
  } catch (error) {
    console.error(`Failed to load exercise config for ${moduleId}/exercise/${exerciseId}:`, error)
    throw new Error(`Exercise configuration loading failed: ${error.message}`)
  }
}

/**
 * Gets exercise configuration by ID using new module system (async)
 * @param {number} exerciseId - Exercise ID
 * @param {string} moduleId - Module ID (default: 'story-points')
 * @returns {Promise<Object>} Exercise configuration
 * @throws {Error} If exercise not found
 */
export async function getExerciseConfigAsync(exerciseId, moduleId = 'story-points') {
  try {
    // Try new module-based loading first
    return await getModuleExerciseConfig(moduleId, exerciseId)
  } catch (error) {
    console.warn('Falling back to legacy exercise loading:', error.message)

    // Fall back to legacy loading
    const metadata = loadExerciseMetadata()
    const exercise = metadata.exercises.find(ex => ex.id === exerciseId)

    if (!exercise) {
      throw new Error(`Exercise ${exerciseId} not found`)
    }

    return exercise
  }
}

/**
 * Enhanced data loading with module support and backward compatibility
 * @param {string} moduleId - Module ID (default: 'story-points')
 * @param {number} exerciseId - Exercise ID
 * @returns {Promise<Object>} Exercise data
 */
export async function loadEnhancedExerciseData(moduleId = 'story-points', exerciseId) {
  try {
    // Try new module-based loading first
    return await loadExerciseData(moduleId, exerciseId)
  } catch (error) {
    console.warn(`Falling back to legacy data loading for exercise ${exerciseId}:`, error.message)

    // Fall back to legacy loading based on exercise ID
    switch (exerciseId) {
      case 1:
        return { items: loadAbstractItems() }
      case 2:
        return { stories: loadUserStories() }
      case 3:
        return { questions: loadQuizQuestions() }
      case 4:
        return { stories: loadReadinessStories() }
      default:
        throw new Error(`No fallback data available for exercise ${exerciseId}`)
    }
  }
}

/**
 * Loads all exercise data with error handling
 * @returns {Object} Object containing all exercise data
 */
export function loadAllExerciseData() {
  const data = {}
  const errors = []

  try {
    data.metadata = loadExerciseMetadata()
  } catch (error) {
    errors.push(`Metadata: ${error.message}`)
  }

  try {
    data.abstractItems = loadAbstractItems()
  } catch (error) {
    errors.push(`Abstract items: ${error.message}`)
  }

  try {
    data.userStories = loadUserStories()
  } catch (error) {
    errors.push(`User stories: ${error.message}`)
  }

  try {
    data.quizQuestions = loadQuizQuestions()
  } catch (error) {
    errors.push(`Quiz questions: ${error.message}`)
  }

  try {
    data.readinessStories = loadReadinessStories()
  } catch (error) {
    errors.push(`Readiness stories: ${error.message}`)
  }

  if (errors.length > 0) {
    console.warn('Some exercise data failed to load:', errors)
  }

  return { data, errors }
}
