import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import RealisticEstimationChallenges from '../RealisticEstimationChallenges';

// Mock fetch
global.fetch = vi.fn();

const mockChallengeData = {
  highUncertaintyScenarios: [
    {
      id: 'test-uncertainty',
      title: 'Test High Uncertainty Story',
      description: 'A story with high uncertainty for testing',
      acceptanceCriteria: ['Criteria 1', 'Criteria 2'],
      uncertaintyFactors: {
        apiDocumentation: 'incomplete',
        teamExperience: 'none'
      },
      handlingTechniques: {
        spike: {
          title: 'Test Spike',
          timeBox: '4 hours',
          objectives: ['Objective 1', 'Objective 2']
        },
        conservativeEstimation: {
          baseEstimate: 3,
          uncertaintyBuffer: 2,
          totalEstimate: 5,
          reasoning: 'Test reasoning'
        }
      },
      teamContext: {
        experienceLevel: 'intermediate',
        domainKnowledge: 'medium',
        technicalStack: 'familiar'
      },
      complexityFactors: {
        technical: 'high',
        business: 'medium',
        integration: 'high',
        uncertainty: 'high'
      }
    }
  ],
  dependencyScenarios: [
    {
      id: 'test-dependency',
      title: 'Test Dependency Story',
      description: 'A story with dependencies for testing',
      acceptanceCriteria: ['Criteria 1'],
      dependencies: [
        {
          type: 'external',
          description: 'External API',
          owner: 'External Team',
          estimatedCompletion: '2 weeks',
          risk: 'high',
          impact: 'Blocks functionality'
        }
      ],
      dependencyImpact: {
        withoutDependencies: {
          points: 13,
          reasoning: 'Cannot implement without dependencies',
          approach: 'Wait for dependencies'
        },
        withMocks: {
          points: 8,
          reasoning: 'Can implement with mocks',
          approach: 'Use mocked dependencies'
        }
      }
    }
  ],
  technicalDebtScenarios: [
    {
      id: 'test-debt',
      title: 'Test Technical Debt Story',
      description: 'A story impacted by technical debt',
      acceptanceCriteria: ['Criteria 1'],
      technicalDebt: {
        description: 'Legacy code issues',
        impact: {
          codeComplexity: 'High complexity',
          testability: 'Hard to test'
        },
        debtAge: '1 year'
      },
      implementationOptions: {
        quickHack: {
          points: 3,
          reasoning: 'Quick fix',
          risks: ['Technical debt increases']
        },
        cleanImplementation: {
          points: 8,
          reasoning: 'Proper refactoring',
          risks: ['Takes longer initially']
        }
      }
    }
  ],
  spikeToStoryTransitions: [
    {
      spike: {
        id: 'test-spike',
        title: 'Test Research Spike',
        type: 'technical',
        timeBox: '6 hours',
        learningObjective: 'Learn about technology X',
        acceptanceCriteria: ['Research objective 1'],
        uncertaintyFactors: ['Unknown performance', 'Unknown complexity']
      },
      resultingStories: [
        {
          id: 'story-1',
          title: 'Implementation Story 1',
          description: 'First implementation story',
          points: 5,
          estimationBasis: 'Based on spike findings',
          reasoning: 'Spike reduced uncertainty'
        }
      ],
      spikeValue: {
        uncertaintyReduction: 'High',
        estimationImprovement: 'Stories became more predictable'
      }
    }
  ]
};

describe('RealisticEstimationChallenges', () => {
  beforeEach(() => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockChallengeData)
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<RealisticEstimationChallenges />);
    expect(screen.getByText('Loading realistic estimation challenges...')).toBeInTheDocument();
  });

  it('loads and displays challenge data', async () => {
    render(<RealisticEstimationChallenges />);
    
    await waitFor(() => {
      expect(screen.getByText('Realistic Estimation Challenges')).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText('Test High Uncertainty Story')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays uncertainty factors for high uncertainty scenarios', async () => {
    render(<RealisticEstimationChallenges />);
    
    await waitFor(() => {
      expect(screen.getByText('Uncertainty Factors:')).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText(/api documentation:/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('allows entering and submitting estimates', async () => {
    render(<RealisticEstimationChallenges />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your estimate')).toBeInTheDocument();
    }, { timeout: 3000 });

    const estimateInput = screen.getByPlaceholderText('Enter your estimate');
    const submitButton = screen.getByText('Submit Estimate');

    expect(submitButton).toBeDisabled();

    fireEvent.change(estimateInput, { target: { value: '5' } });
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Estimation Guidance')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('handles fetch errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockRejectedValue(new Error('Network error'));

    render(<RealisticEstimationChallenges />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load challenge data:', expect.any(Error));
    }, { timeout: 3000 });

    consoleSpy.mockRestore();
  });
});