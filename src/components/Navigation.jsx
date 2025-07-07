import './Navigation.css'

function Navigation({ currentExercise, exerciseProgress, onNavigate }) {
  const exercises = [
    { number: 1, title: 'Abstract Comparisons', description: 'Learn relative sizing with abstract items' },
    { number: 2, title: 'User Stories', description: 'Apply sizing to real user stories' },
    { number: 3, title: 'Core Principles', description: 'Review and reinforce key concepts' }
  ]

  const getExerciseStatus = (exerciseNumber) => {
    const progress = exerciseProgress[exerciseNumber]
    if (progress.completed) return 'completed'
    if (progress.started || exerciseNumber === currentExercise) return 'active'
    if (exerciseNumber === 1 || exerciseProgress[exerciseNumber - 1]?.completed) return 'available'
    return 'locked'
  }

  const canNavigateToExercise = (exerciseNumber) => {
    const status = getExerciseStatus(exerciseNumber)
    return status === 'available' || status === 'active' || status === 'completed'
  }

  const getCompletedCount = () => {
    return Object.values(exerciseProgress).filter(progress => progress.completed).length
  }

  const getProgressPercentage = () => {
    return Math.round((getCompletedCount() / exercises.length) * 100)
  }

  const isAllCompleted = () => {
    return getCompletedCount() === exercises.length
  }

  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-header">
          <h3 className="nav-title">Your Progress</h3>
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
              🎉 Congratulations! You've mastered story point estimation!
            </div>
          )}
        </div>

        <div className="exercise-list">
          {exercises.map((exercise) => {
            const status = getExerciseStatus(exercise.number)
            const isClickable = canNavigateToExercise(exercise.number)

            return (
              <div
                key={exercise.number}
                className={`exercise-item ${status} ${isClickable ? 'clickable' : ''}`}
                onClick={() => isClickable && onNavigate(exercise.number)}
              >
                <div className="exercise-number">
                  {status === 'completed' ? '✓' : exercise.number}
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
