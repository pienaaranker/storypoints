/**
 * Story Point Consistency Validation Utilities
 * 
 * Provides algorithms for checking relative sizing consistency across stories
 * and real-time feedback during estimation exercises.
 */

/**
 * Calculates consistency score between two stories based on their relative complexity
 * @param {Object} story1 - First story with estimation and complexity factors
 * @param {Object} story2 - Second story with estimation and complexity factors
 * @returns {Object} Consistency analysis with score and feedback
 */
export function calculateRelativeConsistency(story1, story2) {
  if (!story1 || !story2 || !story1.points || !story2.points) {
    return { score: 0, feedback: 'Invalid story data for comparison' };
  }

  const pointsRatio = story1.points / story2.points;
  const complexityRatio = calculateComplexityRatio(story1, story2);
  
  // Consistency score based on how well points ratio matches complexity ratio
  const ratioDeviation = Math.abs(Math.log(pointsRatio) - Math.log(complexityRatio));
  const consistencyScore = Math.max(0, 100 - (ratioDeviation * 50));
  
  return {
    score: Math.round(consistencyScore),
    pointsRatio,
    complexityRatio,
    feedback: generateConsistencyFeedback(pointsRatio, complexityRatio, consistencyScore)
  };
}

/**
 * Calculates relative complexity ratio between two stories
 * @param {Object} story1 - First story
 * @param {Object} story2 - Second story
 * @returns {number} Complexity ratio (story1 complexity / story2 complexity)
 */
function calculateComplexityRatio(story1, story2) {
  const complexity1 = calculateOverallComplexity(story1);
  const complexity2 = calculateOverallComplexity(story2);
  
  return complexity1 / complexity2;
}

/**
 * Calculates overall complexity score for a story
 * @param {Object} story - Story with complexity factors
 * @returns {number} Overall complexity score (1-10 scale)
 */
function calculateOverallComplexity(story) {
  const factors = story.complexityFactors || {};
  const weights = {
    technical: 0.3,
    business: 0.25,
    integration: 0.25,
    uncertainty: 0.2
  };
  
  const complexityValues = {
    low: 2,
    medium: 5,
    high: 8
  };
  
  let totalComplexity = 0;
  let totalWeight = 0;
  
  Object.entries(weights).forEach(([factor, weight]) => {
    if (factors[factor]) {
      totalComplexity += (complexityValues[factors[factor]] || 5) * weight;
      totalWeight += weight;
    }
  });
  
  // Default to medium complexity if no factors specified
  return totalWeight > 0 ? totalComplexity / totalWeight : 5;
}

/**
 * Generates human-readable feedback for consistency analysis
 * @param {number} pointsRatio - Ratio of story points
 * @param {number} complexityRatio - Ratio of complexity
 * @param {number} score - Consistency score
 * @returns {string} Feedback message
 */
function generateConsistencyFeedback(pointsRatio, complexityRatio, score) {
  if (score >= 80) {
    return 'Good relative sizing - the point estimates align well with complexity differences.';
  }
  
  if (pointsRatio > complexityRatio * 1.5) {
    return 'The first story might be over-estimated relative to its complexity compared to the second story.';
  }
  
  if (pointsRatio < complexityRatio * 0.67) {
    return 'The first story might be under-estimated relative to its complexity compared to the second story.';
  }
  
  return 'Consider reviewing the relative complexity and ensuring consistent estimation approach.';
}

/**
 * Validates consistency across a set of stories
 * @param {Array} stories - Array of stories with estimations
 * @returns {Object} Overall consistency analysis
 */
export function validateStorySetConsistency(stories) {
  if (!stories || stories.length < 2) {
    return { overallScore: 100, issues: [], recommendations: [] };
  }

  const comparisons = [];
  const issues = [];
  const recommendations = [];
  
  // Compare each story with every other story
  for (let i = 0; i < stories.length; i++) {
    for (let j = i + 1; j < stories.length; j++) {
      const consistency = calculateRelativeConsistency(stories[i], stories[j]);
      comparisons.push({
        story1: stories[i].id,
        story2: stories[j].id,
        ...consistency
      });
      
      if (consistency.score < 60) {
        issues.push({
          type: 'inconsistent_sizing',
          stories: [stories[i].title, stories[j].title],
          score: consistency.score,
          feedback: consistency.feedback
        });
      }
    }
  }
  
  const overallScore = comparisons.length > 0 
    ? Math.round(comparisons.reduce((sum, comp) => sum + comp.score, 0) / comparisons.length)
    : 100;
  
  // Generate recommendations based on issues
  if (issues.length > 0) {
    recommendations.push('Review the relative complexity of flagged stories and re-estimate if needed.');
    recommendations.push('Consider using reference stories to maintain consistent sizing.');
  }
  
  return {
    overallScore,
    comparisons,
    issues,
    recommendations
  };
}

/**
 * Checks cross-domain consistency between technical and business stories
 * @param {Array} technicalStories - Stories with technical focus
 * @param {Array} businessStories - Stories with business focus
 * @returns {Object} Cross-domain consistency analysis
 */
export function validateCrossDomainConsistency(technicalStories, businessStories) {
  const crossDomainIssues = [];
  const recommendations = [];
  
  // Find stories of similar complexity but different domains
  technicalStories.forEach(techStory => {
    businessStories.forEach(bizStory => {
      const consistency = calculateRelativeConsistency(techStory, bizStory);
      
      if (Math.abs(consistency.complexityRatio - 1) < 0.3 && consistency.score < 70) {
        crossDomainIssues.push({
          technicalStory: techStory.title,
          businessStory: bizStory.title,
          issue: 'Similar complexity but inconsistent point estimates across domains',
          suggestion: 'Ensure estimation approach is consistent regardless of story type'
        });
      }
    });
  });
  
  if (crossDomainIssues.length > 0) {
    recommendations.push('Establish reference stories for both technical and business domains.');
    recommendations.push('Use the same estimation scale and approach for all story types.');
    recommendations.push('Consider complexity factors that apply across domains (uncertainty, integration, etc.).');
  }
  
  return {
    crossDomainIssues,
    recommendations,
    hasCrossDomainInconsistencies: crossDomainIssues.length > 0
  };
}

/**
 * Provides real-time feedback during estimation
 * @param {Array} currentEstimates - Current story estimates being worked on
 * @param {Array} referenceStories - Previously estimated reference stories
 * @returns {Object} Real-time feedback and suggestions
 */
export function getRealTimeFeedback(currentEstimates, referenceStories = []) {
  const feedback = {
    warnings: [],
    suggestions: [],
    consistencyScore: 100
  };
  
  if (currentEstimates.length < 2) {
    return feedback;
  }
  
  // Check internal consistency of current estimates
  const internalConsistency = validateStorySetConsistency(currentEstimates);
  feedback.consistencyScore = internalConsistency.overallScore;
  
  if (internalConsistency.issues.length > 0) {
    feedback.warnings.push('Some stories may not be sized consistently relative to each other.');
    feedback.suggestions.push('Compare the complexity factors of flagged stories.');
  }
  
  // Check against reference stories if available
  if (referenceStories.length > 0) {
    currentEstimates.forEach(currentStory => {
      const similarReference = findSimilarReferenceStory(currentStory, referenceStories);
      if (similarReference) {
        const consistency = calculateRelativeConsistency(currentStory, similarReference);
        if (consistency.score < 70) {
          feedback.warnings.push(
            `"${currentStory.title}" sizing may be inconsistent with similar reference story "${similarReference.title}"`
          );
        }
      }
    });
  }
  
  return feedback;
}

/**
 * Finds a reference story with similar complexity
 * @param {Object} targetStory - Story to find reference for
 * @param {Array} referenceStories - Available reference stories
 * @returns {Object|null} Most similar reference story
 */
function findSimilarReferenceStory(targetStory, referenceStories) {
  if (!referenceStories.length) return null;
  
  const targetComplexity = calculateOverallComplexity(targetStory);
  
  let closestStory = null;
  let smallestDifference = Infinity;
  
  referenceStories.forEach(refStory => {
    const refComplexity = calculateOverallComplexity(refStory);
    const difference = Math.abs(targetComplexity - refComplexity);
    
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestStory = refStory;
    }
  });
  
  // Only return if reasonably similar (within 2 complexity points)
  return smallestDifference <= 2 ? closestStory : null;
}