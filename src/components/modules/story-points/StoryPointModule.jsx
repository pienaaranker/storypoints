import React from 'react'
import ModuleRouter from '../../common/ModuleRouter'

/**
 * StoryPointModule wrapper component
 * This component serves as the entry point for the story-points module
 * and handles module-specific logic and routing
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentExercise - Current exercise ID (null for module overview)
 * @param {Object} props.moduleProgress - Module progress state
 * @param {Function} props.onExerciseComplete - Exercise completion callback
 * @param {Function} props.onExerciseStart - Exercise start callback
 * @param {Function} props.onNavigate - Navigation callback
 */
function StoryPointModule({
  currentExercise,
  moduleProgress = {},
  onExerciseComplete,
  onExerciseStart,
  onNavigate
}) {
  const moduleId = 'story-points'

  /**
   * Handles exercise completion with module-specific logic
   * @param {string} moduleId - Module identifier
   * @param {number} exerciseId - Exercise identifier
   */
  const handleExerciseComplete = (moduleId, exerciseId) => {
    // Add any story-points specific completion logic here
    console.log(`Story Points Module: Exercise ${exerciseId} completed`)
    
    if (onExerciseComplete) {
      onExerciseComplete(moduleId, exerciseId)
    }
  }

  /**
   * Handles exercise start with module-specific logic
   * @param {string} moduleId - Module identifier
   * @param {number} exerciseId - Exercise identifier
   */
  const handleExerciseStart = (moduleId, exerciseId) => {
    // Add any story-points specific start logic here
    console.log(`Story Points Module: Exercise ${exerciseId} started`)
    
    if (onExerciseStart) {
      onExerciseStart(moduleId, exerciseId)
    }
  }

  /**
   * Handles navigation with module-specific logic
   * @param {string} type - Navigation type ('home', 'module', 'exercise')
   * @param {string} moduleId - Module identifier
   * @param {number} exerciseId - Exercise identifier (optional)
   */
  const handleNavigate = (type, moduleId, exerciseId) => {
    // Add any story-points specific navigation logic here
    console.log(`Story Points Module: Navigating to ${type}`, { moduleId, exerciseId })
    
    if (onNavigate) {
      onNavigate(type, moduleId, exerciseId)
    }
  }

  return (
    <div className="story-point-module">
      <ModuleRouter
        moduleId={moduleId}
        currentExercise={currentExercise}
        moduleProgress={moduleProgress}
        onExerciseComplete={handleExerciseComplete}
        onExerciseStart={handleExerciseStart}
        onNavigate={handleNavigate}
      />
    </div>
  )
}

export default StoryPointModule
