/**
 * Story Breakdown Validation Utilities
 * Provides validation logic for story breakdown workshop
 */

/**
 * Validates a story breakdown attempt
 * @param {Array} breakdown - Array of broken down stories
 * @param {Object} originalStory - The original story being broken down
 * @returns {Object} Validation results with errors, warnings, and suggestions
 */
export function validateStoryBreakdown(breakdown, originalStory) {
  const results = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Validate individual stories
  breakdown.forEach((story, index) => {
    validateStorySize(story, index, results);
    validateStoryEstimate(story, index, results);
    validateStoryContent(story, index, results);
  });

  // Validate breakdown as a whole
  validateScopeCoverage(breakdown, originalStory, results);
  validateEstimateVariance(breakdown, originalStory, results);
  validateBreakdownQuality(breakdown, originalStory, results);

  return results;
}

/**
 * Validates that a story is appropriately sized (1-8 points)
 */
function validateStorySize(story, index, results) {
  const points = story.estimatedPoints || 0;
  
  if (points > 8) {
    results.errors.push({
      storyIndex: index,
      message: `Story "${story.title || 'Untitled'}" is ${points} points - should be 8 or smaller`,
      type: 'size-violation',
      severity: 'error'
    });
    results.isValid = false;
  }
  
  if (points > 5) {
    results.warnings.push({
      storyIndex: index,
      message: `Story "${story.title || 'Untitled'}" is ${points} points - consider if it can be broken down further`,
      type: 'size-warning',
      severity: 'warning'
    });
  }
}

/**
 * Validates that a story has a valid point estimate
 */
function validateStoryEstimate(story, index, results) {
  const points = story.estimatedPoints || 0;
  
  if (points < 1) {
    results.errors.push({
      storyIndex: index,
      message: `Story "${story.title || 'Untitled'}" needs a point estimate (1-8 points)`,
      type: 'missing-estimate',
      severity: 'error'
    });
    results.isValid = false;
  }
}

/**
 * Validates that a story has sufficient content
 */
function validateStoryContent(story, index, results) {
  if (!story.title || story.title.trim().length === 0) {
    results.errors.push({
      storyIndex: index,
      message: `Story ${index + 1} needs a title`,
      type: 'missing-title',
      severity: 'error'
    });
    results.isValid = false;
  }
  
  if (!story.description || story.description.trim().length === 0) {
    results.warnings.push({
      storyIndex: index,
      message: `Story "${story.title || 'Untitled'}" should have a description`,
      type: 'missing-description',
      severity: 'warning'
    });
  }
  
  if (!story.acceptanceCriteria || story.acceptanceCriteria.length === 0 || 
      story.acceptanceCriteria.every(ac => !ac || ac.trim().length === 0)) {
    results.warnings.push({
      storyIndex: index,
      message: `Story "${story.title || 'Untitled'}" should have acceptance criteria`,
      type: 'missing-criteria',
      severity: 'warning'
    });
  }
}

/**
 * Validates that the breakdown covers the original story scope
 */
function validateScopeCoverage(breakdown, originalStory, results) {
  const originalCriteria = originalStory.acceptanceCriteria || [];
  const breakdownCriteria = breakdown.flatMap(s => s.acceptanceCriteria || [])
    .filter(ac => ac && ac.trim().length > 0);
  
  // Check if breakdown has sufficient acceptance criteria coverage
  if (breakdownCriteria.length < originalCriteria.length * 0.8) {
    results.warnings.push({
      message: `Your breakdown may not cover all aspects of the original story. Original had ${originalCriteria.length} criteria, breakdown has ${breakdownCriteria.length}.`,
      type: 'scope-coverage',
      severity: 'warning'
    });
  }
  
  // Check for empty stories
  const emptyStories = breakdown.filter(s => 
    (!s.title || s.title.trim().length === 0) && 
    (!s.description || s.description.trim().length === 0)
  );
  
  if (emptyStories.length > 0) {
    results.warnings.push({
      message: `${emptyStories.length} story(ies) appear to be empty or incomplete`,
      type: 'incomplete-stories',
      severity: 'warning'
    });
  }
}

/**
 * Validates estimate variance between breakdown and original story
 */
function validateEstimateVariance(breakdown, originalStory, results) {
  const totalPoints = breakdown.reduce((sum, s) => sum + (s.estimatedPoints || 0), 0);
  const originalPoints = getOriginalStoryPoints(originalStory);
  
  if (originalPoints > 0) {
    const variance = Math.abs(totalPoints - originalPoints) / originalPoints;
    
    if (variance > 0.5) {
      results.suggestions.push({
        message: `Total breakdown points (${totalPoints}) differs significantly from original estimate (${originalPoints}). This is normal - breakdown often reveals hidden complexity or helps identify over-estimation.`,
        type: 'estimate-variance',
        severity: 'info'
      });
    } else if (variance > 0.3) {
      results.suggestions.push({
        message: `Total breakdown points (${totalPoints}) vs original estimate (${originalPoints}) shows moderate variance. Consider if all complexity was captured.`,
        type: 'estimate-variance',
        severity: 'info'
      });
    }
  }
}

/**
 * Validates overall breakdown quality
 */
function validateBreakdownQuality(breakdown, originalStory, results) {
  if (breakdown.length === 1) {
    results.warnings.push({
      message: 'Breaking down into just one story may not provide the benefits of decomposition. Consider if further breakdown is possible.',
      type: 'insufficient-breakdown',
      severity: 'warning'
    });
  }
  
  if (breakdown.length > 8) {
    results.warnings.push({
      message: `Breaking down into ${breakdown.length} stories might be too granular. Consider grouping related functionality.`,
      type: 'excessive-breakdown',
      severity: 'warning'
    });
  }
  
  // Check for stories with very similar sizes (might indicate lack of proper analysis)
  const points = breakdown.map(s => s.estimatedPoints || 0).filter(p => p > 0);
  const uniquePoints = [...new Set(points)];
  
  if (points.length > 2 && uniquePoints.length === 1) {
    results.suggestions.push({
      message: `All stories have the same point estimate (${uniquePoints[0]}). Consider if complexity truly is identical across all stories.`,
      type: 'uniform-estimates',
      severity: 'info'
    });
  }
}

/**
 * Gets the original story point estimate from various possible sources
 */
function getOriginalStoryPoints(story) {
  return story.correctPoints || 
         story.estimationVariance?.experiencedTeam?.points ||
         story.estimationVariance?.seniorTeam?.points ||
         story.estimationVariance?.intermediateTeam?.points ||
         0;
}

/**
 * Calculates breakdown quality score (0-100)
 * @param {Object} validationResults - Results from validateStoryBreakdown
 * @returns {number} Quality score from 0-100
 */
export function calculateBreakdownQuality(validationResults) {
  let score = 100;
  
  // Deduct points for errors (major issues)
  score -= validationResults.errors.length * 20;
  
  // Deduct points for warnings (minor issues)
  score -= validationResults.warnings.length * 10;
  
  // Ensure score doesn't go below 0
  return Math.max(0, score);
}

/**
 * Provides breakdown improvement suggestions based on validation results
 * @param {Object} validationResults - Results from validateStoryBreakdown
 * @returns {Array} Array of improvement suggestions
 */
export function getBreakdownImprovementSuggestions(validationResults) {
  const suggestions = [];
  
  // Group errors by type for better suggestions
  const errorsByType = validationResults.errors.reduce((acc, error) => {
    acc[error.type] = acc[error.type] || [];
    acc[error.type].push(error);
    return acc;
  }, {});
  
  if (errorsByType['size-violation']) {
    suggestions.push({
      type: 'size-violation',
      title: 'Story Size Issues',
      description: 'Some stories are larger than 8 points and should be broken down further.',
      actions: [
        'Look for natural breakpoints in the acceptance criteria',
        'Consider separating UI from backend logic',
        'Split by user workflow steps',
        'Separate data operations from business logic'
      ]
    });
  }
  
  if (errorsByType['missing-estimate']) {
    suggestions.push({
      type: 'missing-estimate',
      title: 'Missing Estimates',
      description: 'All stories need point estimates to validate the breakdown.',
      actions: [
        'Estimate each story relative to others',
        'Use Planning Poker or similar techniques',
        'Consider complexity, effort, and uncertainty',
        'Aim for stories between 1-8 points'
      ]
    });
  }
  
  // Add suggestions based on warnings
  const warningsByType = validationResults.warnings.reduce((acc, warning) => {
    acc[warning.type] = acc[warning.type] || [];
    acc[warning.type].push(warning);
    return acc;
  }, {});
  
  if (warningsByType['scope-coverage']) {
    suggestions.push({
      type: 'scope-coverage',
      title: 'Scope Coverage',
      description: 'Ensure your breakdown covers all aspects of the original story.',
      actions: [
        'Review original acceptance criteria',
        'Map each criteria to breakdown stories',
        'Add missing functionality as new stories',
        'Consider edge cases and error handling'
      ]
    });
  }
  
  return suggestions;
}

/**
 * Formats validation results for display
 * @param {Object} validationResults - Results from validateStoryBreakdown
 * @returns {Object} Formatted results for UI display
 */
export function formatValidationResults(validationResults) {
  return {
    ...validationResults,
    qualityScore: calculateBreakdownQuality(validationResults),
    improvementSuggestions: getBreakdownImprovementSuggestions(validationResults),
    summary: {
      totalIssues: validationResults.errors.length + validationResults.warnings.length,
      criticalIssues: validationResults.errors.length,
      minorIssues: validationResults.warnings.length,
      isPassable: validationResults.isValid && validationResults.warnings.length <= 2
    }
  };
}