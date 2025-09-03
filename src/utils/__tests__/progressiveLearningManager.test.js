import { describe, it, expect, beforeEach } from 'vitest'
import { 
  ProgressiveLearningManager, 
  COMPLEXITY_LEVELS, 
  LEARNING_CHECKPOINTS,
  SKILL_CRITERIA 
} from '../progressiveLearningManager'

describe('ProgressiveLearningManager', () => {
  let manager

  beforeEach(() => {
    manager = new ProgressiveLearningManager()
  })

  describe('initialization', () => {
    it('should initialize with foundation level', () => {
      expect(manager.getCurrentComplexityLevel()).toBe(COMPLEXITY_LEVELS.FOUNDATION)
    })

    it('should initialize with empty completed checkpoints', () => {
      expect(manager.learnerState.completedCheckpoints).toEqual([])
    })

    it('should initialize with adaptive settings enabled', () => {
      const settings = manager.learnerState.adaptiveSettings
      expect(settings.showHints).toBe(true)
      expect(settings.allowRetries).toBe(true)
      expect(settings.detailedFeedback).toBe(true)
    })
  })

  describe('complexity level progression', () => {
    it('should progress from foundation to intermediate after 1 checkpoint', () => {
      manager.learnerState.completedCheckpoints = [LEARNING_CHECKPOINTS.BASIC_SIZING]
      expect(manager.getCurrentComplexityLevel()).toBe(COMPLEXITY_LEVELS.INTERMEDIATE)
    })

    it('should progress to advanced after 3 checkpoints', () => {
      manager.learnerState.completedCheckpoints = [
        LEARNING_CHECKPOINTS.BASIC_SIZING,
        LEARNING_CHECKPOINTS.RELATIVE_COMPARISON,
        LEARNING_CHECKPOINTS.STORY_BREAKDOWN
      ]
      expect(manager.getCurrentComplexityLevel()).toBe(COMPLEXITY_LEVELS.ADVANCED)
    })

    it('should reach expert level after 4+ checkpoints', () => {
      manager.learnerState.completedCheckpoints = [
        LEARNING_CHECKPOINTS.BASIC_SIZING,
        LEARNING_CHECKPOINTS.RELATIVE_COMPARISON,
        LEARNING_CHECKPOINTS.STORY_BREAKDOWN,
        LEARNING_CHECKPOINTS.TEAM_ESTIMATION
      ]
      expect(manager.getCurrentComplexityLevel()).toBe(COMPLEXITY_LEVELS.EXPERT)
    })
  })

  describe('story complexity determination', () => {
    it('should classify simple stories as foundation level', () => {
      const story = {
        complexityFactors: {
          technical: 'low',
          business: 'low',
          uncertainty: 'low'
        }
      }
      expect(manager.determineStoryComplexity(story)).toBe(COMPLEXITY_LEVELS.FOUNDATION)
    })

    it('should classify stories with breakdown as advanced', () => {
      const story = {
        breakdownRequired: true,
        complexityFactors: {
          technical: 'medium',
          business: 'medium',
          uncertainty: 'medium'
        }
      }
      expect(manager.determineStoryComplexity(story)).toBe(COMPLEXITY_LEVELS.ADVANCED)
    })

    it('should classify high uncertainty stories as expert level', () => {
      const story = {
        breakdownRequired: true,
        estimationVariance: { team1: 5, team2: 13 },
        complexityFactors: {
          technical: 'high',
          business: 'high',
          uncertainty: 'high'
        }
      }
      expect(manager.determineStoryComplexity(story)).toBe(COMPLEXITY_LEVELS.EXPERT)
    })
  })

  describe('story filtering for current level', () => {
    it('should include foundation stories for foundation learner', () => {
      const stories = [
        { id: 1, complexityFactors: { technical: 'low', business: 'low', uncertainty: 'low' } },
        { id: 2, complexityFactors: { technical: 'medium', business: 'low', uncertainty: 'low' } }
      ]
      
      const filtered = manager.getStoriesForCurrentLevel(stories)
      expect(filtered).toHaveLength(2) // Foundation + intermediate (one level above)
    })

    it('should filter out expert stories for foundation learner', () => {
      manager.learnerState.completedCheckpoints = [] // Foundation level
      
      const stories = [
        { 
          id: 1, 
          breakdownRequired: true,
          estimationVariance: { team1: 5, team2: 21 },
          complexityFactors: { technical: 'high', business: 'high', uncertainty: 'high' }
        }
      ]
      
      const filtered = manager.getStoriesForCurrentLevel(stories)
      expect(filtered).toHaveLength(0) // Expert story should be filtered out
    })
  })

  describe('attempt recording and checkpoint completion', () => {
    it('should record successful attempts', () => {
      manager.recordAttempt(LEARNING_CHECKPOINTS.BASIC_SIZING, true, 0.9)
      
      const score = manager.learnerState.skillScores[LEARNING_CHECKPOINTS.BASIC_SIZING]
      expect(score.attempts).toBe(1)
      expect(score.successes).toBe(1)
      expect(score.averageAccuracy).toBe(0.9)
    })

    it('should complete checkpoint when criteria are met', () => {
      const checkpoint = LEARNING_CHECKPOINTS.BASIC_SIZING
      const criteria = SKILL_CRITERIA[checkpoint]
      
      // Record enough successful attempts
      for (let i = 0; i < criteria.minAttempts; i++) {
        manager.recordAttempt(checkpoint, true, criteria.requiredAccuracy + 0.1)
      }
      
      expect(manager.learnerState.completedCheckpoints).toContain(checkpoint)
    })

    it('should not complete checkpoint with insufficient accuracy', () => {
      const checkpoint = LEARNING_CHECKPOINTS.BASIC_SIZING
      const criteria = SKILL_CRITERIA[checkpoint]
      
      // Record attempts with low accuracy
      for (let i = 0; i < criteria.minAttempts; i++) {
        manager.recordAttempt(checkpoint, false, criteria.requiredAccuracy - 0.1)
      }
      
      expect(manager.learnerState.completedCheckpoints).not.toContain(checkpoint)
    })
  })

  describe('adaptive settings updates', () => {
    it('should reduce hints after 2 checkpoints', () => {
      manager.learnerState.completedCheckpoints = [
        LEARNING_CHECKPOINTS.BASIC_SIZING,
        LEARNING_CHECKPOINTS.RELATIVE_COMPARISON
      ]
      manager.updateAdaptiveSettings()
      
      expect(manager.learnerState.adaptiveSettings.showHints).toBe(false)
    })

    it('should disable retries after 3 checkpoints', () => {
      manager.learnerState.completedCheckpoints = [
        LEARNING_CHECKPOINTS.BASIC_SIZING,
        LEARNING_CHECKPOINTS.RELATIVE_COMPARISON,
        LEARNING_CHECKPOINTS.STORY_BREAKDOWN
      ]
      manager.updateAdaptiveSettings()
      
      expect(manager.learnerState.adaptiveSettings.allowRetries).toBe(false)
    })

    it('should disable detailed feedback after 4 checkpoints', () => {
      manager.learnerState.completedCheckpoints = [
        LEARNING_CHECKPOINTS.BASIC_SIZING,
        LEARNING_CHECKPOINTS.RELATIVE_COMPARISON,
        LEARNING_CHECKPOINTS.STORY_BREAKDOWN,
        LEARNING_CHECKPOINTS.TEAM_ESTIMATION
      ]
      manager.updateAdaptiveSettings()
      
      expect(manager.learnerState.adaptiveSettings.detailedFeedback).toBe(false)
    })
  })

  describe('exercise recommendations', () => {
    const mockExercises = [
      { id: 1, type: 'abstract_comparison' },
      { id: 2, type: 'basic_stories' },
      { id: 3, type: 'story_breakdown' },
      { id: 4, type: 'team_estimation' }
    ]

    it('should recommend foundation exercises for new learners', () => {
      const recommended = manager.getNextRecommendedExercise(mockExercises)
      expect(recommended.type).toBe('abstract_comparison')
    })

    it('should recommend exercises targeting incomplete checkpoints', () => {
      // Complete basic sizing, should recommend relative comparison exercise
      manager.learnerState.completedCheckpoints = [LEARNING_CHECKPOINTS.BASIC_SIZING]
      
      const recommended = manager.getNextRecommendedExercise(mockExercises)
      expect(['basic_stories', 'realistic_stories']).toContain(recommended.type)
    })
  })

  describe('progress summary', () => {
    it('should calculate correct progress percentage', () => {
      manager.learnerState.completedCheckpoints = [
        LEARNING_CHECKPOINTS.BASIC_SIZING,
        LEARNING_CHECKPOINTS.RELATIVE_COMPARISON
      ]
      
      const summary = manager.getProgressSummary()
      const totalCheckpoints = Object.keys(SKILL_CRITERIA).length
      const expectedPercentage = Math.round((2 / totalCheckpoints) * 100)
      
      expect(summary.progressPercentage).toBe(expectedPercentage)
      expect(summary.completedCheckpoints).toBe(2)
    })

    it('should identify next checkpoint', () => {
      manager.learnerState.completedCheckpoints = [LEARNING_CHECKPOINTS.BASIC_SIZING]
      
      const summary = manager.getProgressSummary()
      expect(summary.nextCheckpoint).toBe(LEARNING_CHECKPOINTS.RELATIVE_COMPARISON)
    })
  })

  describe('skill assessment', () => {
    it('should provide detailed assessment for all checkpoints', () => {
      const assessment = manager.getSkillAssessment()
      
      Object.keys(SKILL_CRITERIA).forEach(checkpoint => {
        expect(assessment[checkpoint]).toBeDefined()
        expect(assessment[checkpoint]).toHaveProperty('name')
        expect(assessment[checkpoint]).toHaveProperty('description')
        expect(assessment[checkpoint]).toHaveProperty('isCompleted')
        expect(assessment[checkpoint]).toHaveProperty('progress')
      })
    })

    it('should identify skills that need work', () => {
      const checkpoint = LEARNING_CHECKPOINTS.BASIC_SIZING
      
      // Record several attempts with low accuracy
      for (let i = 0; i < 5; i++) {
        manager.recordAttempt(checkpoint, false, 0.3)
      }
      
      const assessment = manager.getSkillAssessment()
      expect(assessment[checkpoint].needsWork).toBe(true)
    })
  })

  describe('state management', () => {
    it('should save and restore state correctly', () => {
      const originalState = {
        currentLevel: COMPLEXITY_LEVELS.INTERMEDIATE,
        completedCheckpoints: [LEARNING_CHECKPOINTS.BASIC_SIZING],
        skillScores: {
          [LEARNING_CHECKPOINTS.BASIC_SIZING]: {
            attempts: 5,
            successes: 4,
            totalAccuracy: 4.2,
            averageAccuracy: 0.84
          }
        },
        adaptiveSettings: {
          showHints: false,
          allowRetries: true,
          detailedFeedback: true
        }
      }
      
      manager.setState(originalState)
      const restoredState = manager.getState()
      
      expect(restoredState).toEqual(originalState)
    })

    it('should reset to initial state', () => {
      // Modify state
      manager.learnerState.completedCheckpoints = [LEARNING_CHECKPOINTS.BASIC_SIZING]
      manager.learnerState.skillScores = { test: { attempts: 5 } }
      
      // Reset
      manager.reset()
      
      expect(manager.learnerState.completedCheckpoints).toEqual([])
      expect(manager.learnerState.skillScores).toEqual({})
      expect(manager.getCurrentComplexityLevel()).toBe(COMPLEXITY_LEVELS.FOUNDATION)
    })
  })
})