/**
 * Data loading utilities for exercise system
 * Handles loading and validation of exercise data from JSON files
 */

// Import JSON files
import exercisesData from '../data/exercises.json'
import exercise1Data from '../data/exercise1-items.json'
import exercise2Data from '../data/exercise2-stories.json'
import exercise3Data from '../data/exercise3-questions.json'

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

  // Validate config - pointScale is only required for exercises 1 and 2 (not quiz)
  const configRequiredProps = exercise.id === 3 ? [] : ['pointScale']
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
 * Loads and validates exercise metadata
 * @returns {Object} Exercise metadata
 * @throws {Error} If loading or validation fails
 */
export function loadExerciseMetadata() {
  try {
    if (!exercisesData || !exercisesData.exercises) {
      throw new Error('Invalid exercises data structure')
    }

    // Validate each exercise
    exercisesData.exercises.forEach(validateExercise)

    return exercisesData
  } catch (error) {
    console.error('Failed to load exercise metadata:', error)
    throw new Error(`Exercise metadata loading failed: ${error.message}`)
  }
}

/**
 * Loads and validates abstract items for Exercise 1
 * @returns {Array} Array of abstract items
 * @throws {Error} If loading or validation fails
 */
export function loadAbstractItems() {
  try {
    if (!exercise1Data || !exercise1Data.items) {
      throw new Error('Invalid exercise 1 data structure')
    }

    // Validate each item
    exercise1Data.items.forEach(validateAbstractItem)

    return exercise1Data.items
  } catch (error) {
    console.error('Failed to load abstract items:', error)
    throw new Error(`Abstract items loading failed: ${error.message}`)
  }
}

/**
 * Loads and validates user stories for Exercise 2
 * @returns {Array} Array of user stories
 * @throws {Error} If loading or validation fails
 */
export function loadUserStories() {
  try {
    if (!exercise2Data || !exercise2Data.stories) {
      throw new Error('Invalid exercise 2 data structure')
    }

    // Validate each story
    exercise2Data.stories.forEach(validateUserStory)

    return exercise2Data.stories
  } catch (error) {
    console.error('Failed to load user stories:', error)
    throw new Error(`User stories loading failed: ${error.message}`)
  }
}

/**
 * Loads and validates quiz questions for Exercise 3
 * @returns {Array} Array of quiz questions
 * @throws {Error} If loading or validation fails
 */
export function loadQuizQuestions() {
  try {
    if (!exercise3Data || !exercise3Data.questions) {
      throw new Error('Invalid exercise 3 data structure')
    }

    // Validate each question
    exercise3Data.questions.forEach(validateQuizQuestion)

    return exercise3Data.questions
  } catch (error) {
    console.error('Failed to load quiz questions:', error)
    throw new Error(`Quiz questions loading failed: ${error.message}`)
  }
}

/**
 * Gets exercise configuration by ID
 * @param {number} exerciseId - Exercise ID
 * @returns {Object} Exercise configuration
 * @throws {Error} If exercise not found
 */
export function getExerciseConfig(exerciseId) {
  const metadata = loadExerciseMetadata()
  const exercise = metadata.exercises.find(ex => ex.id === exerciseId)
  
  if (!exercise) {
    throw new Error(`Exercise ${exerciseId} not found`)
  }
  
  return exercise
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

  if (errors.length > 0) {
    console.warn('Some exercise data failed to load:', errors)
  }

  return { data, errors }
}
