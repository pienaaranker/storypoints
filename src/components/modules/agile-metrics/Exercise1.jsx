import { useState, useEffect } from 'react'
import { loadExerciseData, getModuleExerciseConfig } from '../../../utils/moduleLoader'
import './Exercise.css'

/**
 * Velocity Analysis Workshop Exercise
 * Interactive exercise for analyzing team velocity patterns and making data-driven planning decisions
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onComplete - Exercise completion callback
 * @param {Function} props.onStart - Exercise start callback
 * @param {boolean} props.isStarted - Whether the exercise has been started
 */
function Exercise1({ onComplete, onStart, isStarted }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exerciseConfig, setExerciseConfig] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [currentScenario, setCurrentScenario] = useState(0)
  const [currentStep, setCurrentStep] = useState('analysis') // 'analysis', 'questions', 'results'
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  // Load exercise data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load exercise configuration from module config
        const exerciseConfigData = await getModuleExerciseConfig('agile-metrics', 1)

        // Load exercise data using the module loader
        const exerciseData = await loadExerciseData('agile-metrics', 1)

        // Extract data from the loaded JSON
        const scenarios = exerciseData.scenarios || []

        setExerciseConfig(exerciseConfigData)
        setScenarios(scenarios)
      } catch (err) {
        console.error('Failed to load velocity analysis exercise data:', err)
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
      setCurrentStep('questions')
    } else if (currentStep === 'questions') {
      setCurrentStep('results')
      setShowResults(true)
    }
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
    } else {
      handleExerciseComplete()
    }
  }

  const handleExerciseComplete = () => {
    onComplete()
  }

  const calculateVelocityStats = (sprintData) => {
    const completed = sprintData.map(s => s.completed)
    const average = completed.reduce((sum, val) => sum + val, 0) / completed.length
    const min = Math.min(...completed)
    const max = Math.max(...completed)
    const recent6 = completed.slice(-6)
    const recentAverage = recent6.reduce((sum, val) => sum + val, 0) / recent6.length
    
    return {
      average: Math.round(average * 10) / 10,
      recentAverage: Math.round(recentAverage * 10) / 10,
      min,
      max,
      range: `${min}-${max}`,
      recentRange: `${Math.min(...recent6)}-${Math.max(...recent6)}`
    }
  }

  const renderVelocityChart = (scenario) => {
    const stats = calculateVelocityStats(scenario.sprintData)
    
    return (
      <div className="velocity-chart">
        <h4>📊 Velocity Trend Analysis</h4>
        <div className="chart-container">
          <div className="chart-header">
            <div className="team-info">
              <strong>{scenario.title}</strong>
              <p>{scenario.description}</p>
              <div className="team-details">
                <span>Team Size: {scenario.teamSize}</span>
                <span>Sprint Length: {scenario.sprintLength} weeks</span>
              </div>
            </div>
          </div>
          
          <div className="velocity-data">
            <table className="sprint-table">
              <thead>
                <tr>
                  <th>Sprint</th>
                  <th>Committed</th>
                  <th>Completed</th>
                  <th>Team Days</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {scenario.sprintData.map((sprint, index) => (
                  <tr key={index} className={sprint.completed > sprint.committed ? 'over-committed' : sprint.completed < sprint.committed ? 'under-delivered' : 'on-target'}>
                    <td>{sprint.sprint}</td>
                    <td>{sprint.committed}</td>
                    <td><strong>{sprint.completed}</strong></td>
                    <td>{sprint.teamDays}</td>
                    <td className="notes">{sprint.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="velocity-stats">
            <div className="stat-card">
              <h5>Overall Average</h5>
              <div className="stat-value">{stats.average} points</div>
            </div>
            <div className="stat-card">
              <h5>Recent 6 Sprints</h5>
              <div className="stat-value">{stats.recentAverage} points</div>
            </div>
            <div className="stat-card">
              <h5>Range</h5>
              <div className="stat-value">{stats.range} points</div>
            </div>
            <div className="stat-card">
              <h5>Recent Range</h5>
              <div className="stat-value">{stats.recentRange} points</div>
            </div>
          </div>
        </div>

        <div className="context-info">
          <h5>📝 Context & Insights</h5>
          <p><strong>Context:</strong> {scenario.context}</p>
          {scenario.insights && (
            <div className="insights">
              <strong>Key Insights:</strong>
              <ul>
                {scenario.insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderQuestions = (scenario) => {
    return (
      <div className="velocity-questions">
        <h4>🤔 Analysis Questions</h4>
        <p>Based on the velocity data you just analyzed, answer these questions:</p>
        
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
          <h3>📈 Velocity Analysis</h3>
          <p>Examine the velocity data below and identify patterns, trends, and planning insights.</p>
        </div>

        {renderVelocityChart(scenario)}

        <div className="analysis-guide">
          <h5>🎯 What to Look For:</h5>
          <ul>
            <li><strong>Trends:</strong> Is velocity increasing, decreasing, or stable over time?</li>
            <li><strong>Variation:</strong> How much does velocity vary between sprints?</li>
            <li><strong>Context:</strong> What external factors might explain velocity changes?</li>
            <li><strong>Planning:</strong> What velocity range would be appropriate for future planning?</li>
          </ul>
        </div>

        <div className="step-actions">
          <button className="action-button primary" onClick={handleNextStep}>
            Continue to Questions →
          </button>
        </div>
      </div>
    )
  }

  const renderQuestionsStep = () => {
    const scenario = scenarios[currentScenario]
    const allAnswered = scenario.questions.every((_, index) => 
      answers[`${currentScenario}-${index}`] !== undefined
    )
    
    return (
      <div className="questions-step">
        <div className="step-header">
          <h3>❓ Test Your Analysis</h3>
          <p>Answer these questions based on your velocity analysis:</p>
        </div>

        {renderQuestions(scenario)}

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
    const correctAnswers = scenario.questions.filter((question, index) => 
      answers[`${currentScenario}-${index}`] === question.correct
    ).length
    const totalQuestions = scenario.questions.length
    const score = Math.round((correctAnswers / totalQuestions) * 100)
    
    return (
      <div className="results-step">
        <div className="step-header">
          <h3>📊 Results</h3>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}%</span>
              <span className="score-label">Score</span>
            </div>
            <div className="score-details">
              <p>{correctAnswers} out of {totalQuestions} questions correct</p>
            </div>
          </div>
        </div>

        <div className="scenario-summary">
          <h4>🎯 Key Takeaways</h4>
          {scenario.insights && (
            <ul>
              {scenario.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          )}
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
    <div className="exercise exercise1">
      <div className="exercise-header">
        <h2 className="exercise-title">Velocity Analysis Workshop</h2>
        <p className="exercise-description">
          Analyze team velocity patterns and make data-driven planning decisions
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
            <p>Loading velocity analysis exercise...</p>
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
               "You'll analyze real team velocity data to make planning decisions and learn to distinguish between measurement and meaningful interpretation."}
            </p>
            <button className="start-button" onClick={handleStart}>
              {exerciseConfig?.ui?.startScreen?.buttonText || "Start Velocity Analysis"}
            </button>
          </div>
        ) : (
          <>
            {currentStep === 'analysis' && renderAnalysisStep()}
            {currentStep === 'questions' && renderQuestionsStep()}
            {currentStep === 'results' && renderResultsStep()}
          </>
        )}
      </div>
    </div>
  )
}

export default Exercise1
