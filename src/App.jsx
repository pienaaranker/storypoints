import { useState } from 'react'
import './App.css'

// Import components (will create these next)
import Header from './components/Header'
import Exercise1 from './components/Exercise1'
import Exercise2 from './components/Exercise2'
import Exercise3 from './components/Exercise3'
import Navigation from './components/Navigation'

function App() {
  const [currentExercise, setCurrentExercise] = useState(1)
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
      setCurrentExercise(exerciseNumber + 1)
      setExerciseProgress(prev => ({
        ...prev,
        [exerciseNumber + 1]: { ...prev[exerciseNumber + 1], started: true }
      }))
    }
  }

  const handleExerciseStart = (exerciseNumber) => {
    setExerciseProgress(prev => ({
      ...prev,
      [exerciseNumber]: { ...prev[exerciseNumber], started: true }
    }))
  }

  const navigateToExercise = (exerciseNumber) => {
    setCurrentExercise(exerciseNumber)
  }

  const renderCurrentExercise = () => {
    switch (currentExercise) {
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
      <Header />
      <main className="main-content">
        {renderCurrentExercise()}
      </main>
      <Navigation
        currentExercise={currentExercise}
        exerciseProgress={exerciseProgress}
        onNavigate={navigateToExercise}
      />
    </div>
  )
}

export default App
