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
import './Exercise2.css'
import UserStoryItem from '../../UserStoryItem'
import PointSelector from '../../PointSelector'
import { loadUserStories, getExerciseConfig } from '../../../utils/dataLoader'

function Exercise2({ onComplete, onStart, isStarted }) {
  const [stories, setStories] = useState([])
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

        const [userStories, config] = await Promise.all([
          loadUserStories(),
          getExerciseConfig(2)
        ])

        setStories(userStories)
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
    // Shuffle stories initially to avoid bias
    const shuffled = [...stories].sort(() => Math.random() - 0.5)
    setStories(shuffled)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setStories((stories) => {
        const oldIndex = stories.findIndex(story => story.id === active.id)
        const newIndex = stories.findIndex(story => story.id === over.id)
        return arrayMove(stories, oldIndex, newIndex)
      })
    }
  }

  const handleOrderingComplete = () => {
    setCurrentStep('pointing')
  }

  const handlePointAssignment = (storyId, points) => {
    setUserPoints(prev => {
      if (points === null) {
        // Remove the story from userPoints when deselected
        const { [storyId]: removed, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [storyId]: points
      }
    })
  }

  const handlePointingComplete = () => {
    setCurrentStep('feedback')
  }

  const handleExerciseComplete = () => {
    onComplete()
  }

  const renderOrderingStep = () => (
    <div className="ordering-step">
      <h3>Step 1: Order User Stories by Complexity</h3>
      <div className="step-question">
        <h4 className="question-prompt">🎯 Your Task:</h4>
        <p className="question-text">Which user story is the simplest to implement? Arrange all stories from <strong>least complex to most complex</strong> by considering development effort, technical challenges, and requirements.</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={stories.map(story => story.id)} strategy={verticalListSortingStrategy}>
          <div className="sortable-list">
            {stories.map((story, index) => (
              <UserStoryItem key={story.id} id={story.id} story={story} index={index + 1} />
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
        <p className="question-text">How many story points should each user story receive based on its complexity, effort, and uncertainty? Select from the Fibonacci sequence: <strong>{exerciseConfig?.config?.pointScale?.join(', ') || '1, 2, 3, 5, 8, 13'}</strong></p>
      </div>

      <div className="pointing-list">
        {stories.map((story, index) => (
          <div key={story.id} className="pointing-story">
            <div className="story-info">
              <span className="story-position">#{index + 1}</span>
              <div className="story-details">
                <strong>{story.title}</strong>
                <p className="story-description">{story.description}</p>
                <div className="acceptance-criteria">
                  <strong>Acceptance Criteria:</strong>
                  <ul>
                    {story.acceptanceCriteria.map((criteria, idx) => (
                      <li key={idx}>{criteria}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <PointSelector
              value={userPoints[story.id] || null}
              onChange={(points) => handlePointAssignment(story.id, points)}
              pointScale={exerciseConfig?.config?.pointScale || [1, 2, 3, 5, 8, 13]}
            />
          </div>
        ))}
      </div>

      <button
        className="next-button"
        onClick={handlePointingComplete}
        disabled={Object.keys(userPoints).length < stories.length}
      >
        See Results & Explanations
      </button>
    </div>
  )

  const renderFeedbackStep = () => {
    const correctOrder = [...stories].sort((a, b) => a.correctOrder - b.correctOrder)

    return (
      <div className="feedback-step">
        <h3>Results & Detailed Analysis</h3>

        <div className="feedback-section">
          <h4>Correct Ordering & Points:</h4>
          <div className="correct-answers">
            {correctOrder.map((story, index) => (
              <div key={story.id} className="feedback-story">
                <div className="story-rank">#{index + 1}</div>
                <div className="story-content">
                  <div className="story-header">
                    <strong>{story.title}</strong> - <span className="points">{story.correctPoints} points</span>
                  </div>
                  <div className="complexity-breakdown">
                    <span className="complexity-item">Complexity: <strong>{story.factors?.complexity || story.complexity}</strong></span>
                    <span className="complexity-item">Effort: <strong>{story.factors?.effort || story.effort}</strong></span>
                    <span className="complexity-item">Uncertainty: <strong>{story.factors?.uncertainty || story.uncertainty}</strong></span>
                  </div>
                  <p className="explanation">{story.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="key-learning">
          <h4>Key Insights:</h4>
          <ul>
            <li><strong>Complexity Factors:</strong> Notice how technical complexity, business logic, and integration points affect sizing.</li>
            <li><strong>Uncertainty Impact:</strong> Stories with more unknowns get higher points even if the base effort seems similar.</li>
            <li><strong>Non-Linear Growth:</strong> The jump from "change password" (3) to "social login" (13) reflects exponential complexity increase.</li>
            <li><strong>Hidden Complexity:</strong> Simple-sounding features like "upload picture" involve multiple technical considerations.</li>
          </ul>
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
        <h2>Exercise 2: User Stories Sizing</h2>
        <p className="exercise-intro">
          Apply relative sizing to real user stories. You'll drag and drop stories to order them
          by complexity, then assign story points using the Fibonacci sequence.
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
               "You'll work with realistic user stories from a typical web application. First arrange them by relative complexity, then assign story points (1, 2, 3, 5, 8, 13) based on complexity, effort, and uncertainty."}
            </p>
            <button className="start-button" onClick={handleStart} disabled={stories.length === 0}>
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
            <strong>Remember:</strong> Notice how a small change in requirements can significantly
            increase complexity. Story points help us account for these nuances.
          </p>
        </div>
      )}
    </div>
  )
}

export default Exercise2
