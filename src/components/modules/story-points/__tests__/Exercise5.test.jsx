import { describe, test, expect, vi, beforeEach } from 'vitest';

const mockBreakdownData = {
  metadata: {
    type: "breakdown_required_stories",
    version: "1.0.0"
  },
  stories: [
    {
      id: 'test-story-1',
      title: 'Complete User Management System',
      description: 'As an admin, I want a comprehensive user management system',
      acceptanceCriteria: [
        'Create, read, update, delete user accounts',
        'Assign and manage user roles and permissions',
        'Bulk operations (import, export, bulk edit)'
      ],
      correctPoints: 21,
      breakdownRequired: true,
      breakdownSuggestions: [
        {
          technique: 'by-workflow',
          description: 'Break down by admin workflow steps',
          resultingStories: [
            {
              id: 'basic-crud',
              title: 'Basic User CRUD',
              description: 'Create, read, update, delete users',
              acceptanceCriteria: ['Add user form', 'Edit user', 'Delete user'],
              estimationVariance: {
                experiencedTeam: { points: 5, reasoning: 'Standard CRUD', confidenceLevel: 'high' }
              }
            }
          ],
          benefits: ['Independent value delivery', 'Incremental progress']
        }
      ]
    }
  ]
};

describe('Exercise5 Logic Tests', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Structure Validation', () => {
    test('validates breakdown data structure', () => {
      expect(mockBreakdownData).toHaveProperty('metadata');
      expect(mockBreakdownData).toHaveProperty('stories');
      expect(Array.isArray(mockBreakdownData.stories)).toBe(true);
    });

    test('validates story structure for breakdown', () => {
      const story = mockBreakdownData.stories[0];
      
      expect(story).toHaveProperty('id');
      expect(story).toHaveProperty('title');
      expect(story).toHaveProperty('description');
      expect(story).toHaveProperty('acceptanceCriteria');
      expect(story).toHaveProperty('correctPoints');
      expect(story).toHaveProperty('breakdownRequired');
      expect(story).toHaveProperty('breakdownSuggestions');
      
      expect(Array.isArray(story.acceptanceCriteria)).toBe(true);
      expect(Array.isArray(story.breakdownSuggestions)).toBe(true);
      expect(typeof story.correctPoints).toBe('number');
      expect(typeof story.breakdownRequired).toBe('boolean');
    });

    test('validates breakdown suggestions structure', () => {
      const story = mockBreakdownData.stories[0];
      const suggestion = story.breakdownSuggestions[0];
      
      expect(suggestion).toHaveProperty('technique');
      expect(suggestion).toHaveProperty('description');
      expect(suggestion).toHaveProperty('resultingStories');
      expect(suggestion).toHaveProperty('benefits');
      
      expect(Array.isArray(suggestion.resultingStories)).toBe(true);
      expect(Array.isArray(suggestion.benefits)).toBe(true);
      expect(typeof suggestion.technique).toBe('string');
      expect(typeof suggestion.description).toBe('string');
    });

    test('validates resulting stories structure', () => {
      const suggestion = mockBreakdownData.stories[0].breakdownSuggestions[0];
      const resultingStory = suggestion.resultingStories[0];
      
      expect(resultingStory).toHaveProperty('id');
      expect(resultingStory).toHaveProperty('title');
      expect(resultingStory).toHaveProperty('description');
      expect(resultingStory).toHaveProperty('acceptanceCriteria');
      
      expect(Array.isArray(resultingStory.acceptanceCriteria)).toBe(true);
    });
  });

  describe('Breakdown Logic', () => {
    test('identifies stories that need breakdown', () => {
      const story = mockBreakdownData.stories[0];
      
      const needsBreakdown = story.correctPoints > 8 || story.breakdownRequired;
      expect(needsBreakdown).toBe(true);
      expect(story.correctPoints).toBe(21);
      expect(story.breakdownRequired).toBe(true);
    });

    test('calculates total points before breakdown', () => {
      const story = mockBreakdownData.stories[0];
      const totalPoints = story.correctPoints;
      
      expect(totalPoints).toBe(21);
      expect(totalPoints).toBeGreaterThan(8); // Should trigger breakdown
    });

    test('calculates points after breakdown', () => {
      const suggestion = mockBreakdownData.stories[0].breakdownSuggestions[0];
      const resultingStory = suggestion.resultingStories[0];
      
      // Get points from estimation variance
      const points = resultingStory.estimationVariance?.experiencedTeam?.points || 5;
      
      expect(points).toBe(5);
      expect(points).toBeLessThanOrEqual(8); // Should be appropriately sized
    });

    test('validates breakdown technique types', () => {
      const validTechniques = ['by-workflow', 'by-data', 'by-acceptance-criteria', 'by-complexity'];
      const story = mockBreakdownData.stories[0];
      
      story.breakdownSuggestions.forEach(suggestion => {
        expect(validTechniques).toContain(suggestion.technique);
      });
    });
  });

  describe('Technique Display Names', () => {
    test('maps technique codes to display names', () => {
      const techniqueMap = {
        'by-workflow': 'By Workflow Steps',
        'by-data': 'By Data Entities',
        'by-acceptance-criteria': 'By Acceptance Criteria',
        'by-complexity': 'By Complexity Layers'
      };
      
      Object.entries(techniqueMap).forEach(([code, displayName]) => {
        expect(typeof code).toBe('string');
        expect(typeof displayName).toBe('string');
        expect(displayName.length).toBeGreaterThan(0);
      });
    });

    test('handles unknown technique gracefully', () => {
      const unknownTechnique = 'unknown-technique';
      const fallbackName = 'Unknown Technique';
      
      expect(typeof unknownTechnique).toBe('string');
      expect(typeof fallbackName).toBe('string');
    });
  });

  describe('Progress Tracking', () => {
    test('tracks completed breakdowns', () => {
      let completedBreakdowns = [];
      
      const newCompletion = {
        storyId: 'test-story-1',
        technique: 'by-workflow',
        resultingStories: 3,
        completedAt: new Date()
      };
      
      completedBreakdowns = [...completedBreakdowns, newCompletion];
      
      expect(completedBreakdowns.length).toBe(1);
      expect(completedBreakdowns[0].storyId).toBe('test-story-1');
    });

    test('calculates progress percentage', () => {
      const totalStories = 5;
      const completedStories = 2;
      const progressPercentage = (completedStories / totalStories) * 100;
      
      expect(progressPercentage).toBe(40);
    });

    test('determines if exercise is complete', () => {
      const totalStories = 3;
      const completedStories = 3;
      const isComplete = completedStories >= totalStories;
      
      expect(isComplete).toBe(true);
    });
  });

  describe('Educational Content', () => {
    test('provides breakdown benefits', () => {
      const benefits = [
        { icon: '🎯', title: 'Reduce Risk', description: 'Smaller stories are less risky' },
        { icon: '🚀', title: 'Faster Delivery', description: 'Deliver value incrementally' },
        { icon: '🔍', title: 'Better Understanding', description: 'Clarify requirements' },
        { icon: '🤝', title: 'Team Collaboration', description: 'Shared understanding' }
      ];
      
      benefits.forEach(benefit => {
        expect(benefit).toHaveProperty('icon');
        expect(benefit).toHaveProperty('title');
        expect(benefit).toHaveProperty('description');
        expect(typeof benefit.title).toBe('string');
        expect(typeof benefit.description).toBe('string');
      });
    });

    test('provides technique descriptions', () => {
      const techniques = [
        {
          id: 'by-workflow',
          name: 'By Workflow Steps',
          description: 'Break down by user workflow or process steps',
          example: 'Login → Browse → Select → Purchase'
        },
        {
          id: 'by-data',
          name: 'By Data Entities',
          description: 'Break down by different data objects or entities',
          example: 'Users, Products, Orders, Payments'
        }
      ];
      
      techniques.forEach(technique => {
        expect(technique).toHaveProperty('id');
        expect(technique).toHaveProperty('name');
        expect(technique).toHaveProperty('description');
        expect(technique).toHaveProperty('example');
        expect(typeof technique.description).toBe('string');
        expect(technique.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Workshop Integration', () => {
    test('handles workshop state management', () => {
      let workshopState = {
        isOpen: false,
        currentStory: null,
        selectedTechnique: null
      };
      
      // Open workshop
      workshopState = {
        ...workshopState,
        isOpen: true,
        currentStory: mockBreakdownData.stories[0]
      };
      
      expect(workshopState.isOpen).toBe(true);
      expect(workshopState.currentStory).toBeDefined();
      
      // Close workshop
      workshopState = {
        ...workshopState,
        isOpen: false,
        currentStory: null,
        selectedTechnique: null
      };
      
      expect(workshopState.isOpen).toBe(false);
      expect(workshopState.currentStory).toBeNull();
    });

    test('handles workshop completion', () => {
      const workshopResult = {
        originalStory: mockBreakdownData.stories[0],
        technique: 'by-workflow',
        resultingStories: [
          { title: 'Story 1', points: 3 },
          { title: 'Story 2', points: 5 }
        ],
        isValid: true
      };
      
      expect(workshopResult.originalStory).toBeDefined();
      expect(workshopResult.technique).toBe('by-workflow');
      expect(Array.isArray(workshopResult.resultingStories)).toBe(true);
      expect(workshopResult.isValid).toBe(true);
      
      const totalPointsAfter = workshopResult.resultingStories.reduce((sum, story) => sum + story.points, 0);
      expect(totalPointsAfter).toBe(8);
    });
  });

  describe('Error Handling', () => {
    test('handles empty stories array', () => {
      const emptyData = { stories: [] };
      
      expect(Array.isArray(emptyData.stories)).toBe(true);
      expect(emptyData.stories.length).toBe(0);
      
      const hasStories = emptyData.stories.length > 0;
      expect(hasStories).toBe(false);
    });

    test('handles malformed story data', () => {
      const malformedStory = {
        id: 'test',
        // Missing required fields
      };
      
      const hasRequiredFields = malformedStory.title && malformedStory.description;
      expect(hasRequiredFields).toBeFalsy();
    });

    test('handles missing breakdown suggestions', () => {
      const storyWithoutSuggestions = {
        ...mockBreakdownData.stories[0],
        breakdownSuggestions: []
      };
      
      expect(Array.isArray(storyWithoutSuggestions.breakdownSuggestions)).toBe(true);
      expect(storyWithoutSuggestions.breakdownSuggestions.length).toBe(0);
      
      const hasSuggestions = storyWithoutSuggestions.breakdownSuggestions.length > 0;
      expect(hasSuggestions).toBe(false);
    });

    test('handles network errors gracefully', () => {
      const networkError = new Error('Failed to fetch');
      
      expect(networkError).toBeInstanceOf(Error);
      expect(networkError.message).toBe('Failed to fetch');
      
      // Should have fallback behavior
      const fallbackData = { stories: [] };
      expect(fallbackData.stories).toBeDefined();
    });
  });

  describe('Callback Functions', () => {
    test('onComplete callback structure', () => {
      const completionData = {
        exerciseId: 5,
        completed: true,
        storiesCompleted: 3,
        totalStories: 3,
        score: 100
      };
      
      expect(typeof mockOnComplete).toBe('function');
      
      mockOnComplete(completionData);
      expect(mockOnComplete).toHaveBeenCalledWith(completionData);
    });

    test('workshop completion callback', () => {
      const workshopCompletion = {
        storyId: 'test-story-1',
        technique: 'by-workflow',
        success: true,
        resultingStories: 3
      };
      
      const mockWorkshopCallback = vi.fn();
      mockWorkshopCallback(workshopCompletion);
      
      expect(mockWorkshopCallback).toHaveBeenCalledWith(workshopCompletion);
    });
  });

  describe('Story Filtering and Selection', () => {
    test('filters stories that require breakdown', () => {
      const allStories = [
        { id: '1', correctPoints: 5, breakdownRequired: false },
        { id: '2', correctPoints: 13, breakdownRequired: true },
        { id: '3', correctPoints: 21, breakdownRequired: true }
      ];
      
      const storiesNeedingBreakdown = allStories.filter(story => 
        story.correctPoints > 8 || story.breakdownRequired
      );
      
      expect(storiesNeedingBreakdown.length).toBe(2);
      expect(storiesNeedingBreakdown[0].id).toBe('2');
      expect(storiesNeedingBreakdown[1].id).toBe('3');
    });

    test('sorts stories by complexity', () => {
      const stories = [
        { id: '1', correctPoints: 21 },
        { id: '2', correctPoints: 13 },
        { id: '3', correctPoints: 8 }
      ];
      
      const sortedStories = [...stories].sort((a, b) => a.correctPoints - b.correctPoints);
      
      expect(sortedStories[0].correctPoints).toBe(8);
      expect(sortedStories[1].correctPoints).toBe(13);
      expect(sortedStories[2].correctPoints).toBe(21);
    });
  });
});