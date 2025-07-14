import { useState, useEffect } from 'react'
import './Exercise.css'

/**
 * Exercise 1: Velocity & Capacity Planning
 * Interactive exercise for planning sprint capacity based on team velocity and story points
 */
function Exercise1({ onComplete, onStart, isStarted }) {
  const [currentStep, setCurrentStep] = useState('start') // 'start', 'planning', 'feedback'
  const [teamData, setTeamData] = useState(null)
  const [backlogStories, setBacklogStories] = useState([])
  const [sprintStories, setSprintStories] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock team data - in real implementation this would come from JSON
  const mockTeamData = {
    teamName: "Alpha Squad",
    sprintLength: 2, // weeks
    teamSize: 5,
    availableCapacity: 80, // hours
    velocityHistory: [
      { sprint: "Sprint 1", points: 23 },
      { sprint: "Sprint 2", points: 28 },
      { sprint: "Sprint 3", points: 25 },
      { sprint: "Sprint 4", points: 31 },
      { sprint: "Sprint 5", points: 27 },
      { sprint: "Sprint 6", points: 29 }
    ],
    averageVelocity: 27.2,
    recommendedCapacity: 28
  }

  const mockBacklogStories = [
    {
      id: 1,
      title: "User Login Enhancement",
      description: "Improve login flow with better error handling",
      points: 5,
      priority: "High"
    },
    {
      id: 2,
      title: "Dashboard Performance",
      description: "Optimize dashboard loading time",
      points: 8,
      priority: "High"
    },
    {
      id: 3,
      title: "Mobile Responsive Design",
      description: "Make app fully responsive on mobile devices",
      points: 13,
      priority: "Medium"
    },
    {
      id: 4,
      title: "Email Notifications",
      description: "Add email notification system",
      points: 8,
      priority: "Medium"
    },
    {
      id: 5,
      title: "User Profile Updates",
      description: "Allow users to update their profiles",
      points: 5,
      priority: "Medium"
    },
    {
      id: 6,
      title: "Search Functionality",
      description: "Add search feature to main interface",
      points: 13,
      priority: "Low"
    },
    {
      id: 7,
      title: "Data Export Feature",
      description: "Allow users to export their data",
      points: 8,
      priority: "Low"
    },
    {
      id: 8,
      title: "API Rate Limiting",
      description: "Implement rate limiting for API endpoints",
      points: 3,
      priority: "Medium"
    }
  ]

  useEffect(() => {
    if (currentStep === 'planning') {
      setTeamData(mockTeamData)
      setBacklogStories(mockBacklogStories)
    }
  }, [currentStep])

  const handleStart = () => {
    if (onStart) onStart()
    setCurrentStep('planning')
  }

  const moveStoryToSprint = (story) => {
    setBacklogStories(prev => prev.filter(s => s.id !== story.id))
    setSprintStories(prev => [...prev, story])
  }

  const moveStoryToBacklog = (story) => {
    setSprintStories(prev => prev.filter(s => s.id !== story.id))
    setBacklogStories(prev => [...prev, story])
  }

  const getTotalSprintPoints = () => {
    return sprintStories.reduce((total, story) => total + story.points, 0)
  }

  const getCapacityPercentage = () => {
    const total = getTotalSprintPoints()
    const recommended = teamData?.recommendedCapacity || 28
    return Math.min((total / recommended) * 100, 120) // Cap at 120% for visual purposes
  }

  const isOverCapacity = () => {
    return getTotalSprintPoints() > (teamData?.recommendedCapacity || 28)
  }

  const handleSubmitPlan = () => {
    setCurrentStep('feedback')
  }

  const handleComplete = () => {
    if (onComplete) onComplete()
  }

  const renderVelocityChart = () => {
    if (!teamData) return null

    const maxPoints = Math.max(...teamData.velocityHistory.map(s => s.points))
    
    return (
      <div className="velocity-chart">
        <h4>Team Velocity History</h4>
        <div className="chart-bars">
          {teamData.velocityHistory.map((sprint, index) => (
            <div 
              key={index}
              className="chart-bar"
              style={{ height: `${(sprint.points / maxPoints) * 100}%` }}
            >
              <div className="chart-bar-value">{sprint.points}</div>
              <div className="chart-bar-label">{sprint.sprint}</div>
            </div>
          ))}
        </div>
        <p>Average Velocity: <strong>{teamData.averageVelocity} points</strong></p>
      </div>
    )
  }

  const renderStartScreen = () => (
    <div className="start-screen">
      <h2>Velocity & Capacity Planning</h2>
      <p>
        Learn to plan realistic sprint commitments based on team capacity and historical velocity. 
        You'll work with real team data to balance story complexity with team capabilities.
      </p>
      <button className="start-button" onClick={handleStart}>
        Start Planning
      </button>
    </div>
  )

  const renderPlanningStep = () => (
    <div className="capacity-planning-step">
      <div className="exercise-header">
        <h2>Sprint Planning: {teamData?.teamName}</h2>
        <p>Plan your next sprint based on team velocity and capacity</p>
      </div>

      <div className="team-info">
        <h3>Team Information</h3>
        <div className="team-stats">
          <div className="stat-card">
            <div className="stat-value">{teamData?.teamSize}</div>
            <div className="stat-label">Team Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{teamData?.sprintLength}w</div>
            <div className="stat-label">Sprint Length</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{teamData?.availableCapacity}h</div>
            <div className="stat-label">Available Hours</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{teamData?.averageVelocity}</div>
            <div className="stat-label">Avg Velocity</div>
          </div>
        </div>
      </div>

      {renderVelocityChart()}

      <div className="planning-area">
        <div className="backlog-section">
          <h4>Product Backlog</h4>
          <p>Drag stories to your sprint (Recommended capacity: {teamData?.recommendedCapacity} points)</p>
          {backlogStories.map(story => (
            <div 
              key={story.id} 
              className="story-item"
              onClick={() => moveStoryToSprint(story)}
            >
              <div className="story-title">{story.title}</div>
              <span className="story-points">{story.points} pts</span>
              <div className="story-description">{story.description}</div>
            </div>
          ))}
        </div>

        <div className="sprint-section">
          <h4>Sprint Backlog</h4>
          <div className="sprint-capacity">
            <div className="capacity-text">
              <span>Capacity: {getTotalSprintPoints()} / {teamData?.recommendedCapacity} points</span>
              <span>{Math.round(getCapacityPercentage())}%</span>
            </div>
            <div className="capacity-bar">
              <div 
                className={`capacity-fill ${isOverCapacity() ? 'over-capacity' : ''}`}
                style={{ width: `${getCapacityPercentage()}%` }}
              />
            </div>
            {isOverCapacity() && (
              <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                ⚠️ Over capacity! Consider removing some stories.
              </div>
            )}
          </div>
          
          {sprintStories.map(story => (
            <div 
              key={story.id} 
              className="story-item"
              onClick={() => moveStoryToBacklog(story)}
            >
              <div className="story-title">{story.title}</div>
              <span className="story-points">{story.points} pts</span>
              <div className="story-description">{story.description}</div>
            </div>
          ))}
          
          {sprintStories.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
              Click stories from the backlog to add them to your sprint
            </div>
          )}
        </div>
      </div>

      <div className="step-actions">
        <button 
          className="submit-button"
          onClick={handleSubmitPlan}
          disabled={sprintStories.length === 0}
        >
          Submit Sprint Plan
        </button>
      </div>
    </div>
  )

  const renderFeedbackStep = () => {
    const totalPoints = getTotalSprintPoints()
    const recommended = teamData?.recommendedCapacity || 28
    const variance = ((totalPoints - recommended) / recommended) * 100
    
    return (
      <div className="feedback-step">
        <div className="exercise-header">
          <h2>Sprint Plan Analysis</h2>
          <p>Here's how your sprint plan looks</p>
        </div>

        <div className="score-summary">
          <div className="score">{totalPoints} Points</div>
          <p>
            {variance > 10 ? 'Over-committed' : variance < -10 ? 'Under-committed' : 'Well-balanced'} 
            ({variance > 0 ? '+' : ''}{Math.round(variance)}% vs recommended)
          </p>
        </div>

        <div className="detailed-feedback">
          <h3>Your Sprint Plan</h3>
          {sprintStories.map(story => (
            <div key={story.id} className="feedback-item">
              <strong>{story.title}</strong> - {story.points} points
              <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>{story.description}</div>
            </div>
          ))}
          
          <div className="key-learnings">
            <h4>Key Learnings</h4>
            <ul>
              <li>Historical velocity is your best predictor for future capacity</li>
              <li>Leave buffer for unexpected work and team availability changes</li>
              <li>It's better to under-commit and over-deliver than the opposite</li>
              <li>Sprint planning is about sustainable pace, not maximum throughput</li>
            </ul>
          </div>
        </div>

        <div className="step-actions">
          <button className="complete-button" onClick={handleComplete}>
            Complete Exercise
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading-screen">Loading exercise...</div>
  }

  switch (currentStep) {
    case 'start':
      return renderStartScreen()
    case 'planning':
      return renderPlanningStep()
    case 'feedback':
      return renderFeedbackStep()
    default:
      return renderStartScreen()
  }
}

export default Exercise1
