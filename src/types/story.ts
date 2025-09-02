/**
 * Enhanced story data structure for story point estimation exercises
 * Supports team context, breakdown suggestions, and realistic estimation scenarios
 */

export type ExperienceLevel = 'junior' | 'intermediate' | 'senior';
export type KnowledgeLevel = 'low' | 'medium' | 'high';
export type TechnicalStackFamiliarity = 'familiar' | 'new' | 'mixed';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ComplexityLevel = 'low' | 'medium' | 'high';
export type BreakdownTechnique = 'by-workflow' | 'by-data' | 'by-acceptance-criteria' | 'by-complexity';
export type NonEstimableWorkType = 'spike' | 'research' | 'proof-of-concept' | 'learning';

export interface TeamContext {
  experienceLevel: ExperienceLevel;
  domainKnowledge: KnowledgeLevel;
  technicalStack: TechnicalStackFamiliarity;
  teamSize: number;
  workingAgreements: string[];
}

export interface EstimationVariance {
  [teamType: string]: {
    points: number;
    reasoning: string;
    confidenceLevel: ConfidenceLevel;
  };
}

export interface ComplexityFactors {
  technical: ComplexityLevel;
  business: ComplexityLevel;
  integration: ComplexityLevel;
  uncertainty: ComplexityLevel;
}

export interface Dependency {
  id: string;
  description: string;
  type: 'internal' | 'external' | 'technical' | 'business';
  impact: ComplexityLevel;
  mitigation?: string;
}

export interface TechnicalDebtImpact {
  description: string;
  additionalComplexity: ComplexityLevel;
  refactoringRequired: boolean;
  estimatedImpact: string;
}

export interface BreakdownSuggestion {
  technique: BreakdownTechnique;
  description: string;
  resultingStories: Omit<Story, 'breakdownSuggestions' | 'breakdownRequired'>[];
  benefits: string[];
}

export interface Story {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  teamContext: TeamContext;
  estimationVariance: EstimationVariance;
  breakdownRequired: boolean;
  breakdownSuggestions: BreakdownSuggestion[];
  complexityFactors: ComplexityFactors;
  dependencies?: Dependency[];
  technicalDebt?: TechnicalDebtImpact;
  // Legacy fields for backward compatibility
  correctOrder?: number;
  correctPoints?: number;
  factors?: {
    complexity: string;
    effort: string;
    uncertainty: string;
  };
  explanation?: string;
}

export interface NonEstimableWork {
  type: NonEstimableWorkType;
  title: string;
  timeBox: string;
  learningObjective: string;
  acceptanceCriteria: string[];
  transitionToStories: string[];
  reasoning: string;
}

export interface StoryDataset {
  metadata: {
    exerciseId: number;
    type: string;
    version: string;
    description: string;
  };
  stories: Story[];
  nonEstimableWork?: NonEstimableWork[];
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}