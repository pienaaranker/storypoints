/**
 * Progressive Learning Manager for Story Point Estimation
 * Manages difficulty scaling, learning checkpoints, and adaptive content
 */

/**
 * Complexity levels for progressive learning
 */
export const COMPLEXITY_LEVELS = {
  FOUNDATION: 'foundation',
  INTERMEDIATE: 'intermediate', 
  ADVANCED: 'advanced',
  EXPERT: 'expert'
}

/**
 * Learning checkpoints for skill validation
 */
export const LEARNING_CHECKPOINTS = {
  BASIC_SIZING: 'basic_sizing',
  RELATIVE_COMPARISON: 'relative_comparison',
  STORY_BREAKDOWN: 'story_breakdown',
  TEAM_ESTIMATION: 'team_estimation',
  UNCERTAINTY_HANDLING: 'uncertainty_handling'
}

/**
 * Skill assessment criteria
 */
export const SKILL_CRITERIA = {
  [LEARNING_CHECKPOINTS.BASIC_SIZING]: {
    name: 'Basic Sizing',
    description: 'Ability to assign appropriate story points to clear, simple stories',
    requiredAccuracy: 0.8,
    minAttempts: 5
  },
  [LEARNING_CHECKPOINTS.RELATIVE_COMPARISON]: {
    name: 'Relative Comparison',
    description: 'Consistent relative sizing across different story types',
    requiredAccuracy: 0.75,
    minAttempts: 8
  },
  [LEARNING_CHECKPOINTS.STORY_BREAKDOWN]: {
    name: 'Story Breakdown',
    description: 'Identifying when stories need breakdown and applying techniques',
    requiredAccuracy: 0.7,
    minAttempts: 6
  },
  [LEARNING_CHECKPOINTS.TEAM_ESTIMATION]: {
    name: 'Team Estimation',
    description: 'Understanding collaborative estimation dynamics',
    requiredAccuracy: 0.75,
    minAttempts: 4
  },
  [LEARNING_CHECKPOINTS.UNCERTAINTY_HANDLING]: {
    name: 'Uncertainty Handling',
    description: 'Managing high-uncertainty and complex estimation scenarios',
    requiredAccuracy: 0.65,
    minAttempts: 5
  }
}

/**
 * Progressive Learning Manager class
 */
export class ProgressiveLearningManager {
  constructor(initialState = {}) {
    this.learnerState = {
      currentLevel: COMPLEXITY_LEVELS.FOUNDATION,
      completedCheckpoints: [],
      skillScores: {},
      adaptiveSettings: {
        showHints: true,
        allowRetries: true,
        detailedFeedback: true
      },
      ...initialState
    }
  }

  /**
   * Determines the appropriate complexity level for the learner
   * @returns {string} Current complexity level
   */
  getCurrentComplexityLevel() {
    const checkpointCount = this.learnerState.completedCheckpoints.length
    
    if (checkpointCount >= 4) {
      return COMPLEXITY_LEVELS.EXPERT
    } else if (checkpointCount >= 3) {
      return COMPLEXITY_LEVELS.ADVANCED
    } else if (checkpointCount >= 1) {
      return COMPLEXITY_LEVELS.INTERMEDIATE
    }
    
    return COMPLEXITY_LEVELS.FOUNDATION
  }

  /**
   * Filters stories based on current complexity level
   * @param {Array} stories - Array of story objects
   * @returns {Array} Filtered stories appropriate for current level
   */
  getStoriesForCurrentLevel(stories) {
    const level = this.getCurrentComplexityLevel()
    
    return stories.filter(story => {
      const storyLevel = this.determineStoryComplexity(story)
      return this.isStoryAppropriateForLevel(storyLevel, level)
    })
  }

  /**
   * Determines the complexity level of a story
   * @param {Object} story - Story object
   * @returns {string} Complexity level
   */
  determineStoryComplexity(story) {
    const factors = story.complexityFactors || {}
    const hasBreakdown = story.breakdownRequired || false
    const hasVariance = story.estimationVariance && Object.keys(story.estimationVariance).length > 1
    const hasUncertainty = factors.uncertainty === 'high'
    
    // Expert level: Multiple complexity factors, high uncertainty
    if (hasUncertainty && hasBreakdown && hasVariance) {
      return COMPLEXITY_LEVELS.EXPERT
    }
    
    // Advanced level: Breakdown required or high complexity
    if (hasBreakdown || factors.technical === 'high' || factors.business === 'high') {
      return COMPLEXITY_LEVELS.ADVANCED
    }
    
    // Intermediate level: Some complexity factors or team variance
    if (hasVariance || factors.technical === 'medium' || factors.business === 'medium') {
      return COMPLEXITY_LEVELS.INTERMEDIATE
    }
    
    // Foundation level: Clear, simple stories
    return COMPLEXITY_LEVELS.FOUNDATION
  }

  /**
   * Checks if a story is appropriate for the given level
   * @param {string} storyLevel - Story complexity level
   * @param {string} learnerLevel - Learner's current level
   * @returns {boolean} Whether story is appropriate
   */
  isStoryAppropriateForLevel(storyLevel, learnerLevel) {
    const levelOrder = [
      COMPLEXITY_LEVELS.FOUNDATION,
      COMPLEXITY_LEVELS.INTERMEDIATE,
      COMPLEXITY_LEVELS.ADVANCED,
      COMPLEXITY_LEVELS.EXPERT
    ]
    
    const storyIndex = levelOrder.indexOf(storyLevel)
    const learnerIndex = levelOrder.indexOf(learnerLevel)
    
    // Allow stories at current level and one level above for challenge
    return storyIndex <= learnerIndex + 1
  }

  /**
   * Records a learning attempt and updates skill scores
   * @param {string} checkpoint - Learning checkpoint
   * @param {boolean} success - Whether attempt was successful
   * @param {number} accuracy - Accuracy score (0-1)
   */
  recordAttempt(checkpoint, success, accuracy = 0) {
    if (!this.learnerState.skillScores[checkpoint]) {
      this.learnerState.skillScores[checkpoint] = {
        attempts: 0,
        successes: 0,
        totalAccuracy: 0,
        averageAccuracy: 0
      }
    }
    
    const score = this.learnerState.skillScores[checkpoint]
    score.attempts++
    score.totalAccuracy += accuracy
    score.averageAccuracy = score.totalAccuracy / score.attempts
    
    if (success) {
      score.successes++
    }
    
    // Check if checkpoint is completed
    this.checkCheckpointCompletion(checkpoint)
  }

  /**
   * Checks if a learning checkpoint has been completed
   * @param {string} checkpoint - Learning checkpoint to check
   * @returns {boolean} Whether checkpoint is completed
   */
  checkCheckpointCompletion(checkpoint) {
    const criteria = SKILL_CRITERIA[checkpoint]
    const score = this.learnerState.skillScores[checkpoint]
    
    if (!criteria || !score) return false
    
    const meetsAccuracy = score.averageAccuracy >= criteria.requiredAccuracy
    const meetsAttempts = score.attempts >= criteria.minAttempts
    
    if (meetsAccuracy && meetsAttempts && !this.learnerState.completedCheckpoints.includes(checkpoint)) {
      this.learnerState.completedCheckpoints.push(checkpoint)
      this.updateAdaptiveSettings()
      return true
    }
    
    return false
  }

  /**
   * Updates adaptive settings based on learner progress
   */
  updateAdaptiveSettings() {
    const checkpointCount = this.learnerState.completedCheckpoints.length
    
    // Reduce assistance as learner progresses
    this.learnerState.adaptiveSettings = {
      showHints: checkpointCount < 2,
      allowRetries: checkpointCount < 3,
      detailedFeedback: checkpointCount < 4
    }
  }

  /**
   * Gets the next recommended exercise based on progress
   * @param {Array} exercises - Available exercises
   * @returns {Object|null} Recommended exercise or null
   */
  getNextRecommendedExercise(exercises) {
    const level = this.getCurrentComplexityLevel()
    const completedCheckpoints = this.learnerState.completedCheckpoints
    
    // Find exercises that match current level and haven't been mastered
    const appropriateExercises = exercises.filter(exercise => {
      const exerciseLevel = this.determineExerciseComplexity(exercise)
      return this.isStoryAppropriateForLevel(exerciseLevel, level)
    })
    
    // Prioritize exercises that help with incomplete checkpoints
    const incompleteCheckpoints = Object.keys(SKILL_CRITERIA).filter(
      checkpoint => !completedCheckpoints.includes(checkpoint)
    )
    
    if (incompleteCheckpoints.length > 0) {
      const targetCheckpoint = incompleteCheckpoints[0]
      const targetExercise = appropriateExercises.find(exercise =>
        this.exerciseTargetsCheckpoint(exercise, targetCheckpoint)
      )
      
      if (targetExercise) return targetExercise
    }
    
    return appropriateExercises[0] || null
  }

  /**
   * Determines the complexity level of an exercise
   * @param {Object} exercise - Exercise object
   * @returns {string} Complexity level
   */
  determineExerciseComplexity(exercise) {
    // Map exercise types to complexity levels
    const exerciseComplexity = {
      'abstract_comparison': COMPLEXITY_LEVELS.FOUNDATION,
      'basic_stories': COMPLEXITY_LEVELS.FOUNDATION,
      'realistic_stories': COMPLEXITY_LEVELS.INTERMEDIATE,
      'story_breakdown': COMPLEXITY_LEVELS.ADVANCED,
      'team_estimation': COMPLEXITY_LEVELS.ADVANCED,
      'uncertainty_scenarios': COMPLEXITY_LEVELS.EXPERT,
      'collaborative_estimation': COMPLEXITY_LEVELS.EXPERT
    }
    
    return exerciseComplexity[exercise.type] || COMPLEXITY_LEVELS.INTERMEDIATE
  }

  /**
   * Checks if an exercise targets a specific learning checkpoint
   * @param {Object} exercise - Exercise object
   * @param {string} checkpoint - Learning checkpoint
   * @returns {boolean} Whether exercise targets checkpoint
   */
  exerciseTargetsCheckpoint(exercise, checkpoint) {
    const exerciseCheckpoints = {
      'abstract_comparison': [LEARNING_CHECKPOINTS.BASIC_SIZING],
      'basic_stories': [LEARNING_CHECKPOINTS.BASIC_SIZING, LEARNING_CHECKPOINTS.RELATIVE_COMPARISON],
      'realistic_stories': [LEARNING_CHECKPOINTS.RELATIVE_COMPARISON],
      'story_breakdown': [LEARNING_CHECKPOINTS.STORY_BREAKDOWN],
      'team_estimation': [LEARNING_CHECKPOINTS.TEAM_ESTIMATION],
      'uncertainty_scenarios': [LEARNING_CHECKPOINTS.UNCERTAINTY_HANDLING],
      'collaborative_estimation': [LEARNING_CHECKPOINTS.TEAM_ESTIMATION, LEARNING_CHECKPOINTS.UNCERTAINTY_HANDLING]
    }
    
    const targets = exerciseCheckpoints[exercise.type] || []
    return targets.includes(checkpoint)
  }

  /**
   * Gets learning progress summary
   * @returns {Object} Progress summary
   */
  getProgressSummary() {
    const totalCheckpoints = Object.keys(SKILL_CRITERIA).length
    const completedCount = this.learnerState.completedCheckpoints.length
    const progressPercentage = Math.round((completedCount / totalCheckpoints) * 100)
    
    return {
      currentLevel: this.getCurrentComplexityLevel(),
      completedCheckpoints: completedCount,
      totalCheckpoints,
      progressPercentage,
      nextCheckpoint: this.getNextCheckpoint(),
      adaptiveSettings: this.learnerState.adaptiveSettings
    }
  }

  /**
   * Gets the next checkpoint to work on
   * @returns {string|null} Next checkpoint or null if all completed
   */
  getNextCheckpoint() {
    const allCheckpoints = Object.keys(SKILL_CRITERIA)
    return allCheckpoints.find(checkpoint => 
      !this.learnerState.completedCheckpoints.includes(checkpoint)
    ) || null
  }

  /**
   * Gets detailed skill assessment
   * @returns {Object} Skill assessment details
   */
  getSkillAssessment() {
    const assessment = {}
    
    Object.keys(SKILL_CRITERIA).forEach(checkpoint => {
      const criteria = SKILL_CRITERIA[checkpoint]
      const score = this.learnerState.skillScores[checkpoint] || {
        attempts: 0,
        successes: 0,
        averageAccuracy: 0
      }
      
      const isCompleted = this.learnerState.completedCheckpoints.includes(checkpoint)
      const progress = score.attempts > 0 ? 
        Math.min(score.attempts / criteria.minAttempts, 1) : 0
      
      assessment[checkpoint] = {
        ...criteria,
        ...score,
        isCompleted,
        progress,
        needsWork: score.averageAccuracy < criteria.requiredAccuracy && score.attempts >= 3
      }
    })
    
    return assessment
  }

  /**
   * Resets learner state
   */
  reset() {
    this.learnerState = {
      currentLevel: COMPLEXITY_LEVELS.FOUNDATION,
      completedCheckpoints: [],
      skillScores: {},
      adaptiveSettings: {
        showHints: true,
        allowRetries: true,
        detailedFeedback: true
      }
    }
  }

  /**
   * Gets current learner state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.learnerState }
  }

  /**
   * Sets learner state
   * @param {Object} state - New state
   */
  setState(state) {
    this.learnerState = { ...state }
  }
}

export default ProgressiveLearningManager