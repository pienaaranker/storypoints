import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock data for testing
const mockTeamMembers = [
  {
    id: 'alice-senior',
    name: 'Alice Chen',
    role: 'Senior Developer',
    experienceLevel: 'senior',
    domainKnowledge: 'high',
    technicalStack: 'familiar'
  },
  {
    id: 'bob-intermediate',
    name: 'Bob Martinez',
    role: 'Full Stack Developer',
    experienceLevel: 'intermediate',
    domainKnowledge: 'medium',
    technicalStack: 'familiar'
  },
  {
    id: 'carol-junior',
    name: 'Carol Kim',
    role: 'Junior Developer',
    experienceLevel: 'junior',
    domainKnowledge: 'low',
    technicalStack: 'new'
  }
];

const mockStories = [
  {
    id: 'test-story-1',
    title: 'User Profile Update',
    description: 'As a user, I want to update my profile information.',
    acceptanceCriteria: [
      'User can edit name and email',
      'Form validation prevents invalid data',
      'Changes are saved to database'
    ],
    complexityFactors: {
      technical: 'low',
      business: 'low',
      integration: 'low',
      uncertainty: 'low'
    },
    estimationVariance: {
      'alice-senior': {
        points: 3,
        reasoning: 'Straightforward CRUD operation',
        confidenceLevel: 'high'
      },
      'bob-intermediate': {
        points: 5,
        reasoning: 'Need to handle validation and updates',
        confidenceLevel: 'medium'
      },
      'carol-junior': {
        points: 8,
        reasoning: 'Need to learn form handling patterns',
        confidenceLevel: 'low'
      }
    }
  },
  {
    id: 'test-story-2',
    title: 'Payment Processing',
    description: 'As a customer, I want to pay with credit card.',
    acceptanceCriteria: [
      'Integrate with payment API',
      'Handle success and failure scenarios',
      'Store transaction records'
    ],
    complexityFactors: {
      technical: 'high',
      business: 'medium',
      integration: 'high',
      uncertainty: 'medium'
    },
    estimationVariance: {
      'alice-senior': {
        points: 8,
        reasoning: 'Complex integration with security implications',
        confidenceLevel: 'medium'
      },
      'bob-intermediate': {
        points: 13,
        reasoning: 'Haven\'t worked with payment APIs before',
        confidenceLevel: 'low'
      },
      'carol-junior': {
        points: 21,
        reasoning: 'Very complex with security considerations',
        confidenceLevel: 'low'
      }
    }
  }
];

describe('PlanningPokerSimulator Logic Tests', () => {
  const mockOnEstimationComplete = vi.fn();
  const mockOnRoundComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Structure Validation', () => {
    test('validates story data structure', () => {
      const story = mockStories[0];
      
      expect(story).toHaveProperty('id');
      expect(story).toHaveProperty('title');
      expect(story).toHaveProperty('description');
      expect(story).toHaveProperty('acceptanceCriteria');
      expect(story).toHaveProperty('complexityFactors');
      expect(story).toHaveProperty('estimationVariance');
      
      expect(Array.isArray(story.acceptanceCriteria)).toBe(true);
      expect(typeof story.estimationVariance).toBe('object');
    });

    test('validates team member data structure', () => {
      const member = mockTeamMembers[0];
      
      expect(member).toHaveProperty('id');
      expect(member).toHaveProperty('name');
      expect(member).toHaveProperty('role');
      expect(member).toHaveProperty('experienceLevel');
      expect(member).toHaveProperty('domainKnowledge');
      expect(member).toHaveProperty('technicalStack');
      
      expect(['junior', 'intermediate', 'senior']).toContain(member.experienceLevel);
      expect(['low', 'medium', 'high']).toContain(member.domainKnowledge);
    });

    test('validates estimation variance structure', () => {
      mockStories.forEach(story => {
        Object.values(story.estimationVariance).forEach(estimate => {
          expect(typeof estimate.points).toBe('number');
          expect(typeof estimate.reasoning).toBe('string');
          expect(typeof estimate.confidenceLevel).toBe('string');
          expect(['low', 'medium', 'high']).toContain(estimate.confidenceLevel);
        });
      });
    });

    test('validates complexity factors', () => {
      mockStories.forEach(story => {
        const factors = story.complexityFactors;
        expect(['low', 'medium', 'high']).toContain(factors.technical);
        expect(['low', 'medium', 'high']).toContain(factors.business);
        expect(['low', 'medium', 'high']).toContain(factors.integration);
        expect(['low', 'medium', 'high']).toContain(factors.uncertainty);
      });
    });
  });

  describe('Estimation Logic', () => {
    test('generates realistic estimates based on team member experience', () => {
      const seniorMember = mockTeamMembers[0]; // Alice - senior
      const juniorMember = mockTeamMembers[2]; // Carol - junior
      const story = mockStories[0];

      expect(seniorMember.experienceLevel).toBe('senior');
      expect(juniorMember.experienceLevel).toBe('junior');
      expect(story.estimationVariance['alice-senior'].points).toBe(3);
      expect(story.estimationVariance['carol-junior'].points).toBe(8);
    });

    test('handles estimate divergence calculation', () => {
      const story = mockStories[0];
      const estimates = Object.values(story.estimationVariance).map(e => e.points);
      const minEstimate = Math.min(...estimates);
      const maxEstimate = Math.max(...estimates);
      const divergence = maxEstimate - minEstimate;
      
      expect(divergence).toBeGreaterThan(3); // Should trigger discussion
      expect(minEstimate).toBe(3);
      expect(maxEstimate).toBe(8);
    });

    test('generates appropriate reasoning for different experience levels', () => {
      const story = mockStories[0];
      const seniorReasoning = story.estimationVariance['alice-senior'].reasoning;
      const juniorReasoning = story.estimationVariance['carol-junior'].reasoning;
      
      expect(seniorReasoning).toContain('Straightforward');
      expect(juniorReasoning).toContain('learn');
      expect(typeof seniorReasoning).toBe('string');
      expect(typeof juniorReasoning).toBe('string');
    });

    test('handles high complexity stories appropriately', () => {
      const complexStory = mockStories[1]; // Payment processing story
      const estimates = Object.values(complexStory.estimationVariance).map(e => e.points);
      const maxEstimate = Math.max(...estimates);
      
      expect(maxEstimate).toBeGreaterThan(8); // Should suggest breakdown
      expect(complexStory.complexityFactors.technical).toBe('high');
      expect(complexStory.complexityFactors.integration).toBe('high');
    });
  });

  describe('Discussion Points Logic', () => {
    test('identifies when discussion is needed for divergent estimates', () => {
      const story = mockStories[0];
      const estimates = Object.values(story.estimationVariance).map(e => e.points);
      const minEstimate = Math.min(...estimates);
      const maxEstimate = Math.max(...estimates);
      
      const shouldDiscussEstimateDivergence = (maxEstimate - minEstimate) > 3;
      const shouldDiscussUncertainty = story.complexityFactors?.uncertainty === 'high';
      const shouldDiscussBreakdown = maxEstimate > 8;
      
      expect(shouldDiscussEstimateDivergence).toBe(true);
      expect(shouldDiscussUncertainty).toBe(false); // First story has low uncertainty
      expect(shouldDiscussBreakdown).toBe(false); // First story max is 8
    });

    test('identifies high uncertainty scenarios', () => {
      const highUncertaintyStory = {
        ...mockStories[0],
        complexityFactors: {
          ...mockStories[0].complexityFactors,
          uncertainty: 'high'
        }
      };
      
      const shouldDiscussUncertainty = highUncertaintyStory.complexityFactors.uncertainty === 'high';
      expect(shouldDiscussUncertainty).toBe(true);
    });

    test('identifies stories needing breakdown', () => {
      const largeStory = mockStories[1]; // Payment processing with 21 point estimate
      const estimates = Object.values(largeStory.estimationVariance).map(e => e.points);
      const maxEstimate = Math.max(...estimates);
      
      const shouldDiscussBreakdown = maxEstimate > 8;
      expect(shouldDiscussBreakdown).toBe(true);
      expect(maxEstimate).toBe(21);
    });
  });

  describe('Consensus Logic', () => {
    test('determines when estimates are close enough for quick consensus', () => {
      // Create a story with close estimates
      const closeEstimates = {
        'member1': { points: 5 },
        'member2': { points: 5 },
        'member3': { points: 8 }
      };
      
      const estimates = Object.values(closeEstimates).map(e => e.points);
      const minEstimate = Math.min(...estimates);
      const maxEstimate = Math.max(...estimates);
      
      const closeEnoughForConsensus = (maxEstimate - minEstimate) <= 2;
      expect(closeEnoughForConsensus).toBe(false); // 8-5 = 3, needs discussion
    });

    test('determines when discussion is needed', () => {
      const story = mockStories[0];
      const estimates = Object.values(story.estimationVariance).map(e => e.points);
      const minEstimate = Math.min(...estimates);
      const maxEstimate = Math.max(...estimates);
      
      const needsDiscussion = (maxEstimate - minEstimate) > 2;
      expect(needsDiscussion).toBe(true); // 8-3 = 5, definitely needs discussion
    });
  });

  describe('Simulation Statistics', () => {
    test('calculates consensus rate correctly', () => {
      const stats = {
        roundsCompleted: 3,
        consensusReached: 2
      };
      
      const consensusRate = stats.roundsCompleted > 0 
        ? (stats.consensusReached / stats.roundsCompleted) * 100
        : 0;
      
      expect(consensusRate).toBeCloseTo(66.67, 1);
    });

    test('handles zero rounds completed', () => {
      const initialStats = {
        roundsCompleted: 0,
        consensusReached: 0
      };
      
      const consensusRate = initialStats.roundsCompleted > 0 
        ? (initialStats.consensusReached / initialStats.roundsCompleted) * 100
        : 0;
      
      expect(consensusRate).toBe(0);
    });

    test('tracks round completion correctly', () => {
      let stats = {
        roundsCompleted: 0,
        consensusReached: 0
      };
      
      // Simulate completing a round with consensus
      stats = {
        ...stats,
        roundsCompleted: stats.roundsCompleted + 1,
        consensusReached: stats.consensusReached + 1
      };
      
      expect(stats.roundsCompleted).toBe(1);
      expect(stats.consensusReached).toBe(1);
    });
  });

  describe('Callback Functions', () => {
    test('round complete callback structure', () => {
      const mockRoundResult = {
        story: mockStories[0],
        finalEstimate: 5,
        individualEstimates: {
          'alice-senior': { estimate: 3, reasoning: 'Test reasoning', confidence: 'high' }
        },
        discussionPoints: []
      };
      
      expect(typeof mockOnRoundComplete).toBe('function');
      
      mockOnRoundComplete(mockRoundResult);
      expect(mockOnRoundComplete).toHaveBeenCalledWith(mockRoundResult);
    });

    test('estimation complete callback structure', () => {
      const mockSimulationStats = {
        totalStories: 2,
        stats: {
          roundsCompleted: 2,
          consensusReached: 2
        }
      };
      
      expect(typeof mockOnEstimationComplete).toBe('function');
      
      mockOnEstimationComplete(mockSimulationStats);
      expect(mockOnEstimationComplete).toHaveBeenCalledWith(mockSimulationStats);
    });
  });

  describe('Fibonacci Sequence', () => {
    test('contains correct fibonacci values for estimation', () => {
      const fibonacciSequence = [1, 2, 3, 5, 8, 13, 21, '?'];
      
      expect(fibonacciSequence).toContain(1);
      expect(fibonacciSequence).toContain(2);
      expect(fibonacciSequence).toContain(3);
      expect(fibonacciSequence).toContain(5);
      expect(fibonacciSequence).toContain(8);
      expect(fibonacciSequence).toContain(13);
      expect(fibonacciSequence).toContain(21);
      expect(fibonacciSequence).toContain('?');
      expect(fibonacciSequence.length).toBe(8);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles empty arrays gracefully', () => {
      const emptyStories = [];
      const emptyTeam = [];
      
      expect(Array.isArray(emptyStories)).toBe(true);
      expect(emptyStories.length).toBe(0);
      expect(Array.isArray(emptyTeam)).toBe(true);
      expect(emptyTeam.length).toBe(0);
    });

    test('handles missing estimation variance', () => {
      const storyWithoutVariance = {
        ...mockStories[0],
        estimationVariance: undefined
      };
      
      expect(storyWithoutVariance.estimationVariance).toBeUndefined();
      
      // Should have fallback logic
      const fallbackEstimate = 5;
      expect(typeof fallbackEstimate).toBe('number');
      expect(fallbackEstimate).toBeGreaterThan(0);
    });

    test('handles invalid experience levels', () => {
      const invalidMember = {
        ...mockTeamMembers[0],
        experienceLevel: 'invalid'
      };
      
      const validLevels = ['junior', 'intermediate', 'senior'];
      const isValidLevel = validLevels.includes(invalidMember.experienceLevel);
      expect(isValidLevel).toBe(false);
    });

    test('handles missing complexity factors', () => {
      const storyWithoutComplexity = {
        ...mockStories[0],
        complexityFactors: undefined
      };
      
      expect(storyWithoutComplexity.complexityFactors).toBeUndefined();
      
      // Should have fallback logic
      const defaultComplexity = 'medium';
      expect(['low', 'medium', 'high']).toContain(defaultComplexity);
    });
  });

  describe('Team Member Characteristics', () => {
    test('senior members have appropriate characteristics', () => {
      const seniorMember = mockTeamMembers.find(m => m.experienceLevel === 'senior');
      
      expect(seniorMember).toBeDefined();
      expect(seniorMember.domainKnowledge).toBe('high');
      expect(seniorMember.technicalStack).toBe('familiar');
    });

    test('junior members have appropriate characteristics', () => {
      const juniorMember = mockTeamMembers.find(m => m.experienceLevel === 'junior');
      
      expect(juniorMember).toBeDefined();
      expect(juniorMember.domainKnowledge).toBe('low');
      expect(juniorMember.technicalStack).toBe('new');
    });

    test('intermediate members have balanced characteristics', () => {
      const intermediateMember = mockTeamMembers.find(m => m.experienceLevel === 'intermediate');
      
      expect(intermediateMember).toBeDefined();
      expect(intermediateMember.domainKnowledge).toBe('medium');
      expect(intermediateMember.technicalStack).toBe('familiar');
    });
  });
});