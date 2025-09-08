import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import {
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'

import './Exercise.css'
import './Exercise4.css'
import { loadReadinessStories, getExerciseConfig } from '../../../utils/dataLoader'

// Draggable Story Component
function DraggableStory({ story }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: story.id,
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
      className={`story-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="story-header">
        <strong>{story.title}</strong>
      </div>
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
  )
}

// Droppable Category Component
function DroppableCategory({ category, stories, onReturnStory }) {
  const { isOver, setNodeRef } = useDroppable({
    id: category.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`category-bucket ${category.id} ${isOver ? 'drag-over' : ''}`}
      data-category={category.id}
    >
      <div className="category-header">
        <h4>{category.title}</h4>
        <p>{category.description}</p>
        <span className="story-count">({stories.length})</span>
      </div>
      <div className="category-stories">
        {stories.map(story => (
          <div key={story.id} className="categorized-story">
            <div className="story-content">
              <strong>{story.title}</strong>
              <p>{story.description}</p>
            </div>
            <button
              className="return-story-button"
              onClick={() => onReturnStory(story.id)}
              title="Return to uncategorized stories"
              aria-label={`Return ${story.title} to uncategorized stories`}
            >
              ↩️
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Exercise4({ onComplete, onStart, isStarted }) {
  const [stories, setStories] = useState([])
  const [exerciseConfig, setExerciseConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState('start') // 'start', 'categorization', 'feedback'
  const [categorizedStories, setCategorizedStories] = useState({
    'ready-to-size': [],
    'too-vague': [],
    'too-large': [],
    'too-small': []
  })
  const [uncategorizedStories, setUncategorizedStories] = useState([])
  const [activeId, setActiveId] = useState(null)

  // Load exercise data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [readinessStories, config] = await Promise.all([
          loadReadinessStories(),
          getExerciseConfig(4)
        ])

        setStories(readinessStories)
        setExerciseConfig(config)
        setUncategorizedStories([...readinessStories])
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
    setCurrentStep('categorization')

    // Shuffle stories initially to avoid bias
    if (exerciseConfig?.config?.allowShuffle) {
      const shuffled = [...stories].sort(() => Math.random() - 0.5)
      setUncategorizedStories(shuffled)
    }
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeStoryId = active.id
    const destinationCategory = over.id

    // Find the story being dragged
    const activeStory = stories.find(story => story.id === activeStoryId)
    if (!activeStory) return

    // Check if destination is a valid category
    if (!exerciseConfig?.config?.categories?.some(cat => cat.id === destinationCategory)) {
      return
    }

    // Find source category
    let sourceCategory = null
    if (uncategorizedStories.some(story => story.id === activeStoryId)) {
      sourceCategory = 'uncategorized'
    } else {
      for (const [categoryId, categoryStories] of Object.entries(categorizedStories)) {
        if (categoryStories.some(story => story.id === activeStoryId)) {
          sourceCategory = categoryId
          break
        }
      }
    }

    if (sourceCategory === destinationCategory) return

    // Move story from source to destination
    if (sourceCategory === 'uncategorized') {
      setUncategorizedStories(prev => prev.filter(story => story.id !== activeStoryId))
    } else if (sourceCategory) {
      setCategorizedStories(prev => ({
        ...prev,
        [sourceCategory]: prev[sourceCategory].filter(story => story.id !== activeStoryId)
      }))
    }

    setCategorizedStories(prev => ({
      ...prev,
      [destinationCategory]: [...prev[destinationCategory], activeStory]
    }))
  }

  const handleReturnStory = (storyId) => {
    // Find the story in the categorized stories
    const storyToReturn = stories.find(story => story.id === storyId)
    if (!storyToReturn) return

    // Find which category the story is currently in
    let currentCategory = null
    for (const [categoryId, categoryStories] of Object.entries(categorizedStories)) {
      if (categoryStories.some(story => story.id === storyId)) {
        currentCategory = categoryId
        break
      }
    }

    if (!currentCategory) return

    // Remove story from current category
    setCategorizedStories(prev => ({
      ...prev,
      [currentCategory]: prev[currentCategory].filter(story => story.id !== storyId)
    }))

    // Add story back to uncategorized stories
    setUncategorizedStories(prev => [...prev, storyToReturn])
  }

  const handleSubmit = () => {
    setCurrentStep('feedback')
  }

  const handleComplete = () => {
    onComplete()
  }

  const calculateScore = () => {
    let correct = 0
    let total = 0

    for (const [categoryId, categoryStories] of Object.entries(categorizedStories)) {
      for (const story of categoryStories) {
        total++
        if (story.correctCategory === categoryId) {
          correct++
        }
      }
    }

    return total > 0 ? Math.round((correct / total) * 100) : 0
  }

  const renderStartScreen = () => (
    <div className="exercise-start">
      <div className="start-content">
        <h2>Exercise 4: Story Readiness Assessment</h2>
        <p className="exercise-description">
          {exerciseConfig?.ui?.startScreen?.instructions || 
           "Learn to identify stories that aren't ready for sizing and understand how to prepare them."}
        </p>
        
        <div className="categories-preview">
          <h3>Categories:</h3>
          <div className="category-list">
            {exerciseConfig?.config?.categories?.map(category => (
              <div key={category.id} className="category-preview">
                <strong>{category.title}</strong>
                <p>{category.description}</p>
              </div>
            ))}
          </div>
        </div>

        <button className="start-button" onClick={handleStart} disabled={stories.length === 0}>
          {exerciseConfig?.ui?.startScreen?.buttonText || "Start Readiness Assessment"}
        </button>
      </div>
    </div>
  )

  const renderCategorizationScreen = () => (
    <div className="categorization-screen">
      <div className="categorization-header">
        <h2>Categorize the Stories</h2>
        <p>Drag each story into the appropriate category based on its readiness for estimation.</p>
        <div className="progress-indicator">
          Stories categorized: {Object.values(categorizedStories).flat().length} / {stories.length}
        </div>
      </div>

      <div className="categorization-workspace">
        <div className="categories-section">
          <h3>Categories</h3>
          <div className="category-buckets">
            {exerciseConfig?.config?.categories?.map(category => (
              <DroppableCategory
                key={category.id}
                category={category}
                stories={categorizedStories[category.id] || []}
                onReturnStory={handleReturnStory}
              />
            ))}
          </div>
        </div>

        <div className="stories-section">
          <h3>Stories to Categorize</h3>
          <div className="uncategorized-stories">
            {uncategorizedStories.map(story => (
              <DraggableStory key={story.id} story={story} />
            ))}
          </div>
        </div>
      </div>

      <div className="categorization-actions">
        <button 
          className="submit-button" 
          onClick={handleSubmit}
          disabled={uncategorizedStories.length > 0}
        >
          Submit Categorization
        </button>
      </div>
    </div>
  )

  const renderFeedbackScreen = () => {
    const score = calculateScore()
    
    return (
      <div className="feedback-screen">
        <div className="feedback-header">
          <h2>Assessment Results</h2>
          <div className="score-display">
            <span className="score-value">{score}%</span>
            <span className="score-label">Accuracy</span>
          </div>
        </div>

        <div className="detailed-feedback">
          {exerciseConfig?.config?.categories?.map(category => (
            <div key={category.id} className="category-feedback">
              <h3>{category.title}</h3>
              
              <div className="story-feedback">
                {categorizedStories[category.id]?.map(story => {
                  const isCorrect = story.correctCategory === category.id
                  return (
                    <div key={story.id} className={`story-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                      <div className="story-info">
                        <strong>{story.title}</strong>
                        <span className={`result-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
                          {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      
                      <div className="explanation">
                        <p><strong>Explanation:</strong> {story.explanation}</p>
                        <p><strong>Reasoning:</strong> {story.reasoning}</p>
                        
                        {!isCorrect && (
                          <div className="correct-category">
                            <p><strong>Correct Category:</strong> {
                              exerciseConfig.config.categories.find(cat => cat.id === story.correctCategory)?.title
                            }</p>
                          </div>
                        )}
                        
                        {story.techniques.length > 0 && (
                          <div className="techniques">
                            <p><strong>Techniques to Address:</strong></p>
                            <ul>
                              {story.techniques.map((technique, idx) => (
                                <li key={idx}>{technique}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="completion-actions">
          <button className="complete-button" onClick={handleComplete}>
            Complete Exercise
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="exercise exercise-4">
      <div className="exercise-content">
        {loading ? (
          <div className="loading-screen">
            <p>Loading story readiness scenarios...</p>
          </div>
        ) : error ? (
          <div className="error-screen">
            <p>Error loading exercise: {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : !stories.length ? (
          <div className="loading-screen">
            <p>No stories loaded...</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
          >
            {!isStarted && renderStartScreen()}
            {isStarted && currentStep === 'categorization' && renderCategorizationScreen()}
            {isStarted && currentStep === 'feedback' && renderFeedbackScreen()}

            <DragOverlay>
              {activeId ? (
                <div className="story-card dragging">
                  {stories.find(story => story.id === activeId)?.title}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}

export default Exercise4
