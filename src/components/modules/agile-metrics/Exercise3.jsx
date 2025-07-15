import { useState, useEffect } from 'react'
import { loadExerciseData, getModuleExerciseConfig } from '../../../utils/moduleLoader'
import './Exercise.css'

/**
 * Cycle Time Optimization Exercise
 * Interactive exercise for analyzing development flow and identifying bottlenecks
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onComplete - Exercise completion callback
 * @param {Function} props.onStart - Exercise start callback
 * @param {boolean} props.isStarted - Whether the exercise has been started
 */
function Exercise3({ onComplete, onStart, isStarted }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exerciseConfig, setExerciseConfig] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [flowPrinciples, setFlowPrinciples] = useState({})
  const [currentScenario, setCurrentScenario] = useState(0)
  const [currentStep, setCurrentStep] = useState('analysis') // 'analysis', 'optimization', 'results'
  const [selectedBottleneck, setSelectedBottleneck] = useState('')
  const [selectedStrategy, setSelectedStrategy] = useState('')
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  // Load exercise data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load exercise configuration from module config
        const exerciseConfigData = await getModuleExerciseConfig('agile-metrics', 3)

        // Load exercise data using the module loader
        const exerciseData = await loadExerciseData('agile-metrics', 3)

        // Extract data from the loaded JSON
        const scenarios = exerciseData.scenarios || []
        const principles = exerciseData.flowPrinciples || {}

        setExerciseConfig(exerciseConfigData)
        setScenarios(scenarios)
        setFlowPrinciples(principles)
      } catch (err) {
        console.error('Failed to load cycle time exercise data:', err)
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
      setCurrentStep('optimization')
    } else if (currentStep === 'optimization') {
      setCurrentStep('results')
      setShowResults(true)
    }
  }

  const handleBottleneckSelection = (stage) => {
    setSelectedBottleneck(stage)
  }

  const handleStrategySelection = (strategy) => {
    setSelectedStrategy(strategy)
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
      setSelectedBottleneck('')
      setSelectedStrategy('')
      setAnswers({})
    } else {
      handleExerciseComplete()
    }
  }

  const handleExerciseComplete = () => {
    onComplete()
  }

  const renderFlowDiagram = (scenario) => {
    const workflow = scenario.workflow
    const maxTime = Math.max(...workflow.stageData.map(s => s.averageTime))
    
    return (
      <div className="flow-diagram">
        <h4>🔄 Development Flow Analysis</h4>
        <div className="scenario-info">
          <h5>{scenario.title}</h5>
          <p>{scenario.description}</p>
          <div className="flow-meta">
            <span>Total Cycle Time: {scenario.totalCycleTime} days</span>
            <span>Context: {scenario.context}</span>
          </div>
        </div>

        <div className="workflow-stages">
          {workflow.stageData.map((stage, index) => (
            <div key={index} className="workflow-stage">
              <div className={`stage-box ${stage.bottleneck ? 'bottleneck' : ''}`}>
                <div className="stage-header">
                  <h6>{stage.stage}</h6>
                  <span className="stage-time">{stage.averageTime} days</span>
                </div>
                <div className="stage-details">
                  <p className="stage-description">{stage.description}</p>
                  <div className="stage-capacity">
                    <strong>Capacity:</strong> {stage.capacity}
                  </div>
                  {stage.bottleneck && (
                    <div className="bottleneck-indicator">
                      ⚠️ Bottleneck
                    </div>
                  )}
                </div>
                <div className="stage-bar">
                  <div 
                    className="stage-fill"
                    style={{ 
                      width: `${(stage.averageTime / maxTime) * 100}%`,
                      backgroundColor: stage.bottleneck ? '#e74c3c' : '#3498db'
                    }}
                  ></div>
                </div>
              </div>
              {index < workflow.stageData.length - 1 && (
                <div className="stage-arrow">→</div>
              )}
            </div>
          ))}
        </div>

        <div className="work-items-table">
          <h5>📋 Recent Work Items</h5>
          <table className="cycle-time-table">
            <thead>
              <tr>
                <th>Item</th>
                {workflow.stageData.map((stage, index) => (
                  <th key={index}>{stage.stage}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {scenario.workItems.map((item, index) => {
                const total = Object.values(item).slice(1).reduce((sum, val) => sum + val, 0)
                return (
                  <tr key={index}>
                    <td><strong>{item.id}</strong></td>
                    <td>{item.backlog}</td>
                    <td>{item.development}</td>
                    <td className={item.review > 4 ? 'slow-stage' : ''}>{item.review}</td>
                    <td>{item.testing}</td>
                    <td>{item.deployment}</td>
                    <td><strong>{total.toFixed(1)}</strong></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderBottleneckAnalysis = () => {
    const scenario = scenarios[currentScenario]
    const bottleneckStage = scenario.workflow.stageData.find(s => s.bottleneck)
    
    return (
      <div className="bottleneck-analysis">
        <h4>🔍 Bottleneck Identification</h4>
        <p>Click on the stage you believe is the primary bottleneck in this workflow:</p>
        
        <div className="bottleneck-selector">
          {scenario.workflow.stageData.map((stage, index) => (
            <div
              key={index}
              className={`bottleneck-option ${selectedBottleneck === stage.stage ? 'selected' : ''}`}
              onClick={() => handleBottleneckSelection(stage.stage)}
            >
              <div className="option-header">
                <h6>{stage.stage}</h6>
                <span className="option-time">{stage.averageTime} days</span>
              </div>
              <div className="option-details">
                <div className="capacity-info">Capacity: {stage.capacity}</div>
                <div className="description">{stage.description}</div>
              </div>
              {selectedBottleneck === stage.stage && (
                <div className="selection-indicator">✓</div>
              )}
            </div>
          ))}
        </div>

        {selectedBottleneck && (
          <div className="bottleneck-feedback">
            <div className={`feedback ${selectedBottleneck === bottleneckStage.stage ? 'correct' : 'incorrect'}`}>
              {selectedBottleneck === bottleneckStage.stage ? (
                <div>
                  <h5>✅ Correct Bottleneck Identified!</h5>
                  <p>You correctly identified <strong>{selectedBottleneck}</strong> as the bottleneck.</p>
                  <p>This stage has the highest average time ({bottleneckStage.averageTime} days) and limited capacity ({bottleneckStage.capacity}).</p>
                </div>
              ) : (
                <div>
                  <h5>❌ Not the Primary Bottleneck</h5>
                  <p>The primary bottleneck is actually: <strong>{bottleneckStage.stage}</strong></p>
                  <p>Look for the stage with the highest time and most constrained capacity.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderOptimizationQuestions = () => {
    const scenario = scenarios[currentScenario]
    
    return (
      <div className="optimization-questions">
        <h4>⚡ Optimization Strategy</h4>
        <p>Based on your bottleneck analysis, answer these optimization questions:</p>
        
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
          <h3>🔄 Flow Analysis</h3>
          <p>Examine the development workflow and identify the bottleneck stage:</p>
        </div>

        {renderFlowDiagram(scenario)}
        {renderBottleneckAnalysis()}

        <div className="flow-principles">
          <h5>📚 Flow Optimization Principles</h5>
          <div className="principles-grid">
            {Object.entries(flowPrinciples).map(([key, principle]) => (
              <div key={key} className="principle-card">
                <h6>{principle.description}</h6>
                <p><strong>Application:</strong> {principle.application}</p>
                <p><strong>Key Insight:</strong> {principle.key_insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="step-actions">
          <button 
            className="action-button primary" 
            onClick={handleNextStep}
            disabled={!selectedBottleneck}
          >
            Continue to Optimization →
          </button>
        </div>
      </div>
    )
  }

  const renderOptimizationStep = () => {
    const scenario = scenarios[currentScenario]
    const allAnswered = scenario.questions.every((_, index) => 
      answers[`${currentScenario}-${index}`] !== undefined
    )
    
    return (
      <div className="optimization-step">
        <div className="step-header">
          <h3>⚡ Optimization Planning</h3>
          <p>Design improvements to optimize the development flow:</p>
        </div>

        {renderOptimizationQuestions()}

        <div className="improvement-strategies">
          <h5>🎯 Improvement Strategies</h5>
          <div className="strategies-grid">
            {scenario.improvements.map((improvement, index) => (
              <div key={index} className="strategy-card">
                <h6>{improvement.strategy}</h6>
                <div className="strategy-actions">
                  <strong>Actions:</strong>
                  <ul>
                    {improvement.actions.map((action, actionIndex) => (
                      <li key={actionIndex}>{action}</li>
                    ))}
                  </ul>
                </div>
                <div className="expected-impact">
                  <strong>Expected Impact:</strong> {improvement.expectedImpact}
                </div>
              </div>
            ))}
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
    const bottleneckStage = scenario.workflow.stageData.find(s => s.bottleneck)
    const bottleneckCorrect = selectedBottleneck === bottleneckStage.stage
    const correctAnswers = scenario.questions.filter((question, index) => 
      answers[`${currentScenario}-${index}`] === question.correct
    ).length
    const totalQuestions = scenario.questions.length
    const overallScore = Math.round(((bottleneckCorrect ? 1 : 0) + correctAnswers) / (totalQuestions + 1) * 100)
    
    return (
      <div className="results-step">
        <div className="step-header">
          <h3>📊 Flow Optimization Results</h3>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{overallScore}%</span>
              <span className="score-label">Score</span>
            </div>
            <div className="score-breakdown">
              <div className="score-item">
                <span className="score-label">Bottleneck Identification:</span>
                <span className={`score-value ${bottleneckCorrect ? 'correct' : 'incorrect'}`}>
                  {bottleneckCorrect ? '✅ Correct' : '❌ Incorrect'}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Optimization Questions:</span>
                <span className="score-value">{correctAnswers}/{totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="scenario-summary">
          <h4>🎯 Flow Optimization Summary</h4>
          <div className="bottleneck-summary">
            <h5>Bottleneck: {bottleneckStage.stage}</h5>
            <p><strong>Average Time:</strong> {bottleneckStage.averageTime} days</p>
            <p><strong>Capacity:</strong> {bottleneckStage.capacity}</p>
            <p><strong>Impact:</strong> This stage constrains the entire workflow throughput</p>
          </div>
          
          <div className="optimization-recommendations">
            <h5>Recommended Optimizations:</h5>
            <ul>
              {scenario.improvements.map((improvement, index) => (
                <li key={index}>
                  <strong>{improvement.strategy}:</strong> {improvement.expectedImpact}
                </li>
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
    <div className="exercise exercise3">
      <div className="exercise-header">
        <h2 className="exercise-title">Cycle Time Optimization</h2>
        <p className="exercise-description">
          Analyze development flow and identify bottlenecks using cycle time data
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
            <p>Loading cycle time optimization exercise...</p>
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
               "You'll analyze development flow to optimize team throughput and identify process improvements."}
            </p>
            <button className="start-button" onClick={handleStart}>
              {exerciseConfig?.ui?.startScreen?.buttonText || "Start Flow Analysis"}
            </button>
          </div>
        ) : (
          <>
            {currentStep === 'analysis' && renderAnalysisStep()}
            {currentStep === 'optimization' && renderOptimizationStep()}
            {currentStep === 'results' && renderResultsStep()}
          </>
        )}
      </div>
    </div>
  )
}

export default Exercise3
