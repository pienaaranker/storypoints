import { useState, useEffect } from 'react'
import './Exercise.css'

/**
 * Exercise 2: Sprint Goal Workshop
 * Scenario-based exercise for crafting sprint goals and selecting supporting stories
 */
function Exercise2({ onComplete, onStart, isStarted }) {
  const [currentStep, setCurrentStep] = useState('start') // 'start', 'goal-setting', 'story-selection', 'feedback'
  const [scenario, setScenario] = useState(null)
  const [sprintGoal, setSprintGoal] = useState('')
  const [selectedStories, setSelectedStories] = useState([])
  const [goalQuality, setGoalQuality] = useState({})
  const [loading, setLoading] = useState(false)

  // Mock scenario data - in real implementation this would come from JSON
  const mockScenario = {
    id: 1,
    title: "E-commerce Platform Enhancement",
    businessContext: {
      situation: "Our e-commerce platform has been experiencing high cart abandonment rates (65%) and customer complaints about the checkout process. The business team has identified this as a critical issue affecting revenue.",
      stakeholders: ["Product Manager", "UX Designer", "Development Team", "Customer Support"],
      constraints: ["2-week sprint", "Limited QA resources", "Must not break existing functionality"],
      success_metrics: ["Reduce cart abandonment by 15%", "Improve checkout completion rate", "Decrease support tickets"]
    },
    availableStories: [
      {
        id: 1,
        title: "Simplify checkout form",
        description: "Reduce number of required fields in checkout form",
        points: 5,
        businessValue: "High",
        dependencies: [],
        risks: "Low"
      },
      {
        id: 2,
        title: "Add guest checkout option",
        description: "Allow users to checkout without creating an account",
        points: 8,
        businessValue: "High",
        dependencies: [],
        risks: "Medium"
      },
      {
        id: 3,
        title: "Implement progress indicator",
        description: "Show users their progress through the checkout process",
        points: 3,
        businessValue: "Medium",
        dependencies: [],
        risks: "Low"
      },
      {
        id: 4,
        title: "Add payment method validation",
        description: "Real-time validation of credit card information",
        points: 5,
        businessValue: "Medium",
        dependencies: [],
        risks: "Medium"
      },
      {
        id: 5,
        title: "Optimize page load speed",
        description: "Improve checkout page loading performance",
        points: 8,
        businessValue: "Medium",
        dependencies: [],
        risks: "High"
      },
      {
        id: 6,
        title: "Add cart recovery emails",
        description: "Send automated emails for abandoned carts",
        points: 13,
        businessValue: "High",
        dependencies: ["Email service integration"],
        risks: "High"
      },
      {
        id: 7,
        title: "Mobile checkout optimization",
        description: "Optimize checkout flow for mobile devices",
        points: 8,
        businessValue: "High",
        dependencies: [],
        risks: "Medium"
      },
      {
        id: 8,
        title: "Add multiple payment options",
        description: "Support PayPal, Apple Pay, and Google Pay",
        points: 13,
        businessValue: "Medium",
        dependencies: ["Third-party integrations"],
        risks: "High"
      }
    ]
  }

  useEffect(() => {
    if (currentStep === 'goal-setting') {
      setScenario(mockScenario)
    }
  }, [currentStep])

  useEffect(() => {
    // Evaluate goal quality whenever sprint goal changes
    if (sprintGoal) {
      evaluateGoalQuality(sprintGoal)
    }
  }, [sprintGoal])

  const handleStart = () => {
    if (onStart) onStart()
    setCurrentStep('goal-setting')
  }

  const evaluateGoalQuality = (goal) => {
    const checks = {
      hasBusinessValue: {
        label: "Connects to business value",
        pass: goal.toLowerCase().includes('abandon') || goal.toLowerCase().includes('checkout') || goal.toLowerCase().includes('conversion') || goal.toLowerCase().includes('revenue'),
        description: "Goal should relate to business outcomes"
      },
      isSpecific: {
        label: "Specific and measurable",
        pass: goal.length > 20 && (goal.includes('%') || goal.includes('improve') || goal.includes('reduce') || goal.includes('increase')),
        description: "Goal should be specific about what will be achieved"
      },
      isAchievable: {
        label: "Achievable in one sprint",
        pass: !goal.toLowerCase().includes('completely') && !goal.toLowerCase().includes('perfect') && !goal.toLowerCase().includes('all'),
        description: "Goal should be realistic for a 2-week sprint"
      },
      isUserFocused: {
        label: "User-focused outcome",
        pass: goal.toLowerCase().includes('user') || goal.toLowerCase().includes('customer') || goal.toLowerCase().includes('experience'),
        description: "Goal should focus on user/customer benefits"
      },
      hasClarity: {
        label: "Clear and understandable",
        pass: goal.length >= 15 && goal.length <= 100,
        description: "Goal should be concise but descriptive"
      }
    }

    setGoalQuality(checks)
  }

  const handleGoalSubmit = () => {
    if (sprintGoal.trim()) {
      setCurrentStep('story-selection')
    }
  }

  const toggleStorySelection = (story) => {
    setSelectedStories(prev => {
      const isSelected = prev.find(s => s.id === story.id)
      if (isSelected) {
        return prev.filter(s => s.id !== story.id)
      } else {
        return [...prev, story]
      }
    })
  }

  const getTotalPoints = () => {
    return selectedStories.reduce((total, story) => total + story.points, 0)
  }

  const handleStorySelectionSubmit = () => {
    if (selectedStories.length > 0) {
      setCurrentStep('feedback')
    }
  }

  const handleComplete = () => {
    if (onComplete) onComplete()
  }

  const renderQualityChecks = () => {
    return (
      <div className="goal-quality-checks">
        <h4>Goal Quality Assessment</h4>
        {Object.entries(goalQuality).map(([key, check]) => (
          <div key={key} className="quality-check">
            <div className={`quality-check-icon ${check.pass ? 'pass' : 'fail'}`}>
              {check.pass ? '✓' : '✗'}
            </div>
            <div>
              <strong>{check.label}</strong>
              <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{check.description}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderStartScreen = () => (
    <div className="start-screen">
      <h2>Sprint Goal Workshop</h2>
      <p>
        Learn to craft meaningful sprint goals that align technical work with business value. 
        You'll work through real business scenarios to create focused objectives and select supporting stories.
      </p>
      <button className="start-button" onClick={handleStart}>
        Start Workshop
      </button>
    </div>
  )

  const renderGoalSettingStep = () => (
    <div className="goal-setting-step">
      <div className="exercise-header">
        <h2>Sprint Goal Workshop</h2>
        <p>Craft a compelling sprint goal for this scenario</p>
      </div>

      <div className="business-context">
        <h3>Business Context: {scenario?.title}</h3>
        <div style={{ marginBottom: '1rem' }}>
          <h4>Situation</h4>
          <p>{scenario?.businessContext.situation}</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h4>Success Metrics</h4>
            <ul>
              {scenario?.businessContext.success_metrics.map((metric, index) => (
                <li key={index}>{metric}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Constraints</h4>
            <ul>
              {scenario?.businessContext.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="goal-input-area">
        <h3>Your Sprint Goal</h3>
        <p>Write a sprint goal that captures what the team wants to achieve in this sprint:</p>
        <textarea
          className="goal-input"
          value={sprintGoal}
          onChange={(e) => setSprintGoal(e.target.value)}
          placeholder="Example: Improve checkout experience to reduce cart abandonment by simplifying the process and adding user-friendly features..."
        />
        
        {sprintGoal && renderQualityChecks()}
      </div>

      <div className="step-actions">
        <button 
          className="next-button"
          onClick={handleGoalSubmit}
          disabled={!sprintGoal.trim() || Object.values(goalQuality).filter(check => check.pass).length < 3}
        >
          Continue to Story Selection
        </button>
      </div>
    </div>
  )

  const renderStorySelectionStep = () => (
    <div className="story-selection-step">
      <div className="exercise-header">
        <h2>Select Supporting Stories</h2>
        <p>Choose stories that best support your sprint goal</p>
      </div>

      <div className="goal-reminder" style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h4>Your Sprint Goal:</h4>
        <p style={{ fontStyle: 'italic', margin: '0.5rem 0' }}>"{sprintGoal}"</p>
      </div>

      <div className="story-selection-area">
        <h3>Available Stories (Select stories that support your goal)</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {scenario?.availableStories.map(story => {
            const isSelected = selectedStories.find(s => s.id === story.id)
            return (
              <div 
                key={story.id}
                className={`story-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleStorySelection(story)}
                style={{ 
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #007bff' : '1px solid #dee2e6',
                  background: isSelected ? '#e3f2fd' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="story-title">{story.title}</div>
                    <div className="story-description">{story.description}</div>
                    {story.dependencies.length > 0 && (
                      <div style={{ color: '#ffc107', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        Dependencies: {story.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className="story-points">{story.points} pts</span>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '12px',
                      background: story.businessValue === 'High' ? '#d4edda' : story.businessValue === 'Medium' ? '#fff3cd' : '#f8d7da',
                      color: story.businessValue === 'High' ? '#155724' : story.businessValue === 'Medium' ? '#856404' : '#721c24'
                    }}>
                      {story.businessValue} Value
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Selected Stories: {selectedStories.length}</span>
            <span>Total Points: {getTotalPoints()}</span>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button 
          className="submit-button"
          onClick={handleStorySelectionSubmit}
          disabled={selectedStories.length === 0}
        >
          Review Sprint Plan
        </button>
      </div>
    </div>
  )

  const renderFeedbackStep = () => {
    const highValueStories = selectedStories.filter(s => s.businessValue === 'High').length
    const totalStories = selectedStories.length
    const alignmentScore = Math.round((highValueStories / totalStories) * 100)

    return (
      <div className="feedback-step">
        <div className="exercise-header">
          <h2>Sprint Plan Review</h2>
          <p>Analysis of your sprint goal and story selection</p>
        </div>

        <div className="score-summary">
          <div className="score">{alignmentScore}%</div>
          <p>Goal-Story Alignment Score</p>
        </div>

        <div className="detailed-feedback">
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h4>Your Sprint Goal</h4>
            <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>"{sprintGoal}"</p>
          </div>

          <h4>Selected Stories ({selectedStories.length} stories, {getTotalPoints()} points)</h4>
          {selectedStories.map(story => (
            <div key={story.id} className="feedback-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{story.title}</strong> - {story.points} points
                  <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>{story.description}</div>
                </div>
                <span style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '12px',
                  background: story.businessValue === 'High' ? '#d4edda' : story.businessValue === 'Medium' ? '#fff3cd' : '#f8d7da',
                  color: story.businessValue === 'High' ? '#155724' : story.businessValue === 'Medium' ? '#856404' : '#721c24'
                }}>
                  {story.businessValue} Value
                </span>
              </div>
            </div>
          ))}
          
          <div className="key-learnings">
            <h4>Key Learnings</h4>
            <ul>
              <li>Sprint goals should connect technical work to business outcomes</li>
              <li>Focus on user value rather than technical features</li>
              <li>Select stories that directly support your sprint objective</li>
              <li>Balance scope with team capacity and sprint constraints</li>
              <li>Good goals are specific, measurable, and achievable</li>
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
    case 'goal-setting':
      return renderGoalSettingStep()
    case 'story-selection':
      return renderStorySelectionStep()
    case 'feedback':
      return renderFeedbackStep()
    default:
      return renderStartScreen()
  }
}

export default Exercise2
