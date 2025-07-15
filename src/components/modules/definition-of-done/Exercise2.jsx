import React, { useState, useEffect } from 'react'
import { loadExerciseData, getModuleExerciseConfig } from '../../../utils/moduleLoader'
import './Exercise.css'

/**
 * Acceptance Criteria Mastery Exercise
 * Interactive workshop for writing clear, testable acceptance criteria
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onComplete - Exercise completion callback
 * @param {Function} props.onStart - Exercise start callback
 * @param {boolean} props.isStarted - Whether the exercise has been started
 */
function Exercise2({ onComplete, onStart, isStarted }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exerciseConfig, setExerciseConfig] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [formats, setFormats] = useState([])
  const [qualityChecks, setQualityChecks] = useState([])
  const [currentScenario, setCurrentScenario] = useState(0)
  const [selectedFormat, setSelectedFormat] = useState('given-when-then')
  const [criteriaText, setCriteriaText] = useState('')
  const [givenWhenThen, setGivenWhenThen] = useState([{ given: '', when: '', then: '' }])
  const [currentStep, setCurrentStep] = useState('writing') // writing, review, feedback
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState(null)

  // Load exercise data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load exercise configuration from module config
        const exerciseConfigData = await getModuleExerciseConfig('definition-of-done', 2)

        // Load exercise data using the module loader
        const exerciseData = await loadExerciseData('definition-of-done', 2)

        // Extract data from the loaded JSON
        const scenarios = exerciseData.scenarios
        const formats = exerciseData.formats
        const qualityChecks = exerciseData.qualityChecks

        setExerciseConfig(exerciseConfigData)
        setScenarios(scenarios)
        setFormats(formats)
        setQualityChecks(qualityChecks)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load exercise data:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleStart = () => {
    onStart()
  }

  const handleFormatChange = (formatId) => {
    setSelectedFormat(formatId)
    // Reset criteria when format changes
    setCriteriaText('')
    setGivenWhenThen([{ given: '', when: '', then: '' }])
  }

  const handleGivenWhenThenChange = (index, field, value) => {
    const updated = [...givenWhenThen]
    updated[index][field] = value
    setGivenWhenThen(updated)
  }

  const addGivenWhenThenScenario = () => {
    setGivenWhenThen([...givenWhenThen, { given: '', when: '', then: '' }])
  }

  const removeGivenWhenThenScenario = (index) => {
    if (givenWhenThen.length > 1) {
      setGivenWhenThen(givenWhenThen.filter((_, i) => i !== index))
    }
  }

  const handleReviewCriteria = () => {
    setCurrentStep('review')
    
    // Calculate score based on criteria quality
    // This is a simplified scoring system
    let score = 0
    
    if (selectedFormat === 'given-when-then') {
      const validScenarios = givenWhenThen.filter(scenario => 
        scenario.given.trim() && scenario.when.trim() && scenario.then.trim()
      )
      score = Math.min(100, (validScenarios.length / 3) * 100) // Expect at least 3 scenarios
    } else {
      const criteriaLines = criteriaText.split('\n').filter(line => line.trim())
      score = Math.min(100, (criteriaLines.length / 5) * 100) // Expect at least 5 criteria
    }
    
    setScore(Math.round(score))
    
    // Determine feedback based on score
    let feedbackMessage
    if (score >= 90) {
      feedbackMessage = "Excellent! Your acceptance criteria are clear, comprehensive, and testable."
    } else if (score >= 75) {
      feedbackMessage = "Good work! Your acceptance criteria cover the main requirements."
    } else if (score >= 60) {
      feedbackMessage = "Your acceptance criteria are a good start, but they need more detail."
    } else {
      feedbackMessage = "Your acceptance criteria need significant improvement."
    }
    
    setFeedback(feedbackMessage)
  }

  const handleNextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1)
      setCurrentStep('writing')
      setCriteriaText('')
      setGivenWhenThen([{ given: '', when: '', then: '' }])
      setScore(null)
      setFeedback(null)
    } else {
      handleExerciseComplete()
    }
  }

  const handleExerciseComplete = () => {
    onComplete()
  }

  const handleTryAgain = () => {
    setCurrentStep('writing')
    setCriteriaText('')
    setGivenWhenThen([{ given: '', when: '', then: '' }])
    setScore(null)
    setFeedback(null)
  }

  const renderFormatSelector = () => {
    return (
      <div className="ac-format-selector">
        {formats.map(format => (
          <button
            key={format.id}
            className={`ac-format-button ${selectedFormat === format.id ? 'active' : ''}`}
            onClick={() => handleFormatChange(format.id)}
          >
            {format.name}
          </button>
        ))}
      </div>
    )
  }

  const renderGivenWhenThenEditor = () => {
    return (
      <div className="ac-given-when-then">
        {givenWhenThen.map((scenario, index) => (
          <div key={index} className="gwt-scenario">
            <div className="scenario-header">
              <h4>Scenario {index + 1}</h4>
              {givenWhenThen.length > 1 && (
                <button 
                  className="remove-scenario"
                  onClick={() => removeGivenWhenThenScenario(index)}
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="ac-section">
              <label className="ac-section-label">Given (Initial context or state):</label>
              <textarea
                className="ac-section-input"
                value={scenario.given}
                onChange={(e) => handleGivenWhenThenChange(index, 'given', e.target.value)}
                placeholder="Given I am a registered user..."
              />
            </div>
            
            <div className="ac-section">
              <label className="ac-section-label">When (Action or event):</label>
              <textarea
                className="ac-section-input"
                value={scenario.when}
                onChange={(e) => handleGivenWhenThenChange(index, 'when', e.target.value)}
                placeholder="When I click the login button..."
              />
            </div>
            
            <div className="ac-section">
              <label className="ac-section-label">Then (Expected outcome):</label>
              <textarea
                className="ac-section-input"
                value={scenario.then}
                onChange={(e) => handleGivenWhenThenChange(index, 'then', e.target.value)}
                placeholder="Then I should be redirected to my dashboard..."
              />
            </div>
          </div>
        ))}
        
        <button className="add-scenario" onClick={addGivenWhenThenScenario}>
          Add Another Scenario
        </button>
      </div>
    )
  }

  const renderChecklistEditor = () => {
    return (
      <div className="ac-checklist">
        <div className="ac-section">
          <label className="ac-section-label">Acceptance Criteria (one per line, start with ✓):</label>
          <textarea
            className="ac-section-input"
            style={{ minHeight: '200px' }}
            value={criteriaText}
            onChange={(e) => setCriteriaText(e.target.value)}
            placeholder="✓ User can log in with valid credentials&#10;✓ Invalid email shows error message&#10;✓ Account locks after 3 failed attempts"
          />
        </div>
      </div>
    )
  }

  const renderWritingStep = () => {
    const scenario = scenarios[currentScenario]

    return (
      <div className="ac-workshop">
        <div className="exercise-instructions">
          <h4>✍️ How to Write Acceptance Criteria:</h4>
          <ol>
            <li><strong>Select</strong> a format using the buttons below (Given/When/Then is recommended for beginners)</li>
            <li><strong>Read</strong> the user story and business rules carefully</li>
            <li><strong>Write</strong> specific, testable criteria that define when the story is "done"</li>
            <li><strong>Consider</strong> the edge cases listed - what could go wrong?</li>
            <li><strong>Review</strong> your criteria for clarity and completeness</li>
          </ol>
          <p><em>💡 Tip: Good acceptance criteria are specific, measurable, and leave no room for interpretation.</em></p>
        </div>

        <div className="ac-story-card">
          <h3 className="ac-story-title">{scenario.title}</h3>
          <div className="user-story">
            <strong>User Story:</strong> {scenario.userStory}
          </div>
          <div className="story-context">
            <strong>Context:</strong> {scenario.context}
          </div>
          
          <div className="business-rules">
            <h4>Business Rules:</h4>
            <ul>
              {scenario.businessRules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
          
          <div className="edge-cases">
            <h4>Consider These Edge Cases:</h4>
            <ul>
              {scenario.edgeCases.map((edgeCase, index) => (
                <li key={index}>{edgeCase}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="ac-editor">
          <h3>Write Acceptance Criteria</h3>
          
          {renderFormatSelector()}
          
          {selectedFormat === 'given-when-then' && renderGivenWhenThenEditor()}
          {selectedFormat !== 'given-when-then' && renderChecklistEditor()}
        </div>
        
        <div className="exercise-actions">
          <button 
            className="action-button primary" 
            onClick={handleReviewCriteria}
            disabled={
              selectedFormat === 'given-when-then' 
                ? !givenWhenThen.some(s => s.given && s.when && s.then)
                : !criteriaText.trim()
            }
          >
            Review Criteria
          </button>
        </div>
      </div>
    )
  }

  const renderReviewStep = () => {
    const scenario = scenarios[currentScenario]
    
    return (
      <div className="ac-review">
        <div className="exercise-feedback">
          <h3 className="feedback-title">Your Acceptance Criteria Score: {score}%</h3>
          <p className="feedback-content">{feedback}</p>
        </div>
        
        <div className="criteria-comparison">
          <div className="your-criteria">
            <h3>Your Criteria</h3>
            {selectedFormat === 'given-when-then' ? (
              <div className="gwt-display">
                {givenWhenThen.map((scenario, index) => (
                  <div key={index} className="gwt-scenario-display">
                    <h4>Scenario {index + 1}</h4>
                    <p><strong>Given:</strong> {scenario.given}</p>
                    <p><strong>When:</strong> {scenario.when}</p>
                    <p><strong>Then:</strong> {scenario.then}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="checklist-display">
                <pre>{criteriaText}</pre>
              </div>
            )}
          </div>
          
          <div className="model-solution">
            <h3>Model Solution</h3>
            {selectedFormat === 'given-when-then' ? (
              <div className="gwt-display">
                {scenario.modelSolution.givenWhenThen.map((solution, index) => (
                  <div key={index} className="gwt-scenario-display">
                    <h4>Scenario {index + 1}</h4>
                    <p><strong>Given:</strong> {solution.given}</p>
                    <p><strong>When:</strong> {solution.when}</p>
                    <p><strong>Then:</strong> {solution.then}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="checklist-display">
                {scenario.modelSolution.checklist.map((item, index) => (
                  <div key={index}>{item}</div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="exercise-actions">
          {exerciseConfig?.config?.allowRetry && (
            <button className="action-button secondary" onClick={handleTryAgain}>
              Try Again
            </button>
          )}
          <button className="action-button primary" onClick={handleNextScenario}>
            {currentScenario < scenarios.length - 1 ? 'Next Scenario' : 'Complete Exercise'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="exercise exercise2">
      <div className="exercise-header">
        <h2 className="exercise-title">Acceptance Criteria Mastery</h2>
        <p className="exercise-description">
          Write clear, testable acceptance criteria using Given/When/Then format
        </p>
        
        {scenarios.length > 0 && (
          <div className="scenario-progress">
            Scenario {currentScenario + 1} of {scenarios.length}
          </div>
        )}
      </div>

      <div className="exercise-content">
        {loading ? (
          <div className="loading-screen">
            <p>Loading exercise data...</p>
          </div>
        ) : error ? (
          <div className="error-screen">
            <p>Error loading exercise: {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : !isStarted ? (
          <div className="start-screen">
            <p>
              {exerciseConfig?.ui?.startScreen?.instructions ||
               "You'll be presented with user stories that need acceptance criteria. Practice writing clear, testable criteria using different formats."}
            </p>
            <button className="start-button" onClick={handleStart}>
              {exerciseConfig?.ui?.startScreen?.buttonText || "Start Exercise"}
            </button>
          </div>
        ) : (
          <>
            {currentStep === 'writing' && renderWritingStep()}
            {currentStep === 'review' && renderReviewStep()}
          </>
        )}
      </div>
    </div>
  )
}

export default Exercise2
