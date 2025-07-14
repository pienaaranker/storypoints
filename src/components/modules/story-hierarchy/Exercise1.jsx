import { useState, useEffect } from 'react'
import './Exercise.css'

/**
 * Exercise 1: Epic vs Feature vs Story
 * Categorization exercise to learn the hierarchy and distinctions
 */
function Exercise1({ onComplete, onStart, isStarted }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState('categorization') // 'categorization', 'feedback'
  const [userCategories, setUserCategories] = useState({
    epic: [],
    feature: [],
    story: []
  })

  // Mock data for now - will be loaded from JSON in the future
  const mockItems = [
    {
      id: 1,
      title: "User Authentication System",
      description: "Complete user login, registration, and password management functionality",
      correctCategory: "epic"
    },
    {
      id: 2,
      title: "Password Reset",
      description: "Allow users to reset their password via email",
      correctCategory: "feature"
    },
    {
      id: 3,
      title: "Display password strength indicator",
      description: "As a user, I want to see a password strength indicator when creating a password so that I can create a secure password",
      correctCategory: "story"
    },
    {
      id: 4,
      title: "E-commerce Platform",
      description: "Complete online shopping experience with product catalog, cart, and checkout",
      correctCategory: "epic"
    },
    {
      id: 5,
      title: "Shopping Cart Management",
      description: "Add, remove, and modify items in shopping cart",
      correctCategory: "feature"
    },
    {
      id: 6,
      title: "Update item quantity in cart",
      description: "As a shopper, I want to change the quantity of items in my cart so that I can buy the right amount",
      correctCategory: "story"
    }
  ]

  // Load exercise data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setItems(mockItems)
      } catch (err) {
        console.error('Failed to load exercise data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleStart = () => {
    onStart()
    // Shuffle items initially to avoid bias
    const shuffled = [...items].sort(() => Math.random() - 0.5)
    setItems(shuffled)
  }

  const handleCategorize = (itemId, category) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    // Remove item from all categories first
    const newCategories = {
      epic: userCategories.epic.filter(i => i.id !== itemId),
      feature: userCategories.feature.filter(i => i.id !== itemId),
      story: userCategories.story.filter(i => i.id !== itemId)
    }

    // Add to selected category
    newCategories[category].push(item)
    setUserCategories(newCategories)
  }

  const handleSubmit = () => {
    setCurrentStep('feedback')
  }

  const handleComplete = () => {
    onComplete()
  }

  const getScore = () => {
    let correct = 0
    let total = 0

    Object.keys(userCategories).forEach(category => {
      userCategories[category].forEach(item => {
        total++
        if (item.correctCategory === category) {
          correct++
        }
      })
    })

    return { correct, total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 }
  }

  const renderCategorizationStep = () => {
    const uncategorizedItems = items.filter(item => 
      !Object.values(userCategories).flat().some(catItem => catItem.id === item.id)
    )

    return (
      <div className="categorization-step">
        <div className="instructions">
          <h3>Categorize the Requirements</h3>
          <p>Drag each requirement into the appropriate category: Epic, Feature, or Story.</p>
          <div className="category-definitions">
            <div className="definition">
              <strong>Epic:</strong> Large body of work that can be broken down into features
            </div>
            <div className="definition">
              <strong>Feature:</strong> Functionality that delivers value and can be broken down into stories
            </div>
            <div className="definition">
              <strong>Story:</strong> Small, specific requirement from user's perspective
            </div>
          </div>
        </div>

        <div className="categorization-area">
          <div className="uncategorized-items">
            <h4>Items to Categorize</h4>
            {uncategorizedItems.map(item => (
              <div key={item.id} className="item-card">
                <h5>{item.title}</h5>
                <p>{item.description}</p>
                <div className="category-buttons">
                  <button onClick={() => handleCategorize(item.id, 'epic')}>Epic</button>
                  <button onClick={() => handleCategorize(item.id, 'feature')}>Feature</button>
                  <button onClick={() => handleCategorize(item.id, 'story')}>Story</button>
                </div>
              </div>
            ))}
          </div>

          <div className="categories">
            {Object.keys(userCategories).map(category => (
              <div key={category} className={`category ${category}`}>
                <h4>{category.charAt(0).toUpperCase() + category.slice(1)}s</h4>
                <div className="category-items">
                  {userCategories[category].map(item => (
                    <div key={item.id} className="categorized-item">
                      <h5>{item.title}</h5>
                      <button 
                        className="remove-btn"
                        onClick={() => {
                          const newCategories = { ...userCategories }
                          newCategories[category] = newCategories[category].filter(i => i.id !== item.id)
                          setUserCategories(newCategories)
                        }}
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

        <div className="step-actions">
          <button 
            className="submit-button"
            onClick={handleSubmit}
            disabled={uncategorizedItems.length > 0}
          >
            Submit Categorization
          </button>
        </div>
      </div>
    )
  }

  const renderFeedbackStep = () => {
    const score = getScore()

    return (
      <div className="feedback-step">
        <div className="score-summary">
          <h3>Your Results</h3>
          <div className="score">
            <span className="score-number">{score.correct}/{score.total}</span>
            <span className="score-percentage">({score.percentage}%)</span>
          </div>
        </div>

        <div className="detailed-feedback">
          {Object.keys(userCategories).map(category => (
            <div key={category} className="category-feedback">
              <h4>{category.charAt(0).toUpperCase() + category.slice(1)}s</h4>
              {userCategories[category].map(item => (
                <div 
                  key={item.id} 
                  className={`feedback-item ${item.correctCategory === category ? 'correct' : 'incorrect'}`}
                >
                  <h5>{item.title}</h5>
                  <p>{item.description}</p>
                  {item.correctCategory !== category && (
                    <div className="correction">
                      Should be: <strong>{item.correctCategory}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="step-actions">
          <button className="complete-button" onClick={handleComplete}>
            Complete Exercise
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="exercise exercise-1">
      <div className="exercise-header">
        <h2>Exercise 1: Epic vs Feature vs Story</h2>
        <p>Learn the hierarchy and distinctions between different requirement levels</p>
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
              In this exercise, you'll learn to distinguish between Epics, Features, and Stories. 
              You'll categorize different requirements to understand the hierarchy and appropriate granularity levels.
            </p>
            <button className="start-button" onClick={handleStart} disabled={items.length === 0}>
              Start Exercise
            </button>
          </div>
        ) : (
          <>
            {currentStep === 'categorization' && renderCategorizationStep()}
            {currentStep === 'feedback' && renderFeedbackStep()}
          </>
        )}
      </div>
    </div>
  )
}

export default Exercise1
