import { useState, useEffect } from 'react'
import './Navigation.css'
import { loadModuleConfig } from '../utils/moduleLoader'

function Navigation({
  currentModule,
  currentExercise,
  moduleProgress = {},
  onNavigate,
  onNavigateHome,
  showModuleInfo = true
}) {
  const [moduleConfig, setModuleConfig] = useState(null)
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load module configuration and exercises
  useEffect(() => {
    const loadModuleData = async () => {
      if (!currentModule) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const config = await loadModuleConfig(currentModule)
        setModuleConfig(config)
        setExercises(config.module.exercises || [])
      } catch (err) {
        console.error('Failed to load module data:', err)
        setError(err.message)

        // Fallback for story-points module
        if (currentModule === 'story-points') {
          setExercises([
            { id: 1, title: 'Abstract Comparisons', description: 'Learn relative sizing with abstract items' },
            { id: 2, title: 'User Stories', description: 'Apply sizing to real user stories' },
            { id: 3, title: 'Core Principles', description: 'Review and reinforce key concepts' }
          ])
        }
      } finally {
        setLoading(false)
      }
    }

    loadModuleData()
  }, [currentModule])

  // Get current module progress
  const currentModuleProgress = moduleProgress[currentModule] || { exercises: {} }

  const getExerciseStatus = (exerciseId) => {
    const progress = currentModuleProgress.exercises[exerciseId]
    if (progress?.completed) return 'completed'
    if (progress?.started || exerciseId === currentExercise) return 'active'

    // Check if exercise is available (first exercise or previous completed)
    const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId)
    if (exerciseIndex === 0) return 'available'

    const previousExercise = exercises[exerciseIndex - 1]
    if (previousExercise && currentModuleProgress.exercises[previousExercise.id]?.completed) {
      return 'available'
    }

    return 'locked'
  }

  const canNavigateToExercise = (exerciseId) => {
    const status = getExerciseStatus(exerciseId)
    return status === 'available' || status === 'active' || status === 'completed'
  }

  const getCompletedCount = () => {
    return Object.values(currentModuleProgress.exercises).filter(progress => progress.completed).length
  }

  const getProgressPercentage = () => {
    if (exercises.length === 0) return 0
    return Math.round((getCompletedCount() / exercises.length) * 100)
  }

  const isAllCompleted = () => {
    return exercises.length > 0 && getCompletedCount() === exercises.length
  }

  const handleExerciseClick = (exerciseId) => {
    if (canNavigateToExercise(exerciseId) && onNavigate) {
      onNavigate('exercise', currentModule, exerciseId)
    }
  }

  const handleHomeClick = () => {
    if (onNavigateHome) {
      onNavigateHome()
    } else if (onNavigate) {
      onNavigate('home')
    }
  }

  const handleModuleClick = () => {
    if (onNavigate && currentModule) {
      onNavigate('module', currentModule)
    }
  }

  if (loading) {
    return (
      <nav className="navigation">
        <div className="nav-content">
          <div className="nav-loading">Loading navigation...</div>
        </div>
      </nav>
    )
  }

  if (error && !exercises.length) {
    return (
      <nav className="navigation">
        <div className="nav-content">
          <div className="nav-error">
            <p>Error loading navigation: {error}</p>
            <button onClick={handleHomeClick}>Return to Home</button>
          </div>
        </div>
      </nav>
    )
  }

  const moduleTitle = moduleConfig?.module?.title || 'Learning Module'

  return (
    <nav className="navigation">
      <div className="nav-content">
        {showModuleInfo && (
          <div className="module-info">
            <h2 className="module-title">{moduleTitle}</h2>
            <div className="nav-buttons">
              {currentExercise && (
                <button className="module-button" onClick={handleModuleClick}>
                  ← Module Overview
                </button>
              )}
              <button className="home-button" onClick={handleHomeClick}>
                🏠 Home
              </button>
            </div>
          </div>
        )}

        <div className="nav-header">
          <div className="nav-title-row">
            <h3 className="nav-title">Your Progress</h3>
            {!showModuleInfo && (
              <button className="home-button" onClick={handleHomeClick}>
                ← Return to Home
              </button>
            )}
          </div>
          <div className="progress-summary">
            <div className="progress-stats">
              <span className="completed-count">{getCompletedCount()}</span>
              <span className="total-count">/{exercises.length}</span>
              <span className="progress-label">exercises completed</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <span className="progress-percentage">{getProgressPercentage()}%</span>
            </div>
          </div>
          {isAllCompleted() && (
            <div className="completion-badge">
              🎉 Congratulations! You've completed this module!
            </div>
          )}
        </div>

        <div className="exercise-list">
          {exercises.map((exercise) => {
            const status = getExerciseStatus(exercise.id)
            const isClickable = canNavigateToExercise(exercise.id)

            return (
              <div
                key={exercise.id}
                className={`exercise-item ${status} ${isClickable ? 'clickable' : ''}`}
                onClick={() => isClickable && handleExerciseClick(exercise.id)}
                role={isClickable ? 'button' : 'listitem'}
                tabIndex={isClickable ? 0 : -1}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    handleExerciseClick(exercise.id)
                  }
                }}
                aria-label={`Exercise ${exercise.id}: ${exercise.title} - ${status}`}
              >
                <div className="exercise-number">
                  {status === 'completed' ? '✓' : exercise.id}
                </div>
                <div className="exercise-info">
                  <div className="exercise-title">{exercise.title}</div>
                  <div className="exercise-description">{exercise.description}</div>
                  <div className="exercise-status">
                    {status === 'completed' && <span className="status-badge completed">Completed</span>}
                    {status === 'active' && <span className="status-badge active">In Progress</span>}
                    {status === 'locked' && <span className="status-badge locked">Locked</span>}
                    {status === 'available' && <span className="status-badge available">Available</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
