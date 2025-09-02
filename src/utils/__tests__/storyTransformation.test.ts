/**
 * Unit tests for story data transformation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  transformLegacyStory,
  transformLegacyDataset,
  safeTransformLegacyDataset
} from '../storyTransformation.js';

describe('transformLegacyStory', () => {
  it('should transform basic legacy story', () => {
    const legacyStory = {
      id: 'test-story',
      title: 'Test Story',
      description: 'A test story',
      acceptanceCriteria: ['Must work', 'Must be tested'],
      correctOrder: 1,
      correctPoints: 3,
      factors: {
        complexity: 'Low',
        effort: 'Low',
        uncertainty: 'Low'
      },
      explanation: 'Simple story'
    };

    const transformed = transformLegacyStory(legacyStory);

    expect(transformed.id).toBe('test-story');
    expect(transformed.title).toBe('Test Story');
    expect(transformed.description).toBe('A test story');
    expect(transformed.acceptanceCriteria).toEqual(['Must work', 'Must be tested']);
    expect(transformed.teamContext).toBeDefined();
    expect(transformed.estimationVariance).toBeDefined();
    expect(transformed.complexityFactors).toBeDefined();
    expect(transformed.breakdownRequired).toBe(false);
    
    // Preserve legacy fields
    expect(transformed.correctOrder).toBe(1);
    expect(transformed.correctPoints).toBe(3);
    expect(transformed.factors).toEqual(legacyStory.factors);
    expect(transformed.explanation).toBe('Simple story');
  });

  it('should handle abstract items (name instead of title)', () => {
    const legacyItem = {
      id: 'mountain',
      name: 'A mountain',
      description: 'Massive geological formation',
      correctOrder: 4,
      correctPoints: 13,
      explanation: 'Practically impossible to move'
    };

    const transformed = transformLegacyStory(legacyItem);

    expect(transformed.title).toBe('A mountain');
    expect(transformed.breakdownRequired).toBe(true);
    expect(transformed.breakdownSuggestions.length).toBeGreaterThan(0);
  });

  it('should create appropriate team context based on complexity', () => {
    const simpleStory = {
      id: 'simple',
      title: 'Simple Story',
      description: 'Easy task',
      correctPoints: 2,
      factors: {
        complexity: 'Low',
        effort: 'Low',
        uncertainty: 'Low'
      }
    };

    const complexStory = {
      id: 'complex',
      title: 'Complex Story',
      description: 'Hard task',
      correctPoints: 13,
      factors: {
        complexity: 'High',
        effort: 'High',
        uncertainty: 'High'
      }
    };

    const simpleTransformed = transformLegacyStory(simpleStory);
    const complexTransformed = transformLegacyStory(complexStory);

    expect(simpleTransformed.teamContext.domainKnowledge).toBe('high');
    expect(complexTransformed.teamContext.experienceLevel).toBe('senior');
  });

  it('should create estimation variance with different team perspectives', () => {
    const story = {
      id: 'test',
      title: 'Test Story',
      description: 'Test',
      correctPoints: 5,
      factors: {
        complexity: 'Medium',
        effort: 'Medium',
        uncertainty: 'Medium'
      }
    };

    const transformed = transformLegacyStory(story);

    expect(Object.keys(transformed.estimationVariance)).toContain('juniorTeam');
    expect(Object.keys(transformed.estimationVariance)).toContain('seniorTeam');
    expect(Object.keys(transformed.estimationVariance)).toContain('baseTeam');

    const juniorEstimate = transformed.estimationVariance.juniorTeam;
    const seniorEstimate = transformed.estimationVariance.seniorTeam;
    const baseEstimate = transformed.estimationVariance.baseTeam;

    expect(juniorEstimate.points).toBeGreaterThanOrEqual(baseEstimate.points);
    expect(seniorEstimate.points).toBeLessThanOrEqual(baseEstimate.points);
    expect(baseEstimate.points).toBe(5);
  });

  it('should create breakdown suggestions for large stories', () => {
    const largeStory = {
      id: 'large-story',
      title: 'Large Story',
      description: 'Complex feature',
      acceptanceCriteria: [
        'Must handle user input',
        'Must validate data',
        'Must save to database',
        'Must send notifications'
      ],
      correctPoints: 13,
      factors: {
        complexity: 'High',
        effort: 'High',
        uncertainty: 'Medium'
      }
    };

    const transformed = transformLegacyStory(largeStory);

    expect(transformed.breakdownRequired).toBe(true);
    expect(transformed.breakdownSuggestions.length).toBeGreaterThan(0);
    
    const workflowBreakdown = transformed.breakdownSuggestions.find(
      s => s.technique === 'by-workflow'
    );
    expect(workflowBreakdown).toBeDefined();
    expect(workflowBreakdown?.resultingStories.length).toBeGreaterThan(0);
    
    // Verify breakdown results in smaller stories
    workflowBreakdown?.resultingStories.forEach(story => {
      const maxPoints = Math.max(...Object.values(story.estimationVariance).map(e => e.points));
      expect(maxPoints).toBeLessThanOrEqual(8);
    });
  });

  it('should handle missing fields gracefully', () => {
    const minimalStory = {
      id: 'minimal',
      description: 'Minimal story data'
    };

    const transformed = transformLegacyStory(minimalStory);

    expect(transformed.title).toBe('Untitled Story');
    expect(transformed.acceptanceCriteria).toEqual(['Must meet basic requirements']);
    expect(transformed.teamContext).toBeDefined();
    expect(transformed.estimationVariance).toBeDefined();
    expect(transformed.complexityFactors).toBeDefined();
  });
});

describe('transformLegacyDataset', () => {
  it('should transform complete legacy dataset', () => {
    const legacyDataset = {
      metadata: {
        exerciseId: 1,
        type: 'user_stories',
        version: '1.0.0',
        description: 'Legacy stories'
      },
      stories: [
        {
          id: 'story-1',
          title: 'Story 1',
          description: 'First story',
          correctPoints: 3
        },
        {
          id: 'story-2',
          title: 'Story 2',
          description: 'Second story',
          correctPoints: 8
        }
      ]
    };

    const transformed = transformLegacyDataset(legacyDataset);

    expect(transformed.metadata.exerciseId).toBe(1);
    expect(transformed.metadata.version).toBe('2.0.0');
    expect(transformed.stories).toHaveLength(2);
    
    transformed.stories.forEach(story => {
      expect(story.teamContext).toBeDefined();
      expect(story.estimationVariance).toBeDefined();
      expect(story.complexityFactors).toBeDefined();
    });
  });

  it('should handle abstract items dataset', () => {
    const legacyDataset = {
      metadata: {
        exerciseId: 1,
        type: 'abstract_items',
        version: '1.0.0',
        description: 'Abstract items'
      },
      items: [
        {
          id: 'pebble',
          name: 'A pebble',
          description: 'Small stone',
          correctPoints: 2
        }
      ]
    };

    const transformed = transformLegacyDataset(legacyDataset);

    expect(transformed.stories).toHaveLength(1);
    expect(transformed.stories[0].title).toBe('A pebble');
  });
});

describe('safeTransformLegacyDataset', () => {
  it('should transform dataset and return warnings', () => {
    const legacyDataset = {
      metadata: {
        exerciseId: 1,
        type: 'user_stories',
        version: '1.0.0',
        description: 'Test dataset'
      },
      stories: [
        {
          id: 'story-1',
          title: 'Good Story',
          description: 'Has acceptance criteria',
          acceptanceCriteria: ['Must work'],
          correctPoints: 3
        },
        {
          id: 'story-2',
          title: 'Story Without AC',
          description: 'Missing acceptance criteria',
          acceptanceCriteria: [], // Explicitly empty to trigger warning
          correctPoints: 13
        }
      ]
    };

    const result = safeTransformLegacyDataset(legacyDataset);

    expect(result.dataset).toBeDefined();
    expect(result.warnings).toBeInstanceOf(Array);
    expect(result.warnings.length).toBeGreaterThan(0);
    
    // Should warn about missing acceptance criteria
    expect(result.warnings.some(w => w.includes('no acceptance criteria'))).toBe(true);
  });

  it('should handle transformation errors', () => {
    const invalidDataset = null as any;

    expect(() => safeTransformLegacyDataset(invalidDataset)).toThrow();
  });

  it('should warn about large stories without breakdown', () => {
    const legacyDataset = {
      metadata: {
        exerciseId: 1,
        type: 'user_stories',
        version: '1.0.0',
        description: 'Test dataset'
      },
      stories: [
        {
          id: 'large-story',
          title: 'Large Story',
          description: 'Should be broken down',
          acceptanceCriteria: ['Must work'],
          correctPoints: 21 // Very large
        }
      ]
    };

    const result = safeTransformLegacyDataset(legacyDataset);

    // The transformation should automatically add breakdown for large stories
    expect(result.dataset.stories[0].breakdownRequired).toBe(true);
    expect(result.warnings.length).toBe(0); // No warnings since breakdown is automatically added
  });
});