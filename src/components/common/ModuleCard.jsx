import React from 'react'
import './ModuleCard.css'

/**
 * ModuleCard component for displaying module information and progress
 * @param {Object} props - Component props
 * @param {Object} props.module - Module configuration object
 * @param {string} props.status - Module status ('available', 'coming-soon', 'locked')
 * @param {Object} props.progress - Module progress object
 * @param {Function} props.onNavigate - Navigation callback function
 * @param {boolean} props.disabled - Whether the card is disabled
 */
function ModuleCard({ module, status = 'available', progress = null, onNavigate, disabled = false }) {
  /**
   * Calculates progress percentage for the module
   * @returns {number} Progress percentage (0-100)
   */
  const getProgressPercentage = () => {
    if (!progress?.exercises) return 0
    
    const exerciseIds = Object.keys(progress.exercises)
    if (exerciseIds.length === 0) return 0
    
    const completedCount = exerciseIds.filter(id => 
      progress.exercises[id]?.completed
    ).length
    
    return Math.round((completedCount / exerciseIds.length) * 100)
  }

  /**
   * Gets the appropriate status text for display
   * @returns {string} Status text
   */
  const getStatusText = () => {
    switch (status) {
      case 'available':
        return progress?.moduleCompleted ? 'Completed' : 
               progress?.moduleStarted ? 'In Progress' : 'Start Learning'
      case 'coming-soon':
        return 'Coming Soon'
      case 'locked':
        return 'Locked'
      default:
        return 'Available'
    }
  }

  /**
   * Gets the appropriate CSS class for the card
   * @returns {string} CSS class name
   */
  const getCardClass = () => {
    const baseClass = 'module-card'
    const statusClass = status
    const progressClass = progress?.moduleCompleted ? 'completed' : 
                         progress?.moduleStarted ? 'in-progress' : 'not-started'
    const disabledClass = disabled ? 'disabled' : ''
    
    return [baseClass, statusClass, progressClass, disabledClass]
      .filter(Boolean)
      .join(' ')
  }

  /**
   * Handles card click
   */
  const handleClick = () => {
    if (!disabled && status === 'available' && onNavigate) {
      onNavigate(module.id)
    }
  }

  /**
   * Handles keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  const progressPercentage = getProgressPercentage()
  const statusText = getStatusText()
  const cardClass = getCardClass()
  const isClickable = !disabled && status === 'available'

  return (
    <div 
      className={cardClass}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable ? 0 : -1}
      role={isClickable ? 'button' : 'article'}
      aria-label={`${module.title} - ${statusText}`}
    >
      <div className="module-card-header">
        <div className="module-icon" aria-hidden="true">
          {module.icon}
        </div>
        <div className="module-status">
          <span className={`status-badge ${status}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="module-content">
        <h3 className="module-title">{module.title}</h3>
        <p className="module-description">{module.description}</p>
        
        <div className="module-meta">
          <div className="meta-item">
            <span className="meta-label">Difficulty:</span>
            <span className={`difficulty ${module.difficulty?.toLowerCase()}`}>
              {module.difficulty}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Time:</span>
            <span className="time">{module.estimatedTime}</span>
          </div>
        </div>

        {module.prerequisites && module.prerequisites.length > 0 && (
          <div className="prerequisites">
            <span className="prerequisites-label">Prerequisites:</span>
            <ul className="prerequisites-list">
              {module.prerequisites.map((prereq, index) => (
                <li key={index} className="prerequisite-item">
                  {prereq}
                </li>
              ))}
            </ul>
          </div>
        )}

        {progress && status === 'available' && (
          <div className="module-progress">
            <div className="progress-header">
              <span className="progress-label">Progress</span>
              <span className="progress-percentage">{progressPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
                aria-hidden="true"
              />
            </div>
            {progress.moduleCompleted && (
              <div className="completion-badge">
                ✓ Module Completed
              </div>
            )}
          </div>
        )}
      </div>

      {isClickable && (
        <div className="module-card-footer">
          <div className="action-hint">
            Click to {progress?.moduleStarted ? 'continue' : 'start'}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModuleCard
