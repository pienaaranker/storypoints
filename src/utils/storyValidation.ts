/**
 * Validation functions for story data structure and story point ranges
 * Ensures data integrity and adherence to Scrum best practices
 */

import type {
  Story,
  NonEstimableWork,
  StoryDataset,
  TeamContext,
  ValidationResult,
  ValidationError,
  ExperienceLevel,
  KnowledgeLevel,
  TechnicalStackFamiliarity,
  ConfidenceLevel,
  ComplexityLevel,
  BreakdownTechnique,
  NonEstimableWorkType
} from '../types/story.js';

// Valid story point values following Fibonacci sequence
const VALID_STORY_POINTS = [1, 2, 3, 5, 8, 13, 21, 34];
const RECOMMENDED_MAX_POINTS = 8;
const BREAKDOWN_THRESHOLD = 13;

/**
 * Validates story point values
 */
export function validateStoryPoints(points: number): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Number.isInteger(points) || points < 0) {
    errors.push({
      field: 'points',
      message: 'Story points must be a non-negative integer',
      code: 'INVALID_POINTS_TYPE'
    });
  }

  if (!VALID_STORY_POINTS.includes(points)) {
    errors.push({
      field: 'points',
      message: `Story points must be from Fibonacci sequence: ${VALID_STORY_POINTS.join(', ')}`,
      code: 'INVALID_POINTS_VALUE'
    });
  }

  // Note: Large points are a warning, not an error for validation
  // This allows the validation to pass while still providing guidance

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates team context data
 */
export function validateTeamContext(context: TeamContext): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate experience level
  const validExperienceLevels: ExperienceLevel[] = ['junior', 'intermediate', 'senior'];
  if (!validExperienceLevels.includes(context.experienceLevel)) {
    errors.push({
      field: 'teamContext.experienceLevel',
      message: `Experience level must be one of: ${validExperienceLevels.join(', ')}`,
      code: 'INVALID_EXPERIENCE_LEVEL'
    });
  }

  // Validate domain knowledge
  const validKnowledgeLevels: KnowledgeLevel[] = ['low', 'medium', 'high'];
  if (!validKnowledgeLevels.includes(context.domainKnowledge)) {
    errors.push({
      field: 'teamContext.domainKnowledge',
      message: `Domain knowledge must be one of: ${validKnowledgeLevels.join(', ')}`,
      code: 'INVALID_DOMAIN_KNOWLEDGE'
    });
  }

  // Validate technical stack familiarity
  const validTechStackLevels: TechnicalStackFamiliarity[] = ['familiar', 'new', 'mixed'];
  if (!validTechStackLevels.includes(context.technicalStack)) {
    errors.push({
      field: 'teamContext.technicalStack',
      message: `Technical stack familiarity must be one of: ${validTechStackLevels.join(', ')}`,
      code: 'INVALID_TECH_STACK'
    });
  }

  // Validate team size
  if (!Number.isInteger(context.teamSize) || context.teamSize < 1 || context.teamSize > 12) {
    errors.push({
      field: 'teamContext.teamSize',
      message: 'Team size must be between 1 and 12 members',
      code: 'INVALID_TEAM_SIZE'
    });
  }

  // Validate working agreements
  if (!Array.isArray(context.workingAgreements)) {
    errors.push({
      field: 'teamContext.workingAgreements',
      message: 'Working agreements must be an array of strings',
      code: 'INVALID_WORKING_AGREEMENTS'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates story breakdown requirements
 */
export function validateStoryBreakdown(story: Story): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if large stories have breakdown suggestions
  const hasLargeEstimate = Object.values(story.estimationVariance).some(
    estimate => estimate.points >= BREAKDOWN_THRESHOLD
  );

  if (hasLargeEstimate && !story.breakdownRequired) {
    errors.push({
      field: 'breakdownRequired',
      message: `Stories with ${BREAKDOWN_THRESHOLD}+ points should require breakdown`,
      code: 'MISSING_BREAKDOWN_REQUIREMENT'
    });
  }

  if (story.breakdownRequired && story.breakdownSuggestions.length === 0) {
    errors.push({
      field: 'breakdownSuggestions',
      message: 'Stories requiring breakdown must have breakdown suggestions',
      code: 'MISSING_BREAKDOWN_SUGGESTIONS'
    });
  }

  // Validate breakdown suggestions
  story.breakdownSuggestions.forEach((suggestion, index) => {
    const validTechniques: BreakdownTechnique[] = [
      'by-workflow', 'by-data', 'by-acceptance-criteria', 'by-complexity'
    ];
    
    if (!validTechniques.includes(suggestion.technique)) {
      errors.push({
        field: `breakdownSuggestions[${index}].technique`,
        message: `Breakdown technique must be one of: ${validTechniques.join(', ')}`,
        code: 'INVALID_BREAKDOWN_TECHNIQUE'
      });
    }

    // Validate that resulting stories are appropriately sized
    suggestion.resultingStories.forEach((resultStory, storyIndex) => {
      const storyEstimates = Object.values(resultStory.estimationVariance);
      const hasLargeResultStory = storyEstimates.some(estimate => estimate.points > RECOMMENDED_MAX_POINTS);
      
      if (hasLargeResultStory) {
        errors.push({
          field: `breakdownSuggestions[${index}].resultingStories[${storyIndex}]`,
          message: `Breakdown should result in stories ≤ ${RECOMMENDED_MAX_POINTS} points`,
          code: 'BREAKDOWN_RESULT_TOO_LARGE'
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates complete story data
 */
export function validateStory(story: Story): ValidationResult {
  const errors: ValidationError[] = [];

  // Basic field validation
  if (!story.id || typeof story.id !== 'string') {
    errors.push({
      field: 'id',
      message: 'Story ID is required and must be a string',
      code: 'MISSING_STORY_ID'
    });
  }

  if (!story.title || typeof story.title !== 'string') {
    errors.push({
      field: 'title',
      message: 'Story title is required and must be a string',
      code: 'MISSING_STORY_TITLE'
    });
  }

  if (!story.description || typeof story.description !== 'string') {
    errors.push({
      field: 'description',
      message: 'Story description is required and must be a string',
      code: 'MISSING_STORY_DESCRIPTION'
    });
  }

  if (!Array.isArray(story.acceptanceCriteria) || story.acceptanceCriteria.length === 0) {
    errors.push({
      field: 'acceptanceCriteria',
      message: 'Story must have at least one acceptance criterion',
      code: 'MISSING_ACCEPTANCE_CRITERIA'
    });
  }

  // Validate team context
  const teamContextValidation = validateTeamContext(story.teamContext);
  errors.push(...teamContextValidation.errors);

  // Validate estimation variance
  if (!story.estimationVariance || Object.keys(story.estimationVariance).length === 0) {
    errors.push({
      field: 'estimationVariance',
      message: 'Story must have at least one estimation variance',
      code: 'MISSING_ESTIMATION_VARIANCE'
    });
  } else {
    Object.entries(story.estimationVariance).forEach(([teamType, estimate]) => {
      const pointsValidation = validateStoryPoints(estimate.points);
      pointsValidation.errors.forEach(error => {
        errors.push({
          ...error,
          field: `estimationVariance.${teamType}.${error.field}`
        });
      });

      const validConfidenceLevels: ConfidenceLevel[] = ['low', 'medium', 'high'];
      if (!validConfidenceLevels.includes(estimate.confidenceLevel)) {
        errors.push({
          field: `estimationVariance.${teamType}.confidenceLevel`,
          message: `Confidence level must be one of: ${validConfidenceLevels.join(', ')}`,
          code: 'INVALID_CONFIDENCE_LEVEL'
        });
      }
    });
  }

  // Validate complexity factors
  const validComplexityLevels: ComplexityLevel[] = ['low', 'medium', 'high'];
  Object.entries(story.complexityFactors).forEach(([factor, level]) => {
    if (!validComplexityLevels.includes(level)) {
      errors.push({
        field: `complexityFactors.${factor}`,
        message: `Complexity level must be one of: ${validComplexityLevels.join(', ')}`,
        code: 'INVALID_COMPLEXITY_LEVEL'
      });
    }
  });

  // Validate breakdown requirements
  const breakdownValidation = validateStoryBreakdown(story);
  errors.push(...breakdownValidation.errors);

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates non-estimable work data
 */
export function validateNonEstimableWork(work: NonEstimableWork): ValidationResult {
  const errors: ValidationError[] = [];

  const validTypes: NonEstimableWorkType[] = ['spike', 'research', 'proof-of-concept', 'learning'];
  if (!validTypes.includes(work.type)) {
    errors.push({
      field: 'type',
      message: `Non-estimable work type must be one of: ${validTypes.join(', ')}`,
      code: 'INVALID_WORK_TYPE'
    });
  }

  if (!work.title || typeof work.title !== 'string') {
    errors.push({
      field: 'title',
      message: 'Title is required and must be a string',
      code: 'MISSING_TITLE'
    });
  }

  if (!work.timeBox || typeof work.timeBox !== 'string') {
    errors.push({
      field: 'timeBox',
      message: 'Time box is required and must be a string',
      code: 'MISSING_TIME_BOX'
    });
  }

  if (!work.learningObjective || typeof work.learningObjective !== 'string') {
    errors.push({
      field: 'learningObjective',
      message: 'Learning objective is required and must be a string',
      code: 'MISSING_LEARNING_OBJECTIVE'
    });
  }

  if (!Array.isArray(work.acceptanceCriteria) || work.acceptanceCriteria.length === 0) {
    errors.push({
      field: 'acceptanceCriteria',
      message: 'Must have at least one acceptance criterion',
      code: 'MISSING_ACCEPTANCE_CRITERIA'
    });
  }

  if (!Array.isArray(work.transitionToStories)) {
    errors.push({
      field: 'transitionToStories',
      message: 'Transition to stories must be an array',
      code: 'INVALID_TRANSITION_STORIES'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates complete story dataset
 */
export function validateStoryDataset(dataset: StoryDataset): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate metadata
  if (!dataset.metadata) {
    errors.push({
      field: 'metadata',
      message: 'Dataset metadata is required',
      code: 'MISSING_METADATA'
    });
  } else {
    if (!Number.isInteger(dataset.metadata.exerciseId) || dataset.metadata.exerciseId < 1) {
      errors.push({
        field: 'metadata.exerciseId',
        message: 'Exercise ID must be a positive integer',
        code: 'INVALID_EXERCISE_ID'
      });
    }
  }

  // Validate stories
  if (!Array.isArray(dataset.stories)) {
    errors.push({
      field: 'stories',
      message: 'Stories must be an array',
      code: 'INVALID_STORIES_ARRAY'
    });
  } else {
    dataset.stories.forEach((story, index) => {
      const storyValidation = validateStory(story);
      storyValidation.errors.forEach(error => {
        errors.push({
          ...error,
          field: `stories[${index}].${error.field}`
        });
      });
    });
  }

  // Validate non-estimable work if present
  if (dataset.nonEstimableWork) {
    if (!Array.isArray(dataset.nonEstimableWork)) {
      errors.push({
        field: 'nonEstimableWork',
        message: 'Non-estimable work must be an array',
        code: 'INVALID_NON_ESTIMABLE_WORK_ARRAY'
      });
    } else {
      dataset.nonEstimableWork.forEach((work, index) => {
        const workValidation = validateNonEstimableWork(work);
        workValidation.errors.forEach(error => {
          errors.push({
            ...error,
            field: `nonEstimableWork[${index}].${error.field}`
          });
        });
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates story size distribution follows Scrum best practices
 */
export function validateStoryDistribution(stories: Story[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (stories.length === 0) {
    return { isValid: true, errors: [] };
  }

  // Calculate distribution of story sizes
  const sizeDistribution = new Map<number, number>();
  let totalStories = 0;

  stories.forEach(story => {
    Object.values(story.estimationVariance).forEach(estimate => {
      const points = estimate.points;
      sizeDistribution.set(points, (sizeDistribution.get(points) || 0) + 1);
      totalStories++;
    });
  });

  // Check that majority of stories are 1-8 points (Requirement 1.1)
  const smallStories = Array.from(sizeDistribution.entries())
    .filter(([points]) => points <= RECOMMENDED_MAX_POINTS)
    .reduce((sum, [, count]) => sum + count, 0);

  const smallStoryPercentage = (smallStories / totalStories) * 100;

  if (smallStoryPercentage < 70) {
    errors.push({
      field: 'distribution',
      message: `At least 70% of stories should be ${RECOMMENDED_MAX_POINTS} points or less. Current: ${smallStoryPercentage.toFixed(1)}%`,
      code: 'POOR_SIZE_DISTRIBUTION'
    });
  }

  // Check for stories > 8 points without breakdown guidance (Requirement 1.2)
  const largeStoriesWithoutBreakdown = stories.filter(story => {
    const hasLargeEstimate = Object.values(story.estimationVariance).some(
      estimate => estimate.points > RECOMMENDED_MAX_POINTS
    );
    return hasLargeEstimate && !story.breakdownRequired;
  });

  if (largeStoriesWithoutBreakdown.length > 0) {
    errors.push({
      field: 'breakdown',
      message: `${largeStoriesWithoutBreakdown.length} stories > ${RECOMMENDED_MAX_POINTS} points lack breakdown guidance`,
      code: 'MISSING_BREAKDOWN_GUIDANCE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}