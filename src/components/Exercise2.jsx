import { useState } from 'react'
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
import UserStoryItem from './UserStoryItem'

const USER_STORIES = [
  {
    id: 'view-profile',
    title: 'View User Profile',
    description: 'As a user, I want to view my profile information so that I can see my current details.',
    acceptanceCriteria: [
      'Display user name, email, and profile picture',
      'Show account creation date',
      'Display in a clean, readable format'
    ],
    correctOrder: 1,
    correctPoints: 2,
    complexity: 'Low',
    effort: 'Low',
    uncertainty: 'Low',
    explanation: 'Simple read operation with basic UI display. Minimal business logic and well-understood requirements.'
  },
  {
    id: 'change-password',
    title: 'Change Password',
    description: 'As a user, I want to change my password so that I can maintain account security.',
    acceptanceCriteria: [
      'Require current password verification',
      'Validate new password strength',
      'Send confirmation email',
      'Update password in database securely'
    ],
    correctOrder: 2,
    correctPoints: 3,
    complexity: 'Medium',
    effort: 'Medium',
    uncertainty: 'Low',
    explanation: 'Involves security considerations, validation logic, and email integration. More complex than simple display but well-understood pattern.'
  },
  {
    id: 'upload-profile-picture',
    title: 'Upload Profile Picture',
    description: 'As a user, I want to upload a profile picture so that I can personalize my account.',
    acceptanceCriteria: [
      'Support common image formats (JPG, PNG)',
      'Resize and optimize images automatically',
      'Validate file size and dimensions',
      'Update profile display immediately'
    ],
    correctOrder: 3,
    correctPoints: 5,
    complexity: 'Medium-High',
    effort: 'Medium-High',
    uncertainty: 'Medium',
    explanation: 'File upload handling, image processing, storage management, and real-time UI updates. Multiple integration points and edge cases.'
  },
  {
    id: 'two-factor-auth',
    title: 'Enable Two-Factor Authentication',
    description: 'As a user, I want to enable 2FA so that I can secure my account with an additional layer of protection.',
    acceptanceCriteria: [
      'Generate and display QR code for authenticator apps',
      'Verify setup with test code',
      'Provide backup recovery codes',
      'Integrate with login flow',
      'Handle various authenticator apps'
    ],
    correctOrder: 4,
    correctPoints: 8,
    complexity: 'High',
    effort: 'High',
    uncertainty: 'Medium-High',
    explanation: 'Complex security feature requiring integration with external authenticator systems, backup mechanisms, and modification of core authentication flow.'
  },
  {
    id: 'social-login',
    title: 'Social Media Login Integration',
    description: 'As a user, I want to log in using my social media accounts so that I can access the app more conveniently.',
    acceptanceCriteria: [
      'Support Google, Facebook, and Twitter login',
      'Handle account linking and creation',
      'Manage OAuth flows and tokens',
      'Sync profile data appropriately',
      'Handle edge cases (existing accounts, etc.)'
    ],
    correctOrder: 5,
    correctPoints: 13,
    complexity: 'Very High',
    effort: 'Very High',
    uncertainty: 'High',
    explanation: 'Multiple OAuth integrations, complex account management logic, data synchronization, and numerous edge cases. High uncertainty due to external API dependencies.'
  }
]

function Exercise2({ onComplete, onStart, isStarted }) {
  const [stories, setStories] = useState(USER_STORIES)
  const [currentStep, setCurrentStep] = useState('ordering') // 'ordering', 'pointing', 'feedback'
  const [userPoints, setUserPoints] = useState({})

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleStart = () => {
    onStart()
    // Shuffle stories initially to avoid bias
    const shuffled = [...USER_STORIES].sort(() => Math.random() - 0.5)
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
    setUserPoints(prev => ({
      ...prev,
      [storyId]: points
    }))
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
      <p>Drag and drop these user stories to arrange them from <strong>least complex</strong> to <strong>most complex</strong>:</p>

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
      <p>Now assign story points to each user story. Use the Fibonacci sequence: <strong>1, 2, 3, 5, 8, 13</strong></p>

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
            <div className="point-selector">
              <label>Points:</label>
              <select
                value={userPoints[story.id] || ''}
                onChange={(e) => handlePointAssignment(story.id, parseInt(e.target.value))}
              >
                <option value="">Select...</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="8">8</option>
                <option value="13">13</option>
              </select>
            </div>
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
    const correctOrder = [...USER_STORIES].sort((a, b) => a.correctOrder - b.correctOrder)

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
                    <span className="complexity-item">Complexity: <strong>{story.complexity}</strong></span>
                    <span className="complexity-item">Effort: <strong>{story.effort}</strong></span>
                    <span className="complexity-item">Uncertainty: <strong>{story.uncertainty}</strong></span>
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
        {!isStarted ? (
          <div className="start-screen">
            <p>
              You'll work with realistic user stories from a typical web application.
              First arrange them by relative complexity, then assign story points (1, 2, 3, 5, 8, 13)
              based on complexity, effort, and uncertainty.
            </p>
            <button className="start-button" onClick={handleStart}>
              Start Exercise
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

      <div className="mindset-reminder">
        <p>
          <strong>Remember:</strong> Notice how a small change in requirements can significantly
          increase complexity. Story points help us account for these nuances.
        </p>
      </div>
    </div>
  )
}

export default Exercise2
