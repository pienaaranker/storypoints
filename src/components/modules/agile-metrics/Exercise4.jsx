import { useState, useEffect } from 'react'
import { loadExerciseData, getModuleExerciseConfig } from '../../../utils/moduleLoader'
import './Exercise.css'

/**
 * Team Health Dashboard Exercise
 * Interactive exercise for building comprehensive team health metrics and balanced scorecards
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onComplete - Exercise completion callback
 * @param {Function} props.onStart - Exercise start callback
 * @param {boolean} props.isStarted - Whether the exercise has been started
 */
function Exercise4({ onComplete, onStart, isStarted }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exerciseConfig, setExerciseConfig] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [healthDimensions, setHealthDimensions] = useState({})
  const [currentScenario, setCurrentScenario] = useState(0)
  const [currentStep, setCurrentStep] = useState('assessment') // 'assessment', 'recommendations', 'results'
  const [answers, setAnswers] = useState({})
  const [selectedRecommendations, setSelectedRecommendations] = useState([])
  const [showResults, setShowResults] = useState(false)

  // Load exercise data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load exercise configuration from module config
        const exerciseConfigData = await getModuleExerciseConfig('agile-metrics', 4)

        // Load exercise data using the module loader
        const exerciseData = await loadExerciseData('agile-metrics', 4)

        // Extract data from the loaded JSON
        const scenarios = exerciseData.scenarios || []
        const dimensions = exerciseData.healthDimensions || {}

        setExerciseConfig(exerciseConfigData)
        setScenarios(scenarios)
        setHealthDimensions(dimensions)
      } catch (err) {
        console.error('Failed to load team health exercise data:', err)
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
    if (currentStep === 'assessment') {
      setCurrentStep('recommendations')
    } else if (currentStep === 'recommendations') {
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

  const handleRecommendationToggle = (category, index) => {
    const key = `${category}-${index}`
    setSelectedRecommendations(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key]
    )
  }

  const handleNextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1)
      setCurrentStep('assessment')
      setShowResults(false)
      setAnswers({})
      setSelectedRecommendations([])
    } else {
      handleExerciseComplete()
    }
  }

  const handleExerciseComplete = () => {
    onComplete()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#27ae60'
      case 'warning': return '#f39c12'
      case 'critical': return '#e74c3c'
      default: return '#7f8c8d'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return '✅'
      case 'warning': return '⚠️'
      case 'critical': return '🚨'
      default: return '❓'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      case 'stable': return '➡️'
      default: return '❓'
    }
  }

  const renderHealthDashboard = (scenario) => {
    const metrics = scenario.metrics
    
    return (
      <div className="health-dashboard">
        <h4>📊 Team Health Dashboard</h4>
        <div className="team-profile">
          <h5>{scenario.title}</h5>
          <p>{scenario.description}</p>
          <div className="profile-details">
            <span>Team Size: {scenario.teamProfile.size}</span>
            <span>Average Tenure: {scenario.teamProfile.tenure}</span>
            <span>Domain: {scenario.teamProfile.domain}</span>
            <span>Workload: {scenario.teamProfile.workload}</span>
          </div>
        </div>

        <div className="metrics-grid">
          {Object.entries(metrics).map(([dimension, dimensionMetrics]) => (
            <div key={dimension} className="dimension-card">
              <h6 className="dimension-title">
                {dimension.charAt(0).toUpperCase() + dimension.slice(1)}
              </h6>
              <div className="metrics-list">
                {Object.entries(dimensionMetrics).map(([metricKey, metric]) => (
                  <div key={metricKey} className="metric-item">
                    <div className="metric-header">
                      <span className="metric-name">
                        {metricKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <div className="metric-indicators">
                        <span className="trend-icon">{getTrendIcon(metric.trend)}</span>
                        <span 
                          className="status-icon"
                          style={{ color: getStatusColor(metric.status) }}
                        >
                          {getStatusIcon(metric.status)}
                        </span>
                      </div>
                    </div>
                    <div className="metric-values">
                      <div className="current-value">
                        <span className="value">{metric.current}</span>
                        <span className="unit">
                          {typeof metric.current === 'number' && metric.current <= 10 ? '/10' : 
                           metricKey.includes('rate') || metricKey.includes('coverage') || metricKey.includes('debt') ? '%' : 
                           metricKey.includes('time') ? ' days' : ''}
                        </span>
                      </div>
                      <div className="target-comparison">
                        Target: {metric.target}
                        {typeof metric.target === 'number' && metric.target <= 10 ? '/10' : 
                         metricKey.includes('rate') || metricKey.includes('coverage') || metricKey.includes('debt') ? '%' : 
                         metricKey.includes('time') ? ' days' : ''}
                      </div>
                    </div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ 
                          width: `${Math.min((metric.current / (metric.target * 1.2)) * 100, 100)}%`,
                          backgroundColor: getStatusColor(metric.status)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderAssessmentQuestions = () => {
    const scenario = scenarios[currentScenario]
    
    return (
      <div className="assessment-questions">
        <h4>🤔 Health Assessment</h4>
        <p>Based on the team health dashboard, answer these assessment questions:</p>
        
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

  const renderRecommendationSelector = () => {
    const scenario = scenarios[currentScenario]
    
    return (
      <div className="recommendation-selector">
        <h4>💡 Improvement Recommendations</h4>
        <p>Select the most appropriate recommendations for this team's situation:</p>
        
        {scenario.recommendations.map((recGroup, groupIndex) => (
          <div key={groupIndex} className="recommendation-group">
            <h5>{recGroup.category} Actions</h5>
            <p className="rationale"><strong>Rationale:</strong> {recGroup.rationale}</p>
            <div className="recommendation-actions">
              {recGroup.actions.map((action, actionIndex) => {
                const key = `${recGroup.category}-${actionIndex}`
                return (
                  <label key={actionIndex} className="recommendation-item">
                    <input
                      type="checkbox"
                      checked={selectedRecommendations.includes(key)}
                      onChange={() => handleRecommendationToggle(recGroup.category, actionIndex)}
                    />
                    <span className="recommendation-text">{action}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderAssessmentStep = () => {
    const scenario = scenarios[currentScenario]
    
    return (
      <div className="assessment-step">
        <div className="step-header">
          <h3>📊 Team Health Assessment</h3>
          <p>Analyze this team's health metrics and identify key patterns:</p>
        </div>

        {renderHealthDashboard(scenario)}
        {renderAssessmentQuestions()}

        <div className="health-guide">
          <h5>🎯 Health Assessment Framework</h5>
          <div className="dimensions-guide">
            {Object.entries(healthDimensions).map(([key, dimension]) => (
              <div key={key} className="dimension-guide">
                <h6>{dimension.description}</h6>
                <div className="guide-content">
                  <div className="key-metrics">
                    <strong>Key Metrics:</strong> {dimension.key_metrics.join(', ')}
                  </div>
                  <div className="warning-signs">
                    <strong>Warning Signs:</strong> {dimension.warning_signs.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="step-actions">
          <button 
            className="action-button primary" 
            onClick={handleNextStep}
            disabled={scenario.questions.some((_, index) => answers[`${currentScenario}-${index}`] === undefined)}
          >
            Continue to Recommendations →
          </button>
        </div>
      </div>
    )
  }

  const renderRecommendationsStep = () => {
    return (
      <div className="recommendations-step">
        <div className="step-header">
          <h3>💡 Improvement Planning</h3>
          <p>Select appropriate improvement actions based on your assessment:</p>
        </div>

        {renderRecommendationSelector()}

        <div className="step-actions">
          <button 
            className="action-button primary" 
            onClick={handleNextStep}
            disabled={selectedRecommendations.length === 0}
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
    const assessmentScore = Math.round((correctAnswers / totalQuestions) * 100)
    
    return (
      <div className="results-step">
        <div className="step-header">
          <h3>📊 Team Health Analysis Results</h3>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{assessmentScore}%</span>
              <span className="score-label">Assessment Score</span>
            </div>
            <div className="score-breakdown">
              <div className="score-item">
                <span className="score-label">Health Assessment:</span>
                <span className="score-value">{correctAnswers}/{totalQuestions}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Recommendations Selected:</span>
                <span className="score-value">{selectedRecommendations.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="scenario-summary">
          <h4>🎯 Team Health Summary</h4>
          <div className="health-overview">
            <h5>Key Findings:</h5>
            <ul>
              <li><strong>Primary Concern:</strong> {scenario.title.includes('High Performance') ? 'Burnout risk despite good performance' : 'Building consistent performance from good collaboration'}</li>
              <li><strong>Strengths:</strong> {scenario.title.includes('High Performance') ? 'Strong delivery capabilities' : 'Excellent team collaboration and learning culture'}</li>
              <li><strong>Focus Area:</strong> {scenario.title.includes('High Performance') ? 'Sustainable pace and team well-being' : 'Performance consistency and predictability'}</li>
            </ul>
          </div>
          
          <div className="selected-actions">
            <h5>Your Selected Actions:</h5>
            <ul>
              {selectedRecommendations.map((key, index) => {
                const [category, actionIndex] = key.split('-')
                const recGroup = scenario.recommendations.find(r => r.category === category)
                const action = recGroup?.actions[parseInt(actionIndex)]
                return action ? <li key={index}><strong>{category}:</strong> {action}</li> : null
              })}
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
    <div className="exercise exercise4">
      <div className="exercise-header">
        <h2 className="exercise-title">Team Health Dashboard</h2>
        <p className="exercise-description">
          Build comprehensive team health metrics combining performance and satisfaction indicators
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
            <p>Loading team health dashboard exercise...</p>
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
               "You'll create balanced team health assessments that go beyond simple productivity metrics."}
            </p>
            <button className="start-button" onClick={handleStart}>
              {exerciseConfig?.ui?.startScreen?.buttonText || "Start Health Assessment"}
            </button>
          </div>
        ) : (
          <>
            {currentStep === 'assessment' && renderAssessmentStep()}
            {currentStep === 'recommendations' && renderRecommendationsStep()}
            {currentStep === 'results' && renderResultsStep()}
          </>
        )}
      </div>
    </div>
  )
}

export default Exercise4
