/**
 * Utility functions for team context awareness and estimation variance calculations
 */

/**
 * Calculate estimation variance statistics for a set of team estimates
 * @param {Object} estimationVariance - Object with team estimates
 * @returns {Object} Variance statistics
 */
export const calculateVarianceStats = (estimationVariance) => {
  if (!estimationVariance || Object.keys(estimationVariance).length === 0) {
    return {
      min: 0,
      max: 0,
      range: 0,
      average: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0
    };
  }

  const estimates = Object.values(estimationVariance).map(v => v.points);
  const min = Math.min(...estimates);
  const max = Math.max(...estimates);
  const range = max - min;
  const average = estimates.reduce((sum, val) => sum + val, 0) / estimates.length;
  
  // Calculate standard deviation
  const squaredDifferences = estimates.map(val => Math.pow(val - average, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / estimates.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Coefficient of variation (relative variability)
  const coefficientOfVariation = average > 0 ? (standardDeviation / average) * 100 : 0;

  return {
    min,
    max,
    range,
    average: Math.round(average * 10) / 10, // Round to 1 decimal
    standardDeviation: Math.round(standardDeviation * 10) / 10,
    coefficientOfVariation: Math.round(coefficientOfVariation * 10) / 10
  };
};

/**
 * Determine if estimation variance is significant enough to warrant discussion
 * @param {Object} estimationVariance - Object with team estimates
 * @returns {Object} Analysis of variance significance
 */
export const analyzeVarianceSignificance = (estimationVariance) => {
  const stats = calculateVarianceStats(estimationVariance);
  
  // Thresholds for significance
  const SIGNIFICANT_RANGE_THRESHOLD = 3; // Points difference
  const HIGH_CV_THRESHOLD = 30; // Coefficient of variation percentage
  
  const isSignificant = stats.range >= SIGNIFICANT_RANGE_THRESHOLD || 
                       stats.coefficientOfVariation >= HIGH_CV_THRESHOLD;
  
  let significance = 'low';
  let recommendation = 'Estimates are relatively consistent across teams.';
  
  if (stats.range >= 8) {
    significance = 'very-high';
    recommendation = 'Large variance suggests story needs breakdown or spike to reduce uncertainty.';
  } else if (stats.range >= 5) {
    significance = 'high';
    recommendation = 'Significant variance indicates different team interpretations. Discussion recommended.';
  } else if (stats.range >= 3) {
    significance = 'medium';
    recommendation = 'Moderate variance is normal due to team context differences.';
  }

  return {
    isSignificant,
    significance,
    recommendation,
    stats
  };
};

/**
 * Get contextual explanation for why teams might estimate differently
 * @param {Array} teamContexts - Array of team context objects
 * @param {Object} estimationVariance - Object with team estimates
 * @returns {Array} Array of explanation factors
 */
export const getVarianceExplanationFactors = (teamContexts, estimationVariance) => {
  const factors = [];
  
  if (!teamContexts || !estimationVariance) {
    return factors;
  }

  // Check for experience level differences
  const experienceLevels = teamContexts.map(team => team.experienceLevel);
  const uniqueExperience = [...new Set(experienceLevels)];
  if (uniqueExperience.length > 1) {
    factors.push({
      factor: 'Experience Level Variance',
      description: 'Teams with different experience levels estimate the same work differently due to varying skill levels and efficiency.',
      impact: 'high'
    });
  }

  // Check for domain knowledge differences
  const domainLevels = teamContexts.map(team => team.domainKnowledge);
  const uniqueDomain = [...new Set(domainLevels)];
  if (uniqueDomain.length > 1) {
    factors.push({
      factor: 'Domain Knowledge Variance',
      description: 'Teams with different domain expertise estimate business logic and requirements understanding differently.',
      impact: 'medium'
    });
  }

  // Check for technical stack familiarity
  const techStack = teamContexts.map(team => team.technicalStack);
  const uniqueTech = [...new Set(techStack)];
  if (uniqueTech.length > 1) {
    factors.push({
      factor: 'Technology Stack Familiarity',
      description: 'Teams working with unfamiliar technology need more time for learning and implementation.',
      impact: 'high'
    });
  }

  // Check for team size differences
  const teamSizes = teamContexts.map(team => team.teamSize);
  const minSize = Math.min(...teamSizes);
  const maxSize = Math.max(...teamSizes);
  if (maxSize - minSize >= 2) {
    factors.push({
      factor: 'Team Size Variance',
      description: 'Different team sizes affect coordination overhead and parallel work capabilities.',
      impact: 'low'
    });
  }

  // Check confidence levels in estimates
  const confidenceLevels = Object.values(estimationVariance).map(v => v.confidenceLevel);
  const lowConfidenceCount = confidenceLevels.filter(c => c === 'low').length;
  if (lowConfidenceCount > 0) {
    factors.push({
      factor: 'Estimation Uncertainty',
      description: `${lowConfidenceCount} team(s) have low confidence, indicating high uncertainty or unfamiliar requirements.`,
      impact: 'high'
    });
  }

  return factors;
};

/**
 * Generate recommendations for handling estimation variance
 * @param {Object} varianceAnalysis - Result from analyzeVarianceSignificance
 * @param {Array} explanationFactors - Result from getVarianceExplanationFactors
 * @returns {Array} Array of actionable recommendations
 */
export const generateVarianceRecommendations = (varianceAnalysis, explanationFactors) => {
  const recommendations = [];
  
  if (!varianceAnalysis.isSignificant) {
    recommendations.push({
      type: 'success',
      title: 'Consistent Estimates',
      description: 'Team estimates are reasonably consistent. Proceed with planning.',
      priority: 'low'
    });
    return recommendations;
  }

  // High variance recommendations
  if (varianceAnalysis.significance === 'very-high') {
    recommendations.push({
      type: 'warning',
      title: 'Story Breakdown Required',
      description: 'Large estimation variance suggests this story is too big or unclear. Break it down into smaller, more predictable stories.',
      priority: 'high'
    });
    
    recommendations.push({
      type: 'info',
      title: 'Consider a Spike',
      description: 'If uncertainty is high, create a time-boxed spike to research and reduce unknowns before re-estimating.',
      priority: 'high'
    });
  }

  // Experience-based recommendations
  const hasExperienceVariance = explanationFactors.some(f => f.factor === 'Experience Level Variance');
  if (hasExperienceVariance) {
    recommendations.push({
      type: 'info',
      title: 'Pair Programming Opportunity',
      description: 'Consider pairing junior and senior developers to share knowledge and improve estimate accuracy.',
      priority: 'medium'
    });
  }

  // Technology stack recommendations
  const hasTechVariance = explanationFactors.some(f => f.factor === 'Technology Stack Familiarity');
  if (hasTechVariance) {
    recommendations.push({
      type: 'info',
      title: 'Learning Time',
      description: 'Factor in learning time for teams working with unfamiliar technology. This is legitimate development work.',
      priority: 'medium'
    });
  }

  // Low confidence recommendations
  const hasUncertainty = explanationFactors.some(f => f.factor === 'Estimation Uncertainty');
  if (hasUncertainty) {
    recommendations.push({
      type: 'warning',
      title: 'Clarify Requirements',
      description: 'Low confidence estimates suggest unclear requirements. Spend time clarifying acceptance criteria and technical approach.',
      priority: 'high'
    });
  }

  return recommendations;
};

/**
 * Format team context for display
 * @param {Object} teamContext - Team context object
 * @returns {Object} Formatted display information
 */
export const formatTeamContextDisplay = (teamContext) => {
  if (!teamContext) return null;

  const experienceLabels = {
    junior: 'Junior (1-2 years)',
    intermediate: 'Intermediate (3-5 years)', 
    senior: 'Senior (5+ years)'
  };

  const domainLabels = {
    low: 'Limited Domain Knowledge',
    medium: 'Some Domain Knowledge',
    high: 'Deep Domain Expertise'
  };

  const techLabels = {
    familiar: 'Familiar Technology Stack',
    new: 'New Technology Stack',
    mixed: 'Mixed Technology Familiarity'
  };

  return {
    ...teamContext,
    experienceLabel: experienceLabels[teamContext.experienceLevel] || teamContext.experienceLevel,
    domainLabel: domainLabels[teamContext.domainKnowledge] || teamContext.domainKnowledge,
    techLabel: techLabels[teamContext.technicalStack] || teamContext.technicalStack
  };
};

/**
 * Validate team context data structure
 * @param {Object} teamContext - Team context to validate
 * @returns {Object} Validation result
 */
export const validateTeamContext = (teamContext) => {
  const errors = [];
  
  if (!teamContext) {
    errors.push('Team context is required');
    return { isValid: false, errors };
  }

  const requiredFields = ['experienceLevel', 'domainKnowledge', 'technicalStack', 'teamSize'];
  requiredFields.forEach(field => {
    if (!teamContext[field]) {
      errors.push(`${field} is required`);
    }
  });

  const validExperience = ['junior', 'intermediate', 'senior'];
  if (teamContext.experienceLevel && !validExperience.includes(teamContext.experienceLevel)) {
    errors.push('Invalid experience level');
  }

  const validDomain = ['low', 'medium', 'high'];
  if (teamContext.domainKnowledge && !validDomain.includes(teamContext.domainKnowledge)) {
    errors.push('Invalid domain knowledge level');
  }

  const validTech = ['familiar', 'new', 'mixed'];
  if (teamContext.technicalStack && !validTech.includes(teamContext.technicalStack)) {
    errors.push('Invalid technical stack familiarity');
  }

  if (teamContext.teamSize && (teamContext.teamSize < 1 || teamContext.teamSize > 20)) {
    errors.push('Team size must be between 1 and 20');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};