import React, { useState, useEffect } from 'react'
import './ProgressiveExerciseSelector.css'
import { ProgressiveLearningManager, COMPLEXITY_LEVELS } from '../../../utils/progressiveLearningManager'

/**
 * Progressive Exercise Selector Component
 * Adapts exercise selection and difficulty based on learner progress
 */
function ProgressiveExerciseSelector({
  exercises,
  stories,
  learnerState,
  onExerciseSelect,
  onLearnerStateUpdate,
  showRecommendations = true
}) {
  const [learningManager] = useState(() => new ProgressiveLearningManager(learnerState))
  const [recommendedExercise, setRecommendedExercise] = useState(null)
  const [adaptedExercises, setAdaptedExercises] = useState([])

  useEffect(() => {
    if (learnerState) {
      learningManager.setState(learnerState)
    }
    updateRecommendations()
  }, [learnerState, exercises, stories])

  const updateRecommendations = () => {
    const recommended = learningManager.getNextRecommendedExercise(exercises)
    setRecommendedExercise(recommended)
    
    const adapted = exercises.map(exercise => ({
      ...exercise,
      adaptedStories: learningManager.getStoriesForCurrentLevel(
        getStoriesForExercise(exercise)
      ),
      complexityLevel: learningManager.determineExerciseComplexity(exercise),
      isRecommended: recommended && exercise.id === recommended.id,
      isUnlocked: isExerciseUnlocked(exercise)
    }))
    
    setAdaptedExercises(adapted)
  }

  const getStoriesForExercise = (exercise) => {
    // Get stories based on exercise data file or type
    if (exercise.dataFile && stories[exercise.dataFile]) {
      return stories[exercise.dataFile]
    }
    
    // Fallback to general story pool
    return stories.general || []
  }

  const isExerciseUnlocked = (exercise) => {
    const currentLevel = learningManager.getCurrentComplexityLevel()
    const exerciseLevel = learningManager.determineExerciseComplexity(exercise)
    
    // Foundation exercises are always unlocked
    if (exerciseLevel === COMPLEXITY_LEVELS.FOUNDATION) {
      return true
    }
    
    // Check if learner has progressed enough for this exercise
    const levelOrder = [
      COMPLEXITY_LEVELS.FOUNDATION,
      COMPLEXITY_LEVELS.INTERMEDIATE,
      COMPLEXITY_LEVELS.ADVANCED,
      COMPLEXITY_LEVELS.EXPERT
    ]
    
    const currentIndex = levelOrder.indexOf(currentLevel)
    const exerciseIndex = levelOrder.indexOf(exerciseLevel)
    
    return exerciseIndex <= currentIndex + 1
  }

  const handleExerciseSelect = (exercise) => {
    if (!exercise.isUnlocked) {
      return
    }
    
    // Update learner state if needed
    if (onLearnerStateUpdate) {
      onLearnerStateUpdate(learningManager.getState())
    }
    
    // Pass adapted exercise with filtered stories
    const adaptedExercise = {
      ...exercise,
      stories: exercise.adaptedStories,
      adaptiveSettings: learningManager.learnerState.adaptiveSettings
    }
    
    onExerciseSelect(adaptedExercise)
  }

  const renderComplexityBadge = (level) => {
    const levelConfig = {
      [COMPLEXITY_LEVELS.FOUNDATION]: { 
        label: 'Foundation', 
        color: '#28a745',
        icon: '🌱'
      },
      [COMPLEXITY_LEVELS.INTERMEDIATE]: { 
        label: 'Intermediate', 
        color: '#ffc107',
        icon: '🌿'
      },
      [COMPLEXITY_LEVELS.ADVANCED]: { 
        label: 'Advanced', 
        color: '#17a2b8',
        icon: '🌳'
      },
      [COMPLEXITY_LEVELS.EXPERT]: { 
        label: 'Expert', 
        color: '#6f42c1',
        icon: '🏔️'
      }
    }
    
    const config = levelConfig[level] || levelConfig[COMPLEXITY_LEVELS.FOUNDATION]
    
    return (
      <div 
        className="complexity-badge" 
        style={{ backgroundColor: config.color }}
        title={`${config.label} Level`}
      >
        <span className="complexity-icon">{config.icon}</span>
        <span className="complexity-label">{config.label}</span>
      </div>
    )
  }

  const renderExerciseCard = (exercise) => {
    const {
      isRecommended,
      isUnlocked,
      complexityLevel,
      adaptedStories
    } = exercise

    let cardClass = 'exercise-card'
    if (isRecommended) cardClass += ' recommended'
    if (!isUnlocked) cardClass += ' locked'

    return (
      <div
        key={exercise.id}
        className={cardClass}
        onClick={() => handleExerciseSelect(exercise)}
      >
        <div className="exercise-header">
          <div className="exercise-title-section">
            <h3 className="exercise-title">{exercise.title}</h3>
            {isRecommended && (
              <div className="recommended-badge">
                <span className="recommended-icon">⭐</span>
                <span className="recommended-text">Recommended</span>
              </div>
            )}
          </div>
          
          <div className="exercise-badges">
            {renderComplexityBadge(complexityLevel)}
            {!isUnlocked && (
              <div className="locked-badge">
                <span className="locked-icon">🔒</span>
                <span className="locked-text">Locked</span>
              </div>
            )}
          </div>
        </div>

        <p className="exercise-description">{exercise.description}</p>
        
        {exercise.details && (
          <p className="exercise-details">{exercise.details}</p>
        )}

        <div className="exercise-stats">
          <div className="stat-item">
            <span className="stat-label">Stories:</span>
            <span className="stat-value">{adaptedStories?.length || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Type:</span>
            <span className="stat-value">{exercise.type?.replace('_', ' ') || 'Mixed'}</span>
          </div>
        </div>

        {!isUnlocked && (
          <div className="unlock-requirements">
            <p className="unlock-text">
              Complete more {COMPLEXITY_LEVELS.FOUNDATION} level exercises to unlock
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderRecommendationPanel = () => {
    if (!showRecommendations || !recommendedExercise) {
      return null
    }

    const progressSummary = learningManager.getProgressSummary()
    
    return (
      <div className="recommendation-panel">
        <div className="recommendation-header">
          <h3>🎯 Recommended Next Step</h3>
          <p className="recommendation-subtitle">
            Based on your current progress at {progressSummary.currentLevel} level
          </p>
        </div>
        
        <div className="recommended-exercise-preview">
          <div className="preview-content">
            <h4>{recommendedExercise.title}</h4>
            <p>{recommendedExercise.description}</p>
            
            {progressSummary.nextCheckpoint && (
              <div className="checkpoint-focus">
                <span className="checkpoint-label">Focus Area:</span>
                <span className="checkpoint-name">
                  {progressSummary.nextCheckpoint.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
          
          <button
            className="start-recommended-btn"
            onClick={() => handleExerciseSelect(recommendedExercise)}
          >
            Start Recommended Exercise
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="progressive-exercise-selector">
      {renderRecommendationPanel()}
      
      <div className="exercises-section">
        <div className="section-header">
          <h3>Available Exercises</h3>
          <p className="section-subtitle">
            Exercises are unlocked progressively based on your skill development
          </p>
        </div>
        
        <div className="exercises-grid">
          {adaptedExercises.map(renderExerciseCard)}
        </div>
      </div>
    </div>
  )
}

export default ProgressiveExerciseSelector