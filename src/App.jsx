import { useState } from 'react'
import './App.css'

// Import components
import Home from './components/Home'
import Exercise1 from './components/Exercise1'
import Exercise2 from './components/Exercise2'
import Exercise3 from './components/Exercise3'
import Navigation from './components/Navigation'

function App() {
  const [currentView, setCurrentView] = useState('home') // 'home' or exercise number
  const [exerciseProgress, setExerciseProgress] = useState({
    1: { completed: false, started: false },
    2: { completed: false, started: false },
    3: { completed: false, started: false }
  })

  const handleExerciseComplete = (exerciseNumber) => {
    setExerciseProgress(prev => ({
      ...prev,
      [exerciseNumber]: { ...prev[exerciseNumber], completed: true }
    }))

    // Auto-advance to next exercise if not the last one
    if (exerciseNumber < 3) {
      setCurrentView(exerciseNumber + 1)
      setExerciseProgress(prev => ({
        ...prev,
        [exerciseNumber + 1]: { ...prev[exerciseNumber + 1], started: true }
      }))
    } else {
      // After completing the last exercise, return to home
      setCurrentView('home')
    }
  }

  const handleExerciseStart = (exerciseNumber) => {
    setExerciseProgress(prev => ({
      ...prev,
      [exerciseNumber]: { ...prev[exerciseNumber], started: true }
    }))
  }

  const navigateToExercise = (exerciseNumber) => {
    setCurrentView(exerciseNumber)
  }

  const navigateToHome = () => {
    setCurrentView('home')
  }

  const startFresh = () => {
    setExerciseProgress({
      1: { completed: false, started: false },
      2: { completed: false, started: false },
      3: { completed: false, started: false }
    })
    setCurrentView('home')
  }

  const renderCurrentView = () => {
    if (currentView === 'home') {
      return (
        <Home
          exerciseProgress={exerciseProgress}
          onNavigate={navigateToExercise}
          onStartFresh={startFresh}
        />
      )
    }

    // Render exercise based on currentView number
    switch (currentView) {
      case 1:
        return (
          <Exercise1
            onComplete={() => handleExerciseComplete(1)}
            onStart={() => handleExerciseStart(1)}
            isStarted={exerciseProgress[1].started}
          />
        )
      case 2:
        return (
          <Exercise2
            onComplete={() => handleExerciseComplete(2)}
            onStart={() => handleExerciseStart(2)}
            isStarted={exerciseProgress[2].started}
          />
        )
      case 3:
        return (
          <Exercise3
            onComplete={() => handleExerciseComplete(3)}
            onStart={() => handleExerciseStart(3)}
            isStarted={exerciseProgress[3].started}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      <main className="main-content">
        {renderCurrentView()}
      </main>
      {currentView !== 'home' && (
        <Navigation
          currentExercise={currentView}
          exerciseProgress={exerciseProgress}
          onNavigate={navigateToExercise}
          onNavigateHome={navigateToHome}
        />
      )}
    </div>
  )
}

export default App
