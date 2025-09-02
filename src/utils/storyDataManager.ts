/**
 * Story data management utilities
 * Provides high-level functions for working with story data
 */

import type { Story, StoryDataset, ValidationResult } from '../types/story.js';
import {
  validateStoryDataset,
  validateStoryDistribution,
  transformLegacyDataset,
  safeTransformLegacyDataset
} from '../types/index.js';

/**
 * Loads and validates story data from various sources
 */
export class StoryDataManager {
  /**
   * Validates a complete story dataset and returns detailed results
   */
  static validateDataset(dataset: StoryDataset): {
    isValid: boolean;
    datasetErrors: ValidationResult;
    distributionErrors: ValidationResult;
    summary: {
      totalStories: number;
      storiesNeedingBreakdown: number;
      averageStorySize: number;
      sizeDistribution: Record<number, number>;
    };
  } {
    const datasetValidation = validateStoryDataset(dataset);
    const distributionValidation = validateStoryDistribution(dataset.stories);

    // Calculate summary statistics
    const totalStories = dataset.stories.length;
    const storiesNeedingBreakdown = dataset.stories.filter(s => s.breakdownRequired).length;
    
    const allEstimates = dataset.stories.flatMap(story =>
      Object.values(story.estimationVariance).map(estimate => estimate.points)
    );
    
    const averageStorySize = allEstimates.length > 0 
      ? allEstimates.reduce((sum, points) => sum + points, 0) / allEstimates.length
      : 0;

    const sizeDistribution: Record<number, number> = {};
    allEstimates.forEach(points => {
      sizeDistribution[points] = (sizeDistribution[points] || 0) + 1;
    });

    return {
      isValid: datasetValidation.isValid && distributionValidation.isValid,
      datasetErrors: datasetValidation,
      distributionErrors: distributionValidation,
      summary: {
        totalStories,
        storiesNeedingBreakdown,
        averageStorySize: Math.round(averageStorySize * 100) / 100,
        sizeDistribution
      }
    };
  }

  /**
   * Loads legacy data and transforms it to enhanced format with validation
   */
  static loadAndTransformLegacyData(legacyData: any): {
    success: boolean;
    dataset?: StoryDataset;
    errors: string[];
    warnings: string[];
    validationResult?: ReturnType<typeof StoryDataManager.validateDataset>;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Transform legacy data
      const { dataset, warnings: transformWarnings } = safeTransformLegacyDataset(legacyData);
      warnings.push(...transformWarnings);

      // Validate transformed data
      const validationResult = this.validateDataset(dataset);
      
      if (!validationResult.isValid) {
        validationResult.datasetErrors.errors.forEach(error => {
          errors.push(`Dataset validation: ${error.message}`);
        });
        
        validationResult.distributionErrors.errors.forEach(error => {
          errors.push(`Distribution validation: ${error.message}`);
        });
      }

      return {
        success: errors.length === 0,
        dataset,
        errors,
        warnings,
        validationResult
      };
    } catch (error) {
      errors.push(`Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        success: false,
        errors,
        warnings
      };
    }
  }

  /**
   * Analyzes story complexity and provides recommendations
   */
  static analyzeStoryComplexity(stories: Story[]): {
    recommendations: string[];
    complexityAnalysis: {
      highComplexityStories: Story[];
      storiesNeedingBreakdown: Story[];
      inconsistentEstimates: Story[];
    };
  } {
    const recommendations: string[] = [];
    const highComplexityStories: Story[] = [];
    const storiesNeedingBreakdown: Story[] = [];
    const inconsistentEstimates: Story[] = [];

    stories.forEach(story => {
      // Check for high complexity
      const complexityFactors = Object.values(story.complexityFactors);
      const highComplexityCount = complexityFactors.filter(level => level === 'high').length;
      
      if (highComplexityCount >= 2) {
        highComplexityStories.push(story);
      }

      // Check for breakdown needs
      const maxEstimate = Math.max(...Object.values(story.estimationVariance).map(e => e.points));
      if (maxEstimate > 8 && !story.breakdownRequired) {
        storiesNeedingBreakdown.push(story);
      }

      // Check for inconsistent estimates
      const estimates = Object.values(story.estimationVariance).map(e => e.points);
      const minEstimate = Math.min(...estimates);
      const estimateRatio = maxEstimate / minEstimate;
      
      if (estimateRatio > 2.5) {
        inconsistentEstimates.push(story);
      }
    });

    // Generate recommendations
    if (highComplexityStories.length > 0) {
      recommendations.push(
        `${highComplexityStories.length} stories have high complexity in multiple areas. Consider breaking them down or adding spikes for research.`
      );
    }

    if (storiesNeedingBreakdown.length > 0) {
      recommendations.push(
        `${storiesNeedingBreakdown.length} stories are estimated > 8 points but lack breakdown guidance. Add breakdown suggestions.`
      );
    }

    if (inconsistentEstimates.length > 0) {
      recommendations.push(
        `${inconsistentEstimates.length} stories have highly variable estimates between teams. Review requirements clarity and team context.`
      );
    }

    const largeStoryPercentage = (storiesNeedingBreakdown.length / stories.length) * 100;
    if (largeStoryPercentage > 30) {
      recommendations.push(
        `${largeStoryPercentage.toFixed(1)}% of stories are large (>8 points). Consider improving story breakdown practices.`
      );
    }

    return {
      recommendations,
      complexityAnalysis: {
        highComplexityStories,
        storiesNeedingBreakdown,
        inconsistentEstimates
      }
    };
  }

  /**
   * Generates a report for story data quality
   */
  static generateDataQualityReport(dataset: StoryDataset): {
    overallScore: number;
    sections: {
      validation: { score: number; issues: string[] };
      distribution: { score: number; issues: string[] };
      complexity: { score: number; issues: string[] };
      completeness: { score: number; issues: string[] };
    };
    recommendations: string[];
  } {
    const validation = this.validateDataset(dataset);
    const complexity = this.analyzeStoryComplexity(dataset.stories);
    
    const sections = {
      validation: {
        score: validation.isValid ? 100 : Math.max(0, 100 - (validation.datasetErrors.errors.length * 10)),
        issues: validation.datasetErrors.errors.map(e => e.message)
      },
      distribution: {
        score: validation.distributionErrors.isValid ? 100 : Math.max(0, 100 - (validation.distributionErrors.errors.length * 15)),
        issues: validation.distributionErrors.errors.map(e => e.message)
      },
      complexity: {
        score: Math.max(0, 100 - (complexity.complexityAnalysis.highComplexityStories.length * 5)),
        issues: complexity.complexityAnalysis.highComplexityStories.map(s => `Story "${s.title}" has high complexity`)
      },
      completeness: {
        score: 100, // Base score
        issues: [] as string[]
      }
    };

    // Check completeness
    dataset.stories.forEach(story => {
      if (!story.acceptanceCriteria || story.acceptanceCriteria.length === 0) {
        sections.completeness.score -= 5;
        sections.completeness.issues.push(`Story "${story.title}" lacks acceptance criteria`);
      }
      
      if (Object.keys(story.estimationVariance).length < 2) {
        sections.completeness.score -= 3;
        sections.completeness.issues.push(`Story "${story.title}" needs more team estimation perspectives`);
      }
    });

    sections.completeness.score = Math.max(0, sections.completeness.score);

    const overallScore = Math.round(
      (sections.validation.score + sections.distribution.score + 
       sections.complexity.score + sections.completeness.score) / 4
    );

    return {
      overallScore,
      sections,
      recommendations: [
        ...complexity.recommendations,
        ...(overallScore < 80 ? ['Consider improving story data quality before using in exercises'] : []),
        ...(sections.completeness.score < 90 ? ['Add more detailed acceptance criteria and team perspectives'] : [])
      ]
    };
  }
}