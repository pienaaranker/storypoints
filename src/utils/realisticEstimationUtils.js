/**
 * Utility functions for realistic estimation challenges
 */

/**
 * Analyzes uncertainty factors and provides estimation guidance
 * @param {Object} uncertaintyFactors - Object containing uncertainty factors
 * @returns {Object} Analysis with risk level and recommendations
 */
export const analyzeUncertaintyFactors = (uncertaintyFactors) => {
  if (!uncertaintyFactors) return { riskLevel: 'low', recommendations: [] };

  const factorCount = Object.keys(uncertaintyFactors).length;
  const highRiskKeywords = ['unknown', 'unclear', 'incomplete', 'none', 'beta', 'unstable'];
  
  let riskScore = 0;
  const recommendations = [];

  Object.entries(uncertaintyFactors).forEach(([factor, description]) => {
    const hasHighRiskKeyword = highRiskKeywords.some(keyword => 
      description.toLowerCase().includes(keyword)
    );
    
    if (hasHighRiskKeyword) {
      riskScore += 2;
      recommendations.push(`Consider spike for ${factor.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } else {
      riskScore += 1;
    }
  });

  let riskLevel = 'low';
  if (riskScore >= factorCount * 1.5) {
    riskLevel = 'high';
    recommendations.push('Strong recommendation: Create spike before estimation');
  } else if (riskScore >= factorCount) {
    riskLevel = 'medium';
    recommendations.push('Consider conservative estimation with uncertainty buffer');
  }

  return { riskLevel, recommendations, riskScore };
};

/**
 * Calculates dependency impact on story estimation
 * @param {Array} dependencies - Array of dependency objects
 * @returns {Object} Impact analysis with recommendations
 */
export const calculateDependencyImpact = (dependencies) => {
  if (!dependencies || dependencies.length === 0) {
    return { impactLevel: 'none', recommendations: [], blockers: [] };
  }

  let impactScore = 0;
  const blockers = [];
  const recommendations = [];

  dependencies.forEach(dep => {
    let depScore = 0;
    
    // Risk level impact
    switch (dep.risk) {
      case 'high': depScore += 3; break;
      case 'medium': depScore += 2; break;
      case 'low': depScore += 1; break;
      default: depScore += 1;
    }

    // Type impact
    if (dep.type === 'external') {
      depScore += 2;
      recommendations.push(`Consider mocking ${dep.description} for parallel development`);
    } else {
      depScore += 1;
    }

    // Check if it's a blocker
    if (dep.impact && dep.impact.toLowerCase().includes('block')) {
      blockers.push(dep);
      depScore += 2;
    }

    impactScore += depScore;
  });

  let impactLevel = 'low';
  if (impactScore >= dependencies.length * 4) {
    impactLevel = 'high';
    recommendations.push('Consider breaking story into phases to reduce dependency impact');
  } else if (impactScore >= dependencies.length * 2.5) {
    impactLevel = 'medium';
    recommendations.push('Plan for dependency delays in estimation');
  }

  if (blockers.length > 0) {
    recommendations.push('Identify alternative approaches for blocked functionality');
  }

  return { impactLevel, recommendations, blockers, impactScore };
};

/**
 * Analyzes technical debt impact on story implementation
 * @param {Object} technicalDebt - Technical debt information
 * @returns {Object} Analysis with complexity multiplier and recommendations
 */
export const analyzeTechnicalDebtImpact = (technicalDebt) => {
  if (!technicalDebt) {
    return { complexityMultiplier: 1, recommendations: [], debtLevel: 'none' };
  }

  let debtScore = 0;
  const recommendations = [];

  // Age impact
  if (technicalDebt.debtAge) {
    const ageMatch = technicalDebt.debtAge.match(/(\d+)/);
    if (ageMatch) {
      const ageValue = parseInt(ageMatch[1]);
      if (technicalDebt.debtAge.includes('year')) {
        debtScore += Math.min(ageValue * 2, 6); // Cap at 6 points for age
      } else if (technicalDebt.debtAge.includes('month')) {
        debtScore += Math.min(Math.ceil(ageValue / 6), 3); // Cap at 3 points for months
      }
    }
  }

  // Impact areas
  if (technicalDebt.impact) {
    const impactAreas = Object.keys(technicalDebt.impact).length;
    debtScore += impactAreas;

    Object.entries(technicalDebt.impact).forEach(([area, description]) => {
      if (description.toLowerCase().includes('hard') || 
          description.toLowerCase().includes('difficult') ||
          description.toLowerCase().includes('scattered')) {
        debtScore += 1;
      }
    });
  }

  // Previous attempts
  if (technicalDebt.previousAttempts) {
    debtScore += 2;
    recommendations.push('Learn from previous refactoring attempts to avoid similar issues');
  }

  let debtLevel = 'low';
  let complexityMultiplier = 1;

  if (debtScore >= 8) {
    debtLevel = 'high';
    complexityMultiplier = 2.5;
    recommendations.push('Strong recommendation: Refactor before adding new functionality');
    recommendations.push('Consider this as separate epic rather than single story');
  } else if (debtScore >= 5) {
    debtLevel = 'medium';
    complexityMultiplier = 1.8;
    recommendations.push('Include refactoring time in story estimate');
    recommendations.push('Plan for additional testing due to code complexity');
  } else if (debtScore >= 2) {
    debtLevel = 'low';
    complexityMultiplier = 1.3;
    recommendations.push('Minor refactoring may be needed');
  }

  return { complexityMultiplier, recommendations, debtLevel, debtScore };
};

/**
 * Calculates spike value and story estimation improvements
 * @param {Object} spike - Spike information
 * @param {Array} resultingStories - Stories that result from the spike
 * @returns {Object} Value analysis of the spike
 */
export const calculateSpikeValue = (spike, resultingStories) => {
  if (!spike || !resultingStories) {
    return { timeInvestment: 0, estimationImprovement: 0, riskReduction: 'none' };
  }

  const spikeHours = parseFloat(spike.timeBox.match(/(\d+)/)?.[1] || 0);
  const spikePoints = Math.ceil(spikeHours / 6); // Assuming 6 hours per story point

  // Calculate total story points after spike
  const totalStoryPoints = resultingStories.reduce((sum, story) => sum + (story.points || 0), 0);

  // Estimate what the points would have been without spike (conservative estimate)
  const estimatedPointsWithoutSpike = totalStoryPoints * 2; // Assume 2x multiplier for uncertainty

  const pointsSaved = estimatedPointsWithoutSpike - totalStoryPoints - spikePoints;
  const estimationImprovement = ((estimatedPointsWithoutSpike - totalStoryPoints) / estimatedPointsWithoutSpike) * 100;

  let riskReduction = 'low';
  if (spike.uncertaintyFactors && spike.uncertaintyFactors.length > 3) {
    riskReduction = 'high';
  } else if (spike.uncertaintyFactors && spike.uncertaintyFactors.length > 1) {
    riskReduction = 'medium';
  }

  return {
    timeInvestment: spikePoints,
    pointsSaved: Math.max(pointsSaved, 0),
    estimationImprovement: Math.round(estimationImprovement),
    riskReduction,
    roi: pointsSaved > 0 ? Math.round((pointsSaved / spikePoints) * 100) : 0
  };
};

/**
 * Provides estimation recommendations based on story characteristics
 * @param {Object} story - Story object with various complexity factors
 * @returns {Object} Recommendations for estimation approach
 */
export const getEstimationRecommendations = (story) => {
  const recommendations = [];
  let recommendedApproach = 'standard';
  let confidenceLevel = 'high';

  // Check uncertainty factors
  if (story.uncertaintyFactors) {
    const uncertaintyAnalysis = analyzeUncertaintyFactors(story.uncertaintyFactors);
    if (uncertaintyAnalysis.riskLevel === 'high') {
      recommendedApproach = 'spike-first';
      confidenceLevel = 'low';
      recommendations.push('Create spike to reduce uncertainty before estimation');
    } else if (uncertaintyAnalysis.riskLevel === 'medium') {
      recommendedApproach = 'conservative';
      confidenceLevel = 'medium';
      recommendations.push('Use conservative estimation with uncertainty buffer');
    }
  }

  // Check dependencies
  if (story.dependencies) {
    const dependencyAnalysis = calculateDependencyImpact(story.dependencies);
    if (dependencyAnalysis.impactLevel === 'high') {
      recommendations.push('Consider breaking story to reduce dependency impact');
      if (confidenceLevel === 'high') confidenceLevel = 'medium';
    }
    recommendations.push(...dependencyAnalysis.recommendations);
  }

  // Check technical debt
  if (story.technicalDebt) {
    const debtAnalysis = analyzeTechnicalDebtImpact(story.technicalDebt);
    if (debtAnalysis.debtLevel === 'high') {
      recommendations.push('Address technical debt before implementing new functionality');
      confidenceLevel = 'low';
    }
    recommendations.push(...debtAnalysis.recommendations);
  }

  // Check complexity factors
  if (story.complexityFactors) {
    const highComplexityAreas = Object.entries(story.complexityFactors)
      .filter(([_, level]) => level === 'high')
      .map(([area, _]) => area);

    if (highComplexityAreas.length > 2) {
      recommendations.push('Consider breaking down due to multiple high-complexity areas');
      if (confidenceLevel === 'high') confidenceLevel = 'medium';
    }
  }

  return {
    recommendedApproach,
    confidenceLevel,
    recommendations: [...new Set(recommendations)] // Remove duplicates
  };
};

/**
 * Validates estimation against story characteristics
 * @param {number} estimate - User's estimate in story points
 * @param {Object} story - Story object
 * @returns {Object} Validation result with feedback
 */
export const validateEstimation = (estimate, story) => {
  const recommendations = getEstimationRecommendations(story);
  const feedback = [];
  let isReasonable = true;

  // Check if estimate is too low for high uncertainty
  if (story.uncertaintyFactors) {
    const uncertaintyAnalysis = analyzeUncertaintyFactors(story.uncertaintyFactors);
    if (uncertaintyAnalysis.riskLevel === 'high' && estimate < 8) {
      feedback.push('Estimate may be too low given high uncertainty factors');
      isReasonable = false;
    }
  }

  // Check technical debt impact
  if (story.technicalDebt) {
    const debtAnalysis = analyzeTechnicalDebtImpact(story.technicalDebt);
    if (debtAnalysis.complexityMultiplier > 1.2) {
      feedback.push(`Technical debt may increase complexity by ${Math.round((debtAnalysis.complexityMultiplier - 1) * 100)}%`);
    }
  }

  // Check for breakdown needs
  if (estimate > 8) {
    feedback.push('Stories larger than 8 points should typically be broken down');
    isReasonable = false;
  }

  return {
    isReasonable,
    feedback,
    recommendations: recommendations.recommendations,
    confidenceLevel: recommendations.confidenceLevel
  };
};