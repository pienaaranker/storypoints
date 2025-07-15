import React, { useState, useEffect, Suspense, lazy } from 'react'
import { loadModuleConfig } from '../../utils/moduleLoader'
import Navigation from '../Navigation'
import './ModuleRouter.css'

// Lazy load exercise components for better performance
const StoryPointsExercise1 = lazy(() => import('../modules/story-points/Exercise1'))
const StoryPointsExercise2 = lazy(() => import('../modules/story-points/Exercise2'))
const StoryPointsExercise3 = lazy(() => import('../modules/story-points/Exercise3'))

const StoryHierarchyExercise1 = lazy(() => import('../modules/story-hierarchy/Exercise1'))
const StoryHierarchyExercise2 = lazy(() => import('../modules/story-hierarchy/Exercise2'))

const DefinitionOfDoneExercise1 = lazy(() => import('../modules/definition-of-done/Exercise1'))
const DefinitionOfDoneExercise2 = lazy(() => import('../modules/definition-of-done/Exercise2'))
const DefinitionOfDoneExercise3 = lazy(() => import('../modules/definition-of-done/Exercise3'))

const AgileMetricsExercise1 = lazy(() => import('../modules/agile-metrics/Exercise1'))
const AgileMetricsExercise2 = lazy(() => import('../modules/agile-metrics/Exercise2'))
const AgileMetricsExercise3 = lazy(() => import('../modules/agile-metrics/Exercise3'))
const AgileMetricsExercise4 = lazy(() => import('../modules/agile-metrics/Exercise4'))

/**
 * ModuleRouter component for handling module-level routing and exercise loading
 * @param {Object} props - Component props
 * @param {string} props.moduleId - Current module ID
 * @param {number} props.currentExercise - Current exercise ID
 * @param {Object} props.moduleProgress - Module progress state
 * @param {Function} props.onExerciseComplete - Exercise completion callback
 * @param {Function} props.onExerciseStart - Exercise start callback
 * @param {Function} props.onNavigate - Navigation callback
 */
function ModuleRouter({ 
  moduleId, 
  currentExercise, 
  moduleProgress = {}, 
  onExerciseComplete, 
  onExerciseStart,
  onNavigate 
}) {
  const [moduleConfig, setModuleConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load module configuration
  useEffect(() => {
    const loadConfig = async () => {
      if (!moduleId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const config = await loadModuleConfig(moduleId)
        setModuleConfig(config)
      } catch (err) {
        console.error(`Failed to load module config for ${moduleId}:`, err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [moduleId])

  /**
   * Renders module overview with exercise list
   */
  const renderModuleOverview = () => {
    if (!moduleConfig) return null

    const { module } = moduleConfig

    return (
      <div className="module-overview">
        <div className="module-header">
          <h1 className="module-title">{module.title}</h1>
          <p className="module-description">{module.description}</p>
          
          {module.learningObjectives && (
            <div className="learning-objectives">
              <h3>What You'll Learn:</h3>
              <ul>
                {module.learningObjectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="exercise-list">
          <h3>Exercises</h3>
          <div className="exercise-grid">
            {module.exercises.map((exercise) => {
              const exerciseProgress = moduleProgress.exercises?.[exercise.id] || { started: false, completed: false }

              return (
                <div key={exercise.id} className={`exercise-card ${exerciseProgress.completed ? 'completed' : exerciseProgress.started ? 'in-progress' : 'not-started'}`}>
                  <div className="exercise-header">
                    <h4 className="exercise-title">
                      Exercise {exercise.id}: {exercise.title}
                    </h4>
                    <div className="exercise-status">
                      {exerciseProgress.completed ? (
                        <span className="status-completed">✓ Completed</span>
                      ) : exerciseProgress.started ? (
                        <span className="status-in-progress">⏳ In Progress</span>
                      ) : (
                        <span className="status-not-started">○ Not Started</span>
                      )}
                    </div>
                  </div>

                  <p className="exercise-description">{exercise.description}</p>
                  <p className="exercise-details">{exercise.details}</p>

                  <button
                    className="exercise-button"
                    onClick={() => onNavigate && onNavigate('exercise', moduleId, exercise.id)}
                  >
                    {exerciseProgress.completed ? 'Review Exercise' :
                     exerciseProgress.started ? 'Continue Exercise' :
                     'Start Exercise'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /**
   * Renders specific exercise component
   */
  const renderExercise = () => {
    if (!moduleConfig || !currentExercise) return null

    const exercise = moduleConfig.module.exercises.find(ex => ex.id === currentExercise)
    if (!exercise) {
      return <div className="error">Exercise {currentExercise} not found in module {moduleId}</div>
    }

    const exerciseProgress = moduleProgress.exercises?.[currentExercise] || { started: false, completed: false }

    // Render the appropriate exercise component based on moduleId and exerciseId
    const exerciseProps = {
      onComplete: () => onExerciseComplete && onExerciseComplete(moduleId, currentExercise),
      onStart: () => onExerciseStart && onExerciseStart(moduleId, currentExercise),
      isStarted: exerciseProgress.started
    }

    if (moduleId === 'story-points') {
      switch (currentExercise) {
        case 1:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading exercise...</div>}>
              <StoryPointsExercise1 {...exerciseProps} />
            </Suspense>
          )
        case 2:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading exercise...</div>}>
              <StoryPointsExercise2 {...exerciseProps} />
            </Suspense>
          )
        case 3:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading exercise...</div>}>
              <StoryPointsExercise3 {...exerciseProps} />
            </Suspense>
          )
        default:
          return <div className="error">Exercise {currentExercise} not implemented for story-points</div>
      }
    }

    if (moduleId === 'story-hierarchy') {
      switch (currentExercise) {
        case 1:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading exercise...</div>}>
              <StoryHierarchyExercise1 {...exerciseProps} />
            </Suspense>
          )
        case 2:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading exercise...</div>}>
              <StoryHierarchyExercise2 {...exerciseProps} />
            </Suspense>
          )
        default:
          return <div className="error">Exercise {currentExercise} not implemented for story-hierarchy</div>
      }
    }

    if (moduleId === 'definition-of-done') {
      switch (currentExercise) {
        case 1:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading DoD Creation Workshop...</div>}>
              <DefinitionOfDoneExercise1 {...exerciseProps} />
            </Suspense>
          )
        case 2:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading Acceptance Criteria Mastery...</div>}>
              <DefinitionOfDoneExercise2 {...exerciseProps} />
            </Suspense>
          )
        case 3:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading Quality Gates Assessment...</div>}>
              <DefinitionOfDoneExercise3 {...exerciseProps} />
            </Suspense>
          )
        default:
          return <div className="error">Exercise {currentExercise} not implemented for definition-of-done</div>
      }
    }

    if (moduleId === 'agile-metrics') {
      switch (currentExercise) {
        case 1:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading Velocity Analysis Workshop...</div>}>
              <AgileMetricsExercise1 {...exerciseProps} />
            </Suspense>
          )
        case 2:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading Burndown Chart Mastery...</div>}>
              <AgileMetricsExercise2 {...exerciseProps} />
            </Suspense>
          )
        case 3:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading Cycle Time Optimization...</div>}>
              <AgileMetricsExercise3 {...exerciseProps} />
            </Suspense>
          )
        case 4:
          return (
            <Suspense fallback={<div className="exercise-loading">Loading Team Health Dashboard...</div>}>
              <AgileMetricsExercise4 {...exerciseProps} />
            </Suspense>
          )
        default:
          return <div className="error">Exercise {currentExercise} not implemented for agile-metrics</div>
      }
    }

    // Fallback for other modules or unimplemented exercises
    return (
      <div className="exercise-placeholder">
        <h2>Exercise {exercise.id}: {exercise.title}</h2>
        <p>Exercise component not yet implemented for module {moduleId}</p>
        <p>Status: {exerciseProgress.completed ? 'Completed' : exerciseProgress.started ? 'In Progress' : 'Not Started'}</p>

        <div className="exercise-actions">
          {!exerciseProgress.started && (
            <button onClick={() => onExerciseStart && onExerciseStart(moduleId, currentExercise)}>
              Start Exercise
            </button>
          )}
          {exerciseProgress.started && !exerciseProgress.completed && (
            <button onClick={() => onExerciseComplete && onExerciseComplete(moduleId, currentExercise)}>
              Complete Exercise
            </button>
          )}
          <button onClick={() => onNavigate && onNavigate('module', moduleId)}>
            Back to Module
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading module...</div>
  }

  if (error) {
    return <div className="error">Error loading module: {error}</div>
  }

  if (!moduleId) {
    return null
  }

  return (
    <div className="module-router">
      {currentExercise ? renderExercise() : renderModuleOverview()}

      {/* Show navigation when in exercise or module overview with exercises */}
      {(currentExercise || (!currentExercise && moduleConfig?.module?.exercises?.length > 0)) && (
        <Navigation
          currentModule={moduleId}
          currentExercise={currentExercise}
          moduleProgress={moduleProgress}
          onNavigate={onNavigate}
          showModuleInfo={!currentExercise}
        />
      )}
    </div>
  )
}

export default ModuleRouter
