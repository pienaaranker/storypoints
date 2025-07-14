import { useState, useEffect } from 'react'
import './Exercise.css'

/**
 * Exercise 2: Story Decomposition
 * Interactive story splitting scenarios to learn effective decomposition
 */
function Exercise2({ onComplete, onStart, isStarted }) {
  const [scenarios, setScenarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [userDecompositions, setUserDecompositions] = useState({})
  const [currentStep, setCurrentStep] = useState('decomposition') // 'decomposition', 'feedback'

  // Mock scenarios for now - will be loaded from JSON in the future
  const mockScenarios = [
    {
      id: 1,
      title: "User Profile Management",
      description: "As a user, I want to manage my profile so that I can keep my information up to date and control my privacy settings.",
      context: "This story is too large and needs to be broken down into smaller, more manageable pieces.",
      suggestedDecomposition: [
        "As a user, I want to view my profile information so that I can see what data is stored about me",
        "As a user, I want to edit my basic profile information (name, email) so that I can keep it current",
        "As a user, I want to change my password so that I can maintain account security",
        "As a user, I want to update my privacy settings so that I can control who sees my information",
        "As a user, I want to upload a profile picture so that I can personalize my account"
      ],
      hints: [
        "Think about the different types of profile information",
        "Consider security-related actions separately",
        "Break down by user actions rather than technical implementation"
      ]
    },
    {
      id: 2,
      title: "Order Processing System",
      description: "As a customer, I want to place an order so that I can purchase products from the website.",
      context: "This epic-sized story needs to be decomposed into feature-level and story-level components.",
      suggestedDecomposition: [
        "As a customer, I want to add items to my cart so that I can collect products before purchasing",
        "As a customer, I want to review my cart contents so that I can verify my order before checkout",
        "As a customer, I want to enter my shipping address so that products can be delivered to me",
        "As a customer, I want to select a payment method so that I can pay for my order",
        "As a customer, I want to receive an order confirmation so that I know my purchase was successful"
      ],
      hints: [
        "Follow the customer journey step by step",
        "Each story should represent a single user action",
        "Consider what information the customer needs to provide"
      ]
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
        
        setScenarios(mockScenarios)
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
    setCurrentScenarioIndex(0)
    setUserDecompositions({})
    setCurrentStep('decomposition')
  }

  const handleAddStory = (scenarioId) => {
    const newStory = ""
    setUserDecompositions(prev => ({
      ...prev,
      [scenarioId]: [...(prev[scenarioId] || []), newStory]
    }))
  }

  const handleUpdateStory = (scenarioId, storyIndex, value) => {
    setUserDecompositions(prev => ({
      ...prev,
      [scenarioId]: prev[scenarioId].map((story, index) => 
        index === storyIndex ? value : story
      )
    }))
  }

  const handleRemoveStory = (scenarioId, storyIndex) => {
    setUserDecompositions(prev => ({
      ...prev,
      [scenarioId]: prev[scenarioId].filter((_, index) => index !== storyIndex)
    }))
  }

  const handleNextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1)
    } else {
      setCurrentStep('feedback')
    }
  }

  const handleComplete = () => {
    onComplete()
  }

  const getCurrentScenario = () => scenarios[currentScenarioIndex]

  const renderDecompositionStep = () => {
    const scenario = getCurrentScenario()
    if (!scenario) return null

    const userStories = userDecompositions[scenario.id] || []

    return (
      <div className="decomposition-step">
        <div className="scenario-info">
          <h3>Scenario {currentScenarioIndex + 1} of {scenarios.length}</h3>
          <h4>{scenario.title}</h4>
          <div className="original-story">
            <h5>Original Story:</h5>
            <p className="story-text">{scenario.description}</p>
          </div>
          <div className="context">
            <h5>Context:</h5>
            <p>{scenario.context}</p>
          </div>
        </div>

        <div className="decomposition-area">
          <h5>Break this down into smaller user stories:</h5>
          <div className="user-stories">
            {userStories.map((story, index) => (
              <div key={index} className="story-input-group">
                <textarea
                  value={story}
                  onChange={(e) => handleUpdateStory(scenario.id, index, e.target.value)}
                  placeholder="As a [user type], I want to [action] so that [benefit]"
                  rows={3}
                />
                <button 
                  className="remove-story-btn"
                  onClick={() => handleRemoveStory(scenario.id, index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button 
            className="add-story-btn"
            onClick={() => handleAddStory(scenario.id)}
          >
            + Add User Story
          </button>
        </div>

        <div className="hints-section">
          <h5>Hints:</h5>
          <ul>
            {scenario.hints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>

        <div className="step-actions">
          <button 
            className="next-button"
            onClick={handleNextScenario}
            disabled={userStories.length === 0 || userStories.some(story => story.trim() === '')}
          >
            {currentScenarioIndex < scenarios.length - 1 ? 'Next Scenario' : 'Review Results'}
          </button>
        </div>
      </div>
    )
  }

  const renderFeedbackStep = () => {
    return (
      <div className="feedback-step">
        <h3>Your Decompositions</h3>
        
        {scenarios.map((scenario, scenarioIndex) => {
          const userStories = userDecompositions[scenario.id] || []
          
          return (
            <div key={scenario.id} className="scenario-feedback">
              <h4>Scenario {scenarioIndex + 1}: {scenario.title}</h4>
              
              <div className="comparison">
                <div className="user-decomposition">
                  <h5>Your Decomposition:</h5>
                  <ul>
                    {userStories.map((story, index) => (
                      <li key={index}>{story}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="suggested-decomposition">
                  <h5>Suggested Decomposition:</h5>
                  <ul>
                    {scenario.suggestedDecomposition.map((story, index) => (
                      <li key={index}>{story}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}

        <div className="key-learnings">
          <h4>Key Learnings</h4>
          <ul>
            <li>Each user story should represent a single, valuable piece of functionality</li>
            <li>Stories should follow the "As a [user], I want [action] so that [benefit]" format</li>
            <li>Break down by user actions, not technical implementation</li>
            <li>Each story should be independently testable and deliverable</li>
            <li>Consider the user journey and natural workflow</li>
          </ul>
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
    <div className="exercise exercise-2">
      <div className="exercise-header">
        <h2>Exercise 2: Story Decomposition</h2>
        <p>Learn to break down large stories into smaller, manageable pieces</p>
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
              In this exercise, you'll practice breaking down large user stories into smaller, 
              more manageable pieces. You'll work through realistic scenarios and learn effective 
              decomposition techniques.
            </p>
            <button className="start-button" onClick={handleStart} disabled={scenarios.length === 0}>
              Start Exercise
            </button>
          </div>
        ) : (
          <>
            {currentStep === 'decomposition' && renderDecompositionStep()}
            {currentStep === 'feedback' && renderFeedbackStep()}
          </>
        )}
      </div>
    </div>
  )
}

export default Exercise2
