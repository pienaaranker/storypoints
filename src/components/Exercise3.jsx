import { useState } from 'react'
import './Exercise.css'
import './Exercise3.css'

const QUIZ_QUESTIONS = [
  {
    id: 'relative-sizing',
    question: 'Story points are about relative sizing, not absolute time estimation.',
    answer: true,
    explanation: 'Correct! Story points compare the relative effort/complexity between stories, not predict exact time. This makes them more reliable than time estimates.',
    category: 'Core Concept'
  },
  {
    id: 'fibonacci-sequence',
    question: 'The Fibonacci sequence (1, 2, 3, 5, 8, 13...) is used because it reflects the increasing uncertainty in larger estimates.',
    answer: true,
    explanation: 'Exactly! As stories get larger, our uncertainty grows exponentially. Fibonacci gaps reflect this natural uncertainty progression.',
    category: 'Estimation Scale'
  },
  {
    id: 'time-conversion',
    question: 'You should convert story points directly to hours or days for project planning.',
    answer: false,
    explanation: 'Incorrect. Converting story points to time defeats their purpose. Use velocity (points completed per sprint) for planning instead.',
    category: 'Common Mistake'
  },
  {
    id: 'complexity-factors',
    question: 'Story points should only consider the amount of code to write, not technical complexity or uncertainty.',
    answer: false,
    explanation: 'Wrong! Story points consider three factors: complexity (technical difficulty), effort (amount of work), and uncertainty (unknowns and risks).',
    category: 'Sizing Factors'
  },
  {
    id: 'team-consistency',
    question: 'Different teams will assign the same story points to identical stories.',
    answer: false,
    explanation: 'Not necessarily. Each team develops their own baseline and context. A 5-point story for one team might be 3 or 8 for another, and that\'s okay.',
    category: 'Team Context'
  },
  {
    id: 'baseline-importance',
    question: 'Having a consistent baseline story helps maintain relative sizing accuracy.',
    answer: true,
    explanation: 'Absolutely! A reference story (like "changing a password = 3 points") helps the team maintain consistent relative sizing over time.',
    category: 'Best Practice'
  },
  {
    id: 'velocity-planning',
    question: 'Velocity (story points completed per sprint) is more reliable for planning than individual time estimates.',
    answer: true,
    explanation: 'Correct! Velocity smooths out individual estimation errors and provides a reliable team-based planning metric.',
    category: 'Planning'
  },
  {
    id: 'story-splitting',
    question: 'If a story is estimated at 13+ points, it should usually be split into smaller stories.',
    answer: true,
    explanation: 'Yes! Large stories have high uncertainty and risk. Splitting them into smaller, more predictable pieces improves delivery reliability.',
    category: 'Story Management'
  }
]

function Exercise3({ onComplete, onStart, isStarted }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [showQuestionFeedback, setShowQuestionFeedback] = useState(false)
  const [currentStep, setCurrentStep] = useState('quiz') // 'quiz', 'results', 'summary'

  const handleStart = () => {
    onStart()
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setShowQuestionFeedback(false)
    setCurrentStep('quiz')
  }

  const handleAnswer = (answer) => {
    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex]
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))
    setShowQuestionFeedback(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowQuestionFeedback(false)
    } else {
      setCurrentStep('results')
    }
  }

  const handleViewSummary = () => {
    setCurrentStep('summary')
  }

  const handleComplete = () => {
    onComplete()
  }

  const calculateScore = () => {
    const correctAnswers = QUIZ_QUESTIONS.filter(q => userAnswers[q.id] === q.answer).length
    return Math.round((correctAnswers / QUIZ_QUESTIONS.length) * 100)
  }

  const renderQuiz = () => {
    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex]
    const isCorrect = userAnswers[currentQuestion.id] === currentQuestion.answer

    return (
      <div className="quiz-container">
        <div className="quiz-progress">
          <span>Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="question-card">
          <div className="question-category">{currentQuestion.category}</div>
          <h3 className="question-text">{currentQuestion.question}</h3>

          {!showQuestionFeedback && (
            <div className="question-instruction">
              <p className="instruction-text">Select your answer:</p>
            </div>
          )}

          {!showQuestionFeedback ? (
            <div className="answer-buttons">
              <button
                className="answer-button true-button"
                onClick={() => handleAnswer(true)}
              >
                True
              </button>
              <button
                className="answer-button false-button"
                onClick={() => handleAnswer(false)}
              >
                False
              </button>
            </div>
          ) : (
            <div className="question-feedback">
              <div className={`feedback-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                <span className="result-icon">{isCorrect ? '✓' : '✗'}</span>
                <span className="result-text">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
              </div>
              <p className="feedback-explanation">{currentQuestion.explanation}</p>
              <button className="next-button" onClick={handleNextQuestion}>
                {currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderResults = () => {
    const score = calculateScore()
    const correctAnswers = QUIZ_QUESTIONS.filter(q => userAnswers[q.id] === q.answer).length

    return (
      <div className="results-container">
        <div className="results-header">
          <h3>Quiz Complete!</h3>
          <div className="score-display">
            <span className="score-number">{score}%</span>
            <span className="score-details">({correctAnswers} out of {QUIZ_QUESTIONS.length} correct)</span>
          </div>
        </div>

        <div className="results-breakdown">
          <h4>Question Review</h4>
          {QUIZ_QUESTIONS.map((question, index) => {
            const userAnswer = userAnswers[question.id]
            const isCorrect = userAnswer === question.answer

            return (
              <div key={question.id} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-header">
                  <span className="question-number">Q{index + 1}</span>
                  <span className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <span className="result-category">{question.category}</span>
                </div>
                <p className="result-question">{question.question}</p>
                <div className="result-answers">
                  <span>Your answer: <strong>{userAnswer ? 'True' : 'False'}</strong></span>
                  <span>Correct answer: <strong>{question.answer ? 'True' : 'False'}</strong></span>
                </div>
                {!isCorrect && (
                  <p className="result-explanation">{question.explanation}</p>
                )}
              </div>
            )
          })}
        </div>

        <div className="results-actions">
          <button className="summary-button" onClick={handleViewSummary}>
            View Learning Summary
          </button>
        </div>
      </div>
    )
  }

  const renderSummary = () => {
    return (
      <div className="summary-container">
        <div className="summary-header">
          <h3>🎓 Story Point Mastery Summary</h3>
          <p>Congratulations! You've completed your journey through story point fundamentals.</p>
        </div>

        <div className="key-learnings">
          <h4>🔑 Key Principles You've Mastered</h4>

          <div className="learning-section">
            <h5>1. Relative Sizing Foundation</h5>
            <ul>
              <li>Story points compare relative effort, not absolute time</li>
              <li>Use reference stories as baselines for consistency</li>
              <li>Focus on complexity, effort, and uncertainty - not hours</li>
            </ul>
          </div>

          <div className="learning-section">
            <h5>2. The Three Sizing Factors</h5>
            <ul>
              <li><strong>Complexity:</strong> Technical difficulty and architectural challenges</li>
              <li><strong>Effort:</strong> Amount of work required (coding, testing, documentation)</li>
              <li><strong>Uncertainty:</strong> Unknown requirements, risks, and dependencies</li>
            </ul>
          </div>

          <div className="learning-section">
            <h5>3. Fibonacci Scale Wisdom</h5>
            <ul>
              <li>Fibonacci sequence (1, 2, 3, 5, 8, 13) reflects natural uncertainty growth</li>
              <li>Larger numbers indicate exponentially higher uncertainty</li>
              <li>Stories over 13 points should typically be split</li>
            </ul>
          </div>

          <div className="learning-section">
            <h5>4. Team Velocity & Planning</h5>
            <ul>
              <li>Velocity (points per sprint) enables reliable planning</li>
              <li>Each team develops their own point scale and context</li>
              <li>Velocity is more accurate than individual time estimates</li>
            </ul>
          </div>
        </div>

        <div className="practical-tips">
          <h4>💡 Practical Application Tips</h4>
          <div className="tips-grid">
            <div className="tip-card">
              <h6>During Estimation</h6>
              <ul>
                <li>Start with your baseline reference story</li>
                <li>Consider all three factors: complexity, effort, uncertainty</li>
                <li>Discuss differences in team estimates</li>
                <li>Don't overthink - embrace the relative nature</li>
              </ul>
            </div>
            <div className="tip-card">
              <h6>For Planning</h6>
              <ul>
                <li>Use team velocity for sprint planning</li>
                <li>Never convert points directly to hours</li>
                <li>Track velocity trends over multiple sprints</li>
                <li>Adjust planning based on team capacity</li>
              </ul>
            </div>
            <div className="tip-card">
              <h6>Common Pitfalls to Avoid</h6>
              <ul>
                <li>Don't use story points for individual performance</li>
                <li>Avoid comparing velocities between different teams</li>
                <li>Don't change point values after sprint starts</li>
                <li>Resist pressure to provide time commitments</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="completion-message">
          <h4>🚀 You're Ready!</h4>
          <p>
            You now understand the fundamental principles of story point estimation.
            Remember: estimation is a skill that improves with practice. Start applying
            these concepts with your team, and don't be afraid to refine your approach
            as you gain experience.
          </p>
          <p>
            <strong>The goal isn't perfect estimates - it's consistent, relative sizing
            that enables better planning and delivery.</strong>
          </p>
        </div>

        <div className="summary-actions">
          <button className="complete-button" onClick={handleComplete}>
            Complete Story Point Master
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="exercise">
      <div className="exercise-header">
        <h2>Exercise 3: Core Principles Recap</h2>
        <p className="exercise-intro">
          Test your understanding and review the key principles you've learned
          throughout your story point estimation journey.
        </p>
      </div>

      <div className="exercise-content">
        {!isStarted ? (
          <div className="start-screen">
            <p>
              Complete an interactive quiz covering the fundamental principles of story point estimation,
              then review a comprehensive summary of everything you've learned.
            </p>
            <div className="quiz-preview">
              <h4>What You'll Cover:</h4>
              <ul>
                <li>✓ Relative sizing vs. time estimation</li>
                <li>✓ The three factors: complexity, effort, uncertainty</li>
                <li>✓ Fibonacci sequence and scaling</li>
                <li>✓ Team velocity and planning</li>
                <li>✓ Common mistakes to avoid</li>
              </ul>
            </div>
            <button className="start-button" onClick={handleStart}>
              Start Final Quiz
            </button>
          </div>
        ) : (
          <>
            {currentStep === 'quiz' && renderQuiz()}
            {currentStep === 'results' && renderResults()}
            {currentStep === 'summary' && renderSummary()}
          </>
        )}
      </div>

      {!isStarted && (
        <div className="mindset-reminder">
          <p>
            <strong>Remember:</strong> Story points are about relative sizing, not time estimation.
            Focus on complexity, effort, and uncertainty. This quiz will reinforce these core concepts.
          </p>
        </div>
      )}
    </div>
  )
}

export default Exercise3
