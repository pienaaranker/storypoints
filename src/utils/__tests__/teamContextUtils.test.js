import { describe, it, expect } from 'vitest';
import {
  calculateVarianceStats,
  analyzeVarianceSignificance,
  getVarianceExplanationFactors,
  generateVarianceRecommendations,
  formatTeamContextDisplay,
  validateTeamContext
} from '../teamContextUtils';

describe('teamContextUtils', () => {
  describe('calculateVarianceStats', () => {
    it('calculates variance statistics correctly', () => {
      const estimationVariance = {
        'team1': { points: 3 },
        'team2': { points: 5 },
        'team3': { points: 8 }
      };

      const stats = calculateVarianceStats(estimationVariance);

      expect(stats.min).toBe(3);
      expect(stats.max).toBe(8);
      expect(stats.range).toBe(5);
      expect(stats.average).toBe(5.3);
      expect(stats.standardDeviation).toBeCloseTo(2.1, 1);
      expect(stats.coefficientOfVariation).toBeCloseTo(38.5, 1);
    });

    it('handles empty estimation variance', () => {
      const stats = calculateVarianceStats({});

      expect(stats.min).toBe(0);
      expect(stats.max).toBe(0);
      expect(stats.range).toBe(0);
      expect(stats.average).toBe(0);
      expect(stats.standardDeviation).toBe(0);
      expect(stats.coefficientOfVariation).toBe(0);
    });

    it('handles single estimate', () => {
      const estimationVariance = {
        'team1': { points: 5 }
      };

      const stats = calculateVarianceStats(estimationVariance);

      expect(stats.min).toBe(5);
      expect(stats.max).toBe(5);
      expect(stats.range).toBe(0);
      expect(stats.average).toBe(5);
      expect(stats.standardDeviation).toBe(0);
      expect(stats.coefficientOfVariation).toBe(0);
    });

    it('handles null or undefined input', () => {
      expect(calculateVarianceStats(null)).toEqual({
        min: 0, max: 0, range: 0, average: 0, standardDeviation: 0, coefficientOfVariation: 0
      });
      expect(calculateVarianceStats(undefined)).toEqual({
        min: 0, max: 0, range: 0, average: 0, standardDeviation: 0, coefficientOfVariation: 0
      });
    });
  });

  describe('analyzeVarianceSignificance', () => {
    it('identifies low significance for consistent estimates', () => {
      const estimationVariance = {
        'team1': { points: 3 },
        'team2': { points: 4 },
        'team3': { points: 3 }
      };

      const analysis = analyzeVarianceSignificance(estimationVariance);

      expect(analysis.isSignificant).toBe(false);
      expect(analysis.significance).toBe('low');
      expect(analysis.recommendation).toContain('relatively consistent');
    });

    it('identifies medium significance for moderate variance', () => {
      const estimationVariance = {
        'team1': { points: 3 },
        'team2': { points: 6 },
        'team3': { points: 5 }
      };

      const analysis = analyzeVarianceSignificance(estimationVariance);

      expect(analysis.isSignificant).toBe(true);
      expect(analysis.significance).toBe('medium');
      expect(analysis.recommendation).toContain('Moderate variance is normal');
    });

    it('identifies high significance for large variance', () => {
      const estimationVariance = {
        'team1': { points: 2 },
        'team2': { points: 8 },
        'team3': { points: 5 }
      };

      const analysis = analyzeVarianceSignificance(estimationVariance);

      expect(analysis.isSignificant).toBe(true);
      expect(analysis.significance).toBe('high');
      expect(analysis.recommendation).toContain('Discussion recommended');
    });

    it('identifies very high significance for extreme variance', () => {
      const estimationVariance = {
        'team1': { points: 2 },
        'team2': { points: 13 },
        'team3': { points: 5 }
      };

      const analysis = analyzeVarianceSignificance(estimationVariance);

      expect(analysis.isSignificant).toBe(true);
      expect(analysis.significance).toBe('very-high');
      expect(analysis.recommendation).toContain('breakdown or spike');
    });
  });

  describe('getVarianceExplanationFactors', () => {
    const teamContexts = [
      {
        id: 'junior',
        experienceLevel: 'junior',
        domainKnowledge: 'low',
        technicalStack: 'new',
        teamSize: 3
      },
      {
        id: 'senior',
        experienceLevel: 'senior',
        domainKnowledge: 'high',
        technicalStack: 'familiar',
        teamSize: 5
      }
    ];

    const estimationVariance = {
      'junior': { points: 8, confidenceLevel: 'low' },
      'senior': { points: 3, confidenceLevel: 'high' }
    };

    it('identifies experience level variance', () => {
      const factors = getVarianceExplanationFactors(teamContexts, estimationVariance);

      const experienceFactor = factors.find(f => f.factor === 'Experience Level Variance');
      expect(experienceFactor).toBeDefined();
      expect(experienceFactor.impact).toBe('high');
    });

    it('identifies domain knowledge variance', () => {
      const factors = getVarianceExplanationFactors(teamContexts, estimationVariance);

      const domainFactor = factors.find(f => f.factor === 'Domain Knowledge Variance');
      expect(domainFactor).toBeDefined();
      expect(domainFactor.impact).toBe('medium');
    });

    it('identifies technical stack variance', () => {
      const factors = getVarianceExplanationFactors(teamContexts, estimationVariance);

      const techFactor = factors.find(f => f.factor === 'Technology Stack Familiarity');
      expect(techFactor).toBeDefined();
      expect(techFactor.impact).toBe('high');
    });

    it('identifies team size variance', () => {
      const factors = getVarianceExplanationFactors(teamContexts, estimationVariance);

      const sizeFactor = factors.find(f => f.factor === 'Team Size Variance');
      expect(sizeFactor).toBeDefined();
      expect(sizeFactor.impact).toBe('low');
    });

    it('identifies estimation uncertainty', () => {
      const factors = getVarianceExplanationFactors(teamContexts, estimationVariance);

      const uncertaintyFactor = factors.find(f => f.factor === 'Estimation Uncertainty');
      expect(uncertaintyFactor).toBeDefined();
      expect(uncertaintyFactor.impact).toBe('high');
      expect(uncertaintyFactor.description).toContain('1 team(s) have low confidence');
    });

    it('handles empty inputs gracefully', () => {
      expect(getVarianceExplanationFactors([], {})).toEqual([]);
      expect(getVarianceExplanationFactors(null, null)).toEqual([]);
    });

    it('does not identify factors when teams are similar', () => {
      const similarTeams = [
        {
          id: 'team1',
          experienceLevel: 'senior',
          domainKnowledge: 'high',
          technicalStack: 'familiar',
          teamSize: 5
        },
        {
          id: 'team2',
          experienceLevel: 'senior',
          domainKnowledge: 'high',
          technicalStack: 'familiar',
          teamSize: 5
        }
      ];

      const similarVariance = {
        'team1': { points: 5, confidenceLevel: 'high' },
        'team2': { points: 5, confidenceLevel: 'high' }
      };

      const factors = getVarianceExplanationFactors(similarTeams, similarVariance);
      
      expect(factors.length).toBe(0);
    });
  });

  describe('generateVarianceRecommendations', () => {
    it('generates success recommendation for low variance', () => {
      const varianceAnalysis = {
        isSignificant: false,
        significance: 'low'
      };

      const recommendations = generateVarianceRecommendations(varianceAnalysis, []);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe('success');
      expect(recommendations[0].title).toBe('Consistent Estimates');
    });

    it('generates breakdown recommendation for very high variance', () => {
      const varianceAnalysis = {
        isSignificant: true,
        significance: 'very-high'
      };

      const recommendations = generateVarianceRecommendations(varianceAnalysis, []);

      expect(recommendations.length).toBeGreaterThan(1);
      expect(recommendations.some(r => r.title === 'Story Breakdown Required')).toBe(true);
      expect(recommendations.some(r => r.title === 'Consider a Spike')).toBe(true);
    });

    it('generates pairing recommendation for experience variance', () => {
      const varianceAnalysis = {
        isSignificant: true,
        significance: 'medium'
      };

      const explanationFactors = [
        { factor: 'Experience Level Variance', impact: 'high' }
      ];

      const recommendations = generateVarianceRecommendations(varianceAnalysis, explanationFactors);

      expect(recommendations.some(r => r.title === 'Pair Programming Opportunity')).toBe(true);
    });

    it('generates learning time recommendation for tech variance', () => {
      const varianceAnalysis = {
        isSignificant: true,
        significance: 'medium'
      };

      const explanationFactors = [
        { factor: 'Technology Stack Familiarity', impact: 'high' }
      ];

      const recommendations = generateVarianceRecommendations(varianceAnalysis, explanationFactors);

      expect(recommendations.some(r => r.title === 'Learning Time')).toBe(true);
    });

    it('generates clarification recommendation for uncertainty', () => {
      const varianceAnalysis = {
        isSignificant: true,
        significance: 'high'
      };

      const explanationFactors = [
        { factor: 'Estimation Uncertainty', impact: 'high' }
      ];

      const recommendations = generateVarianceRecommendations(varianceAnalysis, explanationFactors);

      expect(recommendations.some(r => r.title === 'Clarify Requirements')).toBe(true);
    });
  });

  describe('formatTeamContextDisplay', () => {
    it('formats team context with labels', () => {
      const teamContext = {
        experienceLevel: 'junior',
        domainKnowledge: 'low',
        technicalStack: 'new',
        teamSize: 4
      };

      const formatted = formatTeamContextDisplay(teamContext);

      expect(formatted.experienceLabel).toBe('Junior (1-2 years)');
      expect(formatted.domainLabel).toBe('Limited Domain Knowledge');
      expect(formatted.techLabel).toBe('New Technology Stack');
    });

    it('handles null input', () => {
      expect(formatTeamContextDisplay(null)).toBeNull();
    });

    it('preserves original properties', () => {
      const teamContext = {
        id: 'test-team',
        name: 'Test Team',
        experienceLevel: 'senior',
        domainKnowledge: 'high',
        technicalStack: 'familiar',
        teamSize: 5
      };

      const formatted = formatTeamContextDisplay(teamContext);

      expect(formatted.id).toBe('test-team');
      expect(formatted.name).toBe('Test Team');
      expect(formatted.teamSize).toBe(5);
    });
  });

  describe('validateTeamContext', () => {
    it('validates correct team context', () => {
      const teamContext = {
        experienceLevel: 'senior',
        domainKnowledge: 'high',
        technicalStack: 'familiar',
        teamSize: 5
      };

      const result = validateTeamContext(teamContext);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('identifies missing required fields', () => {
      const teamContext = {
        experienceLevel: 'senior'
        // Missing other required fields
      };

      const result = validateTeamContext(teamContext);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('domainKnowledge is required');
      expect(result.errors).toContain('technicalStack is required');
      expect(result.errors).toContain('teamSize is required');
    });

    it('validates experience level values', () => {
      const teamContext = {
        experienceLevel: 'invalid',
        domainKnowledge: 'high',
        technicalStack: 'familiar',
        teamSize: 5
      };

      const result = validateTeamContext(teamContext);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid experience level');
    });

    it('validates domain knowledge values', () => {
      const teamContext = {
        experienceLevel: 'senior',
        domainKnowledge: 'invalid',
        technicalStack: 'familiar',
        teamSize: 5
      };

      const result = validateTeamContext(teamContext);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid domain knowledge level');
    });

    it('validates technical stack values', () => {
      const teamContext = {
        experienceLevel: 'senior',
        domainKnowledge: 'high',
        technicalStack: 'invalid',
        teamSize: 5
      };

      const result = validateTeamContext(teamContext);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid technical stack familiarity');
    });

    it('validates team size range', () => {
      const teamContext = {
        experienceLevel: 'senior',
        domainKnowledge: 'high',
        technicalStack: 'familiar',
        teamSize: 25
      };

      const result = validateTeamContext(teamContext);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Team size must be between 1 and 20');
    });

    it('handles null input', () => {
      const result = validateTeamContext(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Team context is required');
    });
  });
});