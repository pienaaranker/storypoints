import { useState, useEffect } from 'react'
import { loadExerciseData, getModuleExerciseConfig } from '../../../utils/moduleLoader'
import './Exercise.css'

/**
 * Burndown Chart Mastery Exercise
 * Interactive exercise for analyzing burndown chart patterns and developing diagnostic skills
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
  const [burndownPatterns, setBurndownPatterns] = useState({})
  const [currentScenario, setCurrentScenario] = useState(0)
  const [currentStep, setCurrentStep] = useState('analysis') // 'analysis', 'diagnosis', 'results'
  const [selectedPattern, setSelectedPattern] = useState('')
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  // Load exercise data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load exercise configuration from module config
        const exerciseConfigData = await getModuleExerciseConfig('agile-metrics', 2)

        // Load exercise data using the module loader
        const exerciseData = await loadExerciseData('agile-metrics', 2)

        // Extract data from the loaded JSON
        const scenarios = exerciseData.scenarios || []
        const patterns = exerciseData.burndownPatterns || {}

        setExerciseConfig(exerciseConfigData)
        setScenarios(scenarios)
        setBurndownPatterns(patterns)
      } catch (err) {
        console.error('Failed to load burndown analysis exercise data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleStart = () => {
    onStart()
  }

  const handleNextStep = () => {
    if (currentStep === 'analysis') {
      setCurrentStep('diagnosis')
    } else if (currentStep === 'diagnosis') {
      setCurrentStep('results')
      setShowResults(true)
    }
  }

  const handlePatternSelection = (pattern) => {
    setSelectedPattern(pattern)
  }

  const handleAnswer = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [`${currentScenario}-${questionIndex}`]: selectedOption
    }))
  }

  const handleNextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1)
      setCurrentStep('analysis')
      setShowResults(false)
      setSelectedPattern('')
      setAnswers({})
    } else {
      handleExerciseComplete()
    }
  }

  const handleExerciseComplete = () => {
    onComplete()
  }

  const renderBurndownChart = (scenario) => {
    const maxPoints = Math.max(...scenario.dailyData.map(d => d.remaining))
    const chartHeight = 300
    const chartWidth = 600
    const padding = 40

    // Calculate chart dimensions
    const plotWidth = chartWidth - (padding * 2)
    const plotHeight = chartHeight - (padding * 2)

    // Create SVG points for the burndown line
    const burndownPoints = scenario.dailyData.map((data, index) => {
      const x = padding + (index / (scenario.dailyData.length - 1)) * plotWidth
      const y = padding + ((maxPoints - data.remaining) / maxPoints) * plotHeight
      return `${x},${y}`
    }).join(' ')

    // Create SVG points for the ideal line
    const idealPoints = scenario.dailyData.map((data, index) => {
      const x = padding + (index / (scenario.dailyData.length - 1)) * plotWidth
      const y = padding + ((maxPoints - data.ideal) / maxPoints) * plotHeight
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="burndown-chart">
        <h4>📉 Burndown Chart Analysis</h4>
        <div className="chart-info">
          <h5>{scenario.title}</h5>
          <p>{scenario.description}</p>
          <div className="chart-meta">
            <span>Sprint Length: {scenario.sprintLength} days</span>
            <span>Total Points: {scenario.totalPoints}</span>
          </div>
        </div>

        <div className="chart-container">
          <svg width={chartWidth} height={chartHeight} className="burndown-svg">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map(i => {
              const y = padding + (i / 5) * plotHeight
              return (
                <line
                  key={`grid-${i}`}
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
              )
            })}

            {/* Ideal burndown line */}
            <polyline
              points={idealPoints}
              fill="none"
              stroke="#bdc3c7"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Actual burndown line */}
            <polyline
              points={burndownPoints}
              fill="none"
              stroke="#e74c3c"
              strokeWidth="3"
            />

            {/* Data points */}
            {scenario.dailyData.map((data, index) => {
              const x = padding + (index / (scenario.dailyData.length - 1)) * plotWidth
              const y = padding + ((maxPoints - data.remaining) / maxPoints) * plotHeight
              return (
                <circle
                  key={`point-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#e74c3c"
                />
              )
            })}

            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4, 5].map(i => {
              const value = Math.round((maxPoints * (5 - i)) / 5)
              const y = padding + (i / 5) * plotHeight
              return (
                <text
                  key={`y-label-${i}`}
                  x={padding - 10}
                  y={y + 5}
                  textAnchor="end"
                  fontSize="12"
                  fill="#666"
                >
                  {value}
                </text>
              )
            })}

            {/* X-axis labels */}
            {scenario.dailyData.map((data, index) => {
              if (index % 2 === 0) { // Show every other day
                const x = padding + (index / (scenario.dailyData.length - 1)) * plotWidth
                return (
                  <text
                    key={`x-label-${index}`}
                    x={x}
                    y={chartHeight - padding + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#666"
                  >
                    Day {data.day}
                  </text>
                )
              }
              return null
            })}
          </svg>

          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-line ideal"></div>
              <span>Ideal Burndown</span>
            </div>
            <div className="legend-item">
              <div className="legend-line actual"></div>
              <span>Actual Burndown</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPatternSelector = () => {
    const scenario = scenarios[currentScenario]
    
    return (
      <div className="pattern-selector">
        <h4>🔍 Pattern Recognition</h4>
        <p>What pattern does this burndown chart show? Select the pattern that best describes the team's behavior:</p>
        
        <div className="pattern-options">
          {Object.entries(burndownPatterns).map(([key, pattern]) => (
            <div
              key={key}
              className={`pattern-option ${selectedPattern === key ? 'selected' : ''}`}
              onClick={() => handlePatternSelection(key)}
            >
              <div className="pattern-header">
                <h5>{pattern.description}</h5>
                {selectedPattern === key && <span className="selected-indicator">✓</span>}
              </div>
              <div className="pattern-characteristics">
                <strong>Characteristics:</strong>
                <ul>
                  {pattern.characteristics.map((char, index) => (
                    <li key={index}>{char}</li>
                  ))}
                </ul>
              </div>
              <div className="pattern-behavior">
                <strong>Team Behavior:</strong> {pattern.team_behavior}
              </div>
            </div>
          ))}
        </div>

        {selectedPattern && (
          <div className="pattern-feedback">
            <div className={`feedback ${selectedPattern === scenario.pattern ? 'correct' : 'incorrect'}`}>
              {selectedPattern === scenario.pattern ? (
                <div>
                  <h5>✅ Correct Pattern Identified!</h5>
                  <p>You correctly identified this as a <strong>{burndownPatterns[selectedPattern].description}</strong> pattern.</p>
                </div>
              ) : (
                <div>
                  <h5>❌ Not Quite Right</h5>
                  <p>This pattern is actually: <strong>{burndownPatterns[scenario.pattern].description}</strong></p>
                  <p>Look more closely at the shape and timing of the burndown line.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderDiagnosisQuestions = () => {
    const scenario = scenarios[currentScenario]
    
    return (
      <div className="diagnosis-questions">
        <h4>🩺 Diagnostic Questions</h4>
        <p>Now that you've identified the pattern, let's diagnose the root causes and interventions:</p>
        
        {scenario.questions.map((question, index) => (
          <div key={index} className="question-card">
            <h5>Question {index + 1}: {question.question}</h5>
            <div className="question-options">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="option-label">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={optionIndex}
                    checked={answers[`${currentScenario}-${index}`] === optionIndex}
                    onChange={() => handleAnswer(index, optionIndex)}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
            
            {showResults && (
              <div className={`answer-feedback ${answers[`${currentScenario}-${index}`] === question.correct ? 'correct' : 'incorrect'}`}>
                <div className="feedback-header">
                  {answers[`${currentScenario}-${index}`] === question.correct ? '✅ Correct!' : '❌ Incorrect'}
                </div>
                <div className="feedback-explanation">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderAnalysisStep = () => {
    const scenario = scenarios[currentScenario]
    
    return (
      <div className="analysis-step">
        <div className="step-header">
          <h3>📉 Burndown Analysis</h3>
          <p>Examine this burndown chart and identify the pattern it represents.</p>
        </div>

        {renderBurndownChart(scenario)}
        {renderPatternSelector()}

        <div className="step-actions">
          <button 
            className="action-button primary" 
            onClick={handleNextStep}
            disabled={!selectedPattern}
          >
            Continue to Diagnosis →
          </button>
        </div>
      </div>
    )
  }

  const renderDiagnosisStep = () => {
    const scenario = scenarios[currentScenario]
    const allAnswered = scenario.questions.every((_, index) => 
      answers[`${currentScenario}-${index}`] !== undefined
    )
    
    return (
      <div className="diagnosis-step">
        <div className="step-header">
          <h3>🩺 Root Cause Analysis</h3>
          <p>Based on the burndown pattern, diagnose the underlying issues and recommend interventions:</p>
        </div>

        {renderDiagnosisQuestions()}

        <div className="diagnosis-guide">
          <h5>🎯 Diagnostic Framework:</h5>
          <div className="diagnosis-categories">
            <div className="diagnosis-category">
              <h6>Symptoms</h6>
              <ul>
                {scenario.diagnosis.symptoms.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            </div>
            <div className="diagnosis-category">
              <h6>Root Causes</h6>
              <ul>
                {scenario.diagnosis.root_causes.map((cause, index) => (
                  <li key={index}>{cause}</li>
                ))}
              </ul>
            </div>
            <div className="diagnosis-category">
              <h6>Interventions</h6>
              <ul>
                {scenario.diagnosis.interventions.map((intervention, index) => (
                  <li key={index}>{intervention}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="step-actions">
          <button 
            className="action-button primary" 
            onClick={handleNextStep}
            disabled={!allAnswered}
          >
            {showResults ? 'Continue' : 'Show Results'}
          </button>
        </div>
      </div>
    )
  }

  const renderResultsStep = () => {
    const scenario = scenarios[currentScenario]
    const patternCorrect = selectedPattern === scenario.pattern
    const correctAnswers = scenario.questions.filter((question, index) => 
      answers[`${currentScenario}-${index}`] === question.correct
    ).length
    const totalQuestions = scenario.questions.length
    const overallScore = Math.round(((patternCorrect ? 1 : 0) + correctAnswers) / (totalQuestions + 1) * 100)
    
    return (
      <div className="results-step">
        <div className="step-header">
          <h3>📊 Diagnostic Results</h3>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{overallScore}%</span>
              <span className="score-label">Score</span>
            </div>
            <div className="score-breakdown">
              <div className="score-item">
                <span className="score-label">Pattern Recognition:</span>
                <span className={`score-value ${patternCorrect ? 'correct' : 'incorrect'}`}>
                  {patternCorrect ? '✅ Correct' : '❌ Incorrect'}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Diagnostic Questions:</span>
                <span className="score-value">{correctAnswers}/{totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="scenario-summary">
          <h4>🎯 Key Insights</h4>
          <div className="pattern-summary">
            <h5>Pattern: {burndownPatterns[scenario.pattern].description}</h5>
            <p><strong>Team Behavior:</strong> {burndownPatterns[scenario.pattern].team_behavior}</p>
          </div>
          
          <div className="prevention-tips">
            <h5>Prevention Strategies:</h5>
            <ul>
              {scenario.diagnosis.prevention.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="step-actions">
          <button className="action-button primary" onClick={handleNextScenario}>
            {currentScenario < scenarios.length - 1 ? 'Next Scenario →' : 'Complete Exercise'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="exercise exercise2">
      <div className="exercise-header">
        <h2 className="exercise-title">Burndown Chart Mastery</h2>
        <p className="exercise-description">
          Analyze burndown charts to identify team performance patterns and issues
        </p>
        
        {scenarios.length > 0 && (
          <div className="scenario-progress">
            Scenario {currentScenario + 1} of {scenarios.length}: {scenarios[currentScenario]?.title}
          </div>
        )}
      </div>

      <div className="exercise-content">
        {loading ? (
          <div className="loading-screen">
            <p>Loading burndown analysis exercise...</p>
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
               "You'll analyze burndown charts to diagnose team behavior and identify improvement opportunities."}
            </p>
            <button className="start-button" onClick={handleStart}>
              {exerciseConfig?.ui?.startScreen?.buttonText || "Start Burndown Analysis"}
            </button>
          </div>
        ) : (
          <>
            {currentStep === 'analysis' && renderAnalysisStep()}
            {currentStep === 'diagnosis' && renderDiagnosisStep()}
            {currentStep === 'results' && renderResultsStep()}
          </>
        )}
      </div>
    </div>
  )
}

export default Exercise2
