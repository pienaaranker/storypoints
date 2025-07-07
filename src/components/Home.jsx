import { useState, useEffect } from 'react'
import './Home.css'
import { getExerciseConfig } from '../utils/dataLoader'

function Home({ exerciseProgress, onNavigate, onStartFresh }) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load exercise metadata on component mount
  useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true)
        setError(null)

        const exerciseConfigs = await Promise.all([
          getExerciseConfig(1),
          getExerciseConfig(2),
          getExerciseConfig(3)
        ])

        const exerciseList = exerciseConfigs.map((config, index) => ({
          number: index + 1,
          title: config?.title || `Exercise ${index + 1}`,
          description: config?.description || 'Exercise description',
          details: config?.details || 'Exercise details'
        }))

        setExercises(exerciseList)
      } catch (err) {
        console.error('Failed to load exercise metadata:', err)
        setError(err.message)
        // Fallback to hardcoded data
        setExercises([
          {
            number: 1,
            title: 'Abstract Comparisons',
            description: 'Learn relative sizing with abstract items',
            details: 'Start with simple abstract concepts to understand relative effort without real-world bias.'
          },
          {
            number: 2,
            title: 'User Stories',
            description: 'Apply sizing to real user stories',
            details: 'Practice with realistic user stories from a typical web application development scenario.'
          },
          {
            number: 3,
            title: 'Core Principles',
            description: 'Review and reinforce key concepts',
            details: 'Test your knowledge with an interactive quiz covering fundamental story point principles.'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadExercises()
  }, [])

  const getExerciseStatus = (exerciseNumber) => {
    const progress = exerciseProgress[exerciseNumber]
    if (progress.completed) return 'completed'
    if (progress.started) return 'started'
    if (exerciseNumber === 1 || exerciseProgress[exerciseNumber - 1]?.completed) return 'available'
    return 'locked'
  }

  const getCompletedCount = () => {
    return Object.values(exerciseProgress).filter(progress => progress.completed).length
  }

  const getTotalProgress = () => {
    return Math.round((getCompletedCount() / exercises.length) * 100)
  }

  const isAllCompleted = () => {
    return getCompletedCount() === exercises.length
  }

  const hasAnyProgress = () => {
    return Object.values(exerciseProgress).some(progress => progress.started || progress.completed)
  }

  if (loading) {
    return (
      <div className="home">
        <div className="home-header">
          <h1 className="home-title">Story Point Master</h1>
          <p className="home-subtitle">Loading exercises...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home">
        <div className="home-header">
          <h1 className="home-title">Story Point Master</h1>
          <p className="home-subtitle">Error loading exercises: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      <div className="home-header">
        <h1 className="home-title">Story Point Master</h1>
        <p className="home-subtitle">
          Master the art of story point estimation through interactive exercises
        </p>
      </div>

      {hasAnyProgress() && (
        <div className="progress-overview">
          <div className="progress-header">
            <h3>Your Progress</h3>
            <div className="progress-stats">
              <span className="completed-count">{getCompletedCount()}</span>
              <span className="total-count">/{exercises.length}</span>
              <span className="progress-label">exercises completed</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${getTotalProgress()}%` }}
              />
            </div>
            <span className="progress-percentage">{getTotalProgress()}%</span>
          </div>
          {isAllCompleted() && (
            <div className="completion-message">
              🎉 Congratulations! You've completed all exercises and mastered story point estimation!
            </div>
          )}
        </div>
      )}

      <div className="exercises-overview">
        <h3>Learning Path</h3>
        <div className="exercise-cards">
          {exercises.map((exercise) => {
            const status = getExerciseStatus(exercise.number)
            const canStart = status === 'available' || status === 'started' || status === 'completed'

            return (
              <div key={exercise.number} className={`exercise-card ${status}`}>
                <div className="exercise-card-header">
                  <div className="exercise-number">
                    {status === 'completed' ? '✓' : exercise.number}
                  </div>
                  <div className="exercise-status-badge">
                    {status === 'completed' && <span className="status completed">Completed</span>}
                    {status === 'started' && <span className="status started">In Progress</span>}
                    {status === 'locked' && <span className="status locked">Locked</span>}
                    {status === 'available' && <span className="status available">Ready</span>}
                  </div>
                </div>
                <div className="exercise-card-content">
                  <h4 className="exercise-title">{exercise.title}</h4>
                  <p className="exercise-description">{exercise.description}</p>
                  <p className="exercise-details">{exercise.details}</p>
                </div>
                <div className="exercise-card-actions">
                  {canStart && (
                    <button 
                      className={`exercise-button ${status}`}
                      onClick={() => onNavigate(exercise.number)}
                    >
                      {status === 'completed' ? 'Review' : status === 'started' ? 'Continue' : 'Start'}
                    </button>
                  )}
                  {status === 'locked' && (
                    <div className="locked-message">
                      Complete previous exercises to unlock
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {hasAnyProgress() && (
        <div className="home-actions">
          <button className="start-fresh-button" onClick={onStartFresh}>
            Start Fresh
          </button>
          <p className="start-fresh-note">
            Reset all progress and begin the learning journey from the beginning
          </p>
        </div>
      )}

      {!hasAnyProgress() && (
        <div className="welcome-actions">
          <button className="get-started-button" onClick={() => onNavigate(1)}>
            Get Started
          </button>
          <p className="welcome-note">
            Begin your journey to master story point estimation
          </p>
        </div>
      )}
    </div>
  )
}

export default Home
