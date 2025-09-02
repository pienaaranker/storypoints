/**
 * Data transformation utilities for converting legacy story data to enhanced format
 * Supports backward compatibility and migration of existing story examples
 */

import type {
  Story,
  StoryDataset,
  TeamContext,
  EstimationVariance,
  ComplexityFactors,
  BreakdownSuggestion
} from '../types/story.js';

// Valid story point values following Fibonacci sequence
const VALID_STORY_POINTS = [1, 2, 3, 5, 8, 13, 21, 34];

// Legacy story format from existing data files
interface LegacyStory {
  id: string;
  title?: string;
  name?: string; // For abstract items
  description: string;
  acceptanceCriteria?: string[];
  correctOrder?: number;
  correctPoints?: number;
  factors?: {
    complexity: string;
    effort: string;
    uncertainty: string;
  };
  explanation?: string;
}

interface LegacyDataset {
  metadata: {
    exerciseId: number;
    type: string;
    version: string;
    description: string;
  };
  stories?: LegacyStory[];
  items?: LegacyStory[]; // For abstract items
}

/**
 * Creates default team context based on story complexity
 */
function createDefaultTeamContext(complexity: string): TeamContext {
  const complexityLevel = complexity.toLowerCase();
  
  if (complexityLevel.includes('low') || complexityLevel.includes('simple')) {
    return {
      experienceLevel: 'intermediate',
      domainKnowledge: 'high',
      technicalStack: 'familiar',
      teamSize: 5,
      workingAgreements: ['Definition of Done', 'Code Review Process']
    };
  } else if (complexityLevel.includes('high') || complexityLevel.includes('complex')) {
    return {
      experienceLevel: 'senior',
      domainKnowledge: 'medium',
      technicalStack: 'mixed',
      teamSize: 6,
      workingAgreements: ['Definition of Done', 'Code Review Process', 'Pair Programming for Complex Features']
    };
  } else {
    return {
      experienceLevel: 'intermediate',
      domainKnowledge: 'medium',
      technicalStack: 'familiar',
      teamSize: 5,
      workingAgreements: ['Definition of Done', 'Code Review Process']
    };
  }
}

/**
 * Creates estimation variance based on story complexity and team context
 */
function createEstimationVariance(
  basePoints: number,
  complexity: string,
  uncertainty: string
): EstimationVariance {
  const variance: EstimationVariance = {};
  
  // Junior team estimates (typically higher due to less experience)
  const juniorMultiplier = complexity.includes('high') ? 1.6 : 1.3;
  const rawJuniorPoints = Math.min(34, Math.round(basePoints * juniorMultiplier));
  const juniorPoints = VALID_STORY_POINTS.find(p => p >= rawJuniorPoints) || basePoints;
  
  variance.juniorTeam = {
    points: juniorPoints,
    reasoning: `Higher estimate due to limited experience with ${complexity} complexity tasks`,
    confidenceLevel: uncertainty.includes('high') ? 'low' : 'medium'
  };

  // Senior team estimates (typically lower due to experience)
  const seniorMultiplier = complexity.includes('low') ? 0.8 : 0.9;
  const rawSeniorPoints = Math.max(1, Math.round(basePoints * seniorMultiplier));
  const seniorPoints = VALID_STORY_POINTS.slice().reverse().find(p => p <= rawSeniorPoints) || basePoints;
  
  variance.seniorTeam = {
    points: seniorPoints,
    reasoning: `Lower estimate due to experience with similar ${complexity} complexity work`,
    confidenceLevel: uncertainty.includes('high') ? 'medium' : 'high'
  };

  // Base team estimate (original points)
  variance.baseTeam = {
    points: basePoints,
    reasoning: 'Standard team estimate based on current understanding',
    confidenceLevel: uncertainty.includes('low') ? 'high' : 'medium'
  };

  return variance;
}

/**
 * Maps legacy complexity strings to structured complexity factors
 */
function mapComplexityFactors(factors?: {
  complexity: string;
  effort: string;
  uncertainty: string;
}): ComplexityFactors {
  if (!factors) {
    return {
      technical: 'medium',
      business: 'medium',
      integration: 'low',
      uncertainty: 'low'
    };
  }

  const mapLevel = (level: string) => {
    const normalized = level.toLowerCase();
    if (normalized.includes('low') || normalized.includes('simple')) return 'low';
    if (normalized.includes('high') || normalized.includes('complex') || normalized.includes('very')) return 'high';
    return 'medium';
  };

  return {
    technical: mapLevel(factors.complexity),
    business: mapLevel(factors.effort),
    integration: mapLevel(factors.complexity),
    uncertainty: mapLevel(factors.uncertainty)
  };
}

/**
 * Creates breakdown suggestions for large stories
 */
function createBreakdownSuggestions(story: LegacyStory, points: number): BreakdownSuggestion[] {
  if (points <= 8) return [];

  const suggestions: BreakdownSuggestion[] = [];

  // Create workflow-based breakdown
  if (story.acceptanceCriteria && story.acceptanceCriteria.length > 2) {
    const workflowBreakdown: BreakdownSuggestion = {
      technique: 'by-workflow',
      description: 'Break down by user workflow steps',
      resultingStories: story.acceptanceCriteria.slice(0, 3).map((criterion, index) => ({
        id: `${story.id}-workflow-${index + 1}`,
        title: `${story.title || story.name} - ${criterion.split(' ').slice(0, 3).join(' ')}`,
        description: `Implement: ${criterion}`,
        acceptanceCriteria: [criterion],
        teamContext: createDefaultTeamContext('medium'),
        estimationVariance: createEstimationVariance(Math.ceil(points / 3), 'medium', 'low'),
        breakdownRequired: false,
        complexityFactors: {
          technical: 'medium',
          business: 'low',
          integration: 'low',
          uncertainty: 'low'
        }
      })),
      benefits: [
        'Clearer scope for each story',
        'Easier to estimate individual workflow steps',
        'Better testability of individual features'
      ]
    };
    suggestions.push(workflowBreakdown);
  }

  // Create acceptance criteria breakdown
  const acBreakdown: BreakdownSuggestion = {
    technique: 'by-acceptance-criteria',
    description: 'Break down by acceptance criteria',
    resultingStories: [
      {
        id: `${story.id}-core`,
        title: `${story.title || story.name} - Core Functionality`,
        description: 'Implement the basic functionality',
        acceptanceCriteria: ['Core feature works as expected'],
        teamContext: createDefaultTeamContext('medium'),
        estimationVariance: createEstimationVariance(5, 'medium', 'low'),
        breakdownRequired: false,
        complexityFactors: {
          technical: 'medium',
          business: 'medium',
          integration: 'low',
          uncertainty: 'low'
        }
      },
      {
        id: `${story.id}-validation`,
        title: `${story.title || story.name} - Validation & Error Handling`,
        description: 'Add validation and error handling',
        acceptanceCriteria: ['Input validation works', 'Error messages are clear'],
        teamContext: createDefaultTeamContext('low'),
        estimationVariance: createEstimationVariance(3, 'low', 'low'),
        breakdownRequired: false,
        complexityFactors: {
          technical: 'low',
          business: 'low',
          integration: 'low',
          uncertainty: 'low'
        }
      }
    ],
    benefits: [
      'Separates core functionality from edge cases',
      'Allows incremental delivery',
      'Reduces risk by tackling complexity first'
    ]
  };
  suggestions.push(acBreakdown);

  return suggestions;
}

/**
 * Transforms legacy story to enhanced format
 */
export function transformLegacyStory(legacyStory: LegacyStory): Story {
  const points = legacyStory.correctPoints || 5;
  const complexity = legacyStory.factors?.complexity || 'medium';
  const uncertainty = legacyStory.factors?.uncertainty || 'low';
  
  const teamContext = createDefaultTeamContext(complexity);
  const estimationVariance = createEstimationVariance(points, complexity, uncertainty);
  const complexityFactors = mapComplexityFactors(legacyStory.factors);
  const breakdownRequired = points > 8;
  const breakdownSuggestions = createBreakdownSuggestions(legacyStory, points);

  return {
    id: legacyStory.id,
    title: legacyStory.title || legacyStory.name || 'Untitled Story',
    description: legacyStory.description,
    acceptanceCriteria: legacyStory.acceptanceCriteria || ['Must meet basic requirements'],
    teamContext,
    estimationVariance,
    breakdownRequired,
    breakdownSuggestions,
    complexityFactors,
    // Preserve legacy fields for backward compatibility
    correctOrder: legacyStory.correctOrder,
    correctPoints: legacyStory.correctPoints,
    factors: legacyStory.factors,
    explanation: legacyStory.explanation
  };
}

/**
 * Transforms legacy dataset to enhanced format
 */
export function transformLegacyDataset(legacyDataset: LegacyDataset): StoryDataset {
  const legacyStories = legacyDataset.stories || legacyDataset.items || [];
  
  return {
    metadata: {
      ...legacyDataset.metadata,
      version: '2.0.0' // Mark as enhanced version
    },
    stories: legacyStories.map(transformLegacyStory)
  };
}

/**
 * Validates and transforms story data with error handling
 */
export function safeTransformLegacyDataset(legacyDataset: LegacyDataset): {
  dataset: StoryDataset;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  try {
    const transformedDataset = transformLegacyDataset(legacyDataset);
    
    // Check for potential issues
    transformedDataset.stories.forEach((story, index) => {
      if (!story.acceptanceCriteria || story.acceptanceCriteria.length === 0) {
        warnings.push(`Story ${index + 1} (${story.id}) has no acceptance criteria`);
      }
      
      if (Object.keys(story.estimationVariance).length === 0) {
        warnings.push(`Story ${index + 1} (${story.id}) has no estimation variance`);
      }
      
      const hasLargeEstimate = Object.values(story.estimationVariance).some(
        estimate => estimate.points > 8
      );
      if (hasLargeEstimate && !story.breakdownRequired) {
        warnings.push(`Story ${index + 1} (${story.id}) has large estimates but no breakdown guidance`);
      }
    });
    
    return { dataset: transformedDataset, warnings };
  } catch (error) {
    throw new Error(`Failed to transform legacy dataset: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}