/**
 * Unit tests for story data validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  validateStoryPoints,
  validateTeamContext,
  validateStoryBreakdown,
  validateStory,
  validateNonEstimableWork,
  validateStoryDataset,
  validateStoryDistribution
} from '../storyValidation.js';
import type {
  Story,
  TeamContext,
  NonEstimableWork,
  StoryDataset
} from '../../types/story.js';

describe('validateStoryPoints', () => {
  it('should accept valid Fibonacci story points', () => {
    const validPoints = [1, 2, 3, 5, 8, 13, 21, 34];
    
    validPoints.forEach(points => {
      const result = validateStoryPoints(points);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  it('should reject non-Fibonacci values', () => {
    const invalidPoints = [4, 6, 7, 9, 10, 15];
    
    invalidPoints.forEach(points => {
      const result = validateStoryPoints(points);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_POINTS_VALUE')).toBe(true);
    });
  });

  it('should accept large story points (warnings handled elsewhere)', () => {
    const largePoints = [13, 21, 34];
    
    largePoints.forEach(points => {
      const result = validateStoryPoints(points);
      expect(result.isValid).toBe(true);
      // Large points are valid Fibonacci numbers, warnings are handled at story level
    });
  });

  it('should reject negative or non-integer values', () => {
    const invalidValues = [-1, 0.5, 3.14, NaN];
    
    invalidValues.forEach(points => {
      const result = validateStoryPoints(points);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_POINTS_TYPE')).toBe(true);
    });
  });
});

describe('validateTeamContext', () => {
  const validTeamContext: TeamContext = {
    experienceLevel: 'intermediate',
    domainKnowledge: 'medium',
    technicalStack: 'familiar',
    teamSize: 5,
    workingAgreements: ['Definition of Done', 'Code Review Process']
  };

  it('should accept valid team context', () => {
    const result = validateTeamContext(validTeamContext);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid experience levels', () => {
    const invalidContext = { ...validTeamContext, experienceLevel: 'expert' as any };
    const result = validateTeamContext(invalidContext);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_EXPERIENCE_LEVEL')).toBe(true);
  });

  it('should reject invalid domain knowledge levels', () => {
    const invalidContext = { ...validTeamContext, domainKnowledge: 'expert' as any };
    const result = validateTeamContext(invalidContext);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_DOMAIN_KNOWLEDGE')).toBe(true);
  });

  it('should reject invalid technical stack familiarity', () => {
    const invalidContext = { ...validTeamContext, technicalStack: 'unknown' as any };
    const result = validateTeamContext(invalidContext);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_TECH_STACK')).toBe(true);
  });

  it('should reject invalid team sizes', () => {
    const invalidSizes = [0, -1, 15, 3.5];
    
    invalidSizes.forEach(size => {
      const invalidContext = { ...validTeamContext, teamSize: size };
      const result = validateTeamContext(invalidContext);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_TEAM_SIZE')).toBe(true);
    });
  });

  it('should reject invalid working agreements', () => {
    const invalidContext = { ...validTeamContext, workingAgreements: 'not an array' as any };
    const result = validateTeamContext(invalidContext);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_WORKING_AGREEMENTS')).toBe(true);
  });
});describe
('validateStoryBreakdown', () => {
  const baseStory: Story = {
    id: 'test-story',
    title: 'Test Story',
    description: 'A test story',
    acceptanceCriteria: ['Criterion 1'],
    teamContext: {
      experienceLevel: 'intermediate',
      domainKnowledge: 'medium',
      technicalStack: 'familiar',
      teamSize: 5,
      workingAgreements: []
    },
    estimationVariance: {
      team1: { points: 5, reasoning: 'Standard complexity', confidenceLevel: 'medium' }
    },
    breakdownRequired: false,
    breakdownSuggestions: [],
    complexityFactors: {
      technical: 'medium',
      business: 'medium',
      integration: 'low',
      uncertainty: 'low'
    }
  };

  it('should require breakdown for large stories', () => {
    const largeStory = {
      ...baseStory,
      estimationVariance: {
        team1: { points: 13, reasoning: 'Very complex', confidenceLevel: 'low' }
      },
      breakdownRequired: false
    };

    const result = validateStoryBreakdown(largeStory);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_BREAKDOWN_REQUIREMENT')).toBe(true);
  });

  it('should require breakdown suggestions when breakdown is required', () => {
    const storyNeedingBreakdown = {
      ...baseStory,
      breakdownRequired: true,
      breakdownSuggestions: []
    };

    const result = validateStoryBreakdown(storyNeedingBreakdown);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_BREAKDOWN_SUGGESTIONS')).toBe(true);
  });

  it('should validate breakdown technique types', () => {
    const storyWithInvalidBreakdown = {
      ...baseStory,
      breakdownRequired: true,
      breakdownSuggestions: [{
        technique: 'invalid-technique' as any,
        description: 'Invalid breakdown',
        resultingStories: [],
        benefits: []
      }]
    };

    const result = validateStoryBreakdown(storyWithInvalidBreakdown);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_BREAKDOWN_TECHNIQUE')).toBe(true);
  });

  it('should validate that breakdown results in appropriately sized stories', () => {
    const storyWithLargeBreakdownResults = {
      ...baseStory,
      breakdownRequired: true,
      breakdownSuggestions: [{
        technique: 'by-workflow' as const,
        description: 'Break down by workflow',
        resultingStories: [{
          id: 'result-1',
          title: 'Large Result Story',
          description: 'Still too large',
          acceptanceCriteria: ['Criterion'],
          teamContext: baseStory.teamContext,
          estimationVariance: {
            team1: { points: 13, reasoning: 'Still complex', confidenceLevel: 'medium' }
          },
          breakdownRequired: false,
          complexityFactors: baseStory.complexityFactors
        }],
        benefits: ['Better understanding']
      }]
    };

    const result = validateStoryBreakdown(storyWithLargeBreakdownResults);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'BREAKDOWN_RESULT_TOO_LARGE')).toBe(true);
  });
});

describe('validateStory', () => {
  const validStory: Story = {
    id: 'valid-story',
    title: 'Valid Story',
    description: 'A valid story for testing',
    acceptanceCriteria: ['Must do something', 'Must handle errors'],
    teamContext: {
      experienceLevel: 'intermediate',
      domainKnowledge: 'medium',
      technicalStack: 'familiar',
      teamSize: 5,
      workingAgreements: ['Definition of Done']
    },
    estimationVariance: {
      juniorTeam: { points: 8, reasoning: 'Complex for juniors', confidenceLevel: 'low' },
      seniorTeam: { points: 5, reasoning: 'Manageable for seniors', confidenceLevel: 'high' }
    },
    breakdownRequired: false,
    breakdownSuggestions: [],
    complexityFactors: {
      technical: 'medium',
      business: 'low',
      integration: 'medium',
      uncertainty: 'low'
    }
  };

  it('should accept valid story', () => {
    const result = validateStory(validStory);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject story without required fields', () => {
    const incompleteStory = { ...validStory, id: '', title: '', description: '' };
    const result = validateStory(incompleteStory);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_STORY_ID')).toBe(true);
    expect(result.errors.some(e => e.code === 'MISSING_STORY_TITLE')).toBe(true);
    expect(result.errors.some(e => e.code === 'MISSING_STORY_DESCRIPTION')).toBe(true);
  });

  it('should reject story without acceptance criteria', () => {
    const storyWithoutAC = { ...validStory, acceptanceCriteria: [] };
    const result = validateStory(storyWithoutAC);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_ACCEPTANCE_CRITERIA')).toBe(true);
  });

  it('should reject story without estimation variance', () => {
    const storyWithoutEstimation = { ...validStory, estimationVariance: {} };
    const result = validateStory(storyWithoutEstimation);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_ESTIMATION_VARIANCE')).toBe(true);
  });

  it('should validate complexity factors', () => {
    const storyWithInvalidComplexity = {
      ...validStory,
      complexityFactors: {
        technical: 'invalid' as any,
        business: 'low',
        integration: 'medium',
        uncertainty: 'high'
      }
    };

    const result = validateStory(storyWithInvalidComplexity);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_COMPLEXITY_LEVEL')).toBe(true);
  });
});

describe('validateNonEstimableWork', () => {
  const validWork: NonEstimableWork = {
    type: 'spike',
    title: 'Research OAuth Integration',
    timeBox: '4 hours',
    learningObjective: 'Understand OAuth complexity',
    acceptanceCriteria: ['Research completed', 'Findings documented'],
    transitionToStories: ['Implement OAuth', 'Handle OAuth errors'],
    reasoning: 'Need to understand implementation complexity'
  };

  it('should accept valid non-estimable work', () => {
    const result = validateNonEstimableWork(validWork);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid work types', () => {
    const invalidWork = { ...validWork, type: 'invalid-type' as any };
    const result = validateNonEstimableWork(invalidWork);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_WORK_TYPE')).toBe(true);
  });

  it('should require all mandatory fields', () => {
    const incompleteWork = {
      ...validWork,
      title: '',
      timeBox: '',
      learningObjective: '',
      acceptanceCriteria: []
    };

    const result = validateNonEstimableWork(incompleteWork);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_TITLE')).toBe(true);
    expect(result.errors.some(e => e.code === 'MISSING_TIME_BOX')).toBe(true);
    expect(result.errors.some(e => e.code === 'MISSING_LEARNING_OBJECTIVE')).toBe(true);
    expect(result.errors.some(e => e.code === 'MISSING_ACCEPTANCE_CRITERIA')).toBe(true);
  });
});

describe('validateStoryDataset', () => {
  const validDataset: StoryDataset = {
    metadata: {
      exerciseId: 1,
      type: 'user_stories',
      version: '2.0.0',
      description: 'Enhanced story examples'
    },
    stories: [{
      id: 'story-1',
      title: 'Test Story',
      description: 'A test story',
      acceptanceCriteria: ['Must work'],
      teamContext: {
        experienceLevel: 'intermediate',
        domainKnowledge: 'medium',
        technicalStack: 'familiar',
        teamSize: 5,
        workingAgreements: []
      },
      estimationVariance: {
        team1: { points: 3, reasoning: 'Simple', confidenceLevel: 'high' }
      },
      breakdownRequired: false,
      breakdownSuggestions: [],
      complexityFactors: {
        technical: 'low',
        business: 'low',
        integration: 'low',
        uncertainty: 'low'
      }
    }]
  };

  it('should accept valid dataset', () => {
    const result = validateStoryDataset(validDataset);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject dataset without metadata', () => {
    const invalidDataset = { ...validDataset, metadata: undefined as any };
    const result = validateStoryDataset(invalidDataset);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_METADATA')).toBe(true);
  });

  it('should validate exercise ID', () => {
    const invalidDataset = {
      ...validDataset,
      metadata: { ...validDataset.metadata, exerciseId: -1 }
    };
    const result = validateStoryDataset(invalidDataset);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_EXERCISE_ID')).toBe(true);
  });
});

describe('validateStoryDistribution', () => {
  it('should accept good distribution (majority small stories)', () => {
    const stories: Story[] = Array(7).fill(null).map((_, i) => ({
      id: `story-${i}`,
      title: `Story ${i}`,
      description: 'Test story',
      acceptanceCriteria: ['Must work'],
      teamContext: {
        experienceLevel: 'intermediate',
        domainKnowledge: 'medium',
        technicalStack: 'familiar',
        teamSize: 5,
        workingAgreements: []
      },
      estimationVariance: {
        team1: { points: i < 5 ? 3 : 5, reasoning: 'Test', confidenceLevel: 'medium' }
      },
      breakdownRequired: false,
      breakdownSuggestions: [],
      complexityFactors: {
        technical: 'low',
        business: 'low',
        integration: 'low',
        uncertainty: 'low'
      }
    }));

    const result = validateStoryDistribution(stories);
    expect(result.isValid).toBe(true);
  });

  it('should reject poor distribution (too many large stories)', () => {
    const stories: Story[] = Array(10).fill(null).map((_, i) => ({
      id: `story-${i}`,
      title: `Story ${i}`,
      description: 'Test story',
      acceptanceCriteria: ['Must work'],
      teamContext: {
        experienceLevel: 'intermediate',
        domainKnowledge: 'medium',
        technicalStack: 'familiar',
        teamSize: 5,
        workingAgreements: []
      },
      estimationVariance: {
        team1: { points: 13, reasoning: 'Large story', confidenceLevel: 'low' }
      },
      breakdownRequired: false,
      breakdownSuggestions: [],
      complexityFactors: {
        technical: 'high',
        business: 'high',
        integration: 'high',
        uncertainty: 'high'
      }
    }));

    const result = validateStoryDistribution(stories);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'POOR_SIZE_DISTRIBUTION')).toBe(true);
    expect(result.errors.some(e => e.code === 'MISSING_BREAKDOWN_GUIDANCE')).toBe(true);
  });

  it('should handle empty story array', () => {
    const result = validateStoryDistribution([]);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});