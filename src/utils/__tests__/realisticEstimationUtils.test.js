import { describe, it, expect } from 'vitest';
import {
  analyzeUncertaintyFactors,
  calculateDependencyImpact,
  analyzeTechnicalDebtImpact,
  calculateSpikeValue,
  getEstimationRecommendations,
  validateEstimation
} from '../realisticEstimationUtils';

describe('realisticEstimationUtils', () => {
  describe('analyzeUncertaintyFactors', () => {
    it('returns low risk for no uncertainty factors', () => {
      const result = analyzeUncertaintyFactors(null);
      expect(result.riskLevel).toBe('low');
      expect(result.recommendations).toEqual([]);
    });

    it('identifies high risk factors correctly', () => {
      const uncertaintyFactors = {
        apiDocumentation: 'incomplete',
        teamExperience: 'none',
        technology: 'unknown'
      };

      const result = analyzeUncertaintyFactors(uncertaintyFactors);
      expect(result.riskLevel).toBe('high');
      expect(result.recommendations).toContain('Strong recommendation: Create spike before estimation');
    });

    it('identifies medium risk factors correctly', () => {
      const uncertaintyFactors = {
        apiDocumentation: 'partial',
        teamExperience: 'limited'
      };

      const result = analyzeUncertaintyFactors(uncertaintyFactors);
      expect(result.riskLevel).toBe('medium');
      expect(result.recommendations).toContain('Consider conservative estimation with uncertainty buffer');
    });

    it('generates specific recommendations for each factor', () => {
      const uncertaintyFactors = {
        apiDocumentation: 'incomplete'
      };

      const result = analyzeUncertaintyFactors(uncertaintyFactors);
      expect(result.recommendations).toContain('Consider spike for api documentation');
    });
  });

  describe('calculateDependencyImpact', () => {
    it('returns no impact for no dependencies', () => {
      const result = calculateDependencyImpact([]);
      expect(result.impactLevel).toBe('none');
      expect(result.blockers).toEqual([]);
    });

    it('calculates high impact for multiple high-risk external dependencies', () => {
      const dependencies = [
        {
          type: 'external',
          risk: 'high',
          description: 'External API',
          impact: 'Blocks all functionality'
        },
        {
          type: 'external',
          risk: 'high',
          description: 'Third-party service',
          impact: 'Blocks core features'
        }
      ];

      const result = calculateDependencyImpact(dependencies);
      expect(result.impactLevel).toBe('high');
      expect(result.blockers).toHaveLength(2);
      expect(result.recommendations).toContain('Consider breaking story into phases to reduce dependency impact');
    });

    it('identifies blockers correctly', () => {
      const dependencies = [
        {
          type: 'external',
          risk: 'medium',
          description: 'External API',
          impact: 'Blocks functionality'
        }
      ];

      const result = calculateDependencyImpact(dependencies);
      expect(result.blockers).toHaveLength(1);
      expect(result.recommendations).toContain('Identify alternative approaches for blocked functionality');
    });

    it('recommends mocking for external dependencies', () => {
      const dependencies = [
        {
          type: 'external',
          risk: 'low',
          description: 'Payment API'
        }
      ];

      const result = calculateDependencyImpact(dependencies);
      expect(result.recommendations).toContain('Consider mocking Payment API for parallel development');
    });
  });

  describe('analyzeTechnicalDebtImpact', () => {
    it('returns no impact for no technical debt', () => {
      const result = analyzeTechnicalDebtImpact(null);
      expect(result.complexityMultiplier).toBe(1);
      expect(result.debtLevel).toBe('none');
    });

    it('calculates high debt impact correctly', () => {
      const technicalDebt = {
        debtAge: '2 years',
        impact: {
          codeComplexity: 'Very hard to understand',
          testability: 'Difficult to test',
          maintainability: 'Hard to maintain'
        },
        previousAttempts: 'Failed refactoring attempt last year'
      };

      const result = analyzeTechnicalDebtImpact(technicalDebt);
      expect(result.debtLevel).toBe('high');
      expect(result.complexityMultiplier).toBe(2.5);
      expect(result.recommendations).toContain('Strong recommendation: Refactor before adding new functionality');
    });

    it('handles age in months correctly', () => {
      const technicalDebt = {
        debtAge: '18 months',
        impact: {
          codeComplexity: 'Moderate complexity',
          testability: 'Some difficulty'
        }
      };

      const result = analyzeTechnicalDebtImpact(technicalDebt);
      expect(result.debtLevel).toBe('medium');
      expect(result.complexityMultiplier).toBe(1.8);
    });

    it('accounts for previous attempts', () => {
      const technicalDebt = {
        debtAge: '6 months',
        previousAttempts: 'One failed attempt'
      };

      const result = analyzeTechnicalDebtImpact(technicalDebt);
      expect(result.recommendations).toContain('Learn from previous refactoring attempts to avoid similar issues');
    });
  });

  describe('calculateSpikeValue', () => {
    it('returns zero values for missing data', () => {
      const result = calculateSpikeValue(null, null);
      expect(result.timeInvestment).toBe(0);
      expect(result.estimationImprovement).toBe(0);
    });

    it('calculates spike value correctly', () => {
      const spike = {
        timeBox: '8 hours',
        uncertaintyFactors: ['factor1', 'factor2', 'factor3', 'factor4']
      };

      const resultingStories = [
        { points: 3 },
        { points: 5 },
        { points: 2 }
      ];

      const result = calculateSpikeValue(spike, resultingStories);
      expect(result.timeInvestment).toBe(2); // 8 hours / 6 hours per point, rounded up
      expect(result.riskReduction).toBe('high');
      expect(result.pointsSaved).toBeGreaterThan(0);
    });

    it('determines risk reduction level based on uncertainty factors', () => {
      const spikeHighRisk = {
        timeBox: '6 hours',
        uncertaintyFactors: ['f1', 'f2', 'f3', 'f4']
      };

      const spikeMediumRisk = {
        timeBox: '6 hours',
        uncertaintyFactors: ['f1', 'f2']
      };

      const spikeLowRisk = {
        timeBox: '6 hours',
        uncertaintyFactors: ['f1']
      };

      const stories = [{ points: 5 }];

      expect(calculateSpikeValue(spikeHighRisk, stories).riskReduction).toBe('high');
      expect(calculateSpikeValue(spikeMediumRisk, stories).riskReduction).toBe('medium');
      expect(calculateSpikeValue(spikeLowRisk, stories).riskReduction).toBe('low');
    });
  });

  describe('getEstimationRecommendations', () => {
    it('recommends standard approach for simple stories', () => {
      const story = {
        complexityFactors: {
          technical: 'low',
          business: 'low',
          integration: 'low',
          uncertainty: 'low'
        }
      };

      const result = getEstimationRecommendations(story);
      expect(result.recommendedApproach).toBe('standard');
      expect(result.confidenceLevel).toBe('high');
    });

    it('recommends spike-first for high uncertainty', () => {
      const story = {
        uncertaintyFactors: {
          technology: 'unknown',
          integration: 'unclear',
          performance: 'unknown'
        }
      };

      const result = getEstimationRecommendations(story);
      expect(result.recommendedApproach).toBe('spike-first');
      expect(result.confidenceLevel).toBe('low');
      expect(result.recommendations).toContain('Create spike to reduce uncertainty before estimation');
    });

    it('recommends conservative approach for medium uncertainty', () => {
      const story = {
        uncertaintyFactors: {
          technology: 'partially known'
        }
      };

      const result = getEstimationRecommendations(story);
      expect(result.recommendedApproach).toBe('conservative');
      expect(result.confidenceLevel).toBe('medium');
    });

    it('includes dependency recommendations', () => {
      const story = {
        dependencies: [
          {
            type: 'external',
            risk: 'high',
            impact: 'Blocks functionality'
          }
        ]
      };

      const result = getEstimationRecommendations(story);
      expect(result.recommendations).toContain('Consider breaking story to reduce dependency impact');
    });

    it('includes technical debt recommendations', () => {
      const story = {
        technicalDebt: {
          debtAge: '2 years',
          impact: {
            codeComplexity: 'Very hard',
            testability: 'Difficult',
            maintainability: 'Hard'
          }
        }
      };

      const result = getEstimationRecommendations(story);
      expect(result.recommendations).toContain('Address technical debt before implementing new functionality');
      expect(result.confidenceLevel).toBe('low');
    });

    it('recommends breakdown for multiple high-complexity areas', () => {
      const story = {
        complexityFactors: {
          technical: 'high',
          business: 'high',
          integration: 'high'
        }
      };

      const result = getEstimationRecommendations(story);
      expect(result.recommendations).toContain('Consider breaking down due to multiple high-complexity areas');
    });
  });

  describe('validateEstimation', () => {
    it('validates reasonable estimates for simple stories', () => {
      const story = {
        complexityFactors: {
          technical: 'low',
          business: 'low'
        }
      };

      const result = validateEstimation(3, story);
      expect(result.isReasonable).toBe(true);
      expect(result.confidenceLevel).toBe('high');
    });

    it('flags low estimates for high uncertainty stories', () => {
      const story = {
        uncertaintyFactors: {
          technology: 'unknown',
          integration: 'unclear',
          performance: 'unknown'
        }
      };

      const result = validateEstimation(2, story);
      expect(result.isReasonable).toBe(false);
      expect(result.feedback).toContain('Estimate may be too low given high uncertainty factors');
    });

    it('flags estimates over 8 points for breakdown', () => {
      const story = {
        complexityFactors: {
          technical: 'medium'
        }
      };

      const result = validateEstimation(13, story);
      expect(result.isReasonable).toBe(false);
      expect(result.feedback).toContain('Stories larger than 8 points should typically be broken down');
    });

    it('provides technical debt complexity feedback', () => {
      const story = {
        technicalDebt: {
          debtAge: '1 year',
          impact: {
            codeComplexity: 'Hard to understand'
          }
        }
      };

      const result = validateEstimation(5, story);
      expect(result.feedback.some(f => f.includes('Technical debt may increase complexity'))).toBe(true);
    });

    it('removes duplicate recommendations', () => {
      const story = {
        uncertaintyFactors: {
          technology: 'unknown'
        },
        dependencies: [
          {
            type: 'external',
            risk: 'high'
          }
        ]
      };

      const result = validateEstimation(5, story);
      const uniqueRecommendations = [...new Set(result.recommendations)];
      expect(result.recommendations).toEqual(uniqueRecommendations);
    });
  });
});