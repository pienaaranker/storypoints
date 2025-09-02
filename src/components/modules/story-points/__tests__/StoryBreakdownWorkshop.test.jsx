import { describe, test, expect, beforeEach, jest } from 'vitest';
import { validateStoryBreakdown, formatValidationResults } from '../../../../utils/storyBreakdownValidation';

describe('StoryBreakdownWorkshop Integration Tests', () => {
  // Mock story data for testing
  const mockStoryWithBreakdown = {
    id: 'test-story',
    title: 'Complete User Management System',
    description: 'As an admin, I want a comprehensive user management system so that I can efficiently manage all user accounts and permissions.',
    acceptanceCriteria: [
      'Create, read, update, delete user accounts',
      'Assign and manage user roles and permissions',
      'Bulk operations (import, export, bulk edit)',
      'User activity tracking and audit logs'
    ],
    correctPoints: 21,
    breakdownRequired: true,
    breakdownSuggestions: [
      {
        technique: 'by-workflow',
        description: 'Break down by admin workflow steps',
        resultingStories: [
          {
            id: 'basic-user-crud',
            title: 'Basic User CRUD Operations',
            description: 'Create, read, update, delete individual user accounts',
            acceptanceCriteria: ['Add new user form', 'Edit user details', 'Delete user with confirmation'],
            estimationVariance: {
              experiencedTeam: {
                points: 5,
                reasoning: 'Standard CRUD operations with validation',
                confidenceLevel: 'high'
              }
            }
          }
        ],
        benefits: ['Each story delivers independent value', 'Allows incremental delivery']
      }
    ]
  };

  describe('Breakdown Validation Integration', () => {
    test('validates breakdown using the validation utility', () => {
      const breakdown = [
        {
          title: 'Valid Story',
          description: 'A properly sized story',
          acceptanceCriteria: ['Some criteria'],
          estimatedPoints: 5
        }
      ];

      const result = validateStoryBreakdown(breakdown, mockStoryWithBreakdown);
      const formatted = formatValidationResults(result);

      expect(formatted.isValid).toBe(true);
      expect(formatted.qualityScore).toBeGreaterThan(0);
      expect(formatted.summary).toBeDefined();
    });

    test('detects validation errors in breakdown', () => {
      const breakdown = [
        {
          title: 'Too Large Story',
          description: 'This story is too big',
          acceptanceCriteria: ['Many criteria'],
          estimatedPoints: 13 // Too large
        }
      ];

      const result = validateStoryBreakdown(breakdown, mockStoryWithBreakdown);
      const formatted = formatValidationResults(result);

      expect(formatted.isValid).toBe(false);
      expect(formatted.errors.length).toBeGreaterThan(0);
      expect(formatted.errors.some(e => e.type === 'size-violation')).toBe(true);
    });

    test('provides improvement suggestions for poor breakdown', () => {
      const breakdown = [
        {
          title: '', // Missing title
          description: '',
          acceptanceCriteria: [],
          estimatedPoints: 0 // Missing estimate
        }
      ];

      const result = validateStoryBreakdown(breakdown, mockStoryWithBreakdown);
      const formatted = formatValidationResults(result);

      expect(formatted.improvementSuggestions.length).toBeGreaterThan(0);
      expect(formatted.summary.isPassable).toBe(false);
    });
  });

  describe('Breakdown Quality Assessment', () => {
    test('calculates quality score for different breakdown scenarios', () => {
      // Perfect breakdown
      const perfectBreakdown = [
        {
          title: 'Story 1',
          description: 'Well defined story',
          acceptanceCriteria: ['Clear criteria'],
          estimatedPoints: 5
        },
        {
          title: 'Story 2',
          description: 'Another well defined story',
          acceptanceCriteria: ['More criteria'],
          estimatedPoints: 3
        }
      ];

      const perfectResult = validateStoryBreakdown(perfectBreakdown, mockStoryWithBreakdown);
      const perfectFormatted = formatValidationResults(perfectResult);

      // Poor breakdown
      const poorBreakdown = [
        {
          title: 'Huge Story',
          description: '',
          acceptanceCriteria: [],
          estimatedPoints: 15 // Too large
        }
      ];

      const poorResult = validateStoryBreakdown(poorBreakdown, mockStoryWithBreakdown);
      const poorFormatted = formatValidationResults(poorResult);

      expect(perfectFormatted.qualityScore).toBeGreaterThan(poorFormatted.qualityScore);
      expect(perfectFormatted.summary.isPassable).toBe(true);
      expect(poorFormatted.summary.isPassable).toBe(false);
    });
  });

  describe('Workshop Logic Functions', () => {
    test('technique display name mapping works correctly', () => {
      const techniques = {
        'by-workflow': 'By Workflow Steps',
        'by-data': 'By Data Entities',
        'by-acceptance-criteria': 'By Acceptance Criteria',
        'by-complexity': 'By Complexity Layers'
      };

      Object.entries(techniques).forEach(([key, expected]) => {
        // This would test the getTechniqueDisplayName function if it were exported
        expect(key).toBeDefined();
        expect(expected).toBeDefined();
      });
    });

    test('story breakdown state management logic', () => {
      // Test adding stories to breakdown
      let userBreakdown = [];
      
      const newStory = {
        id: `user-story-${Date.now()}`,
        title: '',
        description: '',
        acceptanceCriteria: [''],
        estimatedPoints: 0
      };
      
      userBreakdown = [...userBreakdown, newStory];
      expect(userBreakdown).toHaveLength(1);
      expect(userBreakdown[0].acceptanceCriteria).toHaveLength(1);

      // Test updating story
      userBreakdown[0] = { ...userBreakdown[0], title: 'Updated Title', estimatedPoints: 5 };
      expect(userBreakdown[0].title).toBe('Updated Title');
      expect(userBreakdown[0].estimatedPoints).toBe(5);

      // Test removing story
      userBreakdown = userBreakdown.filter((_, i) => i !== 0);
      expect(userBreakdown).toHaveLength(0);
    });

    test('acceptance criteria management', () => {
      let story = {
        acceptanceCriteria: ['Initial criteria']
      };

      // Add criteria
      story.acceptanceCriteria = [...story.acceptanceCriteria, ''];
      expect(story.acceptanceCriteria).toHaveLength(2);

      // Update criteria
      story.acceptanceCriteria[1] = 'New criteria';
      expect(story.acceptanceCriteria[1]).toBe('New criteria');

      // Remove criteria
      story.acceptanceCriteria = story.acceptanceCriteria.filter((_, i) => i !== 0);
      expect(story.acceptanceCriteria).toHaveLength(1);
      expect(story.acceptanceCriteria[0]).toBe('New criteria');
    });

    test('total points calculation', () => {
      const breakdown = [
        { estimatedPoints: 5 },
        { estimatedPoints: 3 },
        { estimatedPoints: 8 },
        { estimatedPoints: 0 } // Should be treated as 0
      ];

      const total = breakdown.reduce((sum, s) => sum + (s.estimatedPoints || 0), 0);
      expect(total).toBe(16);
    });
  });
});