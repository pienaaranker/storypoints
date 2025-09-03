import React from 'react'
import './LearningProgressTracker.css'
import { SKILL_CRITERIA, LEARNING_CHECKPOINTS } from '../../../utils/progressiveLearningManager'

/**
 * Learning Progress Tracker Component
 * Displays learner progress, skill checkpoints, and adaptive recommendations
 */
function LearningProgressTracker({ 
  progressSummary, 
  skillAssessment, 
  onCheckpointClick,
  showDetailed = false 
}) {
  const {
    currentLevel,
    completedCheckpoints,
    totalCheckpoints,
    progressPercentage,
    nextCheckpoint,
    adaptiveSettings
  } = progressSummary

  const renderCheckpointStatus = (checkpoint, assessment) => {
    const { isCompleted, progress, needsWork, averageAccuracy, attempts } = assessment
    
    let statusClass = 'checkpoint-status'
    let statusIcon = '○'
    let statusText = 'Not Started'
    
    if (isCompleted) {
      statusClass += ' completed'
      statusIcon = '✓'
      statusText = 'Completed'
    } else if (needsWork) {
      statusClass += ' needs-work'
      statusIcon = '⚠'
      statusText = 'Needs Work'
    } else if (attempts > 0) {
      statusClass += ' in-progress'
      statusIcon = '◐'
      statusText = 'In Progress'
    }
    
    return (
      <div 
        key={checkpoint}
        className={`checkpoint-item ${statusClass}`}
        onClick={() => onCheckpointClick && onCheckpointClick(checkpoint)}
      >
        <div className="checkpoint-header">
          <span className="checkpoint-icon">{statusIcon}</span>
          <span className="checkpoint-name">{assessment.name}</span>
          <span className="checkpoint-status-text">{statusText}</span>
        </div>
        
        {showDetailed && (
          <div className="checkpoint-details">
            <p className="checkpoint-description">{assessment.description}</p>
            <div className="checkpoint-metrics">
              <div className="metric">
                <span className="metric-label">Progress:</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <span className="metric-value">{Math.round(progress * 100)}%</span>
              </div>
              
              {attempts > 0 && (
                <>
                  <div className="metric">
                    <span className="metric-label">Accuracy:</span>
                    <span className="metric-value">
                      {Math.round(averageAccuracy * 100)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Attempts:</span>
                    <span className="metric-value">
                      {attempts} / {assessment.minAttempts}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderLevelBadge = (level) => {
    const levelConfig = {
      foundation: { label: 'Foundation', color: '#4CAF50' },
      intermediate: { label: 'Intermediate', color: '#FF9800' },
      advanced: { label: 'Advanced', color: '#2196F3' },
      expert: { label: 'Expert', color: '#9C27B0' }
    }
    
    const config = levelConfig[level] || levelConfig.foundation
    
    return (
      <div 
        className="level-badge" 
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </div>
    )
  }

  const renderAdaptiveSettings = () => {
    if (!showDetailed) return null
    
    return (
      <div className="adaptive-settings">
        <h4>Current Learning Support</h4>
        <div className="settings-grid">
          <div className={`setting-item ${adaptiveSettings.showHints ? 'enabled' : 'disabled'}`}>
            <span className="setting-icon">{adaptiveSettings.showHints ? '💡' : '🔒'}</span>
            <span className="setting-label">Hints</span>
          </div>
          <div className={`setting-item ${adaptiveSettings.allowRetries ? 'enabled' : 'disabled'}`}>
            <span className="setting-icon">{adaptiveSettings.allowRetries ? '🔄' : '🔒'}</span>
            <span className="setting-label">Retries</span>
          </div>
          <div className={`setting-item ${adaptiveSettings.detailedFeedback ? 'enabled' : 'disabled'}`}>
            <span className="setting-icon">{adaptiveSettings.detailedFeedback ? '📝' : '🔒'}</span>
            <span className="setting-label">Detailed Feedback</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="learning-progress-tracker">
      <div className="progress-header">
        <div className="progress-overview">
          <h3>Learning Progress</h3>
          <div className="progress-stats">
            <div className="overall-progress">
              <div className="progress-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${progressPercentage}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">
                    {progressPercentage}%
                  </text>
                </svg>
              </div>
              <div className="progress-text">
                <span className="completed-count">{completedCheckpoints}</span>
                <span className="total-count">/ {totalCheckpoints}</span>
                <span className="progress-label">Checkpoints</span>
              </div>
            </div>
            
            <div className="current-level">
              <span className="level-label">Current Level:</span>
              {renderLevelBadge(currentLevel)}
            </div>
          </div>
        </div>
        
        {nextCheckpoint && (
          <div className="next-checkpoint">
            <h4>Next Checkpoint</h4>
            <div className="next-checkpoint-info">
              <span className="checkpoint-name">
                {SKILL_CRITERIA[nextCheckpoint]?.name}
              </span>
              <p className="checkpoint-description">
                {SKILL_CRITERIA[nextCheckpoint]?.description}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="checkpoints-section">
        <h4>Learning Checkpoints</h4>
        <div className="checkpoints-list">
          {Object.keys(SKILL_CRITERIA).map(checkpoint => 
            renderCheckpointStatus(checkpoint, skillAssessment[checkpoint])
          )}
        </div>
      </div>

      {renderAdaptiveSettings()}
    </div>
  )
}

export default LearningProgressTracker