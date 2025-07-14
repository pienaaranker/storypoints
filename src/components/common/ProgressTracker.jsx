import React from 'react'
import './ProgressTracker.css'

/**
 * ProgressTracker component for displaying overall progress across modules
 * @param {Object} props - Component props
 * @param {Object} props.moduleProgress - Progress data for all modules
 * @param {Array} props.availableModules - Array of available module configurations
 * @param {boolean} props.showDetails - Whether to show detailed progress breakdown
 * @param {string} props.size - Size variant ('small', 'medium', 'large')
 */
function ProgressTracker({ 
  moduleProgress = {}, 
  availableModules = [], 
  showDetails = false,
  size = 'medium'
}) {
  /**
   * Calculates overall progress percentage
   * @returns {number} Overall progress percentage (0-100)
   */
  const getOverallProgress = () => {
    const availableModuleIds = availableModules
      .filter(module => module.status === 'available')
      .map(module => module.id)
    
    if (availableModuleIds.length === 0) return 0
    
    const completedModules = availableModuleIds.filter(id =>
      moduleProgress[id]?.moduleCompleted
    ).length
    
    return Math.round((completedModules / availableModuleIds.length) * 100)
  }

  /**
   * Gets progress data for each module
   * @returns {Array} Array of module progress objects
   */
  const getModuleProgressData = () => {
    return availableModules
      .filter(module => module.status === 'available')
      .map(module => {
        const progress = moduleProgress[module.id]
        const exerciseCount = Object.keys(progress?.exercises || {}).length
        const completedExercises = Object.values(progress?.exercises || {})
          .filter(ex => ex.completed).length
        
        return {
          id: module.id,
          title: module.title,
          icon: module.icon,
          progress: progress || { moduleStarted: false, moduleCompleted: false, exercises: {} },
          exerciseCount,
          completedExercises,
          progressPercentage: exerciseCount > 0 ? Math.round((completedExercises / exerciseCount) * 100) : 0
        }
      })
  }

  /**
   * Gets status text based on overall progress
   * @param {number} overallProgress - Overall progress percentage
   * @returns {string} Status text
   */
  const getStatusText = (overallProgress) => {
    if (overallProgress === 0) return 'Not Started'
    if (overallProgress === 100) return 'All Modules Complete!'
    return 'In Progress'
  }

  const overallProgress = getOverallProgress()
  const moduleProgressData = getModuleProgressData()
  const statusText = getStatusText(overallProgress)

  if (availableModules.length === 0) {
    return null
  }

  return (
    <div className={`progress-tracker ${size}`}>
      <div className="progress-header">
        <h3 className="progress-title">Learning Progress</h3>
        <div className="progress-summary">
          <span className="progress-percentage">{overallProgress}%</span>
          <span className="progress-status">{statusText}</span>
        </div>
      </div>

      <div className="overall-progress">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${overallProgress}%` }}
              aria-label={`Overall progress: ${overallProgress}%`}
            />
          </div>
          <div className="progress-labels">
            <span className="progress-start">0%</span>
            <span className="progress-end">100%</span>
          </div>
        </div>
      </div>

      {showDetails && moduleProgressData.length > 0 && (
        <div className="module-progress-details">
          <h4 className="details-title">Module Breakdown</h4>
          <div className="module-progress-list">
            {moduleProgressData.map(module => (
              <div key={module.id} className="module-progress-item">
                <div className="module-info">
                  <span className="module-icon" aria-hidden="true">
                    {module.icon}
                  </span>
                  <div className="module-text">
                    <span className="module-name">{module.title}</span>
                    <span className="module-stats">
                      {module.completedExercises} of {module.exerciseCount} exercises
                    </span>
                  </div>
                </div>
                <div className="module-progress-bar">
                  <div className="mini-progress-bar">
                    <div 
                      className="mini-progress-fill"
                      style={{ width: `${module.progressPercentage}%` }}
                    />
                  </div>
                  <span className="mini-progress-percentage">
                    {module.progressPercentage}%
                  </span>
                </div>
                <div className="module-status-indicator">
                  {module.progress.moduleCompleted ? (
                    <span className="status-complete" title="Module completed">✓</span>
                  ) : module.progress.moduleStarted ? (
                    <span className="status-in-progress" title="In progress">⏳</span>
                  ) : (
                    <span className="status-not-started" title="Not started">○</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {overallProgress === 100 && (
        <div className="completion-celebration">
          <div className="celebration-icon">🎉</div>
          <div className="celebration-text">
            <strong>Congratulations!</strong>
            <br />
            You've completed all available modules!
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressTracker
