import { useState, useEffect, Suspense, lazy } from 'react'
import { loadModuleConfig } from '../../../utils/moduleLoader'
import './Exercise.css'

// Lazy load exercises for better performance
const Exercise1 = lazy(() => import('./Exercise1'))
const Exercise2 = lazy(() => import('./Exercise2'))
const Exercise3 = lazy(() => import('./Exercise3'))

/**
 * Sprint Planning Module - Master the art of planning effective sprints
 * Handles module-level navigation and exercise coordination
 */
function SprintPlanningModule({ 
  currentExercise, 
  moduleProgress, 
  onExerciseComplete, 
  onExerciseStart, 
  onNavigate 
}) {
  const [moduleConfig, setModuleConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load module configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        const config = await loadModuleConfig('sprint-planning')
        setModuleConfig(config)
      } catch (err) {
        console.error('Failed to load sprint planning module config:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleExerciseComplete = (exerciseId) => {
    if (onExerciseComplete) {
      onExerciseComplete('sprint-planning', exerciseId)
    }
  }

  const handleExerciseStart = (exerciseId) => {
    if (onExerciseStart) {
      onExerciseStart('sprint-planning', exerciseId)
    }
  }

  const handleNavigateToExercise = (exerciseId) => {
    if (onNavigate) {
      onNavigate('exercise', 'sprint-planning', exerciseId)
    }
  }

  const handleNavigateToModule = () => {
    if (onNavigate) {
      onNavigate('module', 'sprint-planning')
    }
  }

  const getExerciseProgress = (exerciseId) => {
    return moduleProgress?.exercises?.[exerciseId] || { started: false, completed: false }
  }

  const renderExercise = (exerciseId) => {
    const exerciseProgress = getExerciseProgress(exerciseId)
    const exerciseProps = {
      onComplete: () => handleExerciseComplete(exerciseId),
      onStart: () => handleExerciseStart(exerciseId),
      onNavigateBack: handleNavigateToModule,
      isStarted: exerciseProgress.started,
      isCompleted: exerciseProgress.completed
    }

    switch (exerciseId) {
      case 1:
        return (
          <Suspense fallback={<div className="exercise-loading">Loading Velocity & Capacity Planning...</div>}>
            <Exercise1 {...exerciseProps} />
          </Suspense>
        )
      case 2:
        return (
          <Suspense fallback={<div className="exercise-loading">Loading Sprint Goal Workshop...</div>}>
            <Exercise2 {...exerciseProps} />
          </Suspense>
        )
      case 3:
        return (
          <Suspense fallback={<div className="exercise-loading">Loading Mid-Sprint Adaptation...</div>}>
            <Exercise3 {...exerciseProps} />
          </Suspense>
        )
      default:
        return (
          <div className="error">
            <h2>Exercise not found</h2>
            <p>Exercise {exerciseId} is not available.</p>
            <button onClick={handleNavigateToModule}>Return to Module</button>
          </div>
        )
    }
  }

  const renderModuleOverview = () => {
    if (!moduleConfig) return null

    const { module } = moduleConfig
    const exercises = module.exercises || []
    
    return (
      <div className="module-overview">
        <div className="module-header">
          <h1 className="module-title">{module.title}</h1>
          <p className="module-description">{module.description}</p>
        </div>

        <div className="learning-objectives">
          <h3>What You'll Learn</h3>
          <ul>
            {module.learningObjectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>

        <div className="exercises-list">
          <h3>Exercises</h3>
          <div className="exercise-cards">
            {exercises.map((exercise) => {
              const progress = getExerciseProgress(exercise.id)
              const isLocked = exercise.id > 1 && !getExerciseProgress(exercise.id - 1).completed
              
              return (
                <div 
                  key={exercise.id} 
                  className={`exercise-card ${progress.completed ? 'completed' : progress.started ? 'started' : 'available'} ${isLocked ? 'locked' : ''}`}
                >
                  <div className="exercise-card-header">
                    <div className="exercise-number">{exercise.id}</div>
                    <div className="exercise-status">
                      <span className={`status ${progress.completed ? 'completed' : progress.started ? 'started' : isLocked ? 'locked' : 'available'}`}>
                        {progress.completed ? 'Completed' : progress.started ? 'In Progress' : isLocked ? 'Locked' : 'Available'}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="exercise-title">{exercise.title}</h4>
                  <p className="exercise-description">{exercise.description}</p>
                  <p className="exercise-details">{exercise.details}</p>
                  
                  <div className="exercise-card-actions">
                    {!isLocked ? (
                      <button 
                        className={`exercise-button ${progress.completed ? 'completed' : progress.started ? 'started' : 'available'}`}
                        onClick={() => handleNavigateToExercise(exercise.id)}
                      >
                        {progress.completed ? 'Review Exercise' : progress.started ? 'Continue' : 'Start Exercise'}
                      </button>
                    ) : (
                      <div className="locked-message">
                        Complete previous exercise to unlock
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="module-loading">
        <h2>Loading Sprint Planning Module...</h2>
        <p>Preparing your learning experience...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="module-error">
        <h2>Failed to Load Module</h2>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  // Render specific exercise if currentExercise is set
  if (currentExercise) {
    return renderExercise(currentExercise)
  }

  // Otherwise render module overview
  return renderModuleOverview()
}

export default SprintPlanningModule
