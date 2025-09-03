import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import LearningProgressTracker from '../LearningProgressTracker'
import { SKILL_CRITERIA, LEARNING_CHECKPOINTS } from '../../../utils/progressiveLearningManager'

describe('LearningProgressTracker', () => {
  const mockProgressSummary = {
    currentLevel: 'intermediate',
    completedCheckpoints: 2,
    totalCheckpoints: 5,
    progressPercentage: 40,
    nextCheckpoint: LEARNING_CHECKPOINTS.STORY_BREAKDOWN,
    adaptiveSettings: {
      showHints: true,
      allowRetries: true,
      detailedFeedback: false
    }
  }

  const mockSkillAssessment = {
    [LEARNING_CHECKPOINTS.BASIC_SIZING]: {
      name: 'Basic Sizing',
      description: 'Ability to assign appropriate story points to clear, simple stories',
      attempts: 8,
      successes: 7,
      averageAccuracy: 0.85,
      isCompleted: true,
      progress: 1,
      needsWork: false
    },
    [LEARNING_CHECKPOINTS.RELATIVE_COMPARISON]: {
      name: 'Relative Comparison',
      description: 'Consistent relative sizing across different story types',
      attempts: 6,
      successes: 4,
      averageAccuracy: 0.78,
      isCompleted: true,
      progress: 0.75,
      needsWork: false
    },
    [LEARNING_CHECKPOINTS.STORY_BREAKDOWN]: {
      name: 'Story Breakdown',
      description: 'Identifying when stories need breakdown and applying techniques',
      attempts: 3,
      successes: 1,
      averageAccuracy: 0.45,
      isCompleted: false,
      progress: 0.5,
      needsWork: true
    },
    [LEARNING_CHECKPOINTS.TEAM_ESTIMATION]: {
      name: 'Team Estimation',
      description: 'Understanding collaborative estimation dynamics',
      attempts: 0,
      successes: 0,
      averageAccuracy: 0,
      isCompleted: false,
      progress: 0,
      needsWork: false
    },
    [LEARNING_CHECKPOINTS.UNCERTAINTY_HANDLING]: {
      name: 'Uncertainty Handling',
      description: 'Managing high-uncertainty and complex estimation scenarios',
      attempts: 0,
      successes: 0,
      averageAccuracy: 0,
      isCompleted: false,
      progress: 0,
      needsWork: false
    }
  }

  const mockOnCheckpointClick = vi.fn()

  beforeEach(() => {
    mockOnCheckpointClick.mockClear()
  })

  describe('rendering', () => {
    it('should render progress overview correctly', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
        />
      )

      expect(screen.getByText('Learning Progress')).toBeInTheDocument()
      expect(screen.getByText('40%')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('/ 5')).toBeInTheDocument()
      expect(screen.getByText('Checkpoints')).toBeInTheDocument()
    })

    it('should display current level badge', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
        />
      )

      expect(screen.getByText('Intermediate')).toBeInTheDocument()
    })

    it('should show next checkpoint information', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
        />
      )

      expect(screen.getByText('Next Checkpoint')).toBeInTheDocument()
      expect(screen.getByText('Story Breakdown')).toBeInTheDocument()
    })

    it('should render all learning checkpoints', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
        />
      )

      Object.keys(SKILL_CRITERIA).forEach(checkpoint => {
        const criteria = SKILL_CRITERIA[checkpoint]
        expect(screen.getByText(criteria.name)).toBeInTheDocument()
      })
    })
  })

  describe('checkpoint status indicators', () => {
    it('should show completed status for finished checkpoints', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
        />
      )

      const basicSizingCheckpoint = screen.getByText('Basic Sizing').closest('.checkpoint-item')
      expect(basicSizingCheckpoint).toHaveClass('completed')
      expect(basicSizingCheckpoint.querySelector('.checkpoint-status-text')).toHaveTextContent('Completed')
    })

    it('should show needs work status for struggling checkpoints', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
        />
      )

      const storyBreakdownCheckpoint = screen.getByText('Story Breakdown').closest('.checkpoint-item')
      expect(storyBreakdownCheckpoint).toHaveClass('needs-work')
      expect(storyBreakdownCheckpoint.querySelector('.checkpoint-status-text')).toHaveTextContent('Needs Work')
    })

    it('should show in progress status for started checkpoints', () => {
      const modifiedAssessment = {
        ...mockSkillAssessment,
        [LEARNING_CHECKPOINTS.STORY_BREAKDOWN]: {
          ...mockSkillAssessment[LEARNING_CHECKPOINTS.STORY_BREAKDOWN],
          needsWork: false
        }
      }

      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={modifiedAssessment}
          onCheckpointClick={mockOnCheckpointClick}
        />
      )

      const storyBreakdownCheckpoint = screen.getByText('Story Breakdown').closest('.checkpoint-item')
      expect(storyBreakdownCheckpoint).toHaveClass('in-progress')
      expect(storyBreakdownCheckpoint.querySelector('.checkpoint-status-text')).toHaveTextContent('In Progress')
    })

    it('should show not started status for untouched checkpoints', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
        />
      )

      const teamEstimationCheckpoint = screen.getByText('Team Estimation').closest('.checkpoint-item')
      expect(teamEstimationCheckpoint).not.toHaveClass('completed')
      expect(teamEstimationCheckpoint).not.toHaveClass('in-progress')
      expect(teamEstimationCheckpoint).not.toHaveClass('needs-work')
      expect(teamEstimationCheckpoint.querySelector('.checkpoint-status-text')).toHaveTextContent('Not Started')
    })
  })

  describe('detailed view', () => {
    it('should show detailed metrics when showDetailed is true', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
          showDetailed={true}
        />
      )

      expect(screen.getByText('85%')).toBeInTheDocument() // Basic sizing accuracy
      expect(screen.getByText('8 / 5')).toBeInTheDocument() // Basic sizing attempts
    })

    it('should hide detailed metrics when showDetailed is false', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
          showDetailed={false}
        />
      )

      expect(screen.queryByText('85%')).not.toBeInTheDocument()
      expect(screen.queryByText('8 / 5')).not.toBeInTheDocument()
    })

    it('should show adaptive settings when detailed view is enabled', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
          showDetailed={true}
        />
      )

      expect(screen.getByText('Current Learning Support')).toBeInTheDocument()
      expect(screen.getByText('Hints')).toBeInTheDocument()
      expect(screen.getByText('Retries')).toBeInTheDocument()
      expect(screen.getByText('Detailed Feedback')).toBeInTheDocument()
    })
  })

  describe('adaptive settings display', () => {
    it('should show enabled settings correctly', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
          showDetailed={true}
        />
      )

      const hintsItem = screen.getByText('Hints').closest('.setting-item')
      const retriesItem = screen.getByText('Retries').closest('.setting-item')
      const feedbackItem = screen.getByText('Detailed Feedback').closest('.setting-item')

      expect(hintsItem).toHaveClass('enabled')
      expect(retriesItem).toHaveClass('enabled')
      expect(feedbackItem).toHaveClass('disabled') // detailedFeedback is false in mock
    })
  })

  describe('interactions', () => {
    it('should call onCheckpointClick when checkpoint is clicked', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
        />
      )

      const basicSizingCheckpoint = screen.getByText('Basic Sizing').closest('.checkpoint-item')
      fireEvent.click(basicSizingCheckpoint)

      expect(mockOnCheckpointClick).toHaveBeenCalledWith(LEARNING_CHECKPOINTS.BASIC_SIZING)
    })

    it('should not call onCheckpointClick when onCheckpointClick is not provided', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
        />
      )

      const basicSizingCheckpoint = screen.getByText('Basic Sizing').closest('.checkpoint-item')
      
      // Should not throw error when clicked without callback
      expect(() => {
        fireEvent.click(basicSizingCheckpoint)
      }).not.toThrow()
    })
  })

  describe('level badge colors', () => {
    it('should render different level badges with appropriate styling', () => {
      const levels = ['foundation', 'intermediate', 'advanced', 'expert']
      
      levels.forEach(level => {
        const progressSummary = { ...mockProgressSummary, currentLevel: level }
        
        const { rerender } = render(
          <LearningProgressTracker
            progressSummary={progressSummary}
            skillAssessment={mockSkillAssessment}
            onCheckpointClick={mockOnCheckpointClick}
          />
        )

        const levelBadge = document.querySelector('.level-badge')
        expect(levelBadge).toBeInTheDocument()
        expect(levelBadge).toHaveStyle('background-color: rgb(76, 175, 80)') // Default foundation color or specific level color

        rerender(<div />) // Clear for next iteration
      })
    })
  })

  describe('progress circle animation', () => {
    it('should set correct stroke-dasharray for progress circle', () => {
      render(
        <LearningProgressTracker
          progressSummary={mockProgressSummary}
          skillAssessment={mockSkillAssessment}
          onCheckpointClick={mockOnCheckpointClick}
        />
      )

      const progressCircle = document.querySelector('.circle')
      expect(progressCircle).toHaveAttribute('stroke-dasharray', '40, 100')
    })
  })
})