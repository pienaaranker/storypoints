import { describe, test, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import ConsistencyFeedback from '../ConsistencyFeedback.jsx';

// Mock the consistency validation utilities
vi.mock('../../../../utils/consistencyValidation.js', () => ({
  validateStorySetConsistency: vi.fn(),
  validateCrossDomainConsistency: vi.fn(),
  getRealTimeFeedback: vi.fn()
}));

import * as consistencyValidation from '../../../../utils/consistencyValidation.js';

describe('ConsistencyFeedback Component', () => {
  const mockStories = [
    {
      id: 'story-1',
      title: 'First Story',
      points: 3,
      domain: 'technical',
      complexityFactors: {
        technical: 'medium',
        business: 'low',
        integration: 'low',
        uncertainty: 'low'
      }
    },
    {
      id: 'story-2', 
      title: 'Second Story',
      points: 5,
      domain: 'business',
      complexityFactors: {
        technical: 'low',
        business: 'medium',
        integration: 'medium',
        uncertainty: 'low'
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  test('renders placeholder when no stories provided', () => {
    consistencyValidation.validateStorySetConsistency.mockReturnValue({
      overallScore: 100,
      issues: [],
      recommendations: []
    });
    
    consistencyValidation.getRealTimeFeedback.mockReturnValue({
      warnings: [],
      suggestions: [],
      consistencyScore: 100
    });

    render(<ConsistencyFeedback stories={[]} />);
    
    expect(screen.getByText('Add story estimates to see consistency analysis')).toBeDefined();
  });

  test('displays consistency score', () => {
    consistencyValidation.validateStorySetConsistency.mockReturnValue({
      overallScore: 85,
      issues: [],
      recommendations: [],
      comparisons: []
    });
    
    consistencyValidation.getRealTimeFeedback.mockReturnValue({
      warnings: [],
      suggestions: [],
      consistencyScore: 85
    });

    render(<ConsistencyFeedback stories={mockStories} />);
    
    expect(screen.getByText('Consistency Score')).toBeDefined();
    expect(screen.getByText('85%')).toBeDefined();
  });

  test('displays warnings when consistency issues exist', () => {
    consistencyValidation.validateStorySetConsistency.mockReturnValue({
      overallScore: 65,
      issues: [
        {
          type: 'inconsistent_sizing',
          stories: ['First Story', 'Second Story'],
          score: 45,
          feedback: 'Stories may not be sized consistently'
        }
      ],
      recommendations: ['Review relative complexity'],
      comparisons: []
    });
    
    consistencyValidation.getRealTimeFeedback.mockReturnValue({
      warnings: ['Some stories may not be sized consistently'],
      suggestions: ['Compare complexity factors'],
      consistencyScore: 65
    });

    render(<ConsistencyFeedback stories={mockStories} />);
    
    expect(screen.getByText('⚠️ Consistency Warnings')).toBeDefined();
    expect(screen.getByText('Some stories may not be sized consistently')).toBeDefined();
  });

  test('displays suggestions for improvement', () => {
    consistencyValidation.validateStorySetConsistency.mockReturnValue({
      overallScore: 70,
      issues: [],
      recommendations: [],
      comparisons: []
    });
    
    consistencyValidation.getRealTimeFeedback.mockReturnValue({
      warnings: [],
      suggestions: ['Use reference stories for better consistency'],
      consistencyScore: 70
    });

    render(<ConsistencyFeedback stories={mockStories} />);
    
    expect(screen.getByText('💡 Suggestions')).toBeDefined();
    expect(screen.getByText('Use reference stories for better consistency')).toBeDefined();
  });

  test('displays detailed issue analysis', () => {
    consistencyValidation.validateStorySetConsistency.mockReturnValue({
      overallScore: 55,
      issues: [
        {
          type: 'inconsistent_sizing',
          stories: ['First Story', 'Second Story'],
          score: 45,
          feedback: 'The first story might be under-estimated relative to its complexity'
        }
      ],
      recommendations: ['Review the relative complexity of flagged stories'],
      comparisons: []
    });
    
    consistencyValidation.getRealTimeFeedback.mockReturnValue({
      warnings: [],
      suggestions: [],
      consistencyScore: 55
    });

    render(<ConsistencyFeedback stories={mockStories} />);
    
    expect(screen.getByText('Detailed Analysis')).toBeDefined();
    expect(screen.getByText('inconsistent sizing')).toBeDefined();
    expect(screen.getByText('Stories: First Story vs Second Story')).toBeDefined();
  });

  test('handles cross-domain analysis when enabled', () => {
    consistencyValidation.validateStorySetConsistency.mockReturnValue({
      overallScore: 75,
      issues: [],
      recommendations: [],
      comparisons: []
    });
    
    consistencyValidation.getRealTimeFeedback.mockReturnValue({
      warnings: [],
      suggestions: [],
      consistencyScore: 75
    });

    consistencyValidation.validateCrossDomainConsistency.mockReturnValue({
      hasCrossDomainInconsistencies: true,
      crossDomainIssues: [
        {
          technicalStory: 'First Story',
          businessStory: 'Second Story',
          issue: 'Similar complexity but inconsistent point estimates across domains',
          suggestion: 'Ensure estimation approach is consistent regardless of story type'
        }
      ],
      recommendations: ['Establish reference stories for both technical and business domains']
    });

    render(
      <ConsistencyFeedback 
        stories={mockStories} 
        showCrossDomainAnalysis={true}
      />
    );
    
    expect(screen.getByText('Cross-Domain Consistency')).toBeDefined();
  });

  test('calls onConsistencyChange callback with correct data', () => {
    const mockOnConsistencyChange = vi.fn();
    
    consistencyValidation.validateStorySetConsistency.mockReturnValue({
      overallScore: 75,
      issues: [{ type: 'test_issue', stories: ['Story A', 'Story B'] }],
      recommendations: [],
      comparisons: []
    });
    
    consistencyValidation.getRealTimeFeedback.mockReturnValue({
      warnings: [],
      suggestions: [],
      consistencyScore: 80
    });

    render(
      <ConsistencyFeedback 
        stories={mockStories}
        onConsistencyChange={mockOnConsistencyChange}
      />
    );
    
    expect(mockOnConsistencyChange).toHaveBeenCalledWith({
      overallScore: 75,
      hasIssues: true,
      feedbackScore: 80
    });
  });
});