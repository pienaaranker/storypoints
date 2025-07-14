import { useState, useEffect } from 'react'
import './Exercise.css'
import './Exercise3.css'
import { loadQuizQuestions, getExerciseConfig } from '../../../utils/dataLoader'

function Exercise3({ onComplete, onStart, isStarted }) {
  const [questions, setQuestions] = useState([])
  const [exerciseConfig, setExerciseConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [showQuestionFeedback, setShowQuestionFeedback] = useState(false)
  const [currentStep, setCurrentStep] = useState('quiz') // 'quiz', 'results', 'summary'

  // Load exercise data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [quizQuestions, config] = await Promise.all([
          loadQuizQuestions(),
          getExerciseConfig(3)
        ])

        setQuestions(quizQuestions)
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

  const handleStart = () => {
    onStart()
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setShowQuestionFeedback(false)
    setCurrentStep('quiz')
  }

  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex]
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))
    setShowQuestionFeedback(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
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
    const correctAnswers = questions.filter(q => userAnswers[q.id] === q.answer).length
    return Math.round((correctAnswers / questions.length) * 100)
  }

  const renderQuiz = () => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return null

    const isCorrect = userAnswers[currentQuestion.id] === currentQuestion.answer

    return (
      <div className="quiz-container">
        <div className="quiz-progress">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
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
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderResults = () => {
    const score = calculateScore()
    const correctAnswers = questions.filter(q => userAnswers[q.id] === q.answer).length

    return (
      <div className="results-container">
        <div className="results-header">
          <h3>Quiz Complete!</h3>
          <div className="score-display">
            <span className="score-number">{score}%</span>
            <span className="score-details">({correctAnswers} out of {questions.length} correct)</span>
          </div>
        </div>

        <div className="results-breakdown">
          <h4>Question Review</h4>
          {questions.map((question, index) => {
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
        {loading ? (
          <div className="loading-screen">
            <p>Loading quiz questions...</p>
          </div>
        ) : error ? (
          <div className="error-screen">
            <p>Error loading quiz: {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : !isStarted ? (
          <div className="start-screen">
            <p>
              {exerciseConfig?.ui?.startScreen?.instructions ||
               "Complete an interactive quiz covering the fundamental principles of story point estimation, then review a comprehensive summary of everything you've learned."}
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
            <button className="start-button" onClick={handleStart} disabled={questions.length === 0}>
              {exerciseConfig?.ui?.startScreen?.buttonText || "Start Final Quiz"}
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

      {!isStarted && exerciseConfig?.config?.showMindsetReminder && (
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
