import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'

import './Exercise.css'
import './Exercise1.css'
import SortableItem from '../../SortableItem'
import PointSelector from '../../PointSelector'
import { loadAbstractItems, getExerciseConfig } from '../../../utils/dataLoader'

function Exercise1({ onComplete, onStart, isStarted }) {
  const [items, setItems] = useState([])
  const [exerciseConfig, setExerciseConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState('ordering') // 'ordering', 'pointing', 'feedback'
  const [userPoints, setUserPoints] = useState({})

  // Load exercise data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [abstractItems, config] = await Promise.all([
          loadAbstractItems(),
          getExerciseConfig(1)
        ])

        setItems(abstractItems)
        setExerciseConfig(config)
      } catch (err) {
        console.error('Failed to load exercise data:', err)
        setError(err.message)
      } finally {
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
    // Shuffle items initially to avoid bias
    const shuffled = [...items].sort(() => Math.random() - 0.5)
    setItems(shuffled)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleOrderingComplete = () => {
    setCurrentStep('pointing')
  }

  const handlePointAssignment = (itemId, points) => {
    setUserPoints(prev => {
      if (points === null) {
        // Remove the item from userPoints when deselected
        const { [itemId]: removed, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [itemId]: points
      }
    })
  }

  const handlePointingComplete = () => {
    setCurrentStep('feedback')
    setShowFeedback(true)
  }

  const handleExerciseComplete = () => {
    onComplete()
  }

  const renderOrderingStep = () => (
    <div className="ordering-step">
      <h3>Step 1: Arrange by Relative Effort</h3>
      <div className="step-question">
        <h4 className="question-prompt">🎯 Your Task:</h4>
        <p className="question-text">Which item requires the least effort to move? Arrange all items from <strong>easiest to hardest</strong> to move by dragging and dropping them.</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="sortable-list">
            {items.map((item, index) => (
              <SortableItem key={item.id} id={item.id} item={item} index={index + 1} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button className="next-button" onClick={handleOrderingComplete}>
        Continue to Point Assignment
      </button>
    </div>
  )

  const renderPointingStep = () => (
    <div className="pointing-step">
      <h3>Step 2: Assign Story Points</h3>
      <div className="step-question">
        <h4 className="question-prompt">🎯 Your Task:</h4>
        <p className="question-text">How many story points should each item receive based on the relative effort to move it? Select from: <strong>{exerciseConfig?.config?.pointScale?.join(', ') || '1, 2, 3, 5, 8, 13'}</strong></p>
      </div>

      <div className="guidance-section">
        <div className="guidance-header">
          <h4>💡 Sizing Mindset Guide</h4>
        </div>
        <div className="guidance-content">
          <div className="guidance-column">
            <h5>Consider These Factors:</h5>
            <ul>
              <li><strong>Physical effort</strong> - How much strength is needed?</li>
              <li><strong>Tools required</strong> - Can you use just your hands?</li>
              <li><strong>Coordination</strong> - Do you need help from others?</li>
              <li><strong>Complexity</strong> - How many steps are involved?</li>
            </ul>
          </div>
          <div className="guidance-column">
            <h5>Remember:</h5>
            <ul>
              <li><strong>Think relatively</strong> - Compare items to each other</li>
              <li><strong>Not about time</strong> - Focus on effort and complexity</li>
              <li><strong>Exponential differences</strong> - A 5 isn't just "5 times" a 1</li>
              <li><strong>Use your experience</strong> - What would it really take?</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pointing-list">
        {items.map((item, index) => (
          <div key={item.id} className="pointing-item">
            <div className="item-info">
              <span className="item-position">#{index + 1}</span>
              <div className="item-details">
                <strong>{item.name}</strong>
                <p>{item.description}</p>
              </div>
            </div>
            <PointSelector
              value={userPoints[item.id] || null}
              onChange={(points) => handlePointAssignment(item.id, points)}
              pointScale={exerciseConfig?.config?.pointScale || [1, 2, 3, 5, 8, 13]}
            />
          </div>
        ))}
      </div>

      <button
        className="next-button"
        onClick={handlePointingComplete}
        disabled={Object.keys(userPoints).length < items.length}
      >
        See Results
      </button>
    </div>
  )

  const renderFeedbackStep = () => {
    const correctOrder = [...items].sort((a, b) => a.correctOrder - b.correctOrder)

    return (
      <div className="feedback-step">
        <h3>Results & Learning</h3>

        <div className="feedback-section">
          <h4>Correct Ordering & Points:</h4>
          <div className="correct-answers">
            {correctOrder.map((item, index) => (
              <div key={item.id} className="feedback-item">
                <div className="item-rank">#{index + 1}</div>
                <div className="item-content">
                  <strong>{item.name}</strong> - <span className="points">{item.correctPoints} points</span>
                  <p className="explanation">{item.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="key-learning">
          <h4>Key Learning:</h4>
          <p>
            Notice the exponential difference in effort between items. A mountain isn't just "4 times"
            harder than a grain of sand - it's exponentially more complex. This is why we use
            Fibonacci-like sequences ({exerciseConfig?.config?.pointScale?.join(', ') || '1, 2, 3, 5, 8, 13'}) rather than linear scales.
          </p>
        </div>

        <button className="complete-button" onClick={handleExerciseComplete}>
          Complete Exercise
        </button>
      </div>
    )
  }

  return (
    <div className="exercise">
      <div className="exercise-header">
        <h2>Exercise 1: Abstract Relative Sizing</h2>
        <p className="exercise-intro">
          Learn the core concept of relative sizing by comparing abstract items.
          This exercise helps you detach from real-world time biases and focus on relative effort.
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
               "You'll be presented with abstract items like \"a grain of sand,\" \"a pebble,\" \"a boulder,\" and \"a mountain.\" Your task is to arrange them by relative effort to move, then assign story points."}
            </p>
            <button className="start-button" onClick={handleStart} disabled={items.length === 0}>
              {exerciseConfig?.ui?.startScreen?.buttonText || "Start Exercise"}
            </button>
          </div>
        ) : (
          <>
            {currentStep === 'ordering' && renderOrderingStep()}
            {currentStep === 'pointing' && renderPointingStep()}
            {currentStep === 'feedback' && renderFeedbackStep()}
          </>
        )}
      </div>

      {exerciseConfig?.config?.showMindsetReminder && (
        <div className="mindset-reminder">
          <p>
            <strong>Remember:</strong> {exerciseConfig?.ui?.mindsetReminder ||
             "Story points are about relative effort, not absolute time. A '3' is roughly three times the effort of a '1'."}
          </p>
        </div>
      )}
    </div>
  )
}

export default Exercise1
