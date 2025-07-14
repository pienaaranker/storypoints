import { useState, useEffect } from 'react'
import './Exercise.css'

/**
 * Exercise 3: Mid-Sprint Adaptation
 * Dynamic simulation exercise for handling scope changes and blockers during sprint
 */
function Exercise3({ onComplete, onStart, isStarted }) {
  const [currentStep, setCurrentStep] = useState('start') // 'start', 'simulation', 'feedback'
  const [sprintData, setSprintData] = useState(null)
  const [currentScenario, setCurrentScenario] = useState(0)
  const [decisions, setDecisions] = useState([])
  const [sprintStatus, setSprintStatus] = useState({})
  const [loading, setLoading] = useState(false)

  // Mock sprint simulation data
  const mockSprintData = {
    sprintGoal: "Improve checkout experience to reduce cart abandonment by 15%",
    originalStories: [
      { id: 1, title: "Simplify checkout form", points: 5, status: "completed", progress: 100 },
      { id: 2, title: "Add guest checkout option", points: 8, status: "in-progress", progress: 60 },
      { id: 3, title: "Implement progress indicator", points: 3, status: "completed", progress: 100 },
      { id: 4, title: "Add payment validation", points: 5, status: "not-started", progress: 0 },
      { id: 5, title: "Mobile optimization", points: 8, status: "in-progress", progress: 30 }
    ],
    teamCapacity: 29,
    daysPassed: 7,
    totalDays: 14,
    scenarios: [
      {
        id: 1,
        day: 8,
        type: "SCOPE_CHANGE",
        title: "Urgent Security Fix Required",
        description: "A critical security vulnerability has been discovered in the payment processing system. The security team requires immediate attention to fix this issue.",
        impact: "This will require 8 story points of effort and needs to be completed this sprint.",
        options: [
          {
            id: 'a',
            title: "Add security fix to sprint",
            description: "Include the security fix and remove lower priority stories",
            consequences: "Sprint goal may be at risk, but security is addressed",
            impact: { scope: -1, quality: +1, morale: -1 }
          },
          {
            id: 'b',
            title: "Defer to next sprint",
            description: "Keep current scope and address security in next sprint",
            consequences: "Security risk remains, but sprint goal is protected",
            impact: { scope: 0, quality: -2, morale: 0 }
          },
          {
            id: 'c',
            title: "Split the team",
            description: "Have some team members work on security while others continue",
            consequences: "Both objectives addressed but team efficiency reduced",
            impact: { scope: -1, quality: 0, morale: -1 }
          }
        ]
      },
      {
        id: 2,
        day: 10,
        type: "BLOCKER",
        title: "Third-party API Issues",
        description: "The payment gateway API is experiencing intermittent failures, blocking the guest checkout implementation.",
        impact: "Guest checkout story (8 points) is blocked and may not be completed.",
        options: [
          {
            id: 'a',
            title: "Implement workaround",
            description: "Create a temporary solution while API issues are resolved",
            consequences: "Story can continue but may need rework later",
            impact: { scope: 0, quality: -1, morale: 0 }
          },
          {
            id: 'b',
            title: "Switch to alternative API",
            description: "Integrate with a different payment provider",
            consequences: "More work required but better long-term solution",
            impact: { scope: -1, quality: +1, morale: -1 }
          },
          {
            id: 'c',
            title: "Focus on other stories",
            description: "Pause guest checkout and prioritize other sprint work",
            consequences: "Sprint goal impact but other work can progress",
            impact: { scope: -2, quality: 0, morale: +1 }
          }
        ]
      },
      {
        id: 3,
        day: 12,
        type: "STAKEHOLDER_REQUEST",
        title: "Last-minute Feature Request",
        description: "The product manager wants to add a 'save for later' feature to the checkout process based on user feedback.",
        impact: "This would be a 5-point story and could enhance the sprint goal.",
        options: [
          {
            id: 'a',
            title: "Add to current sprint",
            description: "Include the feature by working overtime",
            consequences: "Feature delivered but team may be overworked",
            impact: { scope: +1, quality: 0, morale: -2 }
          },
          {
            id: 'b',
            title: "Add to product backlog",
            description: "Prioritize for next sprint planning",
            consequences: "Maintains sprint focus and team sustainability",
            impact: { scope: 0, quality: 0, morale: +1 }
          },
          {
            id: 'c',
            title: "Replace existing story",
            description: "Swap out mobile optimization for this feature",
            consequences: "New feature delivered but original scope changed",
            impact: { scope: 0, quality: -1, morale: 0 }
          }
        ]
      }
    ]
  }

  useEffect(() => {
    if (currentStep === 'simulation') {
      setSprintData(mockSprintData)
      setSprintStatus({
        scope: 0,
        quality: 0,
        morale: 0,
        sprintGoalRisk: 'low'
      })
    }
  }, [currentStep])

  const handleStart = () => {
    if (onStart) onStart()
    setCurrentStep('simulation')
  }

  const handleDecision = (scenarioId, optionId) => {
    const scenario = sprintData.scenarios.find(s => s.id === scenarioId)
    const option = scenario.options.find(o => o.id === optionId)
    
    const newDecision = {
      scenarioId,
      optionId,
      scenario: scenario.title,
      decision: option.title,
      consequences: option.consequences,
      impact: option.impact
    }

    setDecisions(prev => [...prev, newDecision])
    
    // Update sprint status based on decision impact
    setSprintStatus(prev => ({
      scope: Math.max(-3, Math.min(3, prev.scope + option.impact.scope)),
      quality: Math.max(-3, Math.min(3, prev.quality + option.impact.quality)),
      morale: Math.max(-3, Math.min(3, prev.morale + option.impact.morale)),
      sprintGoalRisk: calculateSprintGoalRisk(prev.scope + option.impact.scope, prev.quality + option.impact.quality)
    }))

    // Move to next scenario or feedback
    if (currentScenario < sprintData.scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1)
    } else {
      setCurrentStep('feedback')
    }
  }

  const calculateSprintGoalRisk = (scope, quality) => {
    const totalImpact = scope + quality
    if (totalImpact >= 1) return 'low'
    if (totalImpact >= -1) return 'medium'
    return 'high'
  }

  const handleComplete = () => {
    if (onComplete) onComplete()
  }

  const getStatusColor = (value) => {
    if (value > 0) return '#28a745'
    if (value < 0) return '#dc3545'
    return '#6c757d'
  }

  const getStatusText = (value) => {
    if (value > 0) return 'Positive'
    if (value < 0) return 'Negative'
    return 'Neutral'
  }

  const renderStartScreen = () => (
    <div className="start-screen">
      <h2>Mid-Sprint Adaptation</h2>
      <p>
        Navigate realistic mid-sprint challenges including scope changes, technical blockers, 
        and shifting priorities. Practice agile decision-making that balances principles with practical constraints.
      </p>
      <button className="start-button" onClick={handleStart}>
        Start Simulation
      </button>
    </div>
  )

  const renderSimulationStep = () => {
    const scenario = sprintData.scenarios[currentScenario]
    const progressPercentage = ((sprintData.daysPassed + currentScenario * 2) / sprintData.totalDays) * 100

    return (
      <div className="adaptation-step">
        <div className="exercise-header">
          <h2>Sprint Day {scenario.day} - {scenario.title}</h2>
          <p>Make a decision to keep your sprint on track</p>
        </div>

        <div className="sprint-status">
          <h3>Current Sprint Status</h3>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Sprint Goal:</strong> {sprintData.sprintGoal}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Progress:</strong> Day {scenario.day} of {sprintData.totalDays}
            <div style={{ background: '#e9ecef', height: '8px', borderRadius: '4px', marginTop: '0.5rem' }}>
              <div 
                style={{ 
                  background: '#007bff', 
                  height: '100%', 
                  width: `${progressPercentage}%`, 
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
          
          <div className="status-grid">
            <div className="stat-card">
              <div className="stat-value" style={{ color: getStatusColor(sprintStatus.scope) }}>
                {getStatusText(sprintStatus.scope)}
              </div>
              <div className="stat-label">Scope Impact</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: getStatusColor(sprintStatus.quality) }}>
                {getStatusText(sprintStatus.quality)}
              </div>
              <div className="stat-label">Quality Impact</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: getStatusColor(sprintStatus.morale) }}>
                {getStatusText(sprintStatus.morale)}
              </div>
              <div className="stat-label">Team Morale</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ 
                color: sprintStatus.sprintGoalRisk === 'low' ? '#28a745' : 
                       sprintStatus.sprintGoalRisk === 'medium' ? '#ffc107' : '#dc3545'
              }}>
                {sprintStatus.sprintGoalRisk.toUpperCase()}
              </div>
              <div className="stat-label">Goal Risk</div>
            </div>
          </div>
        </div>

        <div className="scenario-event">
          <div className="event-type">{scenario.type.replace('_', ' ')}</div>
          <h3>{scenario.title}</h3>
          <p>{scenario.description}</p>
          <div style={{ background: '#f8d7da', padding: '0.75rem', borderRadius: '6px', marginTop: '1rem' }}>
            <strong>Impact:</strong> {scenario.impact}
          </div>
        </div>

        <div className="decision-options">
          <h4>How do you want to handle this situation?</h4>
          {scenario.options.map(option => (
            <div 
              key={option.id}
              className="decision-option"
              onClick={() => handleDecision(scenario.id, option.id)}
            >
              <div className="option-title">{option.title}</div>
              <div style={{ margin: '0.5rem 0', color: '#495057' }}>{option.description}</div>
              <div className="option-consequences">
                <strong>Consequences:</strong> {option.consequences}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderFeedbackStep = () => {
    const finalScore = Math.max(0, Math.min(100, 50 + (sprintStatus.scope * 10) + (sprintStatus.quality * 10) + (sprintStatus.morale * 5)))

    return (
      <div className="feedback-step">
        <div className="exercise-header">
          <h2>Sprint Retrospective</h2>
          <p>Review your decisions and their impact on the sprint</p>
        </div>

        <div className="score-summary">
          <div className="score">{Math.round(finalScore)}%</div>
          <p>Sprint Success Score</p>
          <div style={{ 
            color: sprintStatus.sprintGoalRisk === 'low' ? '#28a745' : 
                   sprintStatus.sprintGoalRisk === 'medium' ? '#ffc107' : '#dc3545',
            fontWeight: 'bold'
          }}>
            Sprint Goal Risk: {sprintStatus.sprintGoalRisk.toUpperCase()}
          </div>
        </div>

        <div className="detailed-feedback">
          <h3>Your Decisions</h3>
          {decisions.map((decision, index) => (
            <div key={index} className="feedback-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <strong>{decision.scenario}</strong>
                  <div style={{ color: '#007bff', margin: '0.5rem 0' }}>Decision: {decision.decision}</div>
                  <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>{decision.consequences}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                  {decision.impact.scope !== 0 && (
                    <span style={{ color: getStatusColor(decision.impact.scope) }}>
                      Scope: {decision.impact.scope > 0 ? '+' : ''}{decision.impact.scope}
                    </span>
                  )}
                  {decision.impact.quality !== 0 && (
                    <span style={{ color: getStatusColor(decision.impact.quality) }}>
                      Quality: {decision.impact.quality > 0 ? '+' : ''}{decision.impact.quality}
                    </span>
                  )}
                  {decision.impact.morale !== 0 && (
                    <span style={{ color: getStatusColor(decision.impact.morale) }}>
                      Morale: {decision.impact.morale > 0 ? '+' : ''}{decision.impact.morale}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div className="key-learnings">
            <h4>Key Learnings</h4>
            <ul>
              <li>Mid-sprint changes are inevitable - focus on managing impact</li>
              <li>Protect the sprint goal while being flexible with scope</li>
              <li>Consider team morale and sustainability in decisions</li>
              <li>Communicate changes and trade-offs to stakeholders</li>
              <li>Use retrospectives to improve future sprint planning</li>
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
    case 'simulation':
      return renderSimulationStep()
    case 'feedback':
      return renderFeedbackStep()
    default:
      return renderStartScreen()
  }
}

export default Exercise3
