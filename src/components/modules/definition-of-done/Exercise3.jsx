import React, { useState, useEffect } from 'react'
import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { loadExerciseData } from '../../../utils/moduleLoader'
import './Exercise.css'

/**
 * Quality Gates Assessment Exercise
 * Interactive exercise for designing quality checkpoints throughout development workflow
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
  const [workflow, setWorkflow] = useState(null)
  const [availableGates, setAvailableGates] = useState([])
  const [selectedGates, setSelectedGates] = useState({})
  const [currentStep, setCurrentStep] = useState('selection') // selection, review, feedback
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [tips, setTips] = useState([])

  // Load exercise data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load exercise data using the module loader
        const exerciseData = await loadExerciseData('definition-of-done', 3)
        
        // Extract data from the loaded JSON
        const workflow = exerciseData.workflows[0] // Use first workflow for now
        const availableGates = exerciseData.availableGates
        const tips = exerciseData.tips
        
        // Mock exercise config - this would come from module-config.json
        const mockConfig = {
          ui: {
            startScreen: {
              instructions: "You'll design quality gate processes for different development workflows. Place quality checkpoints at appropriate stages and define criteria for each gate to prevent defects from progressing.",
              buttonText: "Start Quality Gates"
            }
          },
          config: {
            allowRetry: true,
            showProcessFlow: true,
            gateTypes: ["code-review", "testing", "deployment", "documentation"],
            maxGatesPerWorkflow: 6
          }
        }

        setExerciseConfig(mockConfig)
        setWorkflow(workflow)
        setAvailableGates(availableGates)
        setTips(tips)
        
        // Initialize selected gates
        const initialSelected = {}
        workflow.stages.forEach(stage => {
          initialSelected[stage.id] = []
        })
        setSelectedGates(initialSelected)
        
        setLoading(false)
      } catch (err) {
        console.error('Failed to load exercise data:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleStart = () => {
    onStart()
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const gateId = active.id
      const targetStage = over.id
      
      // Find the gate in available gates
      const gate = availableGates.find(g => g.id === gateId)
      
      if (gate) {
        // Remove from available gates
        setAvailableGates(availableGates.filter(g => g.id !== gateId))
        
        // Add to selected gates
        setSelectedGates(prev => ({
          ...prev,
          [targetStage]: [...prev[targetStage], gate]
        }))
      }
    }
  }

  const handleRemoveGate = (stageId, gateId) => {
    // Find the gate in selected gates
    const gate = selectedGates[stageId].find(g => g.id === gateId)
    
    if (gate) {
      // Remove from selected gates
      setSelectedGates(prev => ({
        ...prev,
        [stageId]: prev[stageId].filter(g => g.id !== gateId)
      }))
      
      // Add back to available gates
      setAvailableGates([...availableGates, gate])
    }
  }

  const handleReviewGates = () => {
    setCurrentStep('review')
    
    // Calculate score based on gate placement
    // This is a simplified scoring system
    const totalSelected = Object.values(selectedGates).flat().length
    const totalStages = workflow.stages.length
    
    // Check if each stage has at least one gate
    const stagesWithGates = Object.entries(selectedGates)
      .filter(([_, gates]) => gates.length > 0)
      .length
    
    // Base score on coverage and balance
    const coverageScore = (stagesWithGates / totalStages) * 100
    const balanceScore = Math.min(100, (totalSelected / 8) * 100) // Expect around 8 gates total
    
    const finalScore = Math.round((coverageScore * 0.6) + (balanceScore * 0.4))
    setScore(finalScore)
    
    // Determine feedback based on score
    let feedbackMessage
    if (finalScore >= 90) {
      feedbackMessage = "Excellent! You've designed a comprehensive quality gate process that balances thoroughness with practicality."
    } else if (finalScore >= 75) {
      feedbackMessage = "Good work! Your quality gates cover the main areas well."
    } else if (finalScore >= 60) {
      feedbackMessage = "Your quality gate design is a good start, but it's missing some important checkpoints."
    } else {
      feedbackMessage = "Your quality gate process needs significant improvement."
    }
    
    setFeedback(feedbackMessage)
  }

  const handleExerciseComplete = () => {
    onComplete()
  }

  const handleTryAgain = () => {
    // Reset exercise state
    const initialSelected = {}
    workflow.stages.forEach(stage => {
      initialSelected[stage.id] = []
    })
    setSelectedGates(initialSelected)
    setAvailableGates([...availableGates, ...Object.values(selectedGates).flat()])
    setCurrentStep('selection')
    setScore(null)
    setFeedback(null)
  }

  const renderSelectionStep = () => {
    return (
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="quality-gates-workshop">
          <div className="workflow-description">
            <h3 className="workflow-title">{workflow.title}</h3>
            <p className="workflow-description">{workflow.description}</p>
            <p className="workflow-context">{workflow.context}</p>
          </div>
          
          <div className="gate-toolbox">
            <h3 className="gate-toolbox-title">Available Quality Gates</h3>
            <div className="available-gates">
              {availableGates.map(gate => (
                <div 
                  key={gate.id} 
                  className="quality-gate"
                  id={gate.id} // For DnD
                  draggable
                >
                  <div className="gate-title">{gate.title}</div>
                  <div className="gate-description">{gate.description}</div>
                  <div className="gate-meta">
                    <span className="gate-type">{gate.type}</span>
                    <span className="gate-effort">Effort: {gate.effort}</span>
                    <span className="gate-impact">Impact: {gate.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="workflow-canvas">
            <div className="workflow-stages">
              {workflow.stages.map(stage => (
                <div 
                  key={stage.id} 
                  className="workflow-stage"
                  id={stage.id} // For DnD
                >
                  <div className="stage-header">
                    <span className="stage-icon">{stage.icon}</span>
                    <span className="stage-title">{stage.title}</span>
                  </div>
                  <p className="stage-description">{stage.description}</p>
                  
                  <div className="stage-gates">
                    {selectedGates[stage.id].map(gate => (
                      <div key={gate.id} className="quality-gate">
                        <div className="gate-title">{gate.title}</div>
                        <div className="gate-description">{gate.description}</div>
                        <button 
                          className="remove-gate" 
                          onClick={() => handleRemoveGate(stage.id, gate.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="quality-tips">
            <h3>Quality Gate Tips</h3>
            <div className="tips-list">
              {tips.map((tip, index) => (
                <div key={index} className="tip-item">
                  <h4 className="tip-title">{tip.title}</h4>
                  <p className="tip-description">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="exercise-actions">
            <button 
              className="action-button primary" 
              onClick={handleReviewGates}
              disabled={Object.values(selectedGates).flat().length === 0}
            >
              Review Quality Gates
            </button>
          </div>
        </div>
      </DndContext>
    )
  }

  const renderReviewStep = () => {
    return (
      <div className="gates-review">
        <div className="exercise-feedback">
          <h3 className="feedback-title">Your Quality Gate Process Score: {score}%</h3>
          <p className="feedback-content">{feedback}</p>
        </div>
        
        <div className="gates-summary">
          <h3>Your Quality Gate Process</h3>
          
          <div className="workflow-summary">
            {workflow.stages.map(stage => (
              <div key={stage.id} className="stage-summary">
                <h4 className="stage-title">
                  {stage.icon} {stage.title}
                </h4>
                
                {selectedGates[stage.id].length > 0 ? (
                  <div className="stage-gates-summary">
                    {selectedGates[stage.id].map(gate => (
                      <div key={gate.id} className="gate-summary">
                        <h5 className="gate-title">{gate.title}</h5>
                        <p className="gate-description">{gate.description}</p>
                        <div className="gate-criteria">
                          <strong>Criteria:</strong>
                          <ul>
                            {gate.criteria.map((criterion, index) => (
                              <li key={index}>{criterion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-stage">No quality gates selected for this stage</p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="exercise-actions">
          {exerciseConfig?.config?.allowRetry && (
            <button className="action-button secondary" onClick={handleTryAgain}>
              Try Again
            </button>
          )}
          <button className="action-button primary" onClick={handleExerciseComplete}>
            Complete Exercise
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="exercise exercise3">
      <div className="exercise-header">
        <h2 className="exercise-title">Quality Gates Assessment</h2>
        <p className="exercise-description">
          Design quality checkpoints for development workflow
        </p>
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
               "You'll design quality gate processes for different development workflows."}
            </p>
            <button className="start-button" onClick={handleStart}>
              {exerciseConfig?.ui?.startScreen?.buttonText || "Start Exercise"}
            </button>
          </div>
        ) : (
          <>
            {currentStep === 'selection' && renderSelectionStep()}
            {currentStep === 'review' && renderReviewStep()}
          </>
        )}
      </div>
    </div>
  )
}

export default Exercise3
