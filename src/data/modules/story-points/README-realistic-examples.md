# Realistic Story Point Examples Dataset

## Overview

This dataset provides realistic story point estimation examples that align with Scrum best practices and address common issues in story point training. The examples replace unrealistic scenarios with authentic development work that teams actually encounter.

## Dataset Files

### Core Story Collections

1. **enhanced-exercise1-stories.json** - Foundation stories (1-5 points)
   - Simple, well-understood stories for establishing baseline
   - Team context variations showing experience impact
   - Clear acceptance criteria and reasoning

2. **enhanced-exercise2-stories.json** - Realistic distribution (1-8 points)
   - Proper size distribution with majority under 8 points
   - Stories requiring breakdown with suggestions
   - Complex scenarios with dependencies

3. **realistic-story-dataset.json** - Comprehensive examples
   - Complete range from 1-8 points with proper distribution
   - Team context awareness throughout
   - Breakdown guidance for larger stories

### Specialized Collections

4. **non-estimable-work-examples.json** - Work that shouldn't be estimated
   - Research spikes with time-boxing
   - Proof-of-concept activities
   - Learning and training activities
   - Clear transition to estimable stories

5. **breakdown-required-stories.json** - Stories needing decomposition
   - 13+ point stories with breakdown techniques
   - Multiple decomposition approaches
   - Resulting smaller stories with estimates

6. **team-context-examples.json** - Team experience variations
   - Same story estimated by different team types
   - Junior vs senior team perspectives
   - Technology familiarity impact

7. **proper-size-distribution.json** - Best practice distribution
   - 65% small stories (1-3 points)
   - 20% medium stories (5 points)
   - 10% large stories (8 points)
   - 5% requiring breakdown (13+ points)

## Key Improvements Over Previous Examples

### Realistic Size Distribution
- **Before**: Many 13+ point stories presented as normal
- **After**: Majority 1-8 points, with breakdown guidance for larger stories

### Team Context Awareness
- **Before**: Single "correct" estimate for each story
- **After**: Multiple estimates based on team experience and context

### Breakdown Guidance
- **Before**: Large stories accepted without decomposition
- **After**: Clear breakdown techniques and resulting smaller stories

### Non-Estimable Work Recognition
- **Before**: Everything estimated with story points
- **After**: Clear examples of spikes, research, and learning activities

## Story Structure

Each story includes:

```json
{
  "id": "unique-identifier",
  "title": "User-focused title",
  "description": "As a [role], I want [feature] so that [benefit]",
  "acceptanceCriteria": ["Specific", "Testable", "Criteria"],
  "teamContext": {
    "experienceLevel": "junior|intermediate|senior",
    "domainKnowledge": "low|medium|high",
    "technicalStack": "familiar|new|mixed",
    "teamSize": 4-6,
    "workingAgreements": ["Team practices"]
  },
  "estimationVariance": {
    "teamType": {
      "points": 1-8,
      "reasoning": "Clear explanation",
      "confidenceLevel": "low|medium|high"
    }
  },
  "breakdownRequired": true/false,
  "breakdownSuggestions": [...],
  "complexityFactors": {
    "technical": "low|medium|high",
    "business": "low|medium|high", 
    "integration": "low|medium|high",
    "uncertainty": "low|medium|high"
  }
}
```

## Usage Guidelines

### For Exercise 1 (Foundation Stories)
- Use enhanced-exercise1-stories.json
- Focus on establishing relative sizing baseline
- Demonstrate team context impact on estimation

### For Exercise 2 (Realistic Distribution)
- Use enhanced-exercise2-stories.json or realistic-story-dataset.json
- Show proper size distribution patterns
- Practice breakdown techniques for larger stories

### For Advanced Exercises
- Use breakdown-required-stories.json for decomposition practice
- Use team-context-examples.json for team comparison scenarios
- Use non-estimable-work-examples.json for spike identification

## Educational Objectives

1. **Proper Size Distribution**: Most stories should be 1-8 points
2. **Team Context Matters**: Same story varies by team capability
3. **Breakdown Techniques**: Multiple ways to decompose large stories
4. **Non-Estimable Recognition**: Some work needs spikes, not estimates
5. **Relative Sizing**: Compare stories to each other, not absolute time
6. **Uncertainty Handling**: Use spikes to reduce estimation uncertainty

## Integration with Existing System

The new datasets maintain backward compatibility with existing exercise structure while adding enhanced fields. Legacy fields (correctOrder, correctPoints, factors, explanation) are preserved where applicable.

The enhanced TypeScript interfaces in `src/types/story.ts` support both legacy and new story formats, ensuring smooth migration.