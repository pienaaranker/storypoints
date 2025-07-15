import { useState, useEffect } from 'react'
import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, useDraggable, useDroppable } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { loadExerciseData, getModuleExerciseConfig } from '../../../utils/moduleLoader'
import './Exercise.css'

/**
 * DoD Creation Workshop Exercise
 * Interactive exercise for building comprehensive Definition of Done criteria
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
  const [scenario, setScenario] = useState(null)
  const [categories, setCategories] = useState([])
  const [availableCriteria, setAvailableCriteria] = useState([])
  const [selectedCriteria, setSelectedCriteria] = useState({})
  const [currentStep, setCurrentStep] = useState('selection') // selection, review, feedback
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState(null)

  // Load exercise data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load exercise configuration from module config
        const exerciseConfigData = await getModuleExerciseConfig('definition-of-done', 1)

        // Load exercise data using the module loader
        const exerciseData = await loadExerciseData('definition-of-done', 1)

        // Extract data from the loaded JSON
        const scenario = exerciseData.scenarios[0] // Use first scenario for now
        const categories = exerciseData.categories
        const availableCriteria = exerciseData.availableCriteria

        setExerciseConfig(exerciseConfigData)
        setScenario(scenario)
        setCategories(categories)
        setAvailableCriteria(availableCriteria)

          // Initialize selected criteria
          const initialSelected = {}
          categories.forEach(category => {
            initialSelected[category.id] = []
          })
          setSelectedCriteria(initialSelected)

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

  // Draggable criterion component
  const DraggableCriterion = ({ criterion }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: criterion.id,
    })

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      opacity: isDragging ? 0.5 : 1,
    } : undefined

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`dod-criterion ${isDragging ? 'dragging' : ''}`}
      >
        <div className="dod-criterion-text">{criterion.text}</div>
        <div className="dod-criterion-priority">Priority: {criterion.priority}</div>
      </div>
    )
  }

  // Droppable category component
  const DroppableCategory = ({ category, criteria }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: category.id,
    })

    return (
      <div
        ref={setNodeRef}
        className={`dod-category ${isOver ? 'drag-over' : ''}`}
      >
        <div className="dod-category-header" style={{ color: category.color }}>
          <span className="dod-category-icon">{category.icon}</span>
          <span>{category.title}</span>
        </div>
        <p className="dod-category-description">{category.description}</p>

        <div className="dod-criteria-list">
          {criteria.map(criterion => (
            <div key={criterion.id} className="dod-criterion">
              <div className="dod-criterion-text">{criterion.text}</div>
              <div className="dod-criterion-priority">Priority: {criterion.priority}</div>
              <button
                className="remove-criterion"
                onClick={() => handleRemoveCriterion(category.id, criterion.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const criterionId = active.id
      const targetCategory = over.id
      
      // Find the criterion in available criteria
      const criterion = availableCriteria.find(c => c.id === criterionId)
      
      if (criterion) {
        // Remove from available criteria
        setAvailableCriteria(availableCriteria.filter(c => c.id !== criterionId))
        
        // Add to selected criteria
        setSelectedCriteria(prev => ({
          ...prev,
          [targetCategory]: [...prev[targetCategory], criterion]
        }))
      }
    }
  }

  const handleRemoveCriterion = (categoryId, criterionId) => {
    // Find the criterion in selected criteria
    const criterion = selectedCriteria[categoryId].find(c => c.id === criterionId)
    
    if (criterion) {
      // Remove from selected criteria
      setSelectedCriteria(prev => ({
        ...prev,
        [categoryId]: prev[categoryId].filter(c => c.id !== criterionId)
      }))
      
      // Add back to available criteria
      setAvailableCriteria([...availableCriteria, criterion])
    }
  }

  const handleReviewDoD = () => {
    setCurrentStep('review')
    
    // Calculate score based on correct categorization
    // In a real implementation, this would compare against the model solution
    const totalSelected = Object.values(selectedCriteria).flat().length
    const score = Math.min(100, Math.round((totalSelected / availableCriteria.length) * 100))
    setScore(score)
    
    // Determine feedback based on score
    let feedbackMessage
    if (score >= 90) {
      feedbackMessage = "Excellent! You've created a comprehensive Definition of Done that covers all critical quality aspects."
    } else if (score >= 75) {
      feedbackMessage = "Good work! Your Definition of Done covers most important areas."
    } else if (score >= 60) {
      feedbackMessage = "Your Definition of Done is a good start, but it's missing some critical quality gates."
    } else {
      feedbackMessage = "Your Definition of Done needs significant improvement."
    }
    
    setFeedback(feedbackMessage)
  }

  const handleExerciseComplete = () => {
    onComplete()
  }

  const handleTryAgain = () => {
    // Reset exercise state
    const initialSelected = {}
    categories.forEach(category => {
      initialSelected[category.id] = []
    })
    setSelectedCriteria(initialSelected)
    setAvailableCriteria([...availableCriteria, ...Object.values(selectedCriteria).flat()])
    setCurrentStep('selection')
    setScore(null)
    setFeedback(null)
  }

  const renderSelectionStep = () => {
    return (
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="dod-workshop">
          <div className="scenario-card">
            <h3 className="scenario-title">{scenario.title}</h3>
            <p className="scenario-description">{scenario.description}</p>
            <p className="scenario-context">{scenario.context}</p>
          </div>

          <div className="exercise-instructions">
            <h4>📋 How to Complete This Exercise:</h4>
            <ol>
              <li><strong>Drag</strong> quality criteria from the "Available Criteria" section below into the appropriate category boxes</li>
              <li><strong>Categorize</strong> each criterion into Technical, Functional, Process, or Documentation</li>
              <li><strong>Prioritize</strong> by placing the most important criteria first in each category</li>
              <li><strong>Balance</strong> your selection across all categories for comprehensive coverage</li>
            </ol>
            <p><em>💡 Tip: A good Definition of Done should cover all aspects of quality without being overwhelming.</em></p>
          </div>
          
          <div className="dod-categories">
            {categories.map(category => (
              <DroppableCategory
                key={category.id}
                category={category}
                criteria={selectedCriteria[category.id]}
              />
            ))}
          </div>

          <div className="available-criteria">
            <h3>Available Criteria</h3>
            <div className="criteria-list">
              {availableCriteria.map(criterion => (
                <DraggableCriterion
                  key={criterion.id}
                  criterion={criterion}
                />
              ))}
            </div>
          </div>
          
          <div className="exercise-actions">
            <button 
              className="action-button primary" 
              onClick={handleReviewDoD}
              disabled={Object.values(selectedCriteria).flat().length === 0}
            >
              Review Definition of Done
            </button>
          </div>
        </div>
      </DndContext>
    )
  }

  const renderReviewStep = () => {
    return (
      <div className="dod-review">
        <div className="exercise-feedback">
          <h3 className="feedback-title">Your Definition of Done Score: {score}%</h3>
          <p className="feedback-content">{feedback}</p>
        </div>
        
        <div className="dod-summary">
          <h3>Your Definition of Done</h3>
          
          {categories.map(category => (
            <div key={category.id} className="dod-category-summary">
              <h4 className="category-title" style={{ color: category.color }}>
                {category.icon} {category.title}
              </h4>
              
              {selectedCriteria[category.id].length > 0 ? (
                <ul className="category-criteria">
                  {selectedCriteria[category.id].map(criterion => (
                    <li key={criterion.id} className="criterion-item">
                      <span className="criterion-text">{criterion.text}</span>
                      <span className="criterion-priority">({criterion.priority})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-category">No criteria selected for this category</p>
              )}
            </div>
          ))}
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
    <div className="exercise exercise1">
      <div className="exercise-header">
        <h2 className="exercise-title">DoD Creation Workshop</h2>
        <p className="exercise-description">
          Build comprehensive Definition of Done criteria for different types of work
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
               "You'll work through different development scenarios and build comprehensive Definition of Done criteria."}
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

export default Exercise1
