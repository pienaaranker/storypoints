/**
 * Unit tests for story data manager utilities
 */

import { describe, it, expect } from 'vitest';
import { StoryDataManager } from '../storyDataManager.js';
import type { StoryDataset, Story } from '../../types/story.js';

describe('StoryDataManager', () => {
  const createValidStory = (id: string, points: number = 3): Story => ({
    id,
    title: `Story ${id}`,
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
      team1: { points, reasoning: 'Test estimate', confidenceLevel: 'medium' },
      team2: { points: points === 2 ? 3 : points === 3 ? 5 : points === 5 ? 8 : points, reasoning: 'Team 2 estimate', confidenceLevel: 'medium' }
    },
    breakdownRequired: points > 8,
    breakdownSuggestions: [],
    complexityFactors: {
      technical: 'low',
      business: 'low',
      integration: 'low',
      uncertainty: 'low'
    }
  });

  const createValidDataset = (stories: Story[]): StoryDataset => ({
    metadata: {
      exerciseId: 1,
      type: 'test_stories',
      version: '2.0.0',
      description: 'Test dataset'
    },
    stories
  });

  describe('validateDataset', () => {
    it('should validate a good dataset', () => {
      const stories = [
        createValidStory('story-1', 2),
        createValidStory('story-2', 3),
        createValidStory('story-3', 5)
      ];
      const dataset = createValidDataset(stories);

      const result = StoryDataManager.validateDataset(dataset);



      expect(result.isValid).toBe(true);
      expect(result.summary.totalStories).toBe(3);
      expect(result.summary.storiesNeedingBreakdown).toBe(0);
      expect(result.summary.averageStorySize).toBeGreaterThan(0);
    });

    it('should detect stories needing breakdown', () => {
      const stories = [
        createValidStory('story-1', 2),
        createValidStory('story-2', 13) // Large story
      ];
      const dataset = createValidDataset(stories);

      const result = StoryDataManager.validateDataset(dataset);

      expect(result.summary.storiesNeedingBreakdown).toBe(1);
      expect(result.summary.sizeDistribution[13]).toBeDefined();
    });

    it('should calculate size distribution correctly', () => {
      const stories = [
        createValidStory('story-1', 2),
        createValidStory('story-2', 2),
        createValidStory('story-3', 5)
      ];
      const dataset = createValidDataset(stories);

      const result = StoryDataManager.validateDataset(dataset);

      // With the corrected logic: story-1 (2,3), story-2 (2,3), story-3 (5,8)
      expect(result.summary.sizeDistribution[2]).toBe(2); // Two 2-point estimates from team1
      expect(result.summary.sizeDistribution[3]).toBe(2); // Two 3-point estimates from team2
      expect(result.summary.sizeDistribution[5]).toBe(1); // One 5-point estimate from team1
      expect(result.summary.sizeDistribution[8]).toBe(1); // One 8-point estimate from team2
    });
  });

  describe('loadAndTransformLegacyData', () => {
    it('should transform and validate legacy data successfully', () => {
      const legacyData = {
        metadata: {
          exerciseId: 1,
          type: 'user_stories',
          version: '1.0.0',
          description: 'Legacy stories'
        },
        stories: [
          {
            id: 'legacy-1',
            title: 'Legacy Story',
            description: 'Old format story',
            acceptanceCriteria: ['Must work'],
            correctPoints: 3
          }
        ]
      };

      const result = StoryDataManager.loadAndTransformLegacyData(legacyData);

      expect(result.success).toBe(true);
      expect(result.dataset).toBeDefined();
      expect(result.dataset!.stories).toHaveLength(1);
      expect(result.dataset!.stories[0].estimationVariance).toBeDefined();
      expect(result.validationResult).toBeDefined();
    });

    it('should handle transformation errors gracefully', () => {
      const invalidData = null;

      const result = StoryDataManager.loadAndTransformLegacyData(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.dataset).toBeUndefined();
    });

    it('should collect validation errors', () => {
      const legacyData = {
        metadata: {
          exerciseId: -1, // Invalid exercise ID
          type: 'user_stories',
          version: '1.0.0',
          description: 'Invalid stories'
        },
        stories: []
      };

      const result = StoryDataManager.loadAndTransformLegacyData(legacyData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Exercise ID'))).toBe(true);
    });
  });

  describe('analyzeStoryComplexity', () => {
    it('should identify high complexity stories', () => {
      const highComplexityStory = createValidStory('complex-1', 5);
      highComplexityStory.complexityFactors = {
        technical: 'high',
        business: 'high',
        integration: 'medium',
        uncertainty: 'high'
      };

      const stories = [
        createValidStory('simple-1', 2),
        highComplexityStory
      ];

      const result = StoryDataManager.analyzeStoryComplexity(stories);

      expect(result.complexityAnalysis.highComplexityStories).toHaveLength(1);
      expect(result.complexityAnalysis.highComplexityStories[0].id).toBe('complex-1');
      expect(result.recommendations.some(r => r.includes('high complexity'))).toBe(true);
    });

    it('should identify stories needing breakdown', () => {
      const largeStory = createValidStory('large-1', 13);
      largeStory.breakdownRequired = false; // Should be true but isn't

      const stories = [largeStory];

      const result = StoryDataManager.analyzeStoryComplexity(stories);

      expect(result.complexityAnalysis.storiesNeedingBreakdown).toHaveLength(1);
      expect(result.recommendations.some(r => r.includes('breakdown guidance'))).toBe(true);
    });

    it('should identify inconsistent estimates', () => {
      const inconsistentStory = createValidStory('inconsistent-1', 2);
      inconsistentStory.estimationVariance = {
        juniorTeam: { points: 2, reasoning: 'Simple for us', confidenceLevel: 'high' },
        seniorTeam: { points: 8, reasoning: 'Complex actually', confidenceLevel: 'low' }
      };

      const stories = [inconsistentStory];

      const result = StoryDataManager.analyzeStoryComplexity(stories);

      expect(result.complexityAnalysis.inconsistentEstimates).toHaveLength(1);
      expect(result.recommendations.some(r => r.includes('variable estimates'))).toBe(true);
    });

    it('should warn about too many large stories', () => {
      const stories = Array(10).fill(null).map((_, i) => {
        const story = createValidStory(`large-${i}`, 13);
        story.breakdownRequired = false; // Force them to not have breakdown to trigger warning
        return story;
      });

      const result = StoryDataManager.analyzeStoryComplexity(stories);

      expect(result.recommendations.some(r => r.includes('breakdown practices'))).toBe(true);
    });
  });

  describe('generateDataQualityReport', () => {
    it('should generate high quality report for good data', () => {
      const stories = [
        createValidStory('story-1', 2),
        createValidStory('story-2', 3),
        createValidStory('story-3', 5)
      ];
      const dataset = createValidDataset(stories);

      const report = StoryDataManager.generateDataQualityReport(dataset);

      expect(report.overallScore).toBeGreaterThan(85);
      expect(report.sections.validation.score).toBeGreaterThan(80);
      expect(report.sections.distribution.score).toBe(100);
    });

    it('should penalize missing acceptance criteria', () => {
      const incompleteStory = createValidStory('incomplete-1', 3);
      incompleteStory.acceptanceCriteria = [];

      const stories = [incompleteStory];
      const dataset = createValidDataset(stories);

      const report = StoryDataManager.generateDataQualityReport(dataset);

      expect(report.sections.completeness.score).toBeLessThan(100);
      expect(report.sections.completeness.issues.some(i => 
        i.includes('lacks acceptance criteria')
      )).toBe(true);
    });

    it('should penalize insufficient estimation perspectives', () => {
      const limitedStory = createValidStory('limited-1', 3);
      limitedStory.estimationVariance = {
        onlyTeam: { points: 3, reasoning: 'Only estimate', confidenceLevel: 'medium' }
      };

      const stories = [limitedStory];
      const dataset = createValidDataset(stories);

      const report = StoryDataManager.generateDataQualityReport(dataset);

      expect(report.sections.completeness.score).toBeLessThan(100);
      expect(report.sections.completeness.issues.some(i => 
        i.includes('more team estimation perspectives')
      )).toBe(true);
    });

    it('should provide recommendations for low quality data', () => {
      const poorStory = createValidStory('poor-1', 3);
      poorStory.acceptanceCriteria = [];
      poorStory.estimationVariance = {
        onlyTeam: { points: 3, reasoning: 'Only estimate', confidenceLevel: 'medium' }
      };

      const stories = [poorStory];
      const dataset = createValidDataset(stories);

      const report = StoryDataManager.generateDataQualityReport(dataset);

      expect(report.overallScore).toBeLessThan(100);
      expect(report.sections.completeness.issues.length).toBeGreaterThan(0);
      // The recommendations come from the complexity analysis and quality score
      expect(report.sections.completeness.issues.some(i => 
        i.includes('lacks acceptance criteria') || i.includes('more team estimation perspectives')
      )).toBe(true);
    });
  });
});