import React, { useState, useEffect } from 'react'
import './ProgressiveModuleOverview.css'
import LearningProgressTracker from './LearningProgressTracker'
import ProgressiveExerciseSelector from './ProgressiveExerciseSelector'
import { ProgressiveLearningManager } from '../../../utils/progressiveLearningManager'

/**
 * Progressive Module Overview Component
 * Main entry point for the progressive learning story points module
 */
function ProgressiveModuleOverview({
  moduleConfig,
  moduleProgress = {},
  onExerciseStart,
  onNavigate
}) {
  const [learningManager] = useState(() => new ProgressiveLearningManager())
  const [progressSummary, setProgressSummary] = useState(null)
  const [skillAssessment, setSkillAssessment] = useState(null)
  const [showDetailedProgress, setShowDetailedProgress] = useState(false)
  const [stories, setStories] = useState({})

  useEffect(() => {
    initializeLearningSystem()
    loadStoryData()
  }, [moduleProgress])

  const initializeLearningSystem = () => {
    // Initialize learning manager with any existing progress
    if (moduleProgress.learningState) {
      learningManager.setState(moduleProgress.learningState)
    }

    updateProgressDisplays()
  }

  const loadStoryData = async () => {
    try {
      // Load the progressive story dataset
      const response = await fetch('/src/data/modules/story-points/progressive-story-dataset.json')
      const data = await response.json()
      
      setStories({
        foundation: data.foundation || [],
        intermediate: data.intermediate || [],
        advanced: data.advanced || [],
        expert: data.expert || [],
        general: [
          ...(data.foundation || []),
          ...(data.intermediate || []),
          ...(data.advanced || []),
          ...(data.expert || [])
        ]
      })
    } catch (error) {
      console.error('Failed to load progressive story data:', error)
      // Fallback to empty datasets
      setStories({
        foundation: [],
        intermediate: [],
        advanced: [],
        expert: [],
        general: []
      })
    }
  }

  const updateProgressDisplays = () => {
    const summary = learningManager.getProgressSummary()
    const assessment = learningManager.getSkillAssessment()
    
    setProgressSummary(summary)
    setSkillAssessment(assessment)
  }

  const handleExerciseSelect = (exercise) => {
    // Record that user is starting an exercise
    const checkpoints = learningManager.exerciseTargetsCheckpoint(exercise, 'any')
    
    // Start the exercise with adaptive settings
    if (onExerciseStart) {
      onExerciseStart('story-points', exercise.id, {
        adaptiveSettings: exercise.adaptiveSettings,
        stories: exercise.stories,
        learningContext: {
          currentLevel: learningManager.getCurrentComplexityLevel(),
          targetCheckpoints: checkpoints
        }
      })
    }
  }

  const handleCheckpointClick = (checkpoint) => {
    // Find exercises that target this checkpoint
    const exercises = moduleConfig?.module?.exercises || []
    const targetExercise = exercises.find(exercise =>
      learningManager.exerciseTargetsCheckpoint(exercise, checkpoint)
    )
    
    if (targetExercise) {
      handleExerciseSelect(targetExercise)
    }
  }

  const handleLearnerStateUpdate = (newState) => {
    learningManager.setState(newState)
    updateProgressDisplays()
    
    // Persist the learning state (this would typically go to a backend)
    if (onNavigate) {
      onNavigate('updateLearningState', 'story-points', null, { learningState: newState })
    }
  }

  const renderWelcomeSection = () => {
    const currentLevel = progressSummary?.currentLevel || 'foundation'
    const completedCheckpoints = progressSummary?.completedCheckpoints || 0
    
    let welcomeMessage = "Welcome to Story Point Estimation Mastery!"
    let levelDescription = "Start with foundation concepts and progress through increasingly complex scenarios."
    
    if (completedCheckpoints > 0) {
      welcomeMessage = `Welcome back! You're making great progress.`
      
      switch (currentLevel) {
        case 'intermediate':
          levelDescription = "You've mastered the basics! Now tackle more complex estimation scenarios."
          break
        case 'advanced':
          levelDescription = "Excellent progress! You're ready for advanced estimation challenges."
          break
        case 'expert':
          levelDescription = "Outstanding! You're working with expert-level estimation scenarios."
          break
        default:
          levelDescription = "Continue building your foundation in story point estimation."
      }
    }
    
    return (
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>{welcomeMessage}</h1>
          <p className="welcome-description">{levelDescription}</p>
          
          <div className="learning-approach">
            <h3>🎯 Adaptive Learning Approach</h3>
            <div className="approach-features">
              <div className="feature-item">
                <span className="feature-icon">📈</span>
                <div className="feature-text">
                  <strong>Progressive Complexity</strong>
                  <p>Start simple, advance gradually</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <div className="feature-text">
                  <strong>Skill Checkpoints</strong>
                  <p>Validate learning at each stage</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎨</span>
                <div className="feature-text">
                  <strong>Adaptive Content</strong>
                  <p>Personalized based on progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderProgressToggle = () => {
    return (
      <div className="progress-controls">
        <button
          className={`toggle-btn ${showDetailedProgress ? 'active' : ''}`}
          onClick={() => setShowDetailedProgress(!showDetailedProgress)}
        >
          {showDetailedProgress ? '📊 Hide Details' : '📈 Show Detailed Progress'}
        </button>
      </div>
    )
  }

  if (!progressSummary || !skillAssessment) {
    return (
      <div className="progressive-module-overview loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Initializing adaptive learning system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="progressive-module-overview">
      {renderWelcomeSection()}
      
      {renderProgressToggle()}
      
      <LearningProgressTracker
        progressSummary={progressSummary}
        skillAssessment={skillAssessment}
        onCheckpointClick={handleCheckpointClick}
        showDetailed={showDetailedProgress}
      />
      
      <ProgressiveExerciseSelector
        exercises={moduleConfig?.module?.exercises || []}
        stories={stories}
        learnerState={learningManager.getState()}
        onExerciseSelect={handleExerciseSelect}
        onLearnerStateUpdate={handleLearnerStateUpdate}
        showRecommendations={true}
      />
    </div>
  )
}

export default ProgressiveModuleOverview