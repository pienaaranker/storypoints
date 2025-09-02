import { describe, test, expect } from 'vitest';
import {
  validateStoryBreakdown,
  calculateBreakdownQuality,
  getBreakdownImprovementSuggestions,
  formatValidationResults
} from '../storyBreakdownValidation';

describe('storyBreakdownValidation', () => {
  const mockOriginalStory = {
    id: 'original',
    title: 'Complete User Management System',
    description: 'As an admin, I want a comprehensive user management system',
    acceptanceCriteria: [
      'Create, read, update, delete user accounts',
      'Assign and manage user roles and permissions',
      'Bulk operations (import, export, bulk edit)',
      'User activity tracking and audit logs'
    ],
    correctPoints: 21
  };

  describe('validateStoryBreakdown', () => {
    test('validates valid breakdown successfully', () => {
      const validBreakdown = [
        {
          title: 'User CRUD Operations',
          description: 'Basic user account management',
          acceptanceCriteria: ['Create user', 'Edit user', 'Delete user'],
          estimatedPoints: 5
        },
        {
          title: 'User Roles Management',
          description: 'Role and permission assignment',
          acceptanceCriteria: ['Assign roles', 'Manage permissions'],
          estimatedPoints: 8
        },
        {
          title: 'Bulk Operations',
          description: 'Import and export users',
          acceptanceCriteria: ['Import CSV', 'Export data'],
          estimatedPoints: 6
        }
      ];

      const result = validateStoryBreakdown(validBreakdown, mockOriginalStory);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects stories that are too large', () => {
      const invalidBreakdown = [
        {
          title: 'Valid Story',
          description: 'A properly sized story',
          acceptanceCriteria: ['Some criteria'],
          estimatedPoints: 5
        },
        {
          title: 'Too Large Story',
          description: 'This story is too big',
          acceptanceCriteria: ['Many criteria'],
          estimatedPoints: 13
        }
      ];

      const result = validateStoryBreakdown(invalidBreakdown, mockOriginalStory);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('size-violation');
      expect(result.errors[0].message).toContain('should be 8 or smaller');
    });

    test('detects missing point estimates', () => {
      const invalidBreakdown = [
        {
          title: 'Story Without Points',
          description: 'Missing estimate',
          acceptanceCriteria: ['Some criteria'],
          estimatedPoints: 0
        },
        {
          title: 'Another Story Without Points',
          description: 'Also missing estimate',
          acceptanceCriteria: ['Some criteria']
          // estimatedPoints missing entirely
        }
      ];

      const result = validateStoryBreakdown(invalidBreakdown, mockOriginalStory);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.every(e => e.type === 'missing-estimate')).toBe(true);
    });

    test('detects missing titles', () => {
      const invalidBreakdown = [
        {
          title: '',
          description: 'Story without title',
          acceptanceCriteria: ['Some criteria'],
          estimatedPoints: 5
        },
        {
          // title missing entirely
          description: 'Another story without title',
          acceptanceCriteria: ['Some criteria'],
          estimatedPoints: 3
        }
      ];

      const result = validateStoryBreakdown(invalidBreakdown, mockOriginalStory);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.every(e => e.type === 'missing-title')).toBe(true);
    });

    test('warns about missing descriptions', () => {
      const breakdown = [
        {
          title: 'Story Without Description',
          description: '',
          acceptanceCriteria: ['Some criteria'],
          estimatedPoints: 5
        }
      ];

      const result = validateStoryBreakdown(breakdown, mockOriginalStory);

      expect(result.isValid).toBe(true); // Warnings don't make it invalid
      expect(result.warnings.some(w => w.type === 'missing-description')).toBe(true);
    });

    test('warns about missing acceptance criteria', () => {
      const breakdown = [
        {
          title: 'Story Without Criteria',
          description: 'Has description but no criteria',
          acceptanceCriteria: [],
          estimatedPoints: 5
        }
      ];

      const result = validateStoryBreakdown(breakdown, mockOriginalStory);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.type === 'missing-criteria')).toBe(true);
    });

    test('warns about scope coverage issues', () => {
      const breakdown = [
        {
          title: 'Minimal Story',
          description: 'Only covers small part of original',
          acceptanceCriteria: ['One criteria'], // Original has 4 criteria
          estimatedPoints: 3
        }
      ];

      const result = validateStoryBreakdown(breakdown, mockOriginalStory);

      expect(result.warnings.some(w => w.type === 'scope-coverage')).toBe(true);
    });

    test('provides estimate variance suggestions', () => {
      const breakdown = [
        {
          title: 'Story 1',
          description: 'First story',
          acceptanceCriteria: ['Criteria 1'],
          estimatedPoints: 50 // Much larger than original 21 points
        }
      ];

      const result = validateStoryBreakdown(breakdown, mockOriginalStory);

      expect(result.suggestions.some(s => s.type === 'estimate-variance')).toBe(true);
    });

    test('warns about insufficient breakdown', () => {
      const breakdown = [
        {
          title: 'Only Story',
          description: 'Single story breakdown',
          acceptanceCriteria: ['All the criteria'],
          estimatedPoints: 21
        }
      ];

      const result = validateStoryBreakdown(breakdown, mockOriginalStory);

      expect(result.warnings.some(w => w.type === 'insufficient-breakdown')).toBe(true);
    });

    test('warns about excessive breakdown', () => {
      const breakdown = Array.from({ length: 10 }, (_, i) => ({
        title: `Story ${i + 1}`,
        description: `Description ${i + 1}`,
        acceptanceCriteria: [`Criteria ${i + 1}`],
        estimatedPoints: 2
      }));

      const result = validateStoryBreakdown(breakdown, mockOriginalStory);

      expect(result.warnings.some(w => w.type === 'excessive-breakdown')).toBe(true);
    });

    test('suggests review for uniform estimates', () => {
      const breakdown = [
        {
          title: 'Story 1',
          description: 'First story',
          acceptanceCriteria: ['Criteria 1'],
          estimatedPoints: 5
        },
        {
          title: 'Story 2',
          description: 'Second story',
          acceptanceCriteria: ['Criteria 2'],
          estimatedPoints: 5
        },
        {
          title: 'Story 3',
          description: 'Third story',
          acceptanceCriteria: ['Criteria 3'],
          estimatedPoints: 5
        }
      ];

      const result = validateStoryBreakdown(breakdown, mockOriginalStory);

      expect(result.suggestions.some(s => s.type === 'uniform-estimates')).toBe(true);
    });

    test('warns about stories with moderate size', () => {
      const breakdown = [
        {
          title: 'Moderately Large Story',
          description: 'Could potentially be broken down further',
          acceptanceCriteria: ['Multiple criteria'],
          estimatedPoints: 6
        }
      ];

      const result = validateStoryBreakdown(breakdown, mockOriginalStory);

      expect(result.warnings.some(w => w.type === 'size-warning')).toBe(true);
    });
  });

  describe('calculateBreakdownQuality', () => {
    test('returns 100 for perfect breakdown', () => {
      const perfectResults = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      };

      const quality = calculateBreakdownQuality(perfectResults);
      expect(quality).toBe(100);
    });

    test('deducts points for errors', () => {
      const resultsWithErrors = {
        isValid: false,
        errors: [
          { type: 'size-violation', message: 'Error 1' },
          { type: 'missing-estimate', message: 'Error 2' }
        ],
        warnings: [],
        suggestions: []
      };

      const quality = calculateBreakdownQuality(resultsWithErrors);
      expect(quality).toBe(60); // 100 - (2 * 20)
    });

    test('deducts points for warnings', () => {
      const resultsWithWarnings = {
        isValid: true,
        errors: [],
        warnings: [
          { type: 'missing-description', message: 'Warning 1' },
          { type: 'scope-coverage', message: 'Warning 2' },
          { type: 'size-warning', message: 'Warning 3' }
        ],
        suggestions: []
      };

      const quality = calculateBreakdownQuality(resultsWithWarnings);
      expect(quality).toBe(70); // 100 - (3 * 10)
    });

    test('never returns negative quality', () => {
      const terribleResults = {
        isValid: false,
        errors: Array.from({ length: 10 }, (_, i) => ({ type: 'error', message: `Error ${i}` })),
        warnings: Array.from({ length: 10 }, (_, i) => ({ type: 'warning', message: `Warning ${i}` })),
        suggestions: []
      };

      const quality = calculateBreakdownQuality(terribleResults);
      expect(quality).toBe(0);
    });
  });

  describe('getBreakdownImprovementSuggestions', () => {
    test('provides size violation suggestions', () => {
      const results = {
        errors: [
          { type: 'size-violation', message: 'Story too large' }
        ],
        warnings: [],
        suggestions: []
      };

      const suggestions = getBreakdownImprovementSuggestions(results);
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].type).toBe('size-violation');
      expect(suggestions[0].title).toBe('Story Size Issues');
      expect(suggestions[0].actions).toContain('Look for natural breakpoints in the acceptance criteria');
    });

    test('provides missing estimate suggestions', () => {
      const results = {
        errors: [
          { type: 'missing-estimate', message: 'Missing estimate' }
        ],
        warnings: [],
        suggestions: []
      };

      const suggestions = getBreakdownImprovementSuggestions(results);
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].type).toBe('missing-estimate');
      expect(suggestions[0].actions).toContain('Estimate each story relative to others');
    });

    test('provides scope coverage suggestions', () => {
      const results = {
        errors: [],
        warnings: [
          { type: 'scope-coverage', message: 'Insufficient coverage' }
        ],
        suggestions: []
      };

      const suggestions = getBreakdownImprovementSuggestions(results);
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].type).toBe('scope-coverage');
      expect(suggestions[0].actions).toContain('Review original acceptance criteria');
    });

    test('returns empty array for perfect breakdown', () => {
      const results = {
        errors: [],
        warnings: [],
        suggestions: []
      };

      const suggestions = getBreakdownImprovementSuggestions(results);
      expect(suggestions).toHaveLength(0);
    });
  });

  describe('formatValidationResults', () => {
    test('formats results with quality score and summary', () => {
      const rawResults = {
        isValid: true,
        errors: [],
        warnings: [
          { type: 'missing-description', message: 'Warning' }
        ],
        suggestions: []
      };

      const formatted = formatValidationResults(rawResults);

      expect(formatted.qualityScore).toBe(90); // 100 - 10 for warning
      expect(formatted.improvementSuggestions).toBeDefined();
      expect(formatted.summary).toEqual({
        totalIssues: 1,
        criticalIssues: 0,
        minorIssues: 1,
        isPassable: true // Valid with only 1 warning
      });
    });

    test('marks as not passable with too many warnings', () => {
      const rawResults = {
        isValid: true,
        errors: [],
        warnings: [
          { type: 'warning1', message: 'Warning 1' },
          { type: 'warning2', message: 'Warning 2' },
          { type: 'warning3', message: 'Warning 3' }
        ],
        suggestions: []
      };

      const formatted = formatValidationResults(rawResults);

      expect(formatted.summary.isPassable).toBe(false); // More than 2 warnings
    });

    test('marks as not passable with errors', () => {
      const rawResults = {
        isValid: false,
        errors: [
          { type: 'error', message: 'Error' }
        ],
        warnings: [],
        suggestions: []
      };

      const formatted = formatValidationResults(rawResults);

      expect(formatted.summary.isPassable).toBe(false); // Has errors
    });
  });

  describe('edge cases', () => {
    test('handles empty breakdown', () => {
      const result = validateStoryBreakdown([], mockOriginalStory);
      
      expect(result.isValid).toBe(true); // Empty breakdown is technically valid
      expect(result.warnings.some(w => w.type === 'scope-coverage')).toBe(true);
    });

    test('handles original story without correctPoints', () => {
      const storyWithoutPoints = {
        ...mockOriginalStory,
        correctPoints: undefined,
        estimationVariance: {
          experiencedTeam: { points: 15 }
        }
      };

      const breakdown = [
        {
          title: 'Story',
          description: 'Description',
          acceptanceCriteria: ['Criteria'],
          estimatedPoints: 30
        }
      ];

      const result = validateStoryBreakdown(breakdown, storyWithoutPoints);
      
      expect(result.suggestions.some(s => s.type === 'estimate-variance')).toBe(true);
    });

    test('handles breakdown with null/undefined values', () => {
      const breakdown = [
        {
          title: null,
          description: undefined,
          acceptanceCriteria: null,
          estimatedPoints: undefined
        }
      ];

      const result = validateStoryBreakdown(breakdown, mockOriginalStory);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'missing-title')).toBe(true);
      expect(result.errors.some(e => e.type === 'missing-estimate')).toBe(true);
    });
  });
});