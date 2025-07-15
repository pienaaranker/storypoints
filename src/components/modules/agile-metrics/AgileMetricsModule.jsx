import React from 'react'
import ModuleRouter from '../../common/ModuleRouter'

/**
 * AgileMetricsModule wrapper component
 * This component serves as the entry point for the agile-metrics module
 * and handles module-specific logic and routing
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentExercise - Current exercise ID (null for module overview)
 * @param {Object} props.moduleProgress - Module progress state
 * @param {Function} props.onExerciseComplete - Exercise completion callback
 * @param {Function} props.onExerciseStart - Exercise start callback
 * @param {Function} props.onNavigate - Navigation callback
 */
function AgileMetricsModule({
  currentExercise,
  moduleProgress = {},
  onExerciseComplete,
  onExerciseStart,
  onNavigate
}) {
  const moduleId = 'agile-metrics'

  /**
   * Handles exercise completion with module-specific logic
   * @param {string} moduleId - Module identifier
   * @param {number} exerciseId - Exercise identifier
   */
  const handleExerciseComplete = (moduleId, exerciseId) => {
    // Add any agile-metrics specific completion logic here
    console.log(`Agile Metrics Module: Exercise ${exerciseId} completed`)
    
    // Track completion of advanced metrics exercises
    if (exerciseId === 4) {
      console.log('Agile Metrics Module: All exercises completed - user is now a metrics expert!')
    }
    
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
    // Add any agile-metrics specific start logic here
    console.log(`Agile Metrics Module: Starting Exercise ${exerciseId}`)
    
    // Provide context for advanced exercises
    const exerciseContext = {
      1: 'Velocity Analysis - Focus on planning, not performance measurement',
      2: 'Burndown Analysis - Develop diagnostic skills for team behavior',
      3: 'Cycle Time - Think systems and flow, not individual productivity',
      4: 'Team Health - Balance performance with sustainability'
    }
    
    console.log(`Context: ${exerciseContext[exerciseId]}`)
    
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
    // Add any agile-metrics specific navigation logic here
    console.log(`Agile Metrics Module: Navigating to ${type}`, { moduleId, exerciseId })
    
    if (onNavigate) {
      onNavigate(type, moduleId, exerciseId)
    }
  }

  return (
    <div className="agile-metrics-module">
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

export default AgileMetricsModule
